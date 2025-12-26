# Challenge 16: 🎁 Packing gifts for Santa - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `packGifts`

Pack gifts into sleighs with a maximum weight capacity. Gifts must be delivered in order. When a gift doesn't fit in the current sleigh, start a new one. Return the minimum number of sleighs needed, or null if a gift is too heavy for any sleigh.

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

1. **Edge case**: If no gifts, return 0
2. **Greedy packing**: Process gifts in order
3. **Check weight**: If a gift exceeds maxWeight, return null
4. **Try current sleigh**: If gift fits in current sleigh, add it
5. **New sleigh**: If gift doesn't fit, start a new sleigh
6. **Return count**: Return total number of sleighs used

### Algorithm

```javascript
let sleighs = 1;
let currentWeight = 0;

for (const gift of gifts) {
  if (gift > maxWeight) return null;
  
  if (currentWeight + gift <= maxWeight) {
    currentWeight += gift;
  } else {
    sleighs++;
    currentWeight = gift;
  }
}

return sleighs;
```

## Key Insights

- **Greedy algorithm**: Pack as much as possible into each sleigh before starting a new one
- **Order matters**: Must process gifts in given order (no reordering)
- **Impossible case**: Return null if any gift exceeds maxWeight
- **Empty input**: Return 0 for empty array
- **Simple state**: Track current sleigh weight and total sleigh count
