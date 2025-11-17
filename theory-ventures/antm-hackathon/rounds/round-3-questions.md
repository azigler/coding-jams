# Validation Evaluations - Round 4

Questions 51-63 (13 questions)

---

## the promotion that exceeds caps

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

## the picker that misses deadlines

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

## the customers who activate quickly

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

## the checkout that needs validation

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

## the carts that get abandoned

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

## the funnel that needs optimization

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

## the experiment that shows simpsons paradox

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

## the experiment that has sample ratio mismatch

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

## the experiment that shows novelty effect

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

## the experiments that have interaction effects

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

## the campaign that emails abandoned carts

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

## the transactions that are coordinated

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

## the threshold that triggers verification

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
