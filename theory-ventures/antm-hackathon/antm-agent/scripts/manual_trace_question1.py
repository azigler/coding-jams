#!/usr/bin/env python3
"""Manually trace Question 1 to understand the correct logic."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data.mcp_client import get_mcp_client
from src.data.duckdb_client import DuckDBClient
import json


def trace_question1():
    """Manually trace Question 1 to find correct answer."""
    print("=" * 80)
    print("MANUAL TRACE: Question 1")
    print("=" * 80)
    print("\nQuestion: Store #5's November 2022 revenue dropped from $500K in October to $300K.")
    print("Find: warehouse_sk, category, revenue_impact")
    print("Expected: warehouse_sk=3, category='Electronics', revenue_impact=-17958.17\n")
    
    # Get client
    mcp_client = get_mcp_client()
    if mcp_client:
        client = mcp_client
        print("[Using MCP client]")
    else:
        client = DuckDBClient()
        client.__enter__()
        print("[Using DuckDB client]")
    
    try:
        # Step 1: Verify Store #5 revenue for Oct and Nov 2022
        print("\n" + "=" * 80)
        print("STEP 1: Store #5 Revenue by Month")
        print("=" * 80)
        
        query1 = """
        SELECT 
            d.d_year,
            d.d_moy,
            SUM(ss.ss_sales_price) as total_revenue
        FROM store_sales ss
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5 
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY d.d_year, d.d_moy
        ORDER BY d.d_moy
        """
        
        rows, cols = client.execute_query(query1)
        print(f"\nQuery: {query1[:200]}...")
        print(f"\nResults ({len(rows)} rows):")
        for row in rows:
            print(f"  {dict(zip(cols, row))}")
        
        oct_revenue = None
        nov_revenue = None
        for row in rows:
            d = dict(zip(cols, row))
            if d['d_moy'] == 10:
                oct_revenue = d['total_revenue']
            elif d['d_moy'] == 11:
                nov_revenue = d['total_revenue']
        
        print(f"\nOctober revenue: ${oct_revenue:,.2f}")
        print(f"November revenue: ${nov_revenue:,.2f}")
        print(f"Drop: ${oct_revenue - nov_revenue:,.2f}")
        
        # Step 2: Find items sold at Store #5 in Oct and Nov
        print("\n" + "=" * 80)
        print("STEP 2: Items Sold at Store #5 (Oct & Nov)")
        print("=" * 80)
        
        query2 = """
        SELECT 
            i.i_item_sk,
            i.i_category,
            d.d_moy,
            SUM(ss.ss_sales_price) as category_revenue,
            COUNT(*) as sale_count
        FROM store_sales ss
        JOIN item i ON ss.ss_item_sk = i.i_item_sk
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5 
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY i.i_item_sk, i.i_category, d.d_moy
        ORDER BY i.i_category, d.d_moy
        LIMIT 20
        """
        
        rows, cols = client.execute_query(query2)
        print(f"\nQuery: {query2[:200]}...")
        print(f"\nSample results ({len(rows)} rows, showing first 10):")
        for row in rows[:10]:
            print(f"  {dict(zip(cols, row))}")
        
        # Step 3: Find revenue by category for Store #5
        print("\n" + "=" * 80)
        print("STEP 3: Revenue by Category (Oct vs Nov)")
        print("=" * 80)
        
        query3 = """
        SELECT 
            i.i_category,
            d.d_moy,
            SUM(ss.ss_sales_price) as category_revenue
        FROM store_sales ss
        JOIN item i ON ss.ss_item_sk = i.i_item_sk
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5 
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY i.i_category, d.d_moy
        ORDER BY i.i_category, d.d_moy
        """
        
        rows, cols = client.execute_query(query3)
        print(f"\nQuery: {query3[:200]}...")
        print(f"\nResults ({len(rows)} rows):")
        
        category_revenue = {}
        for row in rows:
            d = dict(zip(cols, row))
            cat = d['i_category']
            month = d['d_moy']
            revenue = d['category_revenue']
            
            if cat not in category_revenue:
                category_revenue[cat] = {}
            category_revenue[cat][month] = revenue
        
        # Find categories with revenue drops
        print("\nCategories with revenue drops:")
        drops = []
        for cat, months in category_revenue.items():
            if 10 in months and 11 in months:
                oct_rev = months[10]
                nov_rev = months[11]
                drop = nov_rev - oct_rev
                if drop < 0:
                    drops.append((cat, oct_rev, nov_rev, drop))
                    print(f"  {cat}: Oct=${oct_rev:,.2f}, Nov=${nov_rev:,.2f}, Drop=${drop:,.2f}")
        
        # Step 4: Find warehouses that supply items to Store #5
        print("\n" + "=" * 80)
        print("STEP 4: Warehouses with Inventory for Store #5 Items")
        print("=" * 80)
        
        # Get items sold at Store #5
        query4a = """
        SELECT DISTINCT ss.ss_item_sk
        FROM store_sales ss
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5 
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        LIMIT 100
        """
        
        rows, cols = client.execute_query(query4a)
        item_sks = [row[0] for row in rows]
        print(f"\nStore #5 sold {len(item_sks)} distinct items (showing first 100)")
        
        # Find inventory for those items by warehouse
        query4b = """
        SELECT 
            w.w_warehouse_sk,
            i.i_category,
            inv.inv_date_sk,
            d.d_moy,
            SUM(inv.inv_quantity_on_hand) as total_inventory
        FROM inventory inv
        JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
        JOIN item i ON inv.inv_item_sk = i.i_item_sk
        JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
        WHERE inv.inv_item_sk IN (
            SELECT DISTINCT ss.ss_item_sk
            FROM store_sales ss
            JOIN date_dim d2 ON ss.ss_sold_date_sk = d2.d_date_sk
            WHERE ss.ss_store_sk = 5 
              AND d2.d_year = 2022 
              AND d2.d_moy IN (10, 11)
        )
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY w.w_warehouse_sk, i.i_category, inv.inv_date_sk, d.d_moy
        ORDER BY w.w_warehouse_sk, i.i_category, d.d_moy
        LIMIT 50
        """
        
        rows, cols = client.execute_query(query4b)
        print(f"\nQuery: {query4b[:300]}...")
        print(f"\nResults ({len(rows)} rows, showing first 20):")
        for row in rows[:20]:
            print(f"  {dict(zip(cols, row))}")
        
        # Step 5: Compare inventory levels between months to find shortages
        print("\n" + "=" * 80)
        print("STEP 5: Inventory Shortages (Oct vs Nov)")
        print("=" * 80)
        
        query5 = """
        WITH oct_inv AS (
            SELECT 
                w.w_warehouse_sk,
                i.i_category,
                SUM(inv.inv_quantity_on_hand) as oct_inventory
            FROM inventory inv
            JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
            JOIN item i ON inv.inv_item_sk = i.i_item_sk
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_item_sk IN (
                SELECT DISTINCT ss.ss_item_sk
                FROM store_sales ss
                JOIN date_dim d2 ON ss.ss_sold_date_sk = d2.d_date_sk
                WHERE ss.ss_store_sk = 5 
                  AND d2.d_year = 2022 
                  AND d2.d_moy IN (10, 11)
            )
              AND d.d_year = 2022 
              AND d.d_moy = 10
            GROUP BY w.w_warehouse_sk, i.i_category
        ),
        nov_inv AS (
            SELECT 
                w.w_warehouse_sk,
                i.i_category,
                SUM(inv.inv_quantity_on_hand) as nov_inventory
            FROM inventory inv
            JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
            JOIN item i ON inv.inv_item_sk = i.i_item_sk
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_item_sk IN (
                SELECT DISTINCT ss.ss_item_sk
                FROM store_sales ss
                JOIN date_dim d2 ON ss.ss_sold_date_sk = d2.d_date_sk
                WHERE ss.ss_store_sk = 5 
                  AND d2.d_year = 2022 
                  AND d2.d_moy IN (10, 11)
            )
              AND d.d_year = 2022 
              AND d.d_moy = 11
            GROUP BY w.w_warehouse_sk, i.i_category
        )
        SELECT 
            COALESCE(o.w_warehouse_sk, n.w_warehouse_sk) as warehouse_sk,
            COALESCE(o.i_category, n.i_category) as category,
            COALESCE(o.oct_inventory, 0) as oct_inventory,
            COALESCE(n.nov_inventory, 0) as nov_inventory,
            (COALESCE(n.nov_inventory, 0) - COALESCE(o.oct_inventory, 0)) as inventory_change
        FROM oct_inv o
        FULL OUTER JOIN nov_inv n ON o.w_warehouse_sk = n.w_warehouse_sk 
                                   AND o.i_category = n.i_category
        WHERE (COALESCE(n.nov_inventory, 0) - COALESCE(o.oct_inventory, 0)) < 0
        ORDER BY inventory_change ASC
        LIMIT 20
        """
        
        rows, cols = client.execute_query(query5)
        print(f"\nQuery: {query5[:300]}...")
        print(f"\nWarehouses with inventory shortages ({len(rows)} rows):")
        for row in rows:
            d = dict(zip(cols, row))
            print(f"  Warehouse {d['warehouse_sk']}, Category {d['category']}: "
                  f"Oct={d['oct_inventory']}, Nov={d['nov_inventory']}, "
                  f"Change={d['inventory_change']}")
        
        # Step 6: Calculate revenue impact for Electronics category, warehouse 3
        print("\n" + "=" * 80)
        print("STEP 6: Revenue Impact for Electronics, Warehouse 3")
        print("=" * 80)
        
        query6 = """
        SELECT 
            i.i_category,
            d.d_moy,
            SUM(ss.ss_sales_price) as category_revenue
        FROM store_sales ss
        JOIN item i ON ss.ss_item_sk = i.i_item_sk
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5 
          AND i.i_category = 'Electronics'
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY i.i_category, d.d_moy
        ORDER BY d.d_moy
        """
        
        rows, cols = client.execute_query(query6)
        print(f"\nQuery: {query6[:200]}...")
        print(f"\nResults ({len(rows)} rows):")
        
        electronics_revenue = {}
        for row in rows:
            d = dict(zip(cols, row))
            month = d['d_moy']
            revenue = d['category_revenue']
            electronics_revenue[month] = revenue
            print(f"  Month {month}: ${revenue:,.2f}")
        
        if 10 in electronics_revenue and 11 in electronics_revenue:
            impact = electronics_revenue[11] - electronics_revenue[10]
            print(f"\nRevenue Impact: ${impact:,.2f}")
            print(f"Expected: -17958.17")
            print(f"Match: {abs(impact - (-17958.17)) < 0.01}")
        
        # Summary
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Expected Answer:")
        print(f"  warehouse_sk: 3")
        print(f"  category: Electronics")
        print(f"  revenue_impact: -17958.17")
        print(f"\nFound:")
        if rows:
            best_shortage = rows[0]  # First row has biggest shortage
            d = dict(zip(cols, best_shortage))
            print(f"  warehouse_sk: {d.get('warehouse_sk')}")
            print(f"  category: {d.get('category')}")
            if 10 in electronics_revenue and 11 in electronics_revenue:
                print(f"  revenue_impact: {electronics_revenue[11] - electronics_revenue[10]:,.2f}")
        
    finally:
        if not mcp_client:
            client.__exit__(None, None, None)


if __name__ == '__main__':
    trace_question1()

