"""
LLM client abstraction layer.

Primary provider: Anthropic (Claude) — aligns with project's AI stack.
The interface is provider-agnostic so OpenAI or a local LLM can be swapped
in by changing the PROVIDER env var without touching agent code.

LangGraph / CrewAI integration point:
  CrewAI wraps LLM calls via its own BaseLLM. When integrating, replace
  LLMClient usage in the agent with a crewai.LLM(...) instance and pass
  it to the CrewAI Agent constructor — the prompt templates stay unchanged.
"""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Any

logger = logging.getLogger(__name__)

# ── Retry constants ─────────────────────────────────────────────────────────
_MAX_RETRIES = 3
_RETRY_DELAY = 2.0  # seconds, doubled on each attempt


def _retry(func):
    """Simple exponential-backoff decorator for API calls."""
    def wrapper(*args, **kwargs):
        delay = _RETRY_DELAY
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                return func(*args, **kwargs)
            except Exception as exc:
                if attempt == _MAX_RETRIES:
                    raise
                logger.warning("LLM call failed (attempt %d/%d): %s — retrying in %.1fs",
                               attempt, _MAX_RETRIES, exc, delay)
                time.sleep(delay)
                delay *= 2
    return wrapper


# ── Provider implementations ────────────────────────────────────────────────

class _AnthropicBackend:
    """
    Thin wrapper around the official Anthropic Python SDK.
    Uses claude-haiku-4-5-20251001 for extraction tasks (fast, cheap, accurate).
    Swap to claude-sonnet-4-6 for higher-fidelity analysis.
    """

    DEFAULT_MODEL = "claude-haiku-4-5-20251001"

    def __init__(self, api_key: str, model: str | None = None):
        try:
            import anthropic  # noqa: F401 — deferred import keeps module loadable without SDK
            self._anthropic = anthropic
        except ImportError as e:
            raise RuntimeError(
                "anthropic package not installed. Run: pip install anthropic"
            ) from e

        self._client = self._anthropic.Anthropic(api_key=api_key)
        self.model = model or self.DEFAULT_MODEL

    @_retry
    def complete(self, system: str, user: str, max_tokens: int = 1024) -> str:
        message = self._client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return message.content[0].text


class _OpenAIBackend:
    """
    OpenAI-compatible backend.
    Also works with any OpenAI-compatible local server (Ollama, LM Studio).
    """

    DEFAULT_MODEL = "gpt-4o-mini"

    def __init__(self, api_key: str, model: str | None = None, base_url: str | None = None):
        try:
            import openai
            self._openai = openai
        except ImportError as e:
            raise RuntimeError(
                "openai package not installed. Run: pip install openai"
            ) from e

        self._client = self._openai.OpenAI(
            api_key=api_key,
            **({"base_url": base_url} if base_url else {}),
        )
        self.model = model or self.DEFAULT_MODEL

    @_retry
    def complete(self, system: str, user: str, max_tokens: int = 1024) -> str:
        response = self._client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return response.choices[0].message.content or ""


# ── Public interface ─────────────────────────────────────────────────────────

class LLMClient:
    """
    Provider-agnostic LLM client.

    Configuration via environment variables:
      LLM_PROVIDER   = "anthropic" | "openai" | "local"  (default: anthropic)
      ANTHROPIC_API_KEY
      OPENAI_API_KEY
      OPENAI_BASE_URL  (optional, for local servers)
      LLM_MODEL        (optional override)
    """

    def __init__(
        self,
        provider: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
    ):
        provider = (provider or os.getenv("LLM_PROVIDER", "anthropic")).lower()
        model = model or os.getenv("LLM_MODEL")

        if provider == "anthropic":
            key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
            self._backend = _AnthropicBackend(api_key=key, model=model)
        elif provider in ("openai", "local"):
            key = api_key or os.getenv("OPENAI_API_KEY", "")
            base_url = os.getenv("OPENAI_BASE_URL") if provider == "local" else None
            self._backend = _OpenAIBackend(api_key=key, model=model, base_url=base_url)
        else:
            raise ValueError(f"Unknown LLM provider: {provider!r}. Use 'anthropic' or 'openai'.")

        self.provider = provider
        logger.info("LLMClient initialised — provider=%s model=%s", provider, self._backend.model)

    def complete(self, system: str, user: str, max_tokens: int = 1024) -> str:
        """Send a system + user prompt and return the raw text response."""
        return self._backend.complete(system=system, user=user, max_tokens=max_tokens)

    def complete_json(self, system: str, user: str, max_tokens: int = 1024) -> dict[str, Any]:
        """
        Like complete(), but expects JSON output and parses it.
        Raises ValueError if the response cannot be decoded as JSON.
        """
        raw = self.complete(system=system, user=user, max_tokens=max_tokens)
        # Strip markdown code fences if the model wraps output in ```json ... ```
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```", 2)[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.rsplit("```", 1)[0].strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"LLM returned non-JSON response. Raw output:\n{raw}"
            ) from exc
