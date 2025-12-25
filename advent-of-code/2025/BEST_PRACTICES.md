# Advent of Code 2025 - Best Practices

Lessons learned from solving Days 1-9. Follow these to iterate faster and avoid common pitfalls.

---

## 1. Always Create `log.md`

**Create a log file for EVERY day, not just failures.**

```markdown
# Day N: [Title] - Solution Log

## Problem Summary
- Part 1: [Brief description]
- Part 2: [Brief description]

## Attempts
- [timestamp] Attempt 1: [answer] - [result: correct/wrong/too high/too low]

## Approach
- [Document your algorithm]

## Key Insights
- [What made this problem tricky?]
```

**Why:**

- Tracks what you've tried (don't resubmit wrong answers)
- Documents your thinking for future reference
- Helps identify patterns in failures
- Even successful solutions deserve documentation

---

## 2. Test Locally Before Submitting

**Never use AoC submission as your test loop.**

### The Problem

- Rate limits: 60s after first attempt, 5 mins after 6+ attempts
- Each failed submission wastes time you could spend iterating

### The Solution

1. **Create test files for the example:**

   ```typescript
   // test-example.ts
   const example = `[paste example input]`
   // ... run your logic
   console.log(`Result: ${result}, Expected: ${expected}`)
   console.log(`Match: ${result === expected ? '✓' : '✗'}`)
   ```

2. **Run tests with timeouts:**

   ```bash
   timeout 60 deno run --allow-read test-example.ts
   ```

3. **Only submit when:**
   - Example test passes ✓
   - Real input produces a result (no errors/hangs)
   - Result seems reasonable (not NaN, not 0, not astronomically large without reason)

---

## 3. Prevent Hanging Scripts

**Scripts that don't exit block your iteration loop.**

### Common Causes

1. **Infinite loops** - Bad termination conditions
2. **Missing output** - No `console.log()` for the answer
3. **Missing exit** - Deno/Node doesn't exit after async operations
4. **Memory overflow** - Map/Set exceeds maximum size

### Preventive Measures

1. **Always use timeouts when running:**

   ```bash
   timeout 300 deno run --allow-read solution.ts 2>&1 | tail -10
   ```

2. **Add progress logging for long operations:**

   ```typescript
   if (i % 10000 === 0) {
     console.error(`Progress: ${i}/${total}`)
   }
   ```

3. **Ensure output is always printed:**

   ```typescript
   console.log(`Part 1: ${part1Answer}`)
   console.log(`Part 2: ${part2Answer}`)
   ```

4. **Add explicit exits in harness scripts:**

   ```typescript
   Deno.exit(0)  // At the end of successful operations
   ```

5. **Avoid unbounded caching:**

   ```typescript
   // BAD - can overflow
   const cache = new Map<string, boolean>()
   
   // BETTER - don't cache, or limit cache size
   function compute(x: number): boolean {
     // Just recompute - it's often fast enough
   }
   ```

---

## 4. Follow the Correct Workflow

**Each day has a strict sequence:**

```
1. Fetch challenge (Part 1 only initially)
   deno task day:fetch 10

2. Read challenge text carefully
   - Note all constraints and edge cases
   - Identify the example and expected output

3. Create solution.ts with example test first
   - Verify example passes before running on real input

4. Run on real input
   - Check for errors, hangs, unreasonable values

5. Submit Part 1
   deno task day:auto 10
   
6. Fetch Part 2 (automatically done after Part 1 success)

7. Read Part 2 challenge text
   - Often adds a twist or constraint

8. Update solution.ts for Part 2
   - Create new tests for Part 2 examples

9. Submit Part 2
```

---

## 5. Handle Large Inputs

**AoC often has inputs that stress naive solutions.**

### Watch For

- Coordinates in the tens of thousands
- Millions of iterations
- Rectangles/grids with billions of tiles
- Numbers that overflow 32-bit integers (use BigInt)

### Solutions

1. **Set reasonable size limits:**

   ```typescript
   if (totalTiles > 2000000000) {
     return false  // Skip, unlikely to be valid
   }
   ```

2. **Use sampling for very large checks:**

   ```typescript
   if (totalTiles > 5000000) {
     // Sample a grid instead of checking every tile
     const gridSize = Math.min(100, Math.sqrt(totalTiles) / 100)
     // ...
   }
   ```

