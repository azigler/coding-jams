# Day 1 Part 2 Solution Log

## Problem Understanding

**Key requirement**: "count the number of times any click causes the dial to point at 0, regardless of whether it happens during a rotation or at the end of one"

**Important**: "any click causes" - so we don't count if we START at 0 (the click didn't cause it, we were already there)

## Example Analysis

Starting at 50:
1. **L68** → 50 to 82: passes through 0 once during rotation ✓
2. **L30** → 82 to 52: no 0
3. **R48** → 52 to 0: ends at 0 ✓ (also crosses through 0, but counts as 1)
4. **L5** → 0 to 95: starts at 0, doesn't count (we were already there)
5. **R60** → 95 to 55: passes through 0 once during rotation ✓
6. **L55** → 55 to 0: ends at 0 ✓
7. **L1** → 0 to 99: starts at 0, doesn't count
8. **L99** → 99 to 0: ends at 0 ✓
9. **R14** → 0 to 14: starts at 0, doesn't count
10. **L82** → 14 to 32: passes through 0 once during rotation ✓

**Total: 6** (3 during rotation + 3 at end)

## Special Case: R1000 from 50

- Goes from 50 to 1050
- Passes through: 50, 51, ..., 99, 0, 1, ..., 99, 0, ... (10 times through 0)
- Then wraps back to 50
- **Should count 10 times**

## Key Insights

1. We need to count every time the unwrapped position is a multiple of 100 (0, 100, 200, etc.)
2. But NOT if we start at a multiple of 100 (the click didn't cause us to be there)
3. When we cross through 0 and end at 0, we might need to count both, OR count once

## Attempts

### Attempt 1: Group-based approach
- Count group boundary crossings
- Count endings at 0
- **Result**: 3989 ❌

### Attempt 2: Count all multiples of 100 in range
- Count every multiple of 100 between oldPos and newPos
- **Result**: 4988 ❌

### Attempt 3: Count crossings + endings separately
- **Result**: 5470 ❌

### Attempt 4: Count all multiples of 100 in range, exclude starting position ✅
- Count every multiple of 100 in [oldPos, newPos]
- Exclude the starting position if it's a multiple of 100
- **Result**: 5978 ✅ CORRECT!
- **Status**: Example works (6), R1000 works (10), edge cases pass, submitted successfully

## Solution

The key insight: Count every time the unwrapped position is a multiple of 100 (0, 100, 200, etc.), but exclude the starting position since "the click didn't cause us to be there, we already were."

Implementation:
1. For each rotation, calculate the unwrapped new position
2. Count all multiples of 100 in the range [oldPos, newPos]
3. Exclude the starting position from the count
4. This naturally handles both "passing through 0" and "ending at 0" cases

## Current Understanding

The dial points at 0 when:
- The unwrapped position is exactly a multiple of 100 (0, 100, 200, 300, ...)
- We need to count how many multiples of 100 we visit during each rotation
- But exclude the starting position if it's already a multiple of 100

## Next Steps

1. Implement counting of all multiples of 100 in the range [oldPos, newPos]
2. Exclude the starting position if it's a multiple of 100
3. Test with example to verify
4. Test with R1000 case to verify

