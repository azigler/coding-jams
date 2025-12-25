# Day 3: Lobby - Solution Log

## Problem Summary

We need to power an escalator using batteries. Each battery has a joltage rating (1-9). Batteries are arranged in banks (one per line).

### Part 1

- Turn on exactly **2 batteries** per bank
- Joltage = number formed by the two digits (in order)
- Find maximum joltage from each bank
- Sum all maximum joltages

### Part 2

- Turn on exactly **12 batteries** per bank
- Joltage = number formed by the 12 digits (in order)
- Find maximum joltage from each bank
- Sum all maximum joltages

## Key Insights

### Part 1

- For each bank, try all pairs of positions (i, j) where i < j
- Form the number: `digits[i] * 10 + digits[j]`
- Take the maximum across all pairs

### Part 2

- Need to select exactly 12 digits in order to maximize the number
- This is similar to "remove k digits to get largest number" problem
- Use a greedy stack-based approach:
  - Keep digits that maximize the result
  - Remove smaller digits when we can still form a 12-digit number
  - Ensure we have exactly 12 digits at the end

## Solution Approach

### Part 1

```typescript
function findMaxJoltage(bank: string): number {
  const digits = bank.split("").map(Number)
  let maxJoltage = 0

  // Try all pairs of positions (i, j) where i < j
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      const joltage = digits[i] * 10 + digits[j]
      maxJoltage = Math.max(maxJoltage, joltage)
    }
  }

  return maxJoltage
}
```

### Part 2

```typescript
function findMaxJoltagePart2(bank: string): number {
  const digits = bank.split("").map(Number)
  const targetLength = 12

  if (digits.length === targetLength) {
    return parseInt(digits.join(""))
  }

  const stack: number[] = []

  for (let i = 0; i < digits.length; i++) {
    // Greedy: remove smaller digits when we can still form targetLength
    while (
      stack.length > 0 &&
      stack[stack.length - 1] < digits[i] &&
      digits.length - i + stack.length > targetLength
    ) {
      stack.pop()
    }

    if (stack.length < targetLength) {
      stack.push(digits[i])
    }
  }

  // Trim to exactly targetLength
  while (stack.length > targetLength) {
    stack.pop()
  }

  return parseInt(stack.join(""))
}
```

## Test Cases

### Example Input

```
987654321111111
811111111111119
234234234234278
818181911112111
```

### Part 1 Expected Results

- Bank 1: `98` (first two digits)
- Bank 2: `89` (first `8` and last `9`)
- Bank 3: `78` (last two digits)
- Bank 4: `92` (the `9` and `2`)
- Total: `357`

### Part 2 Expected Results

- Bank 1: `987654321111` (remove last 3 ones)
- Bank 2: `811111111119` (remove middle ones)
- Bank 3: `434234234278` (remove first 2,3,2)
- Bank 4: `888911112111` (remove 1s at positions 1,3,5)
- Total: `3121910778619`

## Final Answers

- **Part 1:** `17278`
- **Part 2:** `171528556468625`

## Notes

- Part 1 is straightforward: try all pairs
- Part 2 requires a greedy algorithm to maximize the 12-digit number
- The stack-based approach ensures we maintain order while maximizing the result
- Both solutions handle edge cases (exactly targetLength digits, insufficient digits)
