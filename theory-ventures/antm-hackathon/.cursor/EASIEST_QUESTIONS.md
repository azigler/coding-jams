# Easiest Questions - Target for Quick Points

## **TIER 1: SIMPLEST - Single aggregation, no PDFs, no complex logic**

These are straightforward SQL queries - direct aggregations, single or simple JOINs:

1. **Question 5 (Row 4) - the category that sells most**
   - Simple: Aggregate quantities by category in 2023
   - SQL: GROUP BY category, SUM(quantity), ORDER BY DESC

2. **Question 6 (Row 5) - the year that needs validation**
   - Simple: SUM net profit by year, find MIN
   - SQL: GROUP BY year, SUM(net_profit), ORDER BY ASC

3. **Question 15 (Row 14) - the stores that exist**
   - Simple: COUNT DISTINCT stores
   - SQL: COUNT(DISTINCT store_sk)

4. **Question 30 (Row 29) - the channel that generates least revenue**
   - Simple: SUM revenue by channel (store/web/catalog), find MIN
   - SQL: UNION ALL across channels, GROUP BY, find smallest %

5. **Question 39 (Row 38) - the state that generates profit from NY**
   - Simple: SUM net_profit WHERE state = 'NY' AND year = 2023
   - Only store_sales from NY stores

6. **Question 41 (Row 40) - the months that need validation**
   - Simple: SUM revenue GROUP BY month, ORDER BY DESC, TOP 2
   - SQL: GROUP BY month, SUM(revenue), LIMIT 2

7. **Question 42 (Row 41) - the month that hits maximum sales**
   - Simple: SUM sales GROUP BY month, year, find MAX
   - SQL: GROUP BY year, month, SUM(sales), ORDER BY DESC, LIMIT 1

8. **Question 43 (Row 42) - the state that has highest profit**
   - Simple: SUM cumulative net_profit BY state, find MAX
   - SQL: GROUP BY state, SUM(net_profit), ORDER BY DESC, LIMIT 1

9. **Question 44 (Row 43) - the state that has highest profit per customer**
   - Simple: SUM(profit) / COUNT(DISTINCT customer) BY state
   - SQL: GROUP BY state, SUM(profit)/COUNT(DISTINCT customer), ORDER BY DESC

## **TIER 2: STILL EASY - Simple aggregations with date/category filters**

These need basic filtering but still straightforward:

10. **Question 4 (Row 3) - the profit that increases year over year**
    - Simple: SUM net_profit for 2021 vs 2022, calculate difference
    - SQL: WHERE year IN (2021, 2022), GROUP BY year, calculate diff

11. **Question 7 (Row 6) - the store that has highest profit in 2022**
    - Simple: SUM net_profit WHERE year=2022 GROUP BY store, find MAX
    - Need store name lookup

12. **Question 8 (Row 7) - the city that sells most items in 2022**
    - Simple: SUM quantity WHERE year=2022 GROUP BY city, find MAX
    - SQL: GROUP BY city, SUM(quantity), ORDER BY DESC

13. **Question 9 (Row 8) - the product that sells most in 2022 holidays**
    - Simple: SUM quantity WHERE year=2022 AND month IN (11,12) GROUP BY item
    - Need product name lookup

14. **Question 10 (Row 9) - the quarter that succeeds most**
    - Simple: SUM net_profit GROUP BY quarter, find MAX
    - Need UNION ALL across store/web/catalog sales

15. **Question 12 (Row 11) - the item that sells most**
    - Simple: SUM quantity WHERE year=2023 GROUP BY item, find MAX
    - Need product name lookup

16. **Question 13 (Row 12) - the transaction that needs validation**
    - Simple: MAX(net_profit) from store_sales, get transaction details
    - SQL: ORDER BY net_profit DESC, LIMIT 1

17. **Question 14 (Row 13) - the revenue that needs validation**
    - Simple: Same transaction as Q13, just get revenue field
    - SQL: Follow-up from Q13 answer

18. **Question 16 (Row 15) - the store that has highest lifetime profit**
    - Simple: SUM net_profit GROUP BY store, find MAX
    - Need UNION ALL across all years

19. **Question 17 (Row 16) - the store that has lowest lifetime profit**
    - Simple: SUM net_profit GROUP BY store, find MIN
    - Need UNION ALL across all years

20. **Question 18 (Row 17) - the state that has most customers**
    - Simple: COUNT(DISTINCT customer) BY state, find MAX
    - SQL: GROUP BY state, COUNT(DISTINCT customer_sk), ORDER BY DESC

21. **Question 63 (Row 62) - the threshold that triggers verification**
    - Simple: Find threshold where picking slips have verifier signature
    - Need to check picking slip data (may be structured or PDFs)

## **AVOID THESE - Require PDF parsing or complex analysis:**

- **Question 19 (Row 18)** - Requires PDF parsing of purchase orders ✓ (already done)
- **Question 20 (Row 19)** - Requires PDF parsing of warehouse damage reports
- **Question 52 (Row 51)** - Requires PDF parsing of picking slips and shipping manifests
- **Question 28-29** - Complex cohort/trend analysis with linear regression
- **Question 31** - Co-purchase analysis (needs complex pairing logic)
- **Question 38** - Cohort analysis with linear regression
- **Question 46** - Discount analysis across multiple levels
- **Question 48** - Multi-segment customer analysis
- **Question 57-60** - Experimental design analysis (Simpson's paradox, SRM, etc.)
- **Question 53** - LTV calculation (requires cohort analysis)

## **Summary - Quick Win Targets:**

**Start with these 9 easiest (Tier 1):**

1. Q5 - Category that sells most
2. Q6 - Year with lowest profit
3. Q15 - Count unique stores
4. Q30 - Channel with least revenue
5. Q39 - NY state profit in 2023
6. Q41 - Two highest revenue months
7. Q42 - Month with max sales
8. Q43 - State with highest profit
9. Q44 - State with highest profit per customer

**Then move to Tier 2 if needed (about 12 more relatively easy ones)**
