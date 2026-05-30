"""
Entry point for running AI agents from the command line.

Usage:
    # Run with mock data (no API key needed, no live HTTP):
    USE_MOCK_DATA=true python run.py

    # Run against live sources with Anthropic:
    ANTHROPIC_API_KEY=sk-ant-... python run.py

    # Run a specific source only:
    python run.py --source fda

    # Output to a JSON file:
    python run.py --output results.json
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys

# Allow imports from sibling packages (core, scrapers, prompts, agents)
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Vanilla Royal — Regulation Intelligence Agent"
    )
    parser.add_argument(
        "--source",
        choices=["fda", "eu_rasff", "kementan", "codex"],
        default=None,
        help="Run a single regulatory source (default: all)",
    )
    parser.add_argument(
        "--output",
        default=None,
        metavar="FILE",
        help="Write JSON results to a file (default: stdout)",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        default=None,
        help="Force mock data mode (overrides USE_MOCK_DATA env var)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Override mock mode from CLI flag
    if args.mock:
        os.environ["USE_MOCK_DATA"] = "true"

    from agents.regulation_agent import RegulationAgent

    agent = RegulationAgent()
    source_keys = [args.source] if args.source else None

    print(f"\n{'='*60}")
    print("  Vanilla Royal — Regulation Intelligence Agent")
    print(f"  Commodity: Vanilla (HS Code 0905)")
    print(f"  Mode: {'MOCK' if os.getenv('USE_MOCK_DATA') == 'true' else 'LIVE'}")
    print(f"{'='*60}\n")

    result = agent.run(source_keys=source_keys)

    # ── Console summary ──────────────────────────────────────────────────────
    print(f"Sources checked : {', '.join(result.sources_checked)}")
    print(f"Alerts extracted: {result.alert_count}")
    print(f"Errors          : {len(result.errors)}")
    print(f"Has warnings    : {result.has_warnings}")
    print()

    for i, alert in enumerate(result.alerts, 1):
        status_icon = {"Warning": "⚠ ", "Info": "ℹ ", "Cleared": "✓ "}.get(alert.status.value, "  ")
        print(f"[{i}] {status_icon}{alert.title}")
        print(f"     Source : {alert.source}")
        print(f"     Date   : {alert.date}")
        print(f"     Status : {alert.status.value}")
        print(f"     Summary: {alert.summary[:120]}{'...' if len(alert.summary) > 120 else ''}")
        print()

    if result.errors:
        print("Errors:")
        for err in result.errors:
            print(f"  ✗ {err}")
        print()

    # ── JSON output ──────────────────────────────────────────────────────────
    output_data = {
        "agent": result.agent_name,
        "commodity": result.commodity,
        "timestamp": result.timestamp,
        "alert_count": result.alert_count,
        "has_warnings": result.has_warnings,
        "alerts": [a.to_dashboard_dict() for a in result.alerts],
        "errors": result.errors,
    }

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        print(f"Results written to: {args.output}")
    else:
        print("JSON Output:")
        print(json.dumps(output_data, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
