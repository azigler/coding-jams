# Correct Logic for Question 1

## Question
Store #5's November 2022 revenue dropped from $500K in October to $300K. Investigate which warehouse experienced an inventory shortage that affected Store #5, and identify which product category was most impacted by this shortage. What was the revenue impact in dollars for this specific warehouse-category combination?

## Expected Answer
- warehouse_sk: 3
- category: Electronics
- revenue_impact: -17958.17

## Correct Logic Steps

### Step 1: Verify Store #5 Revenue
```sql
SELECT d.d_moy, SUM(ss.ss_sales_price) as revenue
FROM store_sales ss
JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
WHERE ss.ss_store_sk = 5 
  AND d.d_year = 2022 
  AND d.d_moy IN (10, 11)
GROUP BY d.d_moy
```
**Result**: Oct=$1,542,644.58, Nov=$2,036,587.68
**Note**: Actual revenue increased, but question asks about specific warehouse-category impact

### Step 2: Find Inventory Shortages by Warehouse and Category
```sql
WITH oct_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        SUM(inv.inv_quantity_on_hand) as oct_qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 10
    GROUP BY w.w_warehouse_sk, i.i_category
),
nov_inv AS (
    SELECT 
        w.w_warehouse_sk,
        i.i_category,
        SUM(inv.inv_quantity_on_hand) as nov_qty
    FROM inventory inv
    JOIN warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
    JOIN item i ON inv.inv_item_sk = i.i_item_sk
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE d.d_year = 2022 AND d.d_moy = 11
    GROUP BY w.w_warehouse_sk, i.i_category
)
SELECT 
    COALESCE(o.w_warehouse_sk, n.w_warehouse_sk) as warehouse_sk,
    COALESCE(o.i_category, n.i_category) as category,
    COALESCE(o.oct_qty, 0) as oct_inventory,
    COALESCE(n.nov_qty, 0) as nov_inventory,
    (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) as shortage
FROM oct_inv o
FULL OUTER JOIN nov_inv n ON o.w_warehouse_sk = n.w_warehouse_sk 
                           AND o.i_category = n.i_category
WHERE (COALESCE(n.nov_qty, 0) - COALESCE(o.oct_qty, 0)) < 0
ORDER BY shortage ASC
```
**Result**: Warehouse 3, Electronics has shortage (Oct=13573, Nov=7092, Change=-6481)

### Step 3: Find Items with Warehouse 3 Electronics Shortage
```sql
WITH oct_inv AS (
    SELECT inv.inv_item_sk, SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE inv.inv_warehouse_sk = 3 AND d.d_year = 2022 AND d.d_moy = 10
    GROUP BY inv.inv_item_sk
),
nov_inv AS (
    SELECT inv.inv_item_sk, SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE inv.inv_warehouse_sk = 3 AND d.d_year = 2022 AND d.d_moy = 11
    GROUP BY inv.inv_item_sk
),
shortages AS (
    SELECT COALESCE(o.inv_item_sk, n.inv_item_sk) as item_sk,
           (COALESCE(n.qty, 0) - COALESCE(o.qty, 0)) as shortage
    FROM oct_inv o
    FULL OUTER JOIN nov_inv n ON o.inv_item_sk = n.inv_item_sk
    WHERE (COALESCE(n.qty, 0) - COALESCE(o.qty, 0)) < 0
)
SELECT item_sk, shortage
FROM shortages
JOIN item i ON shortages.item_sk = i.i_item_sk
WHERE i.i_category = 'Electronics'
ORDER BY shortage ASC
```

### Step 4: Calculate Revenue Impact
**Key Insight**: Revenue impact is calculated for Electronics items that:
1. Had inventory at Warehouse 3
2. Had a shortage (inventory decreased Oct→Nov)
3. Were sold at Store #5

```sql
WITH oct_inv AS (
    SELECT inv.inv_item_sk, SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE inv.inv_warehouse_sk = 3 AND d.d_year = 2022 AND d.d_moy = 10
    GROUP BY inv.inv_item_sk
),
nov_inv AS (
    SELECT inv.inv_item_sk, SUM(inv.inv_quantity_on_hand) as qty
    FROM inventory inv
    JOIN date_dim d ON inv.inv_date_sk = d.d_date_sk
    WHERE inv.inv_warehouse_sk = 3 AND d.d_year = 2022 AND d.d_moy = 11
    GROUP BY inv.inv_item_sk
),
shortages AS (
    SELECT COALESCE(o.inv_item_sk, n.inv_item_sk) as item_sk,
           (COALESCE(n.qty, 0) - COALESCE(o.qty, 0)) as shortage
    FROM oct_inv o
    FULL OUTER JOIN nov_inv n ON o.inv_item_sk = n.inv_item_sk
    WHERE (COALESCE(n.qty, 0) - COALESCE(o.qty, 0)) < 0
)
SELECT 
    d.d_moy,
    SUM(ss.ss_sales_price) as revenue
FROM store_sales ss
JOIN item i ON ss.ss_item_sk = i.i_item_sk
JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
JOIN shortages s ON ss.ss_item_sk = s.item_sk
WHERE ss.ss_store_sk = 5 
  AND i.i_category = 'Electronics'
  AND d.d_year = 2022 
  AND d.d_moy IN (10, 11)
GROUP BY d.d_moy
ORDER BY d.d_moy
```

**Revenue Impact** = November revenue - October revenue (for affected items)

## Key Insights

1. **Inventory Shortage Detection**: Compare inventory levels between months using FULL OUTER JOIN to catch items that appear/disappear
2. **Linking to Sales**: Join shortage items to store_sales to find which store was affected
3. **Category Filtering**: Filter by category (Electronics) to find most impacted category
4. **Revenue Impact**: Calculate revenue difference for affected items only

## Common Mistakes to Avoid

1. ❌ Don't join store_sales.store_sk to warehouse.warehouse_sk (different entities!)
2. ❌ Don't assume all Electronics items are affected - only those with Warehouse 3 shortage
3. ❌ Don't calculate total revenue change - calculate change for affected items only
4. ✅ Use inventory table as bridge between warehouses and items
5. ✅ Compare inventory levels between months to find shortages
6. ✅ Join shortage items to sales to calculate impact

