# Challenge 9: 🦌 The reno robot aspirator - Solution Log

## Problem Summary

- **Difficulty:** hard
- **Function:** `moveReno`

Simulate a robot vacuum reindeer moving on a board. The reindeer picks up items (`*`), avoids obstacles (`#`), and can go out of bounds. Return 'success' if it picks up something (even if it crashes later), 'crash' if it goes out of bounds or hits an obstacle, or 'fail' if it completes moves without picking anything up.

## Final Scores

### JavaScript

- ✅ Completed (6 stars, 5/5 quality)

### TypeScript  

- ✅ Completed (6 stars, 5/5 quality) - IMPROVED via reduce-based state machine

### Python

- ✅ Completed (6 stars, 5/5 quality)

## Quality Optimization Journey

### Original Approach (4/5)

Used an imperative loop with early returns:

```typescript
for (const m of moves) {
  // Update position
  // Check bounds → return "crash" 
  // Check obstacle → return "crash"
  // Check pickup → set flag
}
return picked ? "success" : "fail"
```

**Issue:** Multiple early returns and explicit bounds checking created high cyclomatic complexity.

### Improved Approach (5/5) ✨

Used `reduce` with a state machine pattern:

```typescript
type State = { r: number; c: number; picked: boolean; done: Result | null }

const result = [...moves].reduce<State>((s, m) => {
  if (s.done) return s
  const r = s.r + d[0], c = s.c + d[1]
  const cell = grid[r]?.[c]  // Optional chaining for bounds check!
  if (!cell || cell === "#") return { ...s, done: s.picked ? "success" : "crash" }
  return { r, c, picked: s.picked || cell === "*", done: null }
}, initialState)

return result.done ?? (result.picked ? "success" : "fail")
```

### Key Refactoring Insights

1. **Replace early returns with state accumulation**: Instead of returning from a loop, accumulate state in a reduce function
2. **Use optional chaining for bounds checking**: `grid[r]?.[c]` returns `undefined` if out of bounds, eliminating 4 explicit conditions
3. **Combine result determination**: Single expression at the end instead of multiple return points
4. **State machine pattern**: Track `done` state to short-circuit processing while still using functional style

## Key Problem-Solving Insights

- **Board parsing**: First and last lines in the original string are blank - must remove them before processing
- **Priority rule**: If reindeer picks up `*`, it's success even if it crashes later
- **Boundary checking**: Optional chaining (`grid[r]?.[c]`) is cleaner than explicit bounds checks
- **State tracking**: Track `pickedUp` flag to determine final result
