# Challenge 6: 🧤 Matching gloves - Solution Log

## Problem Summary
- **Difficulty:** easy
- **Function:** `matchGloves`

Match left and right gloves of the same color. Return an array of colors for all pairs found. Multiple pairs of the same color are allowed. Order is determined by whichever pair can be made first (greedy matching).

## Attempts

### JavaScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python
- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

**Greedy matching algorithm:**
1. Track available gloves by color and hand (L/R)
2. For each glove in order:
   - Check if there's a matching glove of the opposite hand and same color
   - If yes: add color to result and remove the matched glove from pool
   - If no: add this glove to the available pool
3. Return the list of matched colors

### Algorithm:
```javascript
const available = { L: {}, R: {} }; // color -> count
const pairs = [];

for (const glove of gloves) {
  const oppositeHand = glove.hand === 'L' ? 'R' : 'L';
  
  if (available[oppositeHand][glove.color] > 0) {
    pairs.push(glove.color);
    available[oppositeHand][glove.color]--;
  } else {
    available[glove.hand][glove.color] = (available[glove.hand][glove.color] || 0) + 1;
  }
}
```

## Key Insights

- **Greedy matching**: Process gloves in order and match immediately when possible
- **Data structure**: Use objects/maps to track counts by color and hand
- **Order matters**: The problem specifies "whichever pair can be made first", so greedy is correct
- **Multiple pairs**: Same color can appear multiple times in the result
- **Simple logic**: Just track available gloves and match when possible
