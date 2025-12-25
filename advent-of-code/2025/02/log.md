# Day 2 Solution Log

## Problem Understanding

**Part 1**: Find all invalid product IDs in given ranges. An invalid ID is a number made of a sequence of digits repeated twice (e.g., `55`, `6464`, `123123`).

**Key constraints**:

- Must have even length to be split into two equal halves
- The two halves must be identical
- No leading zeros (handled automatically since we work with numbers)

## Key Insights

1. **Pattern detection**: An invalid ID has even length and can be split into two identical halves
2. **Algorithm**: For each range, iterate through all IDs and check if they match the pattern
3. **Efficiency**: We need to check every ID in each range (could be large ranges)

## Attempts

### Attempt 1: Direct implementation ✅

- Parse ranges from input
- For each range, iterate through all IDs
- Check if ID is invalid (even length, split into two equal halves)
- Sum all invalid IDs
- **Result**: 18595663903

## Solution

**Part 1 Answer**: 18595663903 ✅

The solution:

1. Parse comma-separated ranges (format: "start-end")
2. For each range, iterate through all IDs from start to end
3. Check if each ID is invalid: convert to string, check if length is even, split into two halves, compare
4. Sum all invalid IDs

**Part 2 Answer**: 19058204438 ✅

The solution:

1. Same range parsing as Part 1
2. For each ID, check if it can be divided into equal segments that repeat at least twice
3. Try all possible segment lengths from 1 to len/2
4. If length is divisible by segment length, check if all segments are identical
5. Must have at least 2 segments
6. Sum all invalid IDs

**Key difference from Part 1**: Part 1 required exactly 2 repetitions (even length, split in half). Part 2 allows any number of repetitions (2, 3, 4, etc.) as long as all segments are identical.
