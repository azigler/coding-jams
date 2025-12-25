# Day 5: Cafeteria - Solution Log

## Problem Summary

The Elves need help determining which ingredients are fresh vs spoiled based on ingredient ID ranges.

### Part 1

- Database contains fresh ingredient ID ranges (inclusive, can overlap)
- Database contains available ingredient IDs
- Count how many available IDs are fresh (fall into at least one range)

### Part 2

- Count ALL unique ingredient IDs that are considered fresh by the ranges
- Need to merge overlapping ranges and count total IDs covered

## Key Insights

### Part 1

- For each available ID, check if it falls into any range
- Simple range checking: `id >= start && id <= end`

### Part 2

- Need to merge overlapping/adjacent ranges to avoid double-counting
- Sort ranges by start, then merge overlapping ones
- Sum the sizes of merged ranges (inclusive: `end - start + 1`)

## Solution Approach

### Part 1

```typescript
function isFresh(id: number): boolean {
  for (const [start, end] of ranges) {
    if (id >= start && id <= end) {
      return true
    }
  }
  return false
}

let freshCount = 0
for (const id of availableIds) {
  if (isFresh(id)) {
    freshCount++
  }
}
```

### Part 2

```typescript
// Sort ranges by start
ranges.sort((a, b) => a[0] - b[0])

// Merge overlapping ranges
const mergedRanges: Array<[number, number]> = []
let currentRange: [number, number] | null = null

for (const [start, end] of ranges) {
  if (currentRange === null) {
    currentRange = [start, end]
  } else {
    // Check if ranges overlap or are adjacent
    if (start <= currentRange[1] + 1) {
      currentRange[1] = Math.max(currentRange[1], end)
    } else {
      mergedRanges.push(currentRange)
      currentRange = [start, end]
    }
  }
}

// Count total IDs in all merged ranges
let totalFreshIds = 0
for (const [start, end] of mergedRanges) {
  totalFreshIds += end - start + 1
}
```

## Test Cases

### Example Input

```
3-5
10-14
16-20
12-18

1
5
8
11
17
32
```

### Part 1 Expected Results

- ID 1: spoiled
- ID 5: fresh (in range 3-5)
- ID 8: spoiled
- ID 11: fresh (in range 10-14)
- ID 17: fresh (in ranges 16-20 and 12-18)
- ID 32: spoiled
- Total fresh: 3

### Part 2 Expected Results

- Ranges: [3-5], [10-14], [16-20], [12-18]
- Merged: [3-5], [10-20] (12-18 overlaps with both 10-14 and 16-20)
- Total IDs: 3 + 11 = 14

## Final Answers

- **Part 1:** `811`
- **Part 2:** `338189277144473`

## Notes

- Part 1 is straightforward range checking
- Part 2 requires range merging to avoid double-counting
- Important to handle adjacent ranges (end + 1 >= start) as well as overlapping ones
- The ranges can be very large, so merging is more efficient than enumerating all IDs
