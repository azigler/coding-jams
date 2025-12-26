# Challenge 20: 🎁 Vertical warehouse - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `dropGifts`

Drop gifts in columns of a warehouse. Gifts fall from top and land in the lowest empty cell ('.') of the column. If column is full, ignore the gift.

## Attempts

### JavaScript

- ✅ Completed (7 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (7 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (7 stars, 5/5 quality) - First attempt

## Approach

1. **Copy warehouse**: Create a deep copy to avoid mutating input
2. **For each drop**: Process each column in drops array
3. **Find lowest empty**: Start from bottom row, find first '.' cell
4. **Place gift**: Set cell to '#' and break
5. **Ignore if full**: If no '.' found, gift is ignored (no-op)

### Algorithm

```javascript
const result = warehouse.map(row => [...row]);

for (const col of drops) {
  for (let row = result.length - 1; row >= 0; row--) {
    if (result[row][col] === '.') {
      result[row][col] = '#';
      break;
    }
  }
}
```

## Key Insights

- **Start from bottom**: Iterate rows from bottom to top to find lowest empty cell
- **Deep copy**: Use map/spread to avoid mutating input
- **Break after placement**: Once gift is placed, move to next drop
- **Full column handling**: If no '.' found, loop completes naturally (gift ignored)
- **Simple and clean**: Straightforward implementation got 5/5 on first try
