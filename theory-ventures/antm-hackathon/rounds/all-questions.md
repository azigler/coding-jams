# All Questions - Numbered by CSV Row Index

Questions are numbered starting at 1. CSV row_index maps to Question (row_index + 1).

- CSV row 0 (line 2) = Question 1
- CSV row 1 (line 3) = Question 2
- CSV row 18 (line 20) = Question 19
- CSV row 19 (line 21) = Question 20
- etc.

---

## Question 0 - the warehouse that causes revenue drops

**Question:** Store #5's November 2022 revenue dropped from $500K in October to $300K. Investigate which warehouse experienced an inventory shortage that affected Store #5, and identify which product category was most impacted by this shortage. What was the revenue impact in dollars for this specific warehouse-category combination?

**Observations:**

```json
{
  "question": "Store #5's operations team noticed inventory shortages from one warehouse in November 2022. Despite overall revenue growth, investigate which warehouse experienced an inventory shortage that affected Store #5, and identify which product category was most impacted by this shortage. What was the revenue change in dollars for Store #5 in this specific warehouse-category combination from October to November 2022?",
  "warehouse_sk": 3,
  "category": "Jewelry",
  "revenue_impact": -32798.30
}
```

---

## Question 1 - the state that has return spikes

**Question:** January 2023 saw a spike in item returns in one state. What percentage of December revenue in the biggest returns category should be discounted due to those returns?

**Observations:**

```json
{
  "question": "January 2023 saw a spike in item returns in one state. What percentage of December revenue in the biggest returns category should be discounted due to those returns?",
  "state": "CA",
  "category": "Jewelry",
  "return_count": 2500,
  "return_value": 691182.47,
  "difficulty": 1
}
```

---

## Question 2 - the item that loses revenue

**Question:** Sales for an item spiked for a few weeks, but revenue is down. Figure out which item, what the error was, and calculate the lost revenue.

**Observations:**

```json
{
  "question": "Sales for an item spiked for a few weeks, but revenue is down. Figure out which item, what the error was, and calculate the lost revenue.",
  "item_sk": 2,
  "lost_revenue": 45770.69352143964,
  "difficulty": 1
}
```

---

## Question 3 - the product that sells most

**Question:** Which product had the highest sales in 2019? Give the name and total quantity.

**Observations:**

```json
{
  "question": "Which product had the highest sales in 2019? Give the name and total quantity.",
  "item_sk": 8888,
  "total_quantity": 661,
  "difficulty": 1
}
```

---

## Question 4 - the profit that increases year over year

**Question:** How much did our net profit increase from 2021 to 2022?

**Observations:**

```json
{
  "question": "How much did our net profit increase from 2021 to 2022?",
  "profit_increase": 7934200.859999992,
  "difficulty": 1
}
```

---

## Question 5 - the category that sells most

**Question:** What was our most popular category in 2023 (by total quantity of items sold)?

**Observations:**

```json
{
  "question": "What was our most popular category in 2023 (by total quantity of items sold)?",
  "category": "Shoes",
  "difficulty": 1
}
```

---

## Question 6 - the year that needs validation

**Question:** In which year did we have the lowest net profit from sales?

**Observations:**

```json
{
  "question": "In which year did we have the lowest net profit from sales?",
  "year": 2021,
  "difficulty": 1
}
```

---

## Question 7 - the store that has highest profit in 2022

**Question:** In 2022, which store had the highest net profit in sales? Give the name of the store.

**Observations:**

```json
{
  "question": "In 2022, which store had the highest net profit in sales? Give the name of the store.",
  "store_name": "Store 3",
  "difficulty": 1
}
```

---

## Question 8 - the city that sells most items in 2022

**Question:** In 2022, which city had the highest number of items sold? How many items?

**Observations:**

```json
{
  "question": "In 2022, which city had the highest number of items sold? How many items?",
  "city": "Homestead",
  "items_sold": 133797,
  "difficulty": 1
}
```

---

## Question 9 - the product that sells most in 2022 holidays

**Question:** What is the name of our best-selling product during the 2022 holiday season?

**Observations:**

```json
{
  "question": "What is the name of our best-selling product during the 2022 holiday season?",
  "item_sk": 3434,
  "difficulty": 1
}
```

---

## Question 10 - the quarter that succeeds most

**Question:** What was our most successful quarter by far (by total net profit)?

