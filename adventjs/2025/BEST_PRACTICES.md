# AdventJS 2025 - Best Practices

Lessons learned from Advent of Code 2025 and early AdventJS challenges. Follow these to iterate faster and avoid common pitfalls.

---

## ⚠️ Language Note

**AdventJS was created by Spanish speakers.** Some content from the API may be in Spanish:

- Achievement names (e.g., `elfo-del-dom`, `piton-festivo`)
- Code quality feedback from the server
- Some error messages

**We always work in English.** Our harness, solutions, documentation, and reasoning are all in English. Spanish content from the API is displayed as-is or omitted where practical.

---

## 1. Always Create `log.md`

**Create a log file for EVERY challenge, not just failures.**

```markdown
# Challenge N: [Title] - Solution Log

## Problem Summary
- **Difficulty:** [easy/medium/hard]
- **Function:** `functionName`

## Attempts

### JavaScript
- [ ] Not started / ✅ Completed (stars)

### TypeScript
- [ ] Not started / ✅ Completed (stars)

### Python
- [ ] Not started / ✅ Completed (stars)

## Approach
- [Document your algorithm]

## Key Insights
- [What made this problem tricky?]
```

**Why:**

- Tracks what you've tried across all three languages
- Documents your thinking for future reference
- Even successful solutions deserve documentation

---

## 2. Solve in Order: JS → TS → Python

**AdventJS requires solutions in all three languages for full completion.**

### Recommended Workflow

1. **JavaScript First** - Simplest syntax, fastest iteration
2. **TypeScript Second** - Often just add types to JS solution
3. **Python Last** - May require different idioms (list comprehensions, etc.)

### Why This Order?

- JS is the most forgiving (no type errors, flexible syntax)
- TS solutions are often trivial ports from JS
- Python may need refactoring (different naming conventions, different APIs)

---

## 3. Test Locally Before Submitting

**Never use AdventJS submission as your test loop.**

### The Problem

- Each submission takes time (rate limited)
- Failed submissions waste time you could spend iterating

### The Solution

1. **Create test files using examples from the challenge:**

   ```typescript
   // test.ts
   import { functionName } from "./solution.ts"
   
   const testCases = [
     { input: [...], expected: ... },
   ]
   
   for (const { input, expected } of testCases) {
     const result = functionName(...input)
     const pass = JSON.stringify(result) === JSON.stringify(expected)
     console.log(`Test: ${pass ? "✅" : "❌"} Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)}`)
   }
   ```

2. **Run tests before submitting:**

   ```bash
   deno run --allow-read test.ts
   ```

3. **Only submit when all example tests pass**

---

## 4. Understand the Problem First

**Read the challenge twice before coding.**

### Checklist Before Coding

- [ ] What are the input types?
- [ ] What are the output types?
- [ ] What are the edge cases? (empty arrays, negative numbers, etc.)
- [ ] Are there any constraints mentioned in the description?

### Common Edge Cases to Consider

- Empty arrays/strings
- Negative numbers
- Zero values
- Very large numbers
- Invalid inputs (non-numbers where numbers expected)
- Unicode characters
- Duplicate values

---

## 5. Language-Specific Tips

### JavaScript

- Use modern syntax (`const`, `let`, arrow functions)
- Array methods are your friends (`filter`, `map`, `reduce`)
- Be careful with type coercion

### TypeScript

- Start from your JS solution and add types
- Use explicit return types
- Prefer `Array<T>` over `T[]` for clarity in complex types
- Use `Record<string, T>` for object types

### Python

- Use list comprehensions where appropriate
- Remember: `snake_case` for function names
- Use `isinstance()` for type checking
- `dict.get()` with defaults is safer than direct access

---

## 6. Code Quality Matters - Always Aim for 5/5

**AdventJS scores your code on quality (1-5 scale). We ALWAYS aim for 5/5.**

### Quality Criteria (each scored 0-100%)

1. **Correctness** - Does it pass all tests?
2. **Complexity** - Is the algorithm efficient?
3. **Style** - Is the code well-formatted?
4. **Algorithmic Quality** - Is the approach sound?
5. **Maintainability** - Is it readable and maintainable?

### The 5/5 Quality Loop

After each submission:

1. Check the quality score in the output
2. If <5/5, read the **Weaknesses** and **Action Items**
3. Improve the solution based on feedback
4. Resubmit until you achieve 5/5

**Never move to the next language until you have 5/5 in the current one.**

### Tips for 5/5 Scores

- **Be concise** - Use one-liners with array methods
- **Use functional style** - `.filter()`, `.map()`, `.reduce()` over loops
- **Name variables well** - `filteredGifts` not `arr` or `result`
- **Remove temp variables** - Inline expressions when possible
- **Use language idioms** - List comprehensions in Python, etc.
- **Keep it simple** - Avoid over-engineering

