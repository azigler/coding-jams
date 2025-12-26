# AdventJS 2025 - Auto Mode Flight Plan

This document provides the step-by-step process for Cursor's Auto Mode to solve AdventJS challenges with minimal intervention.

---

## Important Notes

### Language Note

AdventJS was created by Spanish speakers. Achievement names and some API feedback are in Spanish, but **we always work in English** - our solutions, documentation, and reasoning are all in English.

### Token Management

Authentication tokens in `.env` may expire. If you get auth errors:

1. Open adventjs.dev in browser and log in
2. Copy fresh `__Secure-next-auth.session-token` from cookies
3. Update `.env`

### 🎯 Goal: 5/5 Code Quality on ALL Solutions

**Every submission must achieve a 5/5 code quality score.** If you get less than 5/5:

1. Read the feedback (weaknesses and action items) from the submission output
2. Improve the solution based on the feedback
3. Use `deno task resubmit <id> <lang>` to resubmit until you achieve 5/5

**Automatic Behavior:**

- If a challenge is solved but has no quality score cached, the harness will automatically resubmit to capture feedback
- If quality score is <5/5, the harness shows weaknesses and requires `--force` or `deno task resubmit` to resubmit
- Feedback is stored in `.cache.json` under each challenge's `advice` field

---

## Pre-Flight Checklist

Before starting any challenge:

- [ ] Read `BEST_PRACTICES.md` to understand guidelines
- [ ] Run `deno task status` to check current progress
- [ ] Identify which challenges need to be solved
- [ ] Identify which languages are remaining for each challenge
- [ ] Check `.cache.json` for any challenges with <5 scores that need improvement

---

## Phase 1: Challenge Setup

### Step 1.1: Fetch Challenge

```bash
deno task fetch <challenge_id>
```

This creates:

- `<id>/challenge.html` - Problem description
- `<id>/examples.html` - Examples section
- `<id>/log.md` - Solution log
- `<id>/test.ts` - Test file template
- `<id>/solution.js` - JavaScript template
- `<id>/solution.ts` - TypeScript template
- `<id>/solution.py` - Python template

### Step 1.2: Read and Understand

1. Read `challenge.html` - understand the problem
2. Read `examples.html` - understand the test cases
3. Identify:
   - Input types
   - Output types
   - Edge cases mentioned
   - Function signature

### Step 1.3: Create Local Tests

Update `test.ts` with examples from the challenge (see existing test files for format).

---

## Phase 2: Solve in JavaScript

### Step 2.1: Implement Solution

Edit `solution.js`:

- Start with the simplest, cleanest approach
- Focus on correctness AND quality
- Handle edge cases
- Use descriptive variable names
- Keep code concise and readable

### Step 2.2: Test Locally

```bash
deno task test <id>
```

All tests should pass before proceeding.

### Step 2.3: Submit and Check Quality

```bash
deno task submit <id> js
```

**Check Results:**

- ✅ All tests pass AND 5/5 quality → proceed to TypeScript
- ✅ All tests pass BUT <5/5 quality → **improve and resubmit** (see Step 2.4)
- ❌ Tests fail → analyze errors and fix

### Step 2.4: Quality Improvement Loop (If Score < 5/5)

If you got less than 5/5:

1. **Read the feedback** from the submission output:
   - Weaknesses section shows what's wrong
   - Action items show how to fix it

2. **Common improvements for 5/5:**
   - Use more concise syntax (e.g., one-liners with array methods)
   - Remove unnecessary variables
   - Use language-appropriate idioms
   - Improve variable naming
   - Reduce complexity

3. **Improve the solution** based on feedback

4. **Resubmit** until you get 5/5:

   ```bash
   deno task submit <id> js
   ```

5. **Only proceed to next language after achieving 5/5**

---

## Phase 3: Solve in TypeScript

### Step 3.1: Port Solution

Edit `solution.ts`:

- Start from the working JavaScript solution
- Add TypeScript types
- Keep the logic identical
- Ensure the solution is as clean as the JS version

### Step 3.2: Submit and Check Quality

```bash
deno task submit <id> ts
```

**If score < 5/5:** Apply the Quality Improvement Loop (same as Step 2.4)

---

## Phase 4: Solve in Python

### Step 4.1: Port Solution

Edit `solution.py`:

- Port the logic from JavaScript
- Use Python idioms:
  - `snake_case` for function names
  - List comprehensions where appropriate
  - Concise, Pythonic style
  - `isinstance()` for type checking
  - `dict.get()` for safe access

### Step 4.2: Submit and Check Quality

```bash
deno task submit <id> py
```

**If score < 5/5:** Apply the Quality Improvement Loop

---

## Phase 5: Verify and Document

### Step 5.1: Verify Completion

```bash
deno task status
```

Check that:

- All three languages show 6 stars
- Check `.cache.json` to confirm all scores are 5/5

### Step 5.2: Update Log

Update `log.md` with:

- Final approach
- Key insights
- Quality scores achieved

---

## Quality Improvement Reference

### Common Feedback and Fixes

| Feedback | Fix |
|----------|-----|
| "Can be more concise" | Use one-liner with `.map()`, `.filter()`, `.reduce()` |
| "Unnecessary variables" | Inline expressions instead of temp vars |
| "Could use array methods" | Replace loops with functional methods |
| "Naming could be improved" | Use descriptive names like `filteredGifts` not `arr` |
| "Complexity could be reduced" | Simplify nested conditions, use early returns |

