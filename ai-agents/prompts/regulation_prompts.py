"""
Prompt templates for the RegulationAgent.

Separation of prompts from agent logic keeps prompts version-controlled,
A/B-testable, and swappable without touching orchestration code.
"""

EXTRACTION_SYSTEM_PROMPT = """\
You are a trade compliance analyst specializing in agricultural commodity regulations.
Your role is to analyze regulatory text and extract structured intelligence for
vanilla (HS Code 0905) exporters — primarily Indonesian producers shipping to the US, EU, and Japan.

RULES:
- Return ONLY valid JSON. No explanations, no markdown fences, no extra text.
- The "summary" field must be 2–4 sentences describing the ECONOMIC IMPACT and
  what the exporter must DO to comply. Be concrete and actionable.
- For "status":
    • "Warning"  = requires immediate action or risks shipment rejection
    • "Info"     = notable change but no immediate action required
    • "Cleared"  = prior alert resolved; normal operations can resume
- For "date": output ISO 8601 (YYYY-MM-DD). If the exact day is unknown, use the
  first of the identified month (e.g., "2026-05-01").
- If a field cannot be determined, use null.
"""

_EXTRACTION_USER_TEMPLATE = """\
Analyze the following regulatory text and extract structured intelligence for
{commodity} exporters.

SOURCE INSTITUTION: {source}
---
{raw_text}
---

Return a single JSON object matching this exact schema:
{{
  "title":   "<short, specific title of this regulation or policy change>",
  "source":  "<issuing institution name>",
  "date":    "<YYYY-MM-DD>",
  "status":  "<Warning | Info | Cleared>",
  "summary": "<2–4 sentences on economic impact and required exporter actions>"
}}
"""

_MULTI_EXTRACTION_USER_TEMPLATE = """\
Analyze the following regulatory bulletin and extract ALL distinct regulatory
events relevant to {commodity} exporters.

SOURCE INSTITUTION: {source}
---
{raw_text}
---

Return a JSON ARRAY where each element matches this schema:
{{
  "title":   "<short, specific title>",
  "source":  "<issuing institution name>",
  "date":    "<YYYY-MM-DD>",
  "status":  "<Warning | Info | Cleared>",
  "summary": "<2–4 sentences on economic impact and required exporter actions>"
}}

If the text contains no relevant events, return an empty array: []
"""


def build_single_extraction_prompt(
    raw_text: str,
    source: str,
    commodity: str = "Vanilla (HS Code 0905)",
) -> str:
    """Prompt to extract exactly one RegulationAlert from raw text."""
    return _EXTRACTION_USER_TEMPLATE.format(
        raw_text=raw_text.strip(),
        source=source,
        commodity=commodity,
    )


def build_multi_extraction_prompt(
    raw_text: str,
    source: str,
    commodity: str = "Vanilla (HS Code 0905)",
) -> str:
    """Prompt to extract a list of RegulationAlerts from a bulletin or feed."""
    return _MULTI_EXTRACTION_USER_TEMPLATE.format(
        raw_text=raw_text.strip(),
        source=source,
        commodity=commodity,
    )
