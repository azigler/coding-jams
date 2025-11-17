"""Configuration management for the agent."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Configuration class for agent settings."""

    # Project paths
    PROJECT_ROOT: Path = Path(__file__).resolve().parents[3]
    AGENT_ROOT: Path = PROJECT_ROOT / "antm-agent"
    DATASET_ROOT: Path = PROJECT_ROOT / "dataset"

    # Data paths
    DUCKDB_PATH: Path = AGENT_ROOT / "data" / "duckdb" / "retail.duckdb"
    LANCEDB_PATH: Path = AGENT_ROOT / "data" / "lancedb"
    PARSED_PDFS_PATH: Path = AGENT_ROOT / "data" / "parsed_pdfs"

    # LLM configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    OPENROUTER_API_KEY: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    DSPY_MODEL: str = os.getenv("DSPY_MODEL", "openai/gpt-4o-mini")
    DSPY_TEMPERATURE: float = float(os.getenv("DSPY_TEMPERATURE", "0.2"))
    DSPY_MAX_TOKENS: int = int(os.getenv("DSPY_MAX_TOKENS", "2000"))

    # Embedding configuration
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")

    # LanceDB configuration
    LANCEDB_TABLE_NAME: str = os.getenv("LANCEDB_TABLE_NAME", "pdf_chunks")

    # Chunking configuration
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1200"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # SQL configuration
    SQL_DEFAULT_LIMIT: int = int(os.getenv("SQL_DEFAULT_LIMIT", "200"))
    SQL_TIMEOUT: int = int(os.getenv("SQL_TIMEOUT", "30"))  # seconds

    @classmethod
    def validate(cls) -> list[str]:
        """
        Validate configuration and return list of errors.

        Returns:
            List of error messages (empty if valid)
        """
        errors = []

        # Check API keys
        if not cls.OPENROUTER_API_KEY and not cls.OPENAI_API_KEY and not cls.ANTHROPIC_API_KEY:
            errors.append(
                "Either OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY must be set"
            )

        # Check paths exist (warn but don't error)
        if not cls.DATASET_ROOT.exists():
            errors.append(f"Dataset root not found: {cls.DATASET_ROOT}")

        return errors

    @classmethod
    def ensure_directories(cls):
        """Ensure all required directories exist."""
        cls.DUCKDB_PATH.parent.mkdir(parents=True, exist_ok=True)
        cls.LANCEDB_PATH.mkdir(parents=True, exist_ok=True)
        cls.PARSED_PDFS_PATH.mkdir(parents=True, exist_ok=True)


# Ensure directories on import
Config.ensure_directories()