### Examples of 5/5 Code

**JavaScript:**

```javascript
function filterGifts(gifts) {
  return gifts.filter(gift => !gift.includes('#'))
}
```

**TypeScript:**

```typescript
function filterGifts(gifts: string[]): string[] {
  return gifts.filter(gift => !gift.includes('#'))
}
```

**Python:**

```python
def filter_gifts(gifts):
  return [gift for gift in gifts if '#' not in gift]
```

### Feedback is Stored

The harness stores quality feedback in `.cache.json`. Check it to see:

- Score and breakdown for each language
- Weaknesses that need fixing
- Action items to implement

---

## 7. Debug Systematically

**When stuck, follow this checklist:**

1. **Re-read the challenge text**
   - Did you miss a constraint?
   - Is there an edge case you didn't consider?

2. **Verify the example works**
   - If example fails, your logic is wrong
   - If example passes but submission fails, look for edge cases

3. **Check for off-by-one errors**
   - Inclusive vs exclusive ranges
   - 0-indexed vs 1-indexed

4. **Print intermediate values**
   - What's the actual state at key points?

5. **Review the test failure details**
   - AdventJS shows expected vs actual for public tests
   - Use this information to debug

---

## 8. Fresh Start After Failures

**If you're stuck after 2-3 failed attempts:**

