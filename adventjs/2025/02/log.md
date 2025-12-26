# Challenge 2: 🏭 Manufacture the toys - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `manufactureGifts`

Manufacture toys by repeating each toy name based on its quantity, ignoring invalid quantities (≤0 or non-numeric).

## Attempts

### JavaScript

- ✅ Completed (6 stars) - Solved by user previously

### TypeScript

- ✅ Completed (6 stars)

### Python

- ✅ Completed (6 stars)

## Approach

For each gift object:

1. Check if quantity is a valid positive number
2. If valid, push the toy name `quantity` times to result array
3. Skip invalid quantities (≤0, non-numeric, etc.)

### JavaScript/TypeScript

```javascript
const result = []
for (const gift of giftsToProduce) {
  if (typeof gift.quantity === 'number' && gift.quantity > 0) {
    for (let i = 0; i < gift.quantity; i++) {
      result.push(gift.toy)
    }
  }
}
return result
```

### Python

```python
result = []
for gift in gifts_to_produce:
  quantity = gift.get('quantity', 0)
  if isinstance(quantity, (int, float)) and quantity > 0:
    for _ in range(int(quantity)):
      result.append(gift.get('toy', ''))
return result
```

## Key Insights

- Need to handle edge cases:
  - Quantity of 0 or negative
  - Non-numeric quantities
  - Empty input array
- Python uses `dict.get()` for safer access
- All solutions scored 5/5 on code quality