**Observations:**

```json
{
  "question": "string",
  "successful_quarter": "string",
  "difficulty": "int"
}
```

---

## Question 11

(Placeholder - empty row in CSV)

---

## Question 12 - the item that sells most

**Question:** What is the top selling item of 2023? Give me the product name

**Observations:**

```json
{
  "question": "string",
  "item_sk": "int",
  "difficulty": "int"
}
```

---

## Question 13 - the transaction that needs validation

**Question:** What is the highest single transaction for a store ever in terms of net profit?

**Observations:**

```json
{
  "question": "string",
  "highest_net_profit": "float",
  "ticket_number": "int",
  "store_sk": "int",
  "difficulty": "int"
}
```

---

## Question 14 - the revenue that needs validation

**Question:** For that same transaction with the highest net profit, what was the total revenue (not including taxes)?

**Observations:**

```json
{
  "question": "string",
  "total_revenue": "float",
  "net_profit": "float",
  "difficulty": "int"
}
```

---

## Question 15 - the stores that exist

**Question:** How many unique stores are there?

**Observations:**

```json
{
  "question": "string",
  "unique_stores": "int",
  "difficulty": "int"
}
```

---

## Question 16 - the store that has highest lifetime profit

**Question:** What stores has highest total net profit over its lifetime?

**Observations:**

```json
{
  "question": "string",
  "store_sk": "int",
  "difficulty": "int"
}
```

---

## Question 17 - the store that has lowest lifetime profit

**Question:** What store has the lowest net profit over its lifetime?

**Observations:**

```json
{
  "question": "string",
  "store_sk": "int",
  "difficulty": "int"
}
```

---

## Question 18 - the state that has most customers

**Question:** From which state do we have the most customers?

**Observations:**

```json
{
  "question": "string",
  "state": "string",
  "customer_count": "int",
  "difficulty": "int"
}
```

---

## Question 19 - the approver that misses signatures

**Question:** Our compliance audit found high-value purchase orders missing required approver signatures, creating financial liability. Purchase orders over $10,000 require both buyer and approver signatures per our procurement policy. What is the total value of unsigned purchase orders exceeding the $10,000 threshold, which approver has the highest total dollar value of unsigned orders, and what is that value?

**Observations:**

```json
{
  "question": "string",
  "total_unsigned_value": "float",
  "highest_value_approver": "string",
  "highest_value_approver_total": "float",
  "difficulty": "int"
}
```

---

## Question 20 - the door dock that damages most

**Question:** Our warehouse operations team at Warehouse 2 has noticed an increase in damaged inventory during 2020. We suspect certain door docks may be causing more damage than others. Identify which door dock has the highest damage rate and quantify how much worse it is compared to the facility average.

**Observations:**

```json
{
  "question": "string",
  "highest_damage_dock": "string",
  "highest_damage_rate_pct": "float",
  "avg_damage_rate_pct": "float",
  "rate_multiplier": "float",
  "difficulty": "int"
}
```

---

## Question 21 - the subscriber who needs recurring orders

**Question:** Our largest customer in 2022 should sign up for a recurring order program. Which customer, which item, and how many months did they order that item?

**Observations:**

```json
{
  "question": "string",
  "customer_sk": "int",
  "item_sk": "int",
  "num_months": "int",
  "difficulty": "int"
}
```

---

## Question 22 - the promotion that drives signups

**Question:** We ran a signup promotion #102 in Q1 2020 for $20 off their first order. Calculate its ROI based on 12-mo value assuming all signups are incremental.

**Observations:**

```json
{
  "question": "string",
  "cohort_size": "int",
  "cohort_ltv": "float",
  "roi_pct": "float",
  "net_profit": "float",
  "difficulty": "int"
}
```

---

## Question 23 - the transactions that look fraudulent

**Question:** We have fishy transactions in December 2022. Based on our fraud policy, how much total sales seem suspiciously close to our fraud spending limit?

**Observations:**

```json
{
  "question": "string",
  "customer_sk": "int",
  "transaction_count": "int",
  "total_value": "float",
  "difficulty": "int"
}
```

---

## Question 24 - the items that get returned most

**Question:** Identify the bottom decile of items (worst 10% by return rate). Calculate the net revenue impact from carrying these high-return items, accounting for sales revenue, customer refunds, and restocking costs. What is the total net revenue impact?

