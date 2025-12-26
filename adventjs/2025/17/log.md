# Challenge 17: 🎄 The Christmas lights panel - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `hasFourLights`

Check if there are 4 consecutive lights of the same color (R or G) aligned horizontally or vertically on a panel. Lights that are off (`.`) don't count. Only check horizontal and vertical, not diagonals.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 4/5 quality) - First attempt

## Approach

1. **Check horizontal lines**: For each row, track consecutive lights of the same color
2. **Check vertical lines**: For each column, track consecutive lights of the same color
3. **Track state**: Maintain count and current color, reset on `.` or color change
4. **Early return**: Return true as soon as count reaches 4

### Algorithm

```javascript
// For each row/column:
let count = 0;
let currentColor = null;

for (each cell) {
  if (cell === '.') {
    reset count and color
  } else if (cell === currentColor) {
    count++;
    if (count >= 4) return true;
  } else {
    count = 1;
    currentColor = cell;
    if (count >= 4) return true;
  }
}
```

## Key Insights

- **Ignore off lights**: `.` cells reset the count and don't contribute
- **Consecutive tracking**: Must track consecutive same-color lights, not just total count
- **Two directions**: Check both horizontal and vertical separately
- **State management**: Track current color and count, reset appropriately
- **Early termination**: Return true immediately when 4 consecutive found
- **Edge case**: Check count after setting new color (in case we start with 4+ cells)
