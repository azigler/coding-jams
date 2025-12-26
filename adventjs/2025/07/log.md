# Challenge 7: 🎄 Decorating the tree - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `drawTree`

Draw a Christmas tree with asterisks `*`, replacing every `frequency` positions with an `ornament` character. Position counting starts at 1, from top to bottom, left to right. The tree must be centered and have a one-line trunk `#` at the end.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Calculate dimensions**: Bottom row width = `2 * height - 1`
2. **Track global position**: Start at 1, increment for each character
3. **For each row** (1 to height):
   - Row width = `2 * row - 1` (odd numbers: 1, 3, 5, ...)
   - Padding = `(maxWidth - rowWidth) / 2` for centering
   - For each character in row:
     - If `position % frequency === 0`, use ornament, else use `*`
     - Increment position
4. **Add trunk**: Centered `#` with same padding as first row

### Algorithm

```javascript
let position = 1;
const maxWidth = 2 * height - 1;

for (let row = 1; row <= height; row++) {
  const rowWidth = 2 * row - 1;
  const padding = (maxWidth - rowWidth) / 2;
  let rowStr = ' '.repeat(padding);
  
  for (let col = 0; col < rowWidth; col++) {
    rowStr += (position % frequency === 0) ? ornament : '*';
    position++;
  }
  lines.push(rowStr);
}

// Add centered trunk
lines.push(' '.repeat((maxWidth - 1) / 2) + '#');
```

## Key Insights

- **Global position counter**: Critical to track positions across all rows, not per-row
- **Centering**: Use `(maxWidth - rowWidth) / 2` for padding each row
- **Row width formula**: `2 * row - 1` gives odd numbers (1, 3, 5, 7, ...)
- **Trunk alignment**: Same padding as first row (which has width 1)
- **Position modulo**: `position % frequency === 0` determines ornament placement
