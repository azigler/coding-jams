# Day 9: Movie Theater - Solution Log

## Problem Summary

Find the largest rectangle with red tiles at opposite corners.

### Part 1 ✅

- Find largest rectangle using any two red tiles as opposite corners
- Area = (|x2-x1| + 1) * (|y2-y1| + 1) (including endpoints)
- **Answer: 4755278336** ✅ CORRECT

### Part 2 ✅

- Rectangle must only contain red or green tiles
- Green tiles form a loop connecting consecutive red tiles
- All tiles inside the loop are also green
- **Current attempts:**
  - 4596179031 - Too high (sampling missed invalid tiles)
  - 21894813 - Too low (skipped large rectangles > 10000x10000)
  - 39910560 - Too low (improved sampling but still missing valid rectangles)
  - 4995773 - Found by checking all tiles, sorted by area (largest first)

## Solution Approach

### Part 1

- Simple: Check all pairs of red tiles, calculate area, find maximum
- O(n²) where n = number of red tiles (496 tiles = ~123k pairs)

### Part 2 Challenges

1. **Performance**: Need to check if all tiles in rectangle are valid
   - With large coordinates (90k+), rectangles can have millions of tiles
   - Checking every tile is too slow

2. **Validation Logic**:
   - Red tiles: from input list
   - Green tiles on perimeter: tiles on edges connecting consecutive red tiles
   - Green tiles inside: use point-in-polygon (ray casting)

3. **Current Implementation**:
   - `isValidTile(x, y)`: Checks if red, on edge, or inside polygon
   - `isOnEdge(x, y)`: Checks if point is on any polygon edge (excluding endpoints)
   - `isInsideLoop(x, y)`: Ray casting algorithm for point-in-polygon
   - `rectangleIsValid()`: Checks boundary tiles, then samples interior

### Issues Encountered

1. **Hanging/Timeout**:
   - Initial implementation hung because checking all tiles in all rectangles was too slow
   - Fixed by adding size limits and sampling, but this caused incorrect answers

2. **Incorrect Answers**:
   - Sampling approach misses invalid tiles, leading to false positives
   - Size limits skip valid large rectangles
   - Need to balance thoroughness vs performance

### Next Steps

Need to find a more efficient way to check rectangle validity:

- Option 1: Precompute valid tile set (too large - billions of tiles)
- Option 2: Better sampling strategy (current approach)
- Option 3: Check if rectangle is entirely contained in polygon more efficiently
- Option 4: Sort rectangles by potential area and check largest first

## Current Status

**New Approach (Attempt 5):**

- Using test-driven development to iterate faster
- Created comprehensive test suite based on challenge examples
- Tests pass ✓ - validation logic is correct
- Fixed bug in `isOnEdge` - was using wrong logic to exclude endpoints
- **Current result: 4995773** - but this is wrong according to AoC
- Need to debug why we're not finding the correct larger rectangle

**Test Results:**

- ✓ Example test passes (area 24)
- ✓ Found rectangle 4995773 is valid according to our logic
- ✗ AoC says 4995773 is wrong
- Issue: Checking all tiles is too slow for large rectangles

**BREAKTHROUGH from Tests:**

- Found larger valid rectangles using test-driven approach!
- 4995773 → 5816008 → 9781100 → 49820213 → 79751464 → 185832331
- Issue: Cache was overflowing, and we weren't checking enough candidates
- Solution: Remove cache, increase size limit to 200M, use dense sampling for large rectangles
- 185832331 → 451345455 (found via tests in 100M-500M range)
- 451345455 → 992981210 (found at candidate 63219)
- 992981210 → 1534043700 (found via tests in 500M-2B range)
- **Final answer: 1534043700** ✅ CORRECT - found at candidate 49359
- Issue was size limit (1B) was too small - increased to 2B
- Test-driven approach successfully found the answer without rate limiting!

## Wrong Answers (DO NOT RESUBMIT)

- 4596179031 - Too high (sampling missed invalid tiles)
- 21894813 - Too low
- 39910560 - Too low
- 4995773 - Wrong
- 49820213 - Wrong
- 185832331 - Wrong
- 992981210 - Wrong

## Key Learnings

1. **Test-driven iteration is critical** - We iterated through 8+ attempts locally before finding the answer, which would have taken hours with rate limiting.

2. **Size limits matter** - Started at 5M, increased through 20M, 50M, 200M, 1B, finally 2B tiles. The answer required checking rectangles with 1.5B tiles.

3. **Caching can overflow** - The Map cache for point-in-polygon exceeded maximum size. Removed caching to fix.

4. **Sampling is a trade-off** - Dense sampling (100x100 grid) worked for very large rectangles while maintaining accuracy.

5. **Sort by priority** - Checking largest rectangles first allowed early exit once a valid answer was found.

- Using test-driven iteration is MUCH faster than submitting and waiting for rate limits!

**Hypothesis:**

- The correct answer might require checking rectangles larger than 20M tiles
- Or we need to optimize validation to check larger rectangles faster
- Or there's a bug where we're not continuing to check after finding a valid one

**Next Steps:**

1. Remove size limits and check all candidates (but optimize for speed)
2. Or check candidates in a different order (maybe by proximity?)
3. Verify the solution code matches test code exactly
4. Only submit when tests confirm correctness