**Observations:**

```json
{
  "question": "string",
  "bottom_decile_item_count": "int",
  "total_restocking_costs": "float",
  "net_revenue_impact": "float",
  "difficulty": "int"
}
```

---

## Question 25 - the item that sells seasonally

**Question:** Identify the item with the strongest seasonal sales pattern, where 3 consecutive calendar months account for the highest percentage of its annual sales. Report the item SK and the percentage of annual sales that these 3 peak months represent (rounded to nearest whole percent).

**Observations:**

```json
{
  "question": "string",
  "item_sk": "int",
  "peak_months": "list[int]",
  "percentage": "int",
  "difficulty": "int"
}
```

---

## Question 26 - the item that exceeds baseline at discount

**Question:** One item was sold at exactly 4 different discount levels in 2022 (0%, 10%, 15%, 20%). Find this item and calculate: (1) the discount percentage where quantity sold first exceeds 2x the baseline, and (2) the discount level that maximizes revenue. Submit item SK, both discount percentages, and max revenue.

**Observations:**

```json
{
  "question": "string",
  "item_sk": "int",
  "doubling_discount": "int",
  "max_revenue_discount": "int",
  "max_revenue": "float",
  "difficulty": "int"
}
```

---

## Question 27 - the performance that needs validation

**Question:** Store #15 has highest revenue but lowest profit margin. Is our promotion strategy causing an issue? Quantify the impact.

**Observations:**

```json
{
  "question": "string",
  "store_sk": "int",
  "profit_margin_percent": "float",
  "promotional_sales_percent": "float",
  "lost_profit": "float",
  "difficulty": "int"
}
```

---

## Question 28 - the customers who stay loyal to brands

**Question:** Long-tenure customers (active 24+ months) show monthly repeat purchase behavior concentrated in one brand. Calculate which brand and what percentage of long-tenure customers purchase from this brand each month on average.

**Observations:**

```json
{
  "question": "string",
  "long_tenure_customer_count": "int",
  "loyalty_brand": "null",
  "monthly_repurchase_rate_percent": "float",
  "difficulty": "int"
}
```

---

## Question 29 - the deviation that needs validation

**Question:** November 2022 month-over-month growth was below trend. Which store had the largest negative deviation from its 3-month linear trend? What percentage of the total shortfall in trend was this responsible for?

**Observations:**

```json
{
  "question": "string",
  "worst_store_sk": "int",
  "deviation_percentage_points": "float",
  "contribution_percent": "float",
  "difficulty": "int"
}
```

---

## Question 30 - the channel that generates least revenue

**Question:** What is the smallest channel in terms of percent of Revenue?

**Observations:**

```json
{
  "question": "string",
  "smallest_channel": "string",
  "store_revenue_percent": "float",
  "web_revenue_percent": "float",
  "catalog_revenue_percent": "float",
  "difficulty": "int"
}
```

---

## Question 31 - the products that get bought together

