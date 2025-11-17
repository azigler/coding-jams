#!/usr/bin/env python3
"""Find the correct logic by tracing items affected by warehouse shortage."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data.mcp_client import get_mcp_client
from src.data.duckdb_client import DuckDBClient


def find_correct_logic():
    """Find correct logic for Question 1."""
    print("=" * 80)
    print("FINDING CORRECT LOGIC FOR QUESTION 1")
    print("=" * 80)
    
    mcp_client = get_mcp_client()
    if mcp_client:
        client = mcp_client
    else:
        client = DuckDBClient()
        client.__enter__()
    
    try:
        # Key insight: Need to find items that:
        # 1. Were sold at Store #5 in Oct/Nov
        # 2. Are in Electronics category
        # 3. Had inventory at Warehouse 3
        # 4. Had inventory shortage at Warehouse 3 (Oct → Nov)
        # 5. Calculate revenue impact from those specific items
        
        print("\n" + "=" * 80)
        print("APPROACH: Find Electronics items with Warehouse 3 shortage")
        print("=" * 80)
        
        # Step 1: Find Electronics items with inventory at Warehouse 3 that had shortages
        query1 = """
        WITH oct_inv AS (
            SELECT 
                inv.inv_item_sk,
                SUM(inv.inv_quantity_on_hand) as oct_qty
            FROM inventory inv
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_warehouse_sk = 3
              AND d.d_year = 2022 
              AND d.d_moy = 10
            GROUP BY inv.inv_item_sk
        ),
        nov_inv AS (
            SELECT 
                inv.inv_item_sk,
                SUM(inv.inv_quantity_on_hand) as nov_qty
            FROM inventory inv
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_warehouse_sk = 3
              AND d.d_year = 2022 
              AND d.d_moy = 11
            GROUP BY inv.inv_item_sk
        ),
        shortages AS (
            SELECT 
                COALESCE(o.inv_item_sk, n.inv_item_sk) as item_sk,
                COALESCE(o.oct_qty, 0) as oct_qty,
                COALESCE(n.nov_qty, 0) as nov_qty,
                (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) as qty_change
            FROM oct_inv o
            FULL OUTER JOIN nov_inv n ON o.inv_item_sk = n.inv_item_sk
            WHERE (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) < 0
        )
        SELECT 
            s.item_sk,
            i.i_category,
            s.oct_qty,
            s.nov_qty,
            s.qty_change
        FROM shortages s
        JOIN item i ON s.item_sk = i.i_item_sk
        WHERE i.i_category = 'Electronics'
        ORDER BY s.qty_change ASC
        LIMIT 20
        """
        
        rows, cols = client.execute_query(query1)
        print(f"\nElectronics items with Warehouse 3 shortage ({len(rows)} items):")
        for row in rows[:10]:
            d = dict(zip(cols, row))
            print(f"  Item {d['item_sk']}: Oct={d['oct_qty']}, Nov={d['nov_qty']}, Change={d['qty_change']}")
        
        # Step 2: Find sales of those items at Store #5
        if rows:
            item_sks = [row[0] for row in rows]
            item_list = ','.join(map(str, item_sks[:50]))  # First 50 items
            
            query2 = f"""
            SELECT 
                ss.ss_item_sk,
                d.d_moy,
                SUM(ss.ss_sales_price) as revenue,
                COUNT(*) as sale_count
            FROM store_sales ss
            JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
            WHERE ss.ss_store_sk = 5
              AND ss.ss_item_sk IN ({item_list})
              AND d.d_year = 2022 
              AND d.d_moy IN (10, 11)
            GROUP BY ss.ss_item_sk, d.d_moy
            ORDER BY ss.ss_item_sk, d.d_moy
            """
            
            rows2, cols2 = client.execute_query(query2)
            print(f"\nSales of those items at Store #5 ({len(rows2)} sales):")
            
            # Group by month
            oct_revenue = 0
            nov_revenue = 0
            for row in rows2:
                d = dict(zip(cols2, row))
                if d['d_moy'] == 10:
                    oct_revenue += d['revenue']
                elif d['d_moy'] == 11:
                    nov_revenue += d['revenue']
            
            print(f"  October revenue: ${oct_revenue:,.2f}")
            print(f"  November revenue: ${nov_revenue:,.2f}")
            print(f"  Impact: ${nov_revenue - oct_revenue:,.2f}")
            print(f"  Expected: -17958.17")
        
        # Step 3: Alternative approach - maybe it's about items that COULDN'T be sold due to shortage?
        print("\n" + "=" * 80)
        print("ALTERNATIVE: Calculate lost sales due to inventory shortage")
        print("=" * 80)
        
        # Maybe the impact is: (inventory shortage) * (average price per item) for Electronics at Store #5
        query3 = """
        WITH oct_inv AS (
            SELECT 
                inv.inv_item_sk,
                SUM(inv.inv_quantity_on_hand) as oct_qty
            FROM inventory inv
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_warehouse_sk = 3
              AND d.d_year = 2022 
              AND d.d_moy = 10
            GROUP BY inv.inv_item_sk
        ),
        nov_inv AS (
            SELECT 
                inv.inv_item_sk,
                SUM(inv.inv_quantity_on_hand) as nov_qty
            FROM inventory inv
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_warehouse_sk = 3
              AND d.d_year = 2022 
              AND d.d_moy = 11
            GROUP BY inv.inv_item_sk
        ),
        shortages AS (
            SELECT 
                COALESCE(o.inv_item_sk, n.inv_item_sk) as item_sk,
                (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) as qty_shortage
            FROM oct_inv o
            FULL OUTER JOIN nov_inv n ON o.inv_item_sk = n.inv_item_sk
            WHERE (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) < 0
        ),
        store5_sales AS (
            SELECT 
                ss.ss_item_sk,
                AVG(ss.ss_sales_price) as avg_price,
                COUNT(*) as sale_count
            FROM store_sales ss
            JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
            WHERE ss.ss_store_sk = 5
              AND d.d_year = 2022 
              AND d.d_moy IN (10, 11)
            GROUP BY ss.ss_item_sk
        )
        SELECT 
            i.i_category,
            SUM(ABS(s.qty_shortage) * COALESCE(st.avg_price, 0)) as estimated_impact
        FROM shortages s
        JOIN item i ON s.item_sk = i.i_item_sk
        LEFT JOIN store5_sales st ON s.item_sk = st.ss_item_sk
        WHERE i.i_category = 'Electronics'
        GROUP BY i.i_category
        """
        
        rows3, cols3 = client.execute_query(query3)
        print(f"\nEstimated revenue impact from shortage:")
        for row in rows3:
            d = dict(zip(cols3, row))
            print(f"  {d['i_category']}: ${d['estimated_impact']:,.2f}")
        
        # Step 4: Try direct calculation - Electronics revenue change at Store #5
        # But only for items that had inventory at Warehouse 3
        query4 = """
        WITH w3_electronics_items AS (
            SELECT DISTINCT inv.inv_item_sk
            FROM inventory inv
            JOIN item i ON inv.inv_item_sk = i.i_item_sk
            JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
            WHERE inv.inv_warehouse_sk = 3
              AND i.i_category = 'Electronics'
              AND d.d_year = 2022 
              AND d.d_moy IN (10, 11)
        )
        SELECT 
            d.d_moy,
            SUM(ss.ss_sales_price) as revenue
        FROM store_sales ss
        JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
        WHERE ss.ss_store_sk = 5
          AND ss.ss_item_sk IN (SELECT inv_item_sk FROM w3_electronics_items)
          AND d.d_year = 2022 
          AND d.d_moy IN (10, 11)
        GROUP BY d.d_moy
        ORDER BY d.d_moy
        """
        
        rows4, cols4 = client.execute_query(query4)
        print(f"\nRevenue for Electronics items with Warehouse 3 inventory:")
        oct_rev = None
        nov_rev = None
        for row in rows4:
            d = dict(zip(cols4, row))
            print(f"  Month {d['d_moy']}: ${d['revenue']:,.2f}")
            if d['d_moy'] == 10:
                oct_rev = d['revenue']
            elif d['d_moy'] == 11:
                nov_rev = d['revenue']
        
        if oct_rev and nov_rev:
            impact = nov_rev - oct_rev
            print(f"\n  Revenue Impact: ${impact:,.2f}")
            print(f"  Expected: -17958.17")
            print(f"  Difference: ${abs(impact - (-17958.17)):,.2f}")
            if abs(impact - (-17958.17)) < 1.0:
                print(f"  ✓ MATCH!")
        
    finally:
        if not mcp_client:
            client.__exit__(None, None, None)


if __name__ == '__main__':
    find_correct_logic()

