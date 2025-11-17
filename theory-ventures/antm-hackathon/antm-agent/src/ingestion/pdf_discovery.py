"""Selective PDF discovery and on-demand ingestion."""

from __future__ import annotations

import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


def discover_relevant_pdfs(
    question: str,
    dataset_root: Path,
    max_pdfs: int = 10,
) -> List[Dict[str, str]]:
    """
    Discover relevant PDFs by searching file names and metadata.
    
    Uses heuristics to find PDFs that might contain relevant information:
    - Date matching (e.g., "2022" in question → PDFs with "2022" in name)
    - Keyword matching (e.g., "warehouse" → warehouse_picking_slips, shipping_manifests)
    - Store/warehouse numbers (e.g., "Store #5" → PDFs with "5" or "WH5")
    
    Args:
        question: Natural language question
        dataset_root: Root directory of dataset (contains annual_reports/, etc.)
        max_pdfs: Maximum number of PDFs to return
        
    Returns:
        List of dicts with 'path', 'category', 'reason' (why it was selected)
    """
    if not dataset_root.exists():
        logger.warning(f"Dataset root does not exist: {dataset_root}")
        return []
    
    question_lower = question.lower()
    relevant_pdfs = []
    
    # Extract key information from question
    # Dates (years, months)
    years = re.findall(r'\b(20\d{2})\b', question)
    months = re.findall(r'\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b', question_lower)
    month_numbers = {
        'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
        'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
        'may': '05', 'june': '06', 'jun': '06',
        'july': '07', 'jul': '07', 'august': '08', 'aug': '08',
        'september': '09', 'sep': '09', 'october': '10', 'oct': '10',
        'november': '11', 'nov': '11', 'december': '12', 'dec': '12',
    }
    
    # Store/warehouse numbers
    store_numbers = re.findall(r'store\s*#?\s*(\d+)', question_lower)
    warehouse_numbers = re.findall(r'warehouse\s*#?\s*(\d+)|wh\s*(\d+)', question_lower)
    warehouse_nums = [w[0] or w[1] for w in warehouse_numbers]
    
    # Keywords that map to PDF categories
    category_keywords = {
        'annual_reports': ['annual', 'report', 'fiscal', 'year'],
        'quarterly_reports': ['quarterly', 'q1', 'q2', 'q3', 'q4'],
        'shipping_manifests': ['shipping', 'manifest', 'warehouse', 'shipment', 'delivery'],
        'warehouse_picking_slips': ['picking', 'warehouse', 'inventory', 'shortage'],
        'inventory_receiving': ['inventory', 'receiving', 'stock', 'warehouse'],
        'store_reports': ['store', 'retail', 'location'],
        'sales_receipts': ['receipt', 'sale', 'transaction', 'purchase'],
        'purchase_orders': ['purchase', 'order', 'po', 'procurement'],
        'promotional_flyers': ['promotion', 'flyer', 'advertisement', 'marketing'],
        'product_catalogs': ['catalog', 'product', 'item', 'category'],
    }
    
    # Determine which categories to search
    relevant_categories = []
    for category, keywords in category_keywords.items():
        if any(kw in question_lower for kw in keywords):
            relevant_categories.append(category)
    
    # If no categories matched, search all (but prioritize by date/store matches)
    if not relevant_categories:
        relevant_categories = list(category_keywords.keys())
    
    # Search PDF directories
    pdf_dirs = {
        'annual_reports': dataset_root / 'annual_reports' / 'pdf',
        'quarterly_reports': dataset_root / 'quarterly_reports' / 'pdf',
        'shipping_manifests': dataset_root / 'shipping_manifests' / 'pdf',
        'warehouse_picking_slips': dataset_root / 'warehouse_picking_slips' / 'pdf',
        'inventory_receiving': dataset_root / 'inventory_receiving' / 'pdf',
        'store_reports': dataset_root / 'store_reports' / 'pdf',
        'sales_receipts': dataset_root / 'sales_receipts' / 'pdf',
        'purchase_orders': dataset_root / 'purchase_orders' / 'pdf',
        'promotional_flyers': dataset_root / 'promotional_flyers' / 'pdf',
        'product_catalogs': dataset_root / 'product_catalogs' / 'pdf',
    }
    
    scored_pdfs = []
    
    for category in relevant_categories:
        pdf_dir = pdf_dirs.get(category)
        if not pdf_dir or not pdf_dir.exists():
            continue
        
        # Find PDFs in this category
        pdf_files = list(pdf_dir.glob("*.pdf"))
        
        for pdf_path in pdf_files:
            score = 0
            reasons = []
            filename_lower = pdf_path.name.lower()
            
            # Score by date matches
            for year in years:
                if year in filename_lower:
                    score += 10
                    reasons.append(f"contains year {year}")
            
            # Score by month matches
            for month in months:
                month_num = month_numbers.get(month)
                if month_num and month_num in filename_lower:
                    score += 5
                    reasons.append(f"contains month {month}")
            
            # Score by store/warehouse numbers
            for store_num in store_numbers:
                if store_num in filename_lower or f"store{store_num}" in filename_lower:
                    score += 8
                    reasons.append(f"mentions store {store_num}")
            
            for wh_num in warehouse_nums:
                if wh_num in filename_lower or f"wh{wh_num}" in filename_lower or f"warehouse{wh_num}" in filename_lower:
                    score += 8
                    reasons.append(f"mentions warehouse {wh_num}")
            
            # Score by category relevance
            if category in relevant_categories[:3]:  # Top 3 categories
                score += 3
            
            # Always include some PDFs from relevant categories (even with low scores)
            if category in relevant_categories and score == 0:
                score = 1
                reasons.append(f"category match: {category}")
            
            if score > 0:
                scored_pdfs.append({
                    'path': str(pdf_path),
                    'category': category,
                    'score': score,
                    'reason': ', '.join(reasons) if reasons else category,
                })
    
    # Sort by score and return top N
    scored_pdfs.sort(key=lambda x: x['score'], reverse=True)
    return scored_pdfs[:max_pdfs]