### Examples of 5/5 Quality Code

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

---

## Troubleshooting Guide

### Problem: Score is 4/5 or Lower

**Solution:**

1. Read the weaknesses and action_items in the output
2. Common issues:
   - Code is too verbose (use one-liners)
   - Using loops instead of functional methods
   - Poor variable names
   - Unnecessary complexity
3. Simplify and resubmit

### Problem: Build ID Expired

**Solution:** The harness will auto-refresh the build ID.

### Problem: Session Expired

**Solution:** Get fresh cookies from browser and update `.env`

### Problem: Rate Limit Hit

**Solution:** Wait for the rate limit to reset (60s default). The harness handles this automatically.

### Problem: Tests Pass Locally But Fail on Submit

**Solution:**

1. Check for edge cases not covered in examples
2. Common issues: empty inputs, negative numbers, type coercion

---

## Quick Reference

### Commands

```bash
deno task fetch <id>          # Fetch challenge
deno task submit <id> js      # Submit JavaScript
deno task submit <id> ts      # Submit TypeScript
deno task submit <id> py      # Submit Python
deno task resubmit <id> <lang> # Force resubmit for quality improvement
deno task improve-all         # List all solutions needing improvement
deno task improve <id> <lang> # Get detailed improvement suggestions
deno task status              # Check progress
```

### Language Order

1. **JavaScript** → Start here, fastest iteration
2. **TypeScript** → Add types to JS solution
3. **Python** → Port with Python idioms

---

## Phase 5: Quality Improvement (4/5 → 5/5)

When you have solutions at 4/5 quality, use this improvement workflow:

### Step 5.1: Identify Solutions Needing Improvement

```bash
deno task improve-all
```

This shows all solutions with <5/5 quality scores.

### Step 5.2: Get Detailed Suggestions

```bash
deno task improve <id> <lang>
```

This provides:
- Current score breakdown
- Main issue identified (usually complexity)
- Matched refactoring patterns with code examples
- Complexity reduction checklist

### Step 5.3: Apply Refactoring Patterns

Common patterns that help achieve 5/5:

1. **Extract Helper Functions**
   ```javascript
   // Before: Inline boundary checks
   if (x >= 0 && x < width && y >= 0 && y < height) { ... }
   
   // After: Helper function
   const inBounds = (x, y) => x >= 0 && x < width && y >= 0 && y < height;
   if (inBounds(x, y)) { ... }
   ```

2. **Use Lookup Tables**
   ```javascript
   // Before: If-else chain for directions
   if (dir === 'U') dy = -1;
   else if (dir === 'D') dy = 1;
   
   // After: Lookup table
   const moves = { U: [0,-1], D: [0,1], L: [-1,0], R: [1,0] };
   const [dx, dy] = moves[dir];
   ```

3. **Simplify Return Statements**
   ```javascript
   // Before: Multiple return checks
   if (a <= 0 && b <= 0) return 0;
   if (a <= 0) return 2;
   if (b <= 0) return 1;
   return a > b ? 1 : b > a ? 2 : 0;
   
   // After: Ternary chain (if cleaner)
   return a <= 0 && b <= 0 ? 0 : a <= 0 ? 2 : b <= 0 ? 1 : Math.sign(b - a) + 1 || 0;
   ```

4. **Functional Style**
   ```javascript
   // Before: Imperative loop
   let result = [];
   for (const x of items) if (x.valid) result.push(x.val);
   
   // After: Functional chain
   const result = items.filter(x => x.valid).map(x => x.val);
   ```

### Step 5.4: Resubmit and Verify

```bash
deno task resubmit <id> <lang>
```

The harness will:
- Show improvement: `🎉 IMPROVEMENT: 4/5 → 5/5`
- Track the attempt in `.cache.json` under `improvementAttempts`
- If still <5/5, show updated suggestions

### Step 5.5: Accept Inherent Complexity

Some problems have inherent complexity that cannot be reduced:
- Grid traversal with multiple direction checks
- State machines with many transitions
- BFS/DFS with multiple conditions

After 2-3 refactoring attempts, if still at 4/5:
1. Document why in `log.md`
2. Move on (correctness > perfect score)

### Key Files

```
<id>/
├── challenge.html  # Problem description
├── examples.html   # Test examples
├── log.md          # Solution log
├── test.ts         # Local tests
├── solution.js     # JavaScript solution
├── solution.ts     # TypeScript solution
└── solution.py     # Python solution
```

---

## Auto Mode Loop

For unattended solving, repeat this loop:

```
1. Check status for next unsolved challenge
2. Fetch challenge if not already fetched
3. Read challenge and examples
4. Implement JS solution (aim for clean, concise code)
5. Test locally
6. Submit JS → if <5/5, improve and resubmit until 5/5
7. Port to TS → submit → if <5/5, improve until 5/5
8. Port to Python → submit → if <5/5, improve until 5/5
9. Verify all languages have 5/5 scores
10. Move to next challenge
```

**Escalation Protocol:**

- After 2 failures: Re-read problem, fresh approach
- After 3 quality iterations without 5/5: Check feedback carefully, try a completely different approach
- After 4 failures: Document blocker in log.md, move to next challenge

---

*Follow this flight plan for each challenge. Always aim for 5/5 quality - consistency is key to success.*
