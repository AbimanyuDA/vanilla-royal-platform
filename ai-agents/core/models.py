"""
Pydantic data models for the Vanilla Royal AI Agent system.
All agent outputs are typed and validated through these models.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class AlertStatus(str, Enum):
    WARNING = "Warning"
    INFO = "Info"
    CLEARED = "Cleared"


class RegulationAlert(BaseModel):
    """
    Structured output of the RegulationAgent.
    Represents a single parsed regulatory event affecting vanilla (HS 0905).
    """

    title: str = Field(description="Short, clear title of the regulation or policy change")
    source: str = Field(description="Issuing institution, e.g. 'US FDA', 'EU Commission', 'Kementan RI'")
    date: str = Field(description="Publication date in ISO 8601 format (YYYY-MM-DD)")
    status: AlertStatus = Field(description="Severity classification of the regulatory change")
    summary: str = Field(
        description=(
            "2-4 sentence summary of the economic impact on vanilla exporters. "
            "Must be actionable — what should exporters DO?"
        )
    )
    commodity: str = Field(default="Vanilla (HS Code 0905)")
    url: Optional[str] = Field(default=None, description="Source URL if available")

    @model_validator(mode="after")
    def validate_date_format(self) -> RegulationAlert:
        # Accept both ISO format and common variants like "May 28, 2026"
        if self.date and len(self.date) < 4:
            raise ValueError(f"Invalid date value: {self.date!r}")
        return self

    def to_dashboard_dict(self) -> dict:
        """Returns the subset used by the Next.js dashboard API response."""
        return {
            "title": self.title,
            "source": self.source,
            "date": self.date,
            "status": self.status.value,
            "summary": self.summary,
        }


class AgentRunResult(BaseModel):
    """Wraps a full agent pipeline run with metadata."""

    agent_name: str
    commodity: str = "Vanilla (HS Code 0905)"
    alerts: list[RegulationAlert] = Field(default_factory=list)
    sources_checked: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    timestamp: str = Field(description="ISO 8601 UTC timestamp of the run")

    @property
    def alert_count(self) -> int:
        return len(self.alerts)

    @property
    def has_warnings(self) -> bool:
        return any(a.status == AlertStatus.WARNING for a in self.alerts)
