#!/usr/bin/env python3
"""Diagnostic script to understand database schema and relationships."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data.duckdb_client import DuckDBClient
from src.data.mcp_client import get_mcp_client
import json


def get_table_schema(client, table_name):
    """Get full schema for a table."""
    try:
        if hasattr(client, 'execute_query'):
            # DuckDB
            result = client.execute_query(f'DESCRIBE {table_name}')
            columns = []
            for row in result[0]:
                columns.append({
                    'name': row[0],
                    'type': row[1],
                    'null': row[2] if len(row) > 2 else None,
                    'default': row[3] if len(row) > 3 else None,
                })
            return columns
        else:
            # MCP
            schema_summary = client.get_schema_summary()
            # Parse schema summary to find table
            # This is a simplified version
            return []
    except Exception as e:
        print(f"Error getting schema for {table_name}: {e}")
        return []


def analyze_relationships():
    """Analyze how tables relate to each other."""
    print("=" * 80)
    print("SCHEMA DIAGNOSTIC ANALYSIS")
    print("=" * 80)
    
    # Try MCP first, fallback to DuckDB
    mcp_client = get_mcp_client()
    if mcp_client:
        print("\n[Using MCP client]")
        client = mcp_client
    else:
        print("\n[Using DuckDB client]")
        client = DuckDBClient()
        client.__enter__()
    
    try:
        # Get all tables
        if hasattr(client, 'list_tables'):
            tables = client.list_tables()
        else:
            # MCP
            tables_info = client.list_tables()
            tables = [t.get('table_name', t) if isinstance(t, dict) else t for t in tables_info]
        
        print(f"\nTotal tables: {len(tables)}")
        
        # Key tables to analyze
        key_tables = [
            'store_sales', 'catalog_sales', 'web_sales',
            'item', 'store', 'warehouse', 'inventory',
            'date_dim', 'customer', 'store_returns'
        ]
        
        schema_info = {}
        
        for table in key_tables:
            if table in tables:
                print(f"\n{'='*80}")
                print(f"TABLE: {table}")
                print(f"{'='*80}")
                
                schema = get_table_schema(client, table)
                schema_info[table] = schema
                
                # Show key columns
                print(f"\nColumns ({len(schema)} total):")
                for col in schema[:30]:  # First 30
                    col_name = col['name'] if isinstance(col, dict) else col[0]
                    col_type = col.get('type', col[1]) if isinstance(col, dict) else col[1]
                    print(f"  {col_name:30} {col_type}")
                
                # Sample data
                try:
                    sample = client.execute_query(f'SELECT * FROM {table} LIMIT 3')
                    if sample[0]:
                        print(f"\nSample data (first row):")
                        cols = sample[1] if len(sample) > 1 else [f'col_{i}' for i in range(len(sample[0][0]))]
                        for i, val in enumerate(sample[0][0][:10]):  # First 10 columns
                            col_name = cols[i] if i < len(cols) else f'col_{i}'
                            print(f"  {col_name}: {val}")
                except Exception as e:
                    print(f"  Could not fetch sample: {e}")
        
        # Analyze relationships
        print(f"\n{'='*80}")
        print("KEY RELATIONSHIPS")
        print(f"{'='*80}")
        
        # store_sales relationships
        if 'store_sales' in schema_info:
            ss_cols = [c['name'] if isinstance(c, dict) else c[0] for c in schema_info['store_sales']]
            print("\nstore_sales joins:")
            if 'ss_item_sk' in ss_cols:
                print("  → item: ss.ss_item_sk = i.i_item_sk")
            if 'ss_store_sk' in ss_cols:
                print("  → store: ss.ss_store_sk = s.s_store_sk")
            if 'ss_sold_date_sk' in ss_cols:
                print("  → date_dim: ss.ss_sold_date_sk = d.d_date_sk")
            if 'ss_customer_sk' in ss_cols:
                print("  → customer: ss.ss_customer_sk = c.c_customer_sk")
        
        # inventory relationships
        if 'inventory' in schema_info:
            inv_cols = [c['name'] if isinstance(c, dict) else c[0] for c in schema_info['inventory']]
            print("\ninventory joins:")
            if 'inv_item_sk' in inv_cols:
                print("  → item: inv.inv_item_sk = i.i_item_sk")
            if 'inv_warehouse_sk' in inv_cols:
                print("  → warehouse: inv.inv_warehouse_sk = w.w_warehouse_sk")
            if 'inv_date_sk' in inv_cols:
                print("  → date_dim: inv.inv_date_sk = d.d_date_sk")
        
        # Save schema info
        output_file = Path(__file__).parent.parent / 'data' / 'schema_analysis.json'
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert to serializable format
        serializable_schema = {}
        for table, cols in schema_info.items():
            serializable_schema[table] = [
                {
                    'name': c['name'] if isinstance(c, dict) else c[0],
                    'type': c.get('type', c[1]) if isinstance(c, dict) else c[1],
                }
                for c in cols
            ]
        
        with open(output_file, 'w') as f:
            json.dump({
                'tables': serializable_schema,
                'relationships': {
                    'store_sales': {
                        'joins': {
                            'item': 'ss.ss_item_sk = i.i_item_sk',
                            'store': 'ss.ss_store_sk = s.s_store_sk',
                            'date_dim': 'ss.ss_sold_date_sk = d.d_date_sk',
                            'customer': 'ss.ss_customer_sk = c.c_customer_sk',
                        }
                    },
                    'inventory': {
                        'joins': {
                            'item': 'inv.inv_item_sk = i.i_item_sk',
                            'warehouse': 'inv.inv_warehouse_sk = w.w_warehouse_sk',
                            'date_dim': 'inv.inv_date_sk = d.d_date_sk',
                        }
                    }
                }
            }, f, indent=2)
        
        print(f"\n✓ Schema analysis saved to: {output_file}")
        
    finally:
        if not mcp_client:
            client.__exit__(None, None, None)


if __name__ == '__main__':
    analyze_relationships()

