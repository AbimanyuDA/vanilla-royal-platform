"""
RegulationAgent — Macro Trend & Regulation Analyst for Vanilla (HS Code 0905)

Responsibilities:
  1. Pull regulatory text from global food/trade agencies (FDA, EU, Kementan, Codex).
  2. Send text through LLM extraction pipeline.
  3. Return validated, structured RegulationAlert objects ready for the dashboard API.

Architecture note — LangGraph / CrewAI integration:
  This agent is written as a plain Python class to stay runnable without additional
  frameworks. To plug into CrewAI, wrap the `analyze` and `run` methods as CrewAI
  Tasks and pass a crewai.LLM instance instead of LLMClient:

    from crewai import Agent, Task, Crew
    analyst = Agent(
        role="Vanilla Regulation Analyst",
        goal="Extract regulatory alerts for HS Code 0905",
        tools=[FetchRegulatoryFeedTool(), ...],
        llm=crewai.LLM(model="claude-haiku-4-5-20251001"),
    )

  For LangGraph: each method maps naturally to a graph node; the AgentRunResult
  is the state object passed between nodes.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from core.llm_client import LLMClient
from core.models import AgentRunResult, AlertStatus, RegulationAlert
from prompts.regulation_prompts import (
    EXTRACTION_SYSTEM_PROMPT,
    build_multi_extraction_prompt,
    build_single_extraction_prompt,
)
from scrapers.regulatory_scraper import RegulatoryScraper

logger = logging.getLogger(__name__)


class RegulationAgent:
    """
    Macro Trend & Regulation Analyst — Vanilla (HS Code 0905).

    Usage:
        agent = RegulationAgent()

        # Analyze a single piece of raw regulatory text:
        alert = agent.analyze(raw_text="FDA issued...", source="US FDA")

        # Run the full pipeline across all sources:
        result = agent.run()
        for alert in result.alerts:
            print(alert.model_dump_json(indent=2))
    """

    NAME = "RegulationAgent"
    COMMODITY = "Vanilla (HS Code 0905)"

    def __init__(
        self,
        llm_client: Optional[LLMClient] = None,
        scraper: Optional[RegulatoryScraper] = None,
        use_mock: bool | None = None,
    ):
        self.llm = llm_client or LLMClient()
        self.scraper = scraper or RegulatoryScraper(use_mock=use_mock)

    # ── Core extraction ──────────────────────────────────────────────────────

    def analyze(
        self,
        raw_text: str,
        source: str,
        url: Optional[str] = None,
    ) -> RegulationAlert:
        """
        Extract one RegulationAlert from a raw block of regulatory text.

        Args:
            raw_text: Scraped or manually provided regulatory text.
            source:   Human-readable institution name, e.g. "US FDA".
            url:      Original URL for traceability (optional).

        Returns:
            A validated RegulationAlert Pydantic model.

        Raises:
            ValueError: If the LLM response cannot be parsed into a valid alert.
        """
        logger.info("Analyzing text from source: %s (%d chars)", source, len(raw_text))

        prompt = build_single_extraction_prompt(
            raw_text=raw_text,
            source=source,
            commodity=self.COMMODITY,
        )

        data = self.llm.complete_json(
            system=EXTRACTION_SYSTEM_PROMPT,
            user=prompt,
            max_tokens=512,
        )

        # Normalize null values that may come back as None
        if data.get("status") not in [s.value for s in AlertStatus]:
            data["status"] = "Info"

        alert = RegulationAlert(
            title=data.get("title", "Untitled Regulation"),
            source=data.get("source", source),
            date=data.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            status=AlertStatus(data.get("status", "Info")),
            summary=data.get("summary", ""),
            commodity=self.COMMODITY,
            url=url,
        )

        logger.info("Extracted alert: [%s] %s", alert.status.value, alert.title)
        return alert

    def analyze_bulk(
        self,
        raw_text: str,
        source: str,
        url: Optional[str] = None,
    ) -> list[RegulationAlert]:
        """
        Extract multiple RegulationAlerts from a single bulletin or feed page.
        Use this when a source page may contain several distinct regulatory events.
        """
        logger.info("Bulk-analyzing feed from source: %s", source)

        prompt = build_multi_extraction_prompt(
            raw_text=raw_text,
            source=source,
            commodity=self.COMMODITY,
        )

        raw = self.llm.complete(
            system=EXTRACTION_SYSTEM_PROMPT,
            user=prompt,
            max_tokens=2048,
        )

        # Parse the array response
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```", 2)[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.rsplit("```", 1)[0].strip()

        try:
            items: list[dict] = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse bulk extraction response: %s\nRaw: %s", exc, raw)
            return []

        alerts: list[RegulationAlert] = []
        for item in items:
            try:
                status_val = item.get("status", "Info")
                if status_val not in [s.value for s in AlertStatus]:
                    status_val = "Info"
                alerts.append(
                    RegulationAlert(
                        title=item.get("title", "Untitled"),
                        source=item.get("source", source),
                        date=item.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
                        status=AlertStatus(status_val),
                        summary=item.get("summary", ""),
                        commodity=self.COMMODITY,
                        url=url,
                    )
                )
            except Exception as exc:
                logger.warning("Skipping malformed alert item: %s — %s", item, exc)

        logger.info("Extracted %d alert(s) from %s", len(alerts), source)
        return alerts

    # ── Pipeline orchestration ───────────────────────────────────────────────

    def run(
        self,
        source_keys: Optional[list[str]] = None,
    ) -> AgentRunResult:
        """
        Full pipeline: fetch → analyze → validate → return structured results.

        Args:
            source_keys: Subset of source keys to process (default: all sources).

        Returns:
            AgentRunResult containing all extracted alerts and run metadata.
        """
        from scrapers.regulatory_scraper import REGULATORY_SOURCES

        keys = source_keys or list(REGULATORY_SOURCES.keys())
        timestamp = datetime.now(timezone.utc).isoformat()

        result = AgentRunResult(
            agent_name=self.NAME,
            commodity=self.COMMODITY,
            timestamp=timestamp,
        )

        logger.info(
            "RegulationAgent pipeline started — sources: %s | timestamp: %s",
            keys,
            timestamp,
        )

        for key in keys:
            institution = self.scraper.get_institution_name(key)
            result.sources_checked.append(institution)

            try:
                raw_text = self.scraper.fetch(key)
                if not raw_text:
                    logger.warning("No text returned for source: %s", key)
                    continue

                # Use bulk extraction — each source page may have multiple events
                alerts = self.analyze_bulk(raw_text=raw_text, source=institution)
                result.alerts.extend(alerts)

            except Exception as exc:
                error_msg = f"{institution}: {exc}"
                logger.error("Error processing source %s: %s", key, exc)
                result.errors.append(error_msg)

        # Sort alerts: Warnings first, then by date descending
        result.alerts.sort(
            key=lambda a: (
                0 if a.status == AlertStatus.WARNING else
                1 if a.status == AlertStatus.INFO else 2,
            )
        )

        logger.info(
            "Pipeline complete — %d alert(s) extracted | %d error(s)",
            result.alert_count,
            len(result.errors),
        )

        return result
