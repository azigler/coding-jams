"""PDF ingester for chunking markdown and storing in LanceDB."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List, Optional

import lancedb
import pandas as pd
from openai import OpenAI
from tqdm import tqdm

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-large"
DEFAULT_CHUNK_SIZE = 1200  # characters
DEFAULT_CHUNK_OVERLAP = 200


def chunk_markdown(
    markdown_text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> List[str]:
    """
    Chunk markdown while preferring paragraph boundaries and keeping limited overlap.

    Args:
        markdown_text: Full markdown text to chunk
        chunk_size: Target chunk size in characters
        overlap: Overlap size in characters

    Returns:
        List of chunk strings
    """
    paragraphs = [p.strip() for p in markdown_text.split("\n\n") if p.strip()]
    if not paragraphs:
        return []

    chunks: List[str] = []
    buffer: List[str] = []
    buffer_len = 0

    for para in paragraphs:
        candidate_len = buffer_len + len(para) + (2 if buffer else 0)
        if candidate_len > chunk_size and buffer:
            chunks.append("\n\n".join(buffer))

            if overlap > 0:
                overlap_paragraphs: List[str] = []
                overlap_len = 0
                for prev_para in reversed(buffer):
                    overlap_paragraphs.insert(0, prev_para)
                    overlap_len += len(prev_para)
                    if overlap_len >= overlap:
                        break
                buffer = overlap_paragraphs
                buffer_len = sum(len(p) for p in buffer)
            else:
                buffer = []
                buffer_len = 0

        buffer.append(para)
        buffer_len += len(para) + 2

    if buffer:
        chunks.append("\n\n".join(buffer))

    return chunks


def infer_section_title(chunk_text: str) -> Optional[str]:
    """Return the first markdown heading found in the chunk, if any."""
    for line in chunk_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            return stripped.lstrip("#").strip()
    return None


def embed_chunks(chunks: List[str], model: str, batch_size: int = 64) -> List[List[float]]:
    """
    Generate embeddings for chunks using OpenAI API or OpenRouter.

    Args:
        chunks: List of text chunks to embed
        model: Embedding model name
        batch_size: Batch size for API calls

    Returns:
        List of embedding vectors
    """
    # Check for OpenRouter first (supports OpenAI embeddings)
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openrouter_key:
        # Use OpenRouter as proxy
        client = OpenAI(
            api_key=openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        )
    elif openai_key:
        client = OpenAI(api_key=openai_key)
    else:
        raise EnvironmentError(
            "Either OPENROUTER_API_KEY or OPENAI_API_KEY environment variable must be set."
        )

    vectors: List[List[float]] = []

    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        response = client.embeddings.create(model=model, input=batch)
        # Preserve ordering to align with chunk indices
        vectors.extend([item.embedding for item in sorted(response.data, key=lambda x: x.index)])

    return vectors


def records_from_chunks(
    chunks: List[str],
    embeddings: List[List[float]],
    source: Path,
    category: Optional[str] = None,
) -> List[Dict]:
    """
    Create LanceDB records from chunks and embeddings.

    Args:
        chunks: List of text chunks
        embeddings: List of embedding vectors
        source: Source file path
        category: Optional category metadata

    Returns:
        List of record dictionaries
    """
    if len(chunks) != len(embeddings):
        raise ValueError("Number of chunks and embeddings must match.")

    records: List[Dict] = []
    source_name = source.stem

    for idx, (chunk_text, vector) in enumerate(zip(chunks, embeddings)):
        records.append(
            {
                "id": f"{source_name}-{idx}",
                "source_path": str(source),
                "source_name": source_name,
                "category": category or "unknown",
                "chunk_index": idx,
                "content": chunk_text,
                "section": infer_section_title(chunk_text),
                "vector": vector,
            }
        )

    return records


def load_into_lancedb(
    records: List[Dict],
    db_path: Path,
    table_name: str,
    mode: str = "append",
):
    """
    Load records into LanceDB table.

    Args:
        records: List of record dictionaries
        db_path: Path to LanceDB directory
        table_name: Name of the table
        mode: "overwrite", "append", or "create"
    """
    if not records:
        raise ValueError("No records to load into LanceDB.")

    db_path.mkdir(parents=True, exist_ok=True)
    db = lancedb.connect(str(db_path))
    data = pd.DataFrame.from_records(records)

    if table_name in db.table_names():
        table = db.open_table(table_name)
        if mode == "overwrite":
            # Delete existing records from same source
            source_value = records[0]["source_path"].replace("'", "''")
            table.delete(f"source_path = '{source_value}'")
            table.add(data)
        else:  # append
            table.add(data)
    else:
        db.create_table(table_name, data=data, mode="overwrite")


def ingest_pdf_to_lancedb(
    markdown_path: Path,
    db_path: Path,
    table_name: str = "pdf_chunks",
    category: Optional[str] = None,
    model: str = DEFAULT_EMBEDDING_MODEL,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
    mode: str = "append",
) -> int:
    """
    Ingest a single parsed PDF markdown file into LanceDB.

    Args:
        markdown_path: Path to parsed markdown file
        db_path: Path to LanceDB directory
        table_name: Name of the LanceDB table
        category: Category metadata (e.g., "annual_reports", "product_catalogs")
        model: Embedding model name
        chunk_size: Chunk size in characters
        overlap: Overlap size in characters
        mode: "overwrite", "append", or "create"

    Returns:
        Number of chunks ingested
    """
    if not markdown_path.exists():
        raise FileNotFoundError(f"Markdown file not found: {markdown_path}")

    # Load markdown
    markdown_text = markdown_path.read_text(encoding="utf-8")

    # Chunk markdown
    chunks = chunk_markdown(markdown_text, chunk_size=chunk_size, overlap=overlap)
    if not chunks:
        return 0

    # Generate embeddings
    embeddings = embed_chunks(chunks, model=model)

    # Create records
    records = records_from_chunks(chunks, embeddings, markdown_path, category=category)

    # Load into LanceDB
    load_into_lancedb(records, db_path, table_name, mode=mode)

    return len(records)


def ingest_pdf_batch(
    markdown_dir: Path,
    db_path: Path,
    table_name: str = "pdf_chunks",
    category: Optional[str] = None,
    model: str = DEFAULT_EMBEDDING_MODEL,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
    progress: bool = True,
) -> dict:
    """
    Ingest all parsed PDF markdown files from a directory into LanceDB.

    Args:
        markdown_dir: Directory containing parsed markdown files
        db_path: Path to LanceDB directory
        table_name: Name of the LanceDB table
        category: Category metadata for all files
        model: Embedding model name
        chunk_size: Chunk size in characters
        overlap: Overlap size in characters
        progress: Show progress bar

    Returns:
        Dictionary with ingestion statistics
    """
    stats = {"total": 0, "success": 0, "failed": 0, "total_chunks": 0, "errors": []}

    markdown_files = list(markdown_dir.glob("*_parsed.md"))
    stats["total"] = len(markdown_files)

    if progress:
        markdown_files = tqdm(markdown_files, desc=f"Ingesting {category or 'PDFs'}")

    for markdown_file in markdown_files:
        try:
            chunks_count = ingest_pdf_to_lancedb(
                markdown_file,
                db_path,
                table_name=table_name,
                category=category,
                model=model,
                chunk_size=chunk_size,
                overlap=overlap,
                mode="append",
            )
            stats["success"] += 1
            stats["total_chunks"] += chunks_count
        except Exception as e:
            stats["failed"] += 1
            stats["errors"].append(f"{markdown_file.name}: {str(e)}")
            if not progress:
                print(f"Error ingesting {markdown_file.name}: {e}")

    return stats