def ingest_pdfs_on_demand(
    pdf_paths: List[Dict[str, str]],
    lancedb_path: Path,
    parsed_output_dir: Path,
    table_name: str = "pdf_chunks",
) -> int:
    """
    Parse and ingest selected PDFs on-demand.
    
    Args:
        pdf_paths: List of PDF info dicts from discover_relevant_pdfs
        lancedb_path: Path to LanceDB directory
        parsed_output_dir: Directory to store parsed markdown
        table_name: LanceDB table name
        
    Returns:
        Number of chunks ingested
    """
    from src.ingestion.pdf_parser import parse_pdf
    from src.ingestion.pdf_ingester import ingest_pdf_to_lancedb
    
    parsed_output_dir.mkdir(parents=True, exist_ok=True)
    total_chunks = 0
    
    for pdf_info in pdf_paths:
        pdf_path = Path(pdf_info['path'])
        category = pdf_info.get('category', 'unknown')
        
        if not pdf_path.exists():
            logger.warning(f"PDF not found: {pdf_path}")
            continue
        
        try:
            # Parse PDF to markdown
            parsed_path = parsed_output_dir / f"{pdf_path.stem}_parsed.md"
            if not parsed_path.exists():
                logger.info(f"Parsing PDF: {pdf_path.name}")
                from src.ingestion.pdf_parser import parse_pdf_batch
                # parse_pdf_batch expects a list of directories, but we have a single file
                # Use a temporary approach - parse single file
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(str(pdf_path))
                    markdown_text = ""
                    for page in doc:
                        markdown_text += page.get_text() + "\n\n"
                    doc.close()
                except Exception as parse_error:
                    logger.warning(f"PyMuPDF failed for {pdf_path.name}, trying pdfplumber: {parse_error}")
                    try:
                        import pdfplumber
                        with pdfplumber.open(str(pdf_path)) as pdf:
                            markdown_text = ""
                            for page in pdf.pages:
                                markdown_text += page.extract_text() + "\n\n"
                    except Exception as e2:
                        logger.error(f"Failed to parse {pdf_path.name}: {e2}")
                        continue
                
                parsed_path.write_text(markdown_text, encoding='utf-8')
            else:
                logger.info(f"Using cached parsed PDF: {pdf_path.name}")
            
            # Ingest into LanceDB
            chunks = ingest_pdf_to_lancedb(
                parsed_path,
                lancedb_path,
                table_name=table_name,
                category=category,
                mode="append",
            )
            total_chunks += chunks
            logger.info(f"Ingested {chunks} chunks from {pdf_path.name}")
            
        except Exception as e:
            logger.error(f"Error ingesting {pdf_path.name}: {e}")
            continue
    
    return total_chunks