1. Create a new solution file (don't just patch the old one)
2. Re-read the problem from scratch
3. Start with the simplest possible approach
4. Verify against examples before submitting

**Why:** Accumulated patches often lead to more bugs. A fresh approach can be faster than debugging a complex solution.

---

## 9. Pattern Recognition

**Look for common patterns before implementing.**

| Problem Type | Approach |
|--------------|----------|
| Filter items | `array.filter()` / list comprehension |
| Transform items | `array.map()` / list comprehension |
| Aggregate values | `array.reduce()` / `sum()` / loop |
| Find item | `array.find()` / loop with early return |
| Check condition | `array.every()` / `array.some()` / `all()` / `any()` |
| Remove duplicates | `new Set()` / `set()` |
| Count occurrences | `Map` / `Counter` / `dict` |
| Tree/Graph traversal | DFS/BFS |
| Dynamic programming | Memoization / tabulation |

---

## 10. Harness Commands Reference

```bash
# Fetch challenge and create files
deno task fetch 3

# Submit solution in specific language
deno task submit 3 js
deno task submit 3 ts
deno task submit 3 py

# Run local tests
deno task test 3

# Auto-solve (submit all unsolved languages)
deno task auto 3

# Check completion status
deno task status
```

---

## 11. Summary Checklist

Before submitting ANY solution:

- [ ] Re-read the challenge
- [ ] Verify examples pass locally
- [ ] Check edge cases
- [ ] Ensure code is clean, concise, and readable
- [ ] Use functional style where possible
- [ ] log.md is updated

After submission:

- [ ] Check quality score - **must be 5/5**
- [ ] If <5/5, read weaknesses and action items
- [ ] Improve and resubmit until 5/5
- [ ] Update log.md with result and quality score
- [ ] Document key insights

---

## 12. Identifying Challenges Needing Quality Improvement

Check `.cache.json` for challenges where:

- Any language has a score <5 (in the `advice` field)
- Stars are less than 6 (indicates possible quality issues)

The harness stores detailed feedback including:

- `score` - Overall quality (aim for 5)
- `breakdown` - Individual metric scores (100% each for 5/5)
- `weaknesses` - What to fix
- `action_items` - How to fix it

---

## 13. Common Patterns for Reducing Cyclomatic Complexity

**Cyclomatic complexity is the #1 reason for 4/5 scores. Here are proven patterns to reduce it:**

### Pattern 1: Extract Boundary/Validation Checks

**Problem:** Nested conditionals in loops checking boundaries, obstacles, etc.

**Solution:** Extract validation into a helper function.

```javascript
// ❌ High complexity (4/5)
for (const move of moves) {
  row += dr
  col += dc
  if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === '#') {
    return pickedUp ? 'success' : 'crash'
  }
}

// ✅ Lower complexity (5/5)
const isValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols
for (const move of moves) {
  row += dr
  col += dc
  if (!isValid(row, col) || grid[row][col] === '#') return pickedUp ? 'success' : 'crash'
}
```

### Pattern 2: Simplify Final Return Statements

**Problem:** Complex nested ternary or if-else chains in return statements.

**Solution:** Use early returns and consolidate conditions.

```javascript
// ❌ High complexity (4/5)
if (hp1 <= 0 && hp2 <= 0) return 0
if (hp1 <= 0) return 2
if (hp2 <= 0) return 1
return hp1 > hp2 ? 1 : hp2 > hp1 ? 2 : 0

// ✅ Lower complexity (5/5)
if (hp1 <= 0) return hp2 <= 0 ? 0 : 2
if (hp2 <= 0) return 1
return hp1 === hp2 ? 0 : hp1 > hp2 ? 1 : 2
```

### Pattern 3: Use Direction Vectors for Grid Traversal

**Problem:** Complex diagonal checking with multiple nested loops.

**Solution:** Use direction vectors and iterate from each cell once.

```javascript
// ❌ High complexity (4/5) - checking from starting points
for (let r = 0; r <= rows - 4; r++) {
  for (let c = 0; c <= cols - 4; c++) {
    // Check diagonal...
  }
}

// ✅ Lower complexity (5/5) - use direction vectors
const dirs = [[1, 1], [1, -1]]
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    for (const [dr, dc] of dirs) {
      // Check line in this direction
    }
  }
}
```

### Pattern 4: Extract Damage/Calculation Logic

**Problem:** Complex conditional logic for calculating values (damage, scores, etc.).

**Solution:** Use helper functions with clear, declarative logic.

```javascript
// ❌ High complexity (4/5)
if (m1 === 'A' && m2 !== 'B') d2 = 1
if (m1 === 'F') d2 = 2
if (m2 === 'A' && m1 !== 'B') d1 = 1
if (m2 === 'F') d1 = 2

// ✅ Lower complexity (5/5)
const getDmg = (m, blocked) => m === 'F' ? 2 : m === 'A' && !blocked ? 1 : 0
hp1 -= getDmg(m2, m1 === 'B')
hp2 -= getDmg(m1, m2 === 'B')
```

### Pattern 5: Simplify Sort Comparisons

**Problem:** Complex nested ternary in sort functions.

**Solution:** Extract comparison logic or use early returns.

```javascript
// ❌ High complexity (4/5)
const sorted = data.sort((a, b) => {
  const va = a[sortBy], vb = b[sortBy]
  return typeof va === 'number' && typeof vb === 'number'
    ? va - vb
    : String(va).localeCompare(String(vb))
})

// ✅ Lower complexity (5/5) - same logic but cleaner structure
const sorted = [...data].sort((a, b) => {
  const va = a[sortBy], vb = b[sortBy]
  if (typeof va === 'number' && typeof vb === 'number') return va - vb
  return String(va).localeCompare(String(vb))
})
```

### Pattern 6: Avoid Redundant Checks in Loops

**Problem:** Checking conditions that can't be true given loop constraints.

**Solution:** Only check what's necessary, use early returns.

```javascript
// ❌ Redundant checks
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (r === 0 && checkLine(...)) // Only check when r === 0
  }
}

// ✅ Check once outside nested loop
for (let r = 0; r < rows; r++) {
  if (checkLine(board[r])) return true
}
```

### Pattern 7: When 4/5 May Be Acceptable

**Some problems have inherent complexity that's difficult to reduce:**

- **Grid traversal with multiple directions** (e.g., Challenge 18) - Checking horizontal, vertical, and diagonals requires multiple loops
- **Complex state machines** (e.g., Challenge 9) - Tracking position, boundaries, obstacles, and pickup state in a loop
- **Turn-based simulations** (e.g., Challenge 12) - Multiple conditional branches for different move combinations

**When to accept 4/5:**
- After 3+ improvement attempts with no progress
- Complexity score is 70-80% (not terrible, just not perfect)
- The code is already clean, readable, and maintainable
- Further simplification would harm readability

**Always try to get 5/5 first**, but recognize when the problem's inherent complexity makes it difficult.

### Key Principles

1. **Extract helpers early** - Don't wait for complexity to build up
2. **Use early returns** - Reduce nesting depth
3. **Consolidate conditions** - Combine related checks
4. **Avoid redundant iterations** - Check each cell/direction once
5. **Use direction vectors** - For grid traversal problems
6. **Simplify return logic** - Use early returns and clear conditionals
7. **Read feedback carefully** - The action items tell you exactly what to fix

### Common Complexity Issues and Fixes

| Issue | Fix |
|-------|-----|
| Nested conditionals in loops | Extract to helper function |
| Complex return statements | Use early returns, consolidate conditions |
| Multiple similar loops | Use direction vectors or helper function |
| Redundant checks | Remove duplicate logic |
| Long lines | Break into multiple lines |
| Complex damage/calculation logic | Extract to helper with clear logic |

---

*Always aim for 5/5 quality on every solution in every language.*
