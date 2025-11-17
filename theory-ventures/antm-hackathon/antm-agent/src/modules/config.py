"""Shared DSPy configuration helpers."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

import dspy

# Default model configuration
# Use Claude Sonnet 4.5 for maximum performance
# OpenRouter model name: anthropic/claude-sonnet-4.5
DEFAULT_MODEL = os.getenv("DSPY_MODEL", "anthropic/claude-sonnet-4.5")
DEFAULT_TEMPERATURE = float(os.getenv("DSPY_TEMPERATURE", "0.2"))
DEFAULT_MAX_TOKENS = int(os.getenv("DSPY_MAX_TOKENS", "2000"))

# API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Fallback model
FALLBACK_MODEL = os.getenv("DSPY_FALLBACK_MODEL", "openai/gpt-4o-mini")


def _lm_kwargs(model: str) -> dict:
    """Get language model kwargs based on model name."""
    kwargs = {
        "temperature": DEFAULT_TEMPERATURE,
        "max_tokens": DEFAULT_MAX_TOKENS,
    }
    
    # OpenRouter support - use it if available (preferred for Claude Sonnet 4.5)
    if OPENROUTER_API_KEY:
        kwargs["api_key"] = OPENROUTER_API_KEY
        kwargs["api_base"] = "https://openrouter.ai/api/v1"  # Use api_base for LiteLLM
        # OpenRouter uses OpenAI-compatible API format, not Anthropic format
        # Force LiteLLM to use OpenAI provider for OpenRouter
        kwargs["custom_llm_provider"] = "openai"
        # OpenRouter requires HTTP headers for model routing
        # LiteLLM uses extra_headers for custom headers
        kwargs["extra_headers"] = {
            "HTTP-Referer": "https://github.com/your-repo",  # Optional
            "X-Title": "ANTM Hackathon Agent",  # Optional
        }
        # Also set headers for compatibility
        kwargs["headers"] = {
            "HTTP-Referer": "https://github.com/your-repo",
            "X-Title": "ANTM Hackathon Agent",
        }
    elif model.startswith("anthropic/") and ANTHROPIC_API_KEY:
        kwargs["api_key"] = ANTHROPIC_API_KEY
    elif model.startswith("openai/") and OPENAI_API_KEY:
        kwargs["api_key"] = OPENAI_API_KEY
    
    return kwargs


@lru_cache(maxsize=1)
def _init_default_lm() -> dspy.LM:
    """Initialize default language model (cached)."""
    try:
        kwargs = _lm_kwargs(DEFAULT_MODEL)
        lm = dspy.LM(DEFAULT_MODEL, **kwargs)
    except Exception:
        # Fallback to alternative model
        kwargs = _lm_kwargs(FALLBACK_MODEL)
        lm = dspy.LM(FALLBACK_MODEL, **kwargs)
    dspy.configure(lm=lm)
    return lm


def get_default_lm(model: Optional[str] = None) -> dspy.LM:
    """
    Return the default LM, instantiating once per process.

    Args:
        model: Optional model name override

    Returns:
        Configured DSPy language model
    """
    if model and model != DEFAULT_MODEL:
        kwargs = _lm_kwargs(model)
        return dspy.LM(model, **kwargs)
    return _init_default_lm()

