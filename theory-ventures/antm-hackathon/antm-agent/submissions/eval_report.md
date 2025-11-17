# Evaluation Report

**Total Questions:** 20
**Questions with Answers:** 20
**Correct:** 0
**Accuracy:** 0.00%

## Results

### the quarter that succeeds most

**Question:** What was our most successful quarter by far (by total net profit)?

### the channel that generates least revenue

**Question:** What is the smallest channel in terms of percent of Revenue?

### the item that sells most

**Question:** What is the top selling item of 2023? Give me the product name

### the transaction that needs validation

**Question:** What is the highest single transaction for a store ever in terms of net profit?

### the revenue that needs validation

**Question:** For that same transaction with the highest net profit, what was the total revenue (not including taxes)?

### the stores that exist

**Question:** How many unique stores are there?

### the store that has highest lifetime profit

**Question:** What stores has highest total net profit over its lifetime?

### the store that has lowest lifetime profit

**Question:** What store has the lowest net profit over its lifetime?

### the state that has most customers

**Question:** From which state do we have the most customers?

### the approver that misses signatures

**Question:** Our compliance audit found high-value purchase orders missing required approver signatures, creating financial liability. Purchase orders over $10,000 require both buyer and approver signatures per our procurement policy. What is the total value of unsigned purchase orders exceeding the $10,000 threshold, which approver has the highest total dollar value of unsigned orders, and what is that value?

### the door dock that damages most

**Question:** Our warehouse operations team at Warehouse 2 has noticed an increase in damaged inventory during 2020. We suspect certain door docks may be causing more damage than others. Identify which door dock has the highest damage rate and quantify how much worse it is compared to the facility average.

### the subscriber who needs recurring orders

**Question:** Our largest customer in 2022 should sign up for a recurring order program. Which customer, which item, and how many months did they order that item?

### the promotion that drives signups

**Question:** We ran a signup promotion #102 in Q1 2020 for $20 off their first order. Calculate its ROI based on 12-mo value assuming all signups are incremental.

### the transactions that look fraudulent

**Question:** We have fishy transactions in December 2022. Based on our fraud policy, how much total sales seem suspiciously close to our fraud spending limit?

### the items that get returned most

**Question:** Identify the bottom decile of items (worst 10% by return rate). Calculate the net revenue impact from carrying these high-return items, accounting for sales revenue, customer refunds, and restocking costs. What is the total net revenue impact?

### the item that sells seasonally

**Question:** Identify the item with the strongest seasonal sales pattern, where 3 consecutive calendar months account for the highest percentage of its annual sales. Report the item SK and the percentage of annual sales that these 3 peak months represent (rounded to nearest whole percent).

### the item that exceeds baseline at discount

**Question:** One item was sold at exactly 4 different discount levels in 2022 (0%, 10%, 15%, 20%). Find this item and calculate: (1) the discount percentage where quantity sold first exceeds 2x the baseline, and (2) the discount level that maximizes revenue. Submit item SK, both discount percentages, and max revenue.

### the performance that needs validation

**Question:** Store #15 has highest revenue but lowest profit margin. Is our promotion strategy causing an issue? Quantify the impact.

### the customers who stay loyal to brands

**Question:** Long-tenure customers (active 24+ months) show monthly repeat purchase behavior concentrated in one brand. Calculate which brand and what percentage of long-tenure customers purchase from this brand each month on average.

### the deviation that needs validation

**Question:** November 2022 month-over-month growth was below trend. Which store had the largest negative deviation from its 3-month linear trend? What percentage of the total shortfall in trend was this responsible for?

**Expected Answers:**
- float

**Agent Answer:**
- col_1: 1
- col_2: Store 1
- col_3: 7528.335000000273
- col_4: 205838.37499999756
- col_5: 288650.0600000005

**Result:** ✗ Incorrect

**Errors:**
- Query returned no results - may need to adjust filters or joins
- Step 3 returned no results
- SQL execution failed after 6 attempts: MCP query error: Error calling tool 'query': â Error executing query: Binder Error: aggregate function calls cannot contain window function calls

LINE 23:         SUM((month - 9.0) * (revenue - AVG(revenue) OVER (PARTITION BY s_store_sk))) / 
                                                ^
- Query returned no results - may need to adjust filters or joins
- Query returned no results - may need to adjust filters or joins
- Step 4 returned no results
- Query returned no results - may need to adjust filters or joins
- Step 5 returned no results

---

