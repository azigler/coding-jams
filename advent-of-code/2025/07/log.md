# Day 7: Laboratories - Solution Log

## Problem Summary

Tachyon beam simulation through a manifold with splitters.

### Part 1 ✅

- Beams move downward
- Beams pass through empty space (`.`)
- When a beam hits a splitter (`^`), it stops and two new beams are emitted from left and right
- Count total number of splits
- **Answer: 1638** ✅ CORRECT

### Part 2 ✅

- Quantum interpretation: single particle takes BOTH paths at each splitter
- Each split creates two timelines
- Need to count all unique timelines (end positions) after all possible journeys
- Example should give 40 timelines

## Attempts and Submissions

### Part 2 Attempts

1. **❌ 1722** - Submitted, marked as "too low"
   - Approach: DFS with memoization, counting unique end positions
   - End positions = positions at bottom row, at splitters (where beam stops), or at obstacles
   - Issue: Example gives 30 instead of expected 40, so logic is incomplete
2. **✅ 7759107121385** - Correct
   - Key insight: timelines do **not** merge; count multiplicities (many-worlds).
   - DP row-by-row with BigInt counts; on splitter, parent ends and two child counts go left/right (off-grid ends).
   - Example now 40 timelines; real input 7759107121385 (submitted, accepted).

### Resolution / Correct Understanding

- A **timeline** is a distinct path; converging beams do **not** merge in many-worlds.
- Model as path counts (BigInt). At each row, track how many timelines occupy each column.
- Movement:
  - If below is `.`, timelines move straight down.
  - If below is `^`, original timeline ends; two new timelines start at left/right of the splitter row. If they go off-grid, they end.
  - Anything else: timeline ends.
- Iterate rows from `S` to bottom, accumulating ended timelines. Remaining timelines after last row also end. Use BigInt throughout.

### Updated Results

- **Example:** 40 timelines ✅
- **Real input:** 7759107121385 ✅

### Notes

- Earlier failures came from merging converging beams (counting unique positions). Counting paths (multiplicity) fixes the gap.
