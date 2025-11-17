#!/usr/bin/env python3
"""Test queries to verify understanding of schema and relationships."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data.duckdb_client import DuckDBClient
from src.data.mcp_client import get_mcp_client


def test_query(client, name, query, expected_columns=None, min_rows=0):
    """Test a query and verify results."""
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print(f"{'='*80}")
    print(f"Query: {query[:200]}...")
    
    try:
        rows, columns = client.execute_query(query)
        print(f"✓ SUCCESS: {len(rows)} rows, columns: {columns}")
        
        if expected_columns:
            missing = set(expected_columns) - set(columns)
            if missing:
                print(f"⚠ WARNING: Missing expected columns: {missing}")
            else:
                print(f"✓ All expected columns present")
        
        if len(rows) < min_rows:
            print(f"⚠ WARNING: Expected at least {min_rows} rows, got {len(rows)}")
        else:
            print(f"✓ Row count OK")
        
        if rows:
            print(f"\nFirst row sample:")
            for i, col in enumerate(columns[:5]):  # First 5 columns
                print(f"  {col}: {rows[0][i]}")
        
        return True
    except Exception as e:
        print(f"✗ FAILED: {e}")
        return False


def run_schema_tests():
    """Run comprehensive schema understanding tests."""
    print("=" * 80)
    print("SCHEMA VERIFICATION TESTS")
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
        tests = []
        
        # Test 1: Basic store_sales query
        tests.append((
            "Store sales basic query",
            """
            SELECT ss.ss_store_sk, ss.ss_item_sk, ss.ss_sold_date_sk, ss.ss_sales_price
            FROM store_sales ss
            LIMIT 5
            """,
            ['ss_store_sk', 'ss_item_sk', 'ss_sold_date_sk', 'ss_sales_price'],
            1
        ))
        
        # Test 2: Store sales with date_dim join
        tests.append((
            "Store sales with date_dim join",
            """
            SELECT ss.ss_store_sk, d.d_year, d.d_moy, ss.ss_sales_price
            FROM store_sales ss
            JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
            WHERE d.d_year = 2022 AND d.d_moy = 11
            LIMIT 5
            """,
            ['ss_store_sk', 'd_year', 'd_moy', 'ss_sales_price'],
            1
        ))
        
        # Test 3: Store sales with item join
        tests.append((
            "Store sales with item join",
            """
            SELECT ss.ss_store_sk, i.i_category, i.i_brand, ss.ss_sales_price
            FROM store_sales ss
            JOIN item i ON ss.ss_item_sk = i.i_item_sk
            LIMIT 5
            """,
            ['ss_store_sk', 'i_category', 'i_brand', 'ss_sales_price'],
            1
        ))
        
        # Test 4: Inventory query
        tests.append((
            "Inventory basic query",
            """
            SELECT inv.inv_warehouse_sk, inv.inv_item_sk, inv.inv_date_sk, inv.inv_quantity_on_hand
            FROM inventory inv
            LIMIT 5
            """,
            ['inv_warehouse_sk', 'inv_item_sk', 'inv_date_sk', 'inv_quantity_on_hand'],
            1
        ))
        
        # Test 5: Inventory with warehouse and item joins
        tests.append((
            "Inventory with warehouse and item joins",
            """
            SELECT w.w_warehouse_sk, w.w_city, i.i_category, inv.inv_quantity_on_hand
            FROM inventory inv
            JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
            JOIN item i ON inv.inv_item_sk = i.i_item_sk
            LIMIT 5
            """,
            ['w_warehouse_sk', 'w_city', 'i_category', 'inv_quantity_on_hand'],
            1
        ))
        
        # Test 6: Store sales filtered by store
        tests.append((
            "Store sales for specific store",
            """
            SELECT ss.ss_store_sk, d.d_year, d.d_moy, SUM(ss.ss_sales_price) as total_revenue
            FROM store_sales ss
            JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
            WHERE ss.ss_store_sk = 5 AND d.d_year = 2022 AND d.d_moy IN (10, 11)
            GROUP BY ss.ss_store_sk, d.d_year, d.d_moy
            """,
            ['ss_store_sk', 'd_year', 'd_moy', 'total_revenue'],
            1
        ))
        
        # Test 7: Inventory shortage detection
        tests.append((
            "Inventory shortage by warehouse and category",
            """
            SELECT w.w_warehouse_sk, i.i_category, SUM(inv.inv_quantity_on_hand) as total_inventory
            FROM inventory inv
            JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
            JOIN item i ON inv.inv_item_sk = i.i_item_sk
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE d.d_year = 2022 AND d.d_moy = 11
            GROUP BY w.w_warehouse_sk, i.i_category
            ORDER BY total_inventory ASC
            LIMIT 5
            """,
            ['w_warehouse_sk', 'i_category', 'total_inventory'],
            1
        ))
        
        # Test 8: Store sales revenue by category
        tests.append((
            "Store sales revenue by category",
            """
            SELECT i.i_category, SUM(ss.ss_sales_price) as category_revenue
            FROM store_sales ss
            JOIN item i ON ss.ss_item_sk = i.i_item_sk
            JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
            WHERE ss.ss_store_sk = 5 AND d.d_year = 2022 AND d.d_moy = 11
            GROUP BY i.i_category
            ORDER BY category_revenue DESC
            LIMIT 5
            """,
            ['i_category', 'category_revenue'],
            1
        ))
        
        # Run all tests
        passed = 0
        failed = 0
        
        for name, query, expected_cols, min_rows in tests:
            if test_query(client, name, query, expected_cols, min_rows):
                passed += 1
            else:
                failed += 1
        
        print(f"\n{'='*80}")
        print(f"TEST SUMMARY: {passed} passed, {failed} failed out of {len(tests)} tests")
        print(f"{'='*80}")
        
        return passed, failed
        
    finally:
        if not mcp_client:
            client.__exit__(None, None, None)


if __name__ == '__main__':
    run_schema_tests()