**Question:** Find the product pair with highest co-purchase rate, what are the items (pair in ascending order) and how many times have they been bought together. Our competitor prices almost everything 5% cheaper than us, what could we make the bundle price to come just under the competitors combined price for these items (let's undercut them by 1%)?

**Observations:**

```json
{
  "question": "string",
  "item_1_sk": "int",
  "item_2_sk": "int",
  "competitor_combined_price": "float",
  "bundle_price": "float",
  "difficulty": "int"
}
```

---

## Question 32 - the traffic that comes from bots

**Question:** November 2022 shows record pageviews but flat revenue. We think it's bots. What percentage of web traffic in November is likely due to bots?

**Observations:**

```json
{
  "question": "string",
  "total_pageviews": "int",
  "bot_ip_prefix": "string",
  "bot_pageviews": "int",
  "bot_percentage": "float",
  "difficulty": "int"
}
```

---

## Question 33 - the warehouse that needs validation

**Question:** Our CS team is getting a lot of tickets related to out-of-stock in January 2022. Can you determine if any specific warehouse is taking a long time to receive restocks? What percentage of the out-of-stock CS tickets are related to that warehouse?

**Observations:**

```json
{
  "question": "string",
  "slowest_warehouse_sk": "int",
  "avg_days_to_receive_shipment": "float",
  "cs_ticket_percentage": "float",
  "difficulty": "int"
}
```

---

## Question 34 - the promise that needs validation

**Question:** What percent of orders missed our delivery time-frame promise, and which product category performed worst?

**Observations:**

```json
{
  "question": "string",
  "promise_days": "int",
  "on_time_rate_percent": "float",
  "missed_rate_percent": "float",
  "worst_category": "string",
  "worst_category_on_time_rate_percent": "float",
  "difficulty": "int"
}
```

---

## Question 35 - the vendor that owes rebates

**Question:** Finance says our supplier owes us a Q4 2022 rebate for missing their speedy delivery guarantee. How much rebate are we owed?

**Observations:**

```json
{
  "question": "string",
  "q4_2022_on_time_rate_percent": "float",
  "sla_threshold_percent": "float",
  "rebate_owed": "float",
  "difficulty": "int"
}
```

---

## Question 36 - the requests that go overdue

**Question:** Since July 1, 2018, what percentage of customer data deletion requests were completed within the legal requirement of 30 days, and how many are overdue?

**Observations:**

```json
{
  "question": "string",
  "total_requests": "int",
  "overdue_requests": "int",
  "overdue_rate_percent": "float",
  "difficulty": "int"
}
```

---

## Question 37 - the products that need recall

**Question:** Our quality team noticed a spike in product defect reports in late 2020. We're investigating whether this warrants a product recall. What percentage of defect reports in Q4 2020 were classified as 'critical' or 'high' severity, and which product category had the highest concentration of these severe defects?

**Observations:**

```json
{
  "question": "string",
  "q4_2020_defect_reports": "int",
  "critical_high_severity_percent": "float",
  "worst_category": "string",
  "worst_category_severe_percentage": "float",
  "difficulty": "int"
}
```

---

## Question 38 - the cohorts that have age gaps

**Question:** We have a customer gap in the 25-30 age range (assume today is 2023-12-31). Based on the linear relationship between age and average customer value across other age groups, calculate the ACV for this cohort and the revenue opportunity from doubling its size. Submit ACV and revenue opportunity.

**Observations:**

```json
{
  "question": "string",
  "age_25_30_customer_count": "int",
  "average_other_buckets": "float",
  "acv_25_30": "float",
  "revenue_opportunity": "float",
  "difficulty": "int"
}
```

---

## Question 39 - the state that generates profit from NY

**Question:** How much net profit did we make from NY state in 2023?

**Observations:**

```json
{
  "question": "string",
  "net_profit": "float",
  "difficulty": "int"
}
```

---

## Question 40 - the customer who migrates channels

**Question:** Customer SK 33,333 switched from 100% in-store to 100% online in March 2021. Investigate what event triggered this channel migration, paying particular attention to any returns and their associated return reasons during this period.

**Observations:**

```json
{
  "question": "string",
  "returns_in_march_2021": "int",
  "return_store_sk": "int",
  "return_reason": "string",
  "difficulty": "int"
}
```

---

## Question 41 - the months that needs validation

**Question:** What two months have the highest revenue generally?

**Observations:**

```json
{
  "question": "string",
  "highest_revenue_months": "list[string]",
  "difficulty": "int"
}
```

---

## Question 42 - the month that hits maximum sales

**Question:** What month/year did we hit maximum sales?

**Observations:**

```json
{
  "question": "string",
  "month": "int",
  "year": "int",
  "difficulty": "int"
}
```

---

## Question 43 - the state that has highest profit

**Question:** Which state currently has the highest cumulative net profit dollar amount?

**Observations:**

```json
{
  "question": "string",
  "state": "string",
  "cumulative_profit": "float",
  "difficulty": "int"
}
```

---

## Question 44 - the state that has highest profit per customer

**Question:** Which state has the highest net profit per customer?

**Observations:**

```json
{
  "question": "string",
  "state": "string",
  "profit_per_customer": "float",
  "difficulty": "int"
}
```

---

## Question 45 - the supplier that packs efficiently

**Question:** Our warehouse wants to optimize receiving operations by identifying suppliers that pack most efficiently. Which supplier has the highest average monetary value per pallet received? What is their average value per pallet?

**Observations:**

```json
{
  "question": "string",
  "top_supplier": "string",
  "avg_value_per_pallet": "float",
  "difficulty": "int"
}
```

---

## Question 46 - the item that exceeds baseline sales

**Question:** Item SK 54,321 sells at different discount levels. At which discount level does quantity sold first exceed 10x the baseline, and what's the total revenue at that level?

**Observations:**

```json
{
  "question": "string",
  "discount_pct": "int",
  "quantity": "int",
  "revenue": "float",
  "difficulty": "int"
}
```

---

## Question 47 - the store that gets cannibalized

**Question:** Store #7 experienced cannibalization from a new store opening in H2 2021. For the category that saw the largest revenue impact calculate the net delta with the new store. Submit the category name and net dollar amount.

**Observations:**

```json
{
  "question": "string",
  "cannibalizing_store_sk": "int",
  "cannibalized_store_sk": "int",
  "category": "string",
  "net_delta": "float",
  "difficulty": "int"
}
```

---

## Question 48 - the customers who represent their segments

**Question:** Segment customers by income tier (Low: <$50K, Medium: $50-100K, High: $100K+) and age group (Young: born <1970, Old: ≥1970). For the top 3 segments by total revenue, identify the 3 most exemplar customers in each segment (closest to segment median CLV). What is the most commonly purchased item across those 9 exemplar customers? Submit item SK and purchase count.

**Observations:**

```json
{
  "question": "string",
  "item_sk": "int",
  "purchase_count": "int",
  "difficulty": "int"
}
```

---

## Question 49 - the cohorts that retain poorly

**Question:** It seems like Q4 customer cohorts retain worse at 90 days. If those customers retained at the same average rate as those acquired in other quarters, what would the additional revenue have been? Submit total cohort LTV and lost 90-day revenue.

**Observations:**

```json
{
  "question": "string",
  "q4_cohort_size": "int",
  "q4_retention_rate": "float",
  "lost_90_day_revenue": "float",
  "difficulty": "int"
}
```

---

## Question 50 - the promotion that tests free shipping

**Question:** A free shipping promotion in July 2022 (orders >$50) ran for one month on a test group. Calculate average order value for test vs control, and incremental revenue per customer. Submit the promotion number, how many users benefit from it, and the incremental revenue per customer.

**Observations:**

```json
{
  "question": "string",
  "promotion_sk": "int",
  "test_aov": "float",
  "control_aov": "float",
  "incremental_aov": "float",
  "incremental_revenue_per_customer": "float",
  "difficulty": "int"
}
```

---

## Question 51 - the promotion that exceeds caps

**Question:** Did anyone exceed the Black Friday electronics per-customer discount cap? How many customers and how much did we over-discount?

**Observations:**

```json
{
  "question": "string",
  "promo_code": "string",
  "discount_cap": "float",
  "customers_exceeding_cap": "int",
  "total_over_discount": "float",
  "difficulty": "int"
}
```

---

## Question 52 - the picker that misses deadlines

**Question:** Our warehouse operations team noticed that some pickers consistently miss their pick deadlines, causing downstream delays. Analyze picking slips and shipping manifests to identify which picker has the highest percentage of orders completed after their deadline, and calculate the average delay time for that picker.

**Observations:**

```json
{
  "question": "string",
  "worst_picker_id": "string",
  "late_percentage": "float",
  "avg_delay_minutes": "float",
  "difficulty": "int"
}
```

---

## Question 53 - the customers who activate quickly

**Question:** Customers who make a 2nd purchase within 30 days show higher 12-month LTV than those who don't. Calculate the incremental LTV lift from making a 2nd purchase (vs 1 purchase). Submit the incremental value.

**Observations:**

```json
{
  "question": "string",
  "customers_with_1_purchase": "int",
  "customers_with_2_purchases": "int",
  "incremental_ltv_lift": "float",
  "difficulty": "int"
}
```

---

## Question 54 - the checkout that needs validation

**Question:** Black Friday week of 2020 was soft on revenue. Our Product managers have been hearing from customers that they're frustrated with payment issues during the checkout process. What's the increase in abandonment rate this year vs last year during Black Friday, and what's the most common error code during that time period?

**Observations:**

```json
{
  "question": "string",
  "abandonment_rate_2019": "float",
  "abandonment_rate_2020": "float",
  "most_common_error_code": "string",
  "difficulty": "int"
}
```

---

## Question 55 - the carts that get abandoned

**Question:** The CRM team is considering starting an abandoned-cart campaign. Quantify the opportunity: identify add_to_cart events with no purchase by the same customer within 24 hours. What would be the ROI if we could recover 10% of the abandoned carts from Dec 2022?

**Observations:**

```json
{
  "question": "string",
  "total_add_to_cart_events": "int",
  "abandoned_cart_count": "int",
  "potential_recovery": "float",
  "difficulty": "int"
}
```

---

## Question 56 - the funnel that needs optimization

**Question:** Our search funnel (Landing → Search → Item → Cart → Checkout) needs optimization. We notice mobile converts far worse, can you find the specific browser and funnel-stage combination where the dropoff is significantly worse than average for that funnel-stage. What's the percentage dropoff for that funnel-stage and browser combination?

**Observations:**

```json
{
  "question": "string",
  "browser": "string",
  "worst_stage": "string",
  "conversion_percent": "float",
  "percentage_points_worse": "float",
  "difficulty": "int"
}
```

---

## Question 57 - the experiment that shows simpsons paradox

**Question:** We ran experiment 'checkout_v2' in December 2021. Our PM wants to understand the results by customer segment (high-value: customer_sk % 5 == 0, low-value: customer_sk % 5 != 0). Calculate the overall conversion rate for control and treatment, then calculate conversion rates for each customer segment. Return the conversion rate lift (in percentage points) for high-value customers only.

**Observations:**

```json
{
  "question": "string",
  "overall_control_rate": "float",
  "overall_treatment_rate": "float",
  "high_value_segment_lift_ppts": "float",
  "difficulty": "int"
}
```

---

## Question 58 - the experiment that has sample ratio mismatch

**Question:** We ran experiment 'pricing_v2' in November 2021, configured for a 50/50 split. Calculate the actual traffic split percentage for each variant. It seems like there's a Sample Ratio Mismatch due to device type. How much of the control group is due to not allocating on mobile.

**Observations:**

```json
{
  "question": "string",
  "actual_split_control_percent": "float",
  "actual_split_treatment_percent": "float",
  "control_excess_due_to_mobile_percent": "float",
  "difficulty": "int"
}
```

---

## Question 59 - the experiment that shows novelty effect

**Question:** We ran experiment 'product_page_v3' for 4 weeks in December 2023 which started
out great, but we think it has a novelty effect? Calculate the conversion rate
lift (in percentage points) for each week, then calculate the rate of change
of the weekly effect sizes.

**Observations:**

```json
{
  "question": "string",
  "week_1_lift_ppts": "float",
  "week_2_lift_ppts": "float",
  "week_3_lift_ppts": "float",
  "week_4_lift_ppts": "float",
  "average_weekly_decline_ppts": "float",
  "difficulty": "int"
}
```

---

## Question 60 - the experiments that have interaction effects

**Question:** We're running two experiments simultaneously in December 2021: 'free_shipping_test' and 'checkout_v2'. We're concerned about interaction effects. How much worse is the lift for those in both?

**Observations:**

```json
{
  "question": "string",
  "isolated_lift_ppts": "float",
  "combined_lift_ppts": "float",
  "lift_degradation_ppts": "float",
  "difficulty": "int"
}
```

---

## Question 61 - the campaign that emails abandoned carts

**Question:** We ran an abandoned-cart email campaign in December 2022. What's the ROI of the campaign?

**Observations:**

```json
{
  "question": "string",
  "emails_sent": "int",
  "click_rate_percent": "float",
  "conversion_rate_percent": "float",
  "total_revenue": "float",
  "roi_percent": "float",
  "difficulty": "int"
}
```

---

## Question 62 - the transactions that are coordinated

**Question:** We've detected suspicious purchasing patterns in December 2022. What IP address, shipping address, and item category are most associated with this coordinated fraud ring?

**Observations:**

```json
{
  "question": "string",
  "suspicious_ip": "string",
  "suspicious_customer_count": "int",
  "suspicious_order_count": "int",
  "most_common_shipping_address_sk": "int",
  "most_common_category": "string",
  "difficulty": "int"
}
```

---

## Question 63 - the threshold that triggers verification

**Question:** During a warehouse audit, you notice some picking slips have both picker and verifier signatures while others have only the picker's signature. The warehouse manager claims there's a consistent policy but it's never been documented. At what number of items does an order require a verifier signature?

**Observations:**

```json
{
  "question": "string",
  "threshold_items": "int",
  "difficulty": "int"
}
```

---
