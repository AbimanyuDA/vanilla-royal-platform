"""
Regulatory news fetcher for global food/trade agencies.

Design principles:
- Each public source has a named key and target URL.
- USE_MOCK_DATA env var (or constructor flag) enables development without
  hitting real government servers.
- Rate limiting: 1-second pause between requests; respects robots.txt intent.
- Returns raw extracted text — parsing/LLM extraction happens in the agent.
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass, field
from typing import Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ── Source registry ──────────────────────────────────────────────────────────

@dataclass
class RegulatorySource:
    key: str
    institution: str
    url: str
    country: str
    css_selector: str = "body"    # BeautifulSoup CSS selector for content area
    encoding: str = "utf-8"


REGULATORY_SOURCES: dict[str, RegulatorySource] = {
    "fda": RegulatorySource(
        key="fda",
        institution="US FDA",
        url="https://www.fda.gov/food/alerts-advisories-safety-information/food-safety-alerts-and-advisories",
        country="United States",
        css_selector="div.lcds-basic-grid",
    ),
    "eu_rasff": RegulatorySource(
        key="eu_rasff",
        institution="EU Commission / RASFF",
        url="https://food.ec.europa.eu/safety/rasff-food-and-feed-safety-alerts/rasff-window_en",
        country="European Union",
        css_selector="div.field--name-body",
    ),
    "kementan": RegulatorySource(
        key="kementan",
        institution="Kementan RI",
        url="https://www.pertanian.go.id/home/?show=news&act=view&id=1",
        country="Indonesia",
        css_selector="div.news-content",
    ),
    "codex": RegulatorySource(
        key="codex",
        institution="Codex Alimentarius / FAO-WHO",
        url="https://www.fao.org/fao-who-codexalimentarius/news-and-events/news/en/",
        country="International",
        css_selector="div.story",
    ),
}


# ── Mock data for development ────────────────────────────────────────────────

MOCK_DATA: dict[str, str] = {
    "fda": """\
FDA Import Alert 99-33 Update — May 2026
The US Food & Drug Administration has issued updated compliance requirements for
phytosanitary certificates accompanying organic vanilla bean shipments (HS 0905.10).
Starting June 1, 2026, all certificates must include batch-level residue testing
results for pesticide Group 15 compounds. Shipments without compliant documentation
will be subject to automatic detention at US ports of entry.
""",
    "eu_rasff": """\
RASFF Notification — Flavouring Substances (Vanilla Derivatives)
European Commission revised Annex II of Regulation (EC) No 834/2007. New traceability
requirements for vanilla derivatives (split beans, extract, powder) imported from
non-EU countries take effect 1 September 2026. Importers must provide full chain-of-custody
documentation from farm to processor level. This applies to all shipments regardless of
organic certification status.
""",
    "kementan": """\
Surat Edaran Kementan No. 05/HK.050/2026 — Pembaruan Template Fitosanitari Ekspor
Kementerian Pertanian Republik Indonesia menerbitkan template baru sertifikat
fitosanitari untuk ekspor komoditas vanili (HS 0905). Template yang diperbarui
sudah diterima oleh otoritas bea cukai Amerika Serikat, Uni Eropa, dan Jepang
per Mei 2026. Eksportir diwajibkan menggunakan template baru mulai 1 Juli 2026.
""",
    "codex": """\
Codex Alimentarius Commission — Draft Standard for Vanilla CXS 330-2024 (Revised)
The Codex Committee on Spices and Culinary Herbs finalized amendments to the vanilla
quality standard at its 10th session. Key changes include updated moisture content
limits (max 38% for whole beans) and mandatory declaration of curing method on
commercial invoices. Member countries have 12 months to align national legislation.
""",
}


# ── Scraper ──────────────────────────────────────────────────────────────────

class RegulatoryScraper:
    _HEADERS = {
        "User-Agent": (
            "VanillaRoyalBot/1.0 (+https://vanillaroyal.id/bot; "
            "trade-intelligence@vanillaroyal.id)"
        ),
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    }
    _REQUEST_TIMEOUT = 15  # seconds
    _RATE_LIMIT_DELAY = 1.0  # seconds between requests

    def __init__(self, use_mock: bool | None = None):
        env_mock = os.getenv("USE_MOCK_DATA", "false").lower() == "true"
        self.use_mock = use_mock if use_mock is not None else env_mock

    def _fetch_html(self, source: RegulatorySource) -> Optional[str]:
        """Fetch raw HTML from a regulatory source URL."""
        try:
            response = requests.get(
                source.url,
                headers=self._HEADERS,
                timeout=self._REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            response.encoding = source.encoding
            return response.text
        except requests.RequestException as exc:
            logger.warning("Failed to fetch %s (%s): %s", source.institution, source.url, exc)
            return None

    def _extract_text(self, html: str, css_selector: str) -> str:
        """Extract readable text from HTML using a CSS selector."""
        soup = BeautifulSoup(html, "lxml")
        container = soup.select_one(css_selector) or soup.body or soup
        # Remove script/style noise
        for tag in container.find_all(["script", "style", "nav", "footer"]):
            tag.decompose()
        lines = [line.strip() for line in container.get_text(separator="\n").splitlines()]
        return "\n".join(line for line in lines if line)

    def fetch(self, source_key: str) -> Optional[str]:
        """
        Return raw text for the given source key.
        Falls back to mock data if use_mock=True or live fetch fails.
        """
        if source_key not in REGULATORY_SOURCES:
            raise KeyError(f"Unknown source key: {source_key!r}. "
                           f"Available: {list(REGULATORY_SOURCES)}")

        source = REGULATORY_SOURCES[source_key]

        if self.use_mock:
            logger.info("Using mock data for source: %s", source_key)
            return MOCK_DATA.get(source_key)

        logger.info("Fetching live data from %s (%s)", source.institution, source.url)
        html = self._fetch_html(source)
        time.sleep(self._RATE_LIMIT_DELAY)

        if html is None:
            logger.warning("Live fetch failed for %s — falling back to mock data", source_key)
            return MOCK_DATA.get(source_key)

        return self._extract_text(html, source.css_selector)

    def fetch_all(self) -> dict[str, str]:
        """
        Fetch text from all registered sources.
        Returns a dict of source_key → raw_text (skips sources that return None).
        """
        results: dict[str, str] = {}
        for key in REGULATORY_SOURCES:
            text = self.fetch(key)
            if text:
                results[key] = text
        return results

    @staticmethod
    def get_institution_name(source_key: str) -> str:
        src = REGULATORY_SOURCES.get(source_key)
        return src.institution if src else source_key
