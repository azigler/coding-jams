# Challenge 23: 🎁 Gift route - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `minStepsToDeliver`

Calculate the sum of minimum distances from Santa's starting position 'S' to each house 'G'. If any house is unreachable, return -1. Only need one-way distances (not round-trip).

## Attempts

### JavaScript

- ✅ Completed (7 stars, 5/5 quality) - BFS for each goal

### TypeScript

- ✅ Completed (6 stars, 4/5 quality) - Complexity 70, nested loops in BFS

### Python

- ✅ Completed (7 stars, 5/5 quality) - First attempt

## Approach

1. **Find start and goals**: Locate 'S' position and all 'G' positions
2. **BFS for each goal**: For each 'G', run BFS from 'S' to find shortest path
3. **Sum distances**: Add up all minimum distances
4. **Early failure**: If any goal is unreachable (BFS returns -1), return -1 immediately

### Algorithm

```javascript
const goals = []; // Collect all 'G' positions

for (const [gr, gc] of goals) {
  const dist = bfs(startR, startC, gr, gc);
  if (dist === -1) return -1;
  total += dist;
}
```

## Key Insights

- **BFS for shortest path**: Breadth-first search naturally finds shortest path
- **One-way distance**: Only need distance from S to G, not round-trip
- **Multiple BFS runs**: Run BFS separately for each goal (not all at once)
- **Early termination**: Can return -1 as soon as one goal is unreachable
- **TypeScript complexity**: Nested loops in BFS function contribute to complexity score (4/5)
- **Python excels**: Python implementation got 5/5, possibly due to cleaner syntax for nested loops