3. **Use BigInt for large numbers:**

   ```typescript
   let count = 0n  // BigInt
   count += 1n
   ```

4. **Sort by priority to find answer faster:**

   ```typescript
   // Check largest rectangles first
   candidates.sort((a, b) => b.area - a.area)
   ```

---

## 6. Debug Systematically

**When stuck, follow this checklist:**

1. **Re-read the challenge text**
   - Did you miss a constraint?
   - Is the starting condition different than you assumed?

2. **Verify the example works**
   - If example fails, your logic is wrong
   - If example passes but real input fails, look for edge cases

3. **Check for off-by-one errors**
   - Inclusive vs exclusive ranges
   - 0-indexed vs 1-indexed

4. **Print intermediate values**
   - What's the actual state at key points?

5. **Check for integer overflow**
   - Use BigInt if numbers could exceed 2^53

6. **Review previous wrong answers**
   - "Too high" means reduce
   - "Too low" means increase
   - Narrow down the range

---

## 7. Track Wrong Answers

**Never resubmit a known wrong answer.**

In your `log.md`:

```markdown
## Wrong Answers (DO NOT RESUBMIT)
- 4596179031 - Too high
- 21894813 - Too low
- 39910560 - Too low
- 49820213 - Wrong (no direction given)
```

This:

- Saves time (no wasted submissions)
- Gives you bounds to work within
- Shows progress toward the solution

---

## 8. Clean Up Test Files

**Keep test files organized:**

```
09/
├── solution.ts          # Main solution
├── input.txt            # Puzzle input
├── challenge.txt        # Challenge description
├── log.md               # Solution log
├── test-example.ts      # Example test
├── test-part2-example.ts  # Part 2 example test
└── test-*.ts            # Other debug tests
```

**Don't delete tests** - they're useful for:

- Regression testing if you refactor
- Understanding your thought process later
- Learning from mistakes

---

## 9. Use the Harness Effectively

**Available commands:**

```bash
# Fetch input and challenge for a day
deno task day:fetch 10

# Run solution and auto-submit
deno task day:auto 10

# Refresh star cache
deno task day:refresh 10

# Run harness directly with flags
deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts --day 10 --part 1 --auto
```

**Flags:**

- `--day N` - Which day to work on
- `--part N` - Which part (1 or 2)
- `--auto` - Auto-submit if answer found
- `--submit` - Submit the answer
- `--fetch-input` - Fetch input and challenge
- `--refresh-stars` - Update star cache from AoC

---

## 10. Recognize Mathematical Structure

**Brute-force search isn't always the answer. Look for mathematical patterns.**

### Day 10 Lesson: Linear Algebra to the Rescue

**Problem:** Find minimum button presses to reach target counter values.

- Naive BFS: State space = (max_target)^n ≈ 100^10 = impossible

**The insight:** This is a system of linear equations!

- A[i][j] = 1 if button j affects counter i
- x[j] = number of presses for button j  
- Solve: Ax = b, minimize sum(x)

**The solution:** Gaussian elimination

1. Reduce to RREF (Reduced Row Echelon Form)
2. Identify pivot and free variables
3. Search only over free variables (typically 2-3!)
4. Compute pivot variables from RREF

**Result:** 100² = 10,000 combinations instead of 100^10

### Patterns to Recognize

| Problem Type | Mathematical Approach |
|--------------|----------------------|
| Toggle states (XOR) | Linear algebra over GF(2) |
| Increment counters | System of linear equations |
| Shortest path | BFS/Dijkstra |
| Path counting | Dynamic programming with BigInt |
| Graph connectivity | Union-Find |
| Range overlaps | Interval merging |
| Point-in-polygon | Ray casting |

**Key takeaway:** Before implementing brute-force, ask:

- Is there a closed-form solution?
- Can I reduce the dimensionality?
- What's the actual number of degrees of freedom?

---

## 11. Summary Checklist

Before submitting ANY answer:

- [ ] Example test passes
- [ ] Solution runs without hanging
- [ ] Answer is not in "wrong answers" list
- [ ] Answer seems reasonable for the problem
- [ ] log.md is created/updated
- [ ] Approach is documented

After submission:

- [ ] Update log.md with result
- [ ] If wrong, add to "wrong answers" list with direction (too high/low)
- [ ] If correct, document the final approach

---

*Last updated: Day 12 completion (Advent calendar complete!)*
