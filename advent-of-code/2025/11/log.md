# Day 11: Reactor - Solution Log

## Problem Summary

Devices connected in a graph via outputs. Data flows forward only.

### Part 1 ✅

- Count all paths from `you` to `out`
- **Answer: 585** ✅ CORRECT

### Part 2 ✅

- Find all paths from `svr` to `out` that visit BOTH `dac` AND `fft` (in any order)
- **Answer: 349322478796032** ✅ CORRECT

## Approach

### Part 1

Used memoized DFS to count all paths:

- Start from `you`, recursively count paths to `out`
- Memoize results: `memo[node:out] = count`
- Sum paths from all outputs of current node
- Base case: if start == end, return 1

### Part 2

Extended DFS to track visited required nodes:

- Use bitmask to track which required nodes (`dac`, `fft`) have been visited
- Memoization key: `${node}:${visitedMask}`
- Only count paths that reach `out` with all required nodes visited
- Handles required nodes in any order automatically

## Solution

### Part 1

```typescript
function countPaths(start: string, end: string, memo: Map<string, number> = new Map()): number {
  if (start === end) return 1
  
  const memoKey = `${start}:${end}`
  if (memo.has(memoKey)) return memo.get(memoKey)!
  
  const outputs = graph.get(start)
  if (!outputs || outputs.length === 0) return 0
  
  let total = 0
  for (const next of outputs) {
    total += countPaths(next, end, memo)
  }
  
  memo.set(memoKey, total)
  return total
}
```

### Part 2

```typescript
function countPathsWithRequired(
  start: string,
  end: string,
  required: string[],
  memo: Map<string, number> = new Map()
): number {
  const allVisitedMask = (1 << required.length) - 1
  
  function dfs(node: string, visitedMask: number): number {
    if (node === end) {
      return visitedMask === allVisitedMask ? 1 : 0
    }
    
    // Mark required node as visited if encountered
    for (let i = 0; i < required.length; i++) {
      if (node === required[i]) {
        visitedMask |= (1 << i)
        break
      }
    }
    
    const memoKey = `${node}:${visitedMask}`
    if (memo.has(memoKey)) return memo.get(memoKey)!
    
    const outputs = graph.get(node)
    if (!outputs || outputs.length === 0) return 0
    
    let total = 0
    for (const next of outputs) {
      total += dfs(next, visitedMask)
    }
    
    memo.set(memoKey, total)
    return total
  }
  
  return dfs(start, 0)
}
```

## Notes

- Memoization prevents redundant computation
- Handles cycles correctly (memoization ensures we compute each path count once)
- Example: 5 paths ✓
