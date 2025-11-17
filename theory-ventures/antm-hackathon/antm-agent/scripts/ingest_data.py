#!/usr/bin/env python3
"""Data ingestion script for loading all hackathon data."""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data.duckdb_client import DuckDBClient
from src.ingestion.pdf_parser import parse_pdf_batch
from src.ingestion.pdf_ingester import ingest_pdf_batch


def get_dataset_paths(project_root: Path) -> dict:
    """Get paths to all dataset directories."""
    dataset_root = project_root / "dataset"
    return {
        "parquet_dir": dataset_root / "data",
        "logs_dir": dataset_root / "data" / "logs",
        "pdf_dirs": {
            "annual_reports": dataset_root / "annual_reports" / "pdf",
            "product_catalogs": dataset_root / "product_catalogs" / "pdf",
            "promotional_flyers": dataset_root / "promotional_flyers" / "pdf",
            "purchase_orders": dataset_root / "purchase_orders" / "pdf",
            "quarterly_reports": dataset_root / "quarterly_reports" / "pdf",
            "sales_receipts": dataset_root / "sales_receipts" / "pdf",
            "shipping_manifests": dataset_root / "shipping_manifests" / "pdf",
            "store_reports": dataset_root / "store_reports" / "pdf",
            "warehouse_picking_slips": dataset_root / "warehouse_picking_slips" / "pdf",
            "inventory_receiving": dataset_root / "inventory_receiving" / "pdf",
        },
    }


def ingest_parquet(client: DuckDBClient, parquet_dir: Path) -> dict:
    """Load parquet files into DuckDB."""
    print("\n=== Loading Parquet Files ===")
    count = client.load_parquet_files(parquet_dir)
    print(f"✓ Loaded {count} parquet tables into DuckDB")
    return {"parquet_tables": count}


def ingest_logs(client: DuckDBClient, logs_dir: Path) -> dict:
    """Load log files into DuckDB."""
    print("\n=== Loading Log Files ===")
    count = client.load_logs(logs_dir)
    print(f"✓ Loaded {count} log tables into DuckDB")
    return {"log_tables": count}


def ingest_pdfs(
    pdf_dirs: dict,
    parsed_output_dir: Path,
    lancedb_path: Path,
    table_name: str = "pdf_chunks",
) -> dict:
    """Parse and ingest all PDFs."""
    print("\n=== Parsing PDFs ===")
    
    # Collect all PDF directories
    pdf_dir_list = [d for d in pdf_dirs.values() if d.exists()]
    
    # Parse all PDFs to markdown
    parse_stats = parse_pdf_batch(pdf_dir_list, parsed_output_dir, progress=True)
    print(f"✓ Parsed {parse_stats['success']}/{parse_stats['total']} PDFs")
    if parse_stats["failed"] > 0:
        print(f"⚠ {parse_stats['failed']} PDFs failed to parse")
    
    # Ingest parsed markdowns into LanceDB by category
    print("\n=== Ingesting PDFs into LanceDB ===")
    total_chunks = 0
    category_stats = {}
    
    for category, pdf_dir in pdf_dirs.items():
        if not pdf_dir.exists():
            continue
        
        # Find parsed markdowns for this category
        # PDFs are parsed to parsed_output_dir, we need to match them
        # For now, we'll ingest all parsed markdowns together
        pass
    
    # Ingest all parsed markdowns together
    ingest_stats = ingest_pdf_batch(
        parsed_output_dir,
        lancedb_path,
        table_name=table_name,
        category=None,  # Will be set per file if we can infer it
        progress=True,
    )
    total_chunks = ingest_stats["total_chunks"]
    print(f"✓ Ingested {ingest_stats['success']}/{ingest_stats['total']} PDFs")
    print(f"✓ Created {total_chunks} chunks in LanceDB")
    
    return {
        "parse_stats": parse_stats,
        "ingest_stats": ingest_stats,
        "total_chunks": total_chunks,
    }


def save_ingestion_status(status: dict, status_path: Path):
    """Save ingestion status to JSON file."""
    status_path.parent.mkdir(parents=True, exist_ok=True)
    with open(status_path, "w") as f:
        json.dump(status, f, indent=2)


def main():
    """Main ingestion function."""
    parser = argparse.ArgumentParser(description="Ingest hackathon dataset")
    parser.add_argument(
        "--parquet-only",
        action="store_true",
        help="Only load parquet files",
    )
    parser.add_argument(
        "--pdf-only",
        action="store_true",
        help="Only parse and ingest PDFs",
    )
    parser.add_argument(
        "--logs-only",
        action="store_true",
        help="Only load log files",
    )
    parser.add_argument(
        "--project-root",
        type=str,
        default=None,
        help="Project root directory (default: auto-detect)",
    )

    args = parser.parse_args()

    # Determine project root
    if args.project_root:
        project_root = Path(args.project_root)
    else:
        project_root = Path(__file__).resolve().parents[2]

    # Get paths
    paths = get_dataset_paths(project_root)
    data_dir = project_root / "antm-agent" / "data"
    parsed_pdfs_dir = data_dir / "parsed_pdfs"
    lancedb_path = data_dir / "lancedb"
    status_path = data_dir / "ingestion_status.json"

    # Initialize status
    status = {}

    # Ingest parquet files
    if not args.pdf_only and not args.logs_only:
        with DuckDBClient() as client:
            status["parquet"] = ingest_parquet(client, paths["parquet_dir"])

    # Ingest logs
    if not args.pdf_only and not args.parquet_only:
        with DuckDBClient() as client:
            status["logs"] = ingest_logs(client, paths["logs_dir"])

    # Ingest PDFs
    if not args.parquet_only and not args.logs_only:
        status["pdfs"] = ingest_pdfs(
            paths["pdf_dirs"],
            parsed_pdfs_dir,
            lancedb_path,
        )

    # Save status
    save_ingestion_status(status, status_path)
    print(f"\n✓ Ingestion complete! Status saved to {status_path}")

    # Verify
    print("\n=== Verification ===")
    with DuckDBClient() as client:
        tables = client.list_tables()
        print(f"✓ DuckDB has {len(tables)} tables")
        if tables:
            print(f"  Sample tables: {', '.join(tables[:5])}")


if __name__ == "__main__":
    main()

