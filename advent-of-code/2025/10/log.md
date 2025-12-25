# Day 10: Factory - Solution Log

## Problem Summary

Each machine has:

- Indicator light diagram: `[.##.]` means lights should be off, on, on, off (positions 0,1,2,3)
- Button wiring schematics: `(0,3,4)` means pressing this button toggles lights at positions 0, 3, and 4
- Joltage requirements: Can be ignored

Goal: Find the minimum number of button presses to configure all lights correctly for each machine, then sum them.

### Part 1

- Find minimum button presses for each machine
- Sum all minima
- **Answer: 449** ✅ CORRECT

### Part 2 ✅

- Instead of toggling lights, buttons increment counters by 1
- Find minimum button presses to reach target joltage levels
- **Answer: 17848** ✅ CORRECT

## Approach

This is a system of linear equations over GF(2) (modulo 2 arithmetic):

- Each button press toggles specific lights (XOR operation)
- We need to find the minimum number of button presses to reach target state
- Can model as: find minimum weight solution to Ax = b (mod 2)

## Solution Approach

Used BFS (Breadth-First Search) to find minimum button presses:

1. Start from all-off state (all lights = 0)
2. For each state, try pressing each button
3. Toggle affected lights (XOR with 1)
4. Return first path that reaches target state
5. Sum minima for all machines

## Attempts

- Example test: ✓ Passes (7)
- Real input: 449 button presses
- Submission: ✅ Correct!

## Part 2 Issues

- BFS approach works for examples but times out on real input
- State space too large: first machine has 10 counters with targets ~50-100
- After 100k iterations: 242k visited states, 142k in queue, still no solution
- Tried DP with memoization but cache overflowed
- Need more efficient algorithm

**This is an Integer Linear Programming problem:**

- Solve Ax = b where A[i][j] = 1 if button j affects counter i
- x[j] = non-negative integer (presses for button j)
- b[i] = target joltage
- Minimize sum(x)

**Potential approaches:**

- Branch-and-bound
- System of linear equations solver adapted for integers
- More aggressive state space pruning
- Different search strategy (A*, iterative deepening)

## Key Insight: Gaussian Elimination

The breakthrough came from recognizing this as a **linear algebra problem**, not a search problem.

**Failed approaches:**

1. Forward BFS - state space too large (counters up to ~100 each)
2. Backwards BFS - still too slow
3. DP with memoization - Map overflow
4. Branch-and-bound - still too slow

**The elegant solution:**

1. Model as system of linear equations: Ax = b
   - A[i][j] = 1 if button j affects counter i
   - x[j] = number of presses for button j
   - b[i] = target joltage for counter i
2. Use Gaussian elimination to get Reduced Row Echelon Form
3. Identify pivot and free variables
4. Search only over free variable values (typically 2-3 variables!)
5. Compute pivot variables from RREF, check non-negativity

**Why it works:**

- With n counters and m buttons, there are m-n degrees of freedom
- For a typical machine with 10 counters and 12 buttons: only 2 free variables!
- Search space: ~100² = 10,000 combinations instead of 100^12

**Result: 17848 (computed in ~2 seconds)**
