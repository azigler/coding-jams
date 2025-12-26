# Challenge 22: 🎄 The sleigh maze - Solution Log

## Problem Summary

- **Difficulty:** hard
- **Function:** `canEscape`

Pathfinding problem: determine if Santa can reach exit 'E' from start 'S' in a maze. Can move up, down, left, right. '#' are walls, '.' are paths.

## Attempts

### JavaScript

- ✅ Completed (7 stars, 5/5 quality) - BFS approach

### TypeScript

- ✅ Completed (7 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (7 stars, 5/5 quality) - First attempt

## Approach

1. **Find start position**: Locate 'S' in the maze
2. **BFS traversal**: Use breadth-first search to explore all reachable cells
3. **Early exit**: Return true as soon as 'E' is found
4. **Boundary checking**: Ensure we stay within maze bounds
5. **Visited tracking**: Use Set to avoid revisiting cells

### Algorithm

```javascript
const queue = [[startR, startC]];
const visited = new Set([`${startR},${startC}`]);

while (queue.length) {
  const [r, c] = queue.shift();
  if (maze[r][c] === 'E') return true;
  
  for (each direction) {
    if (in bounds && not wall && not visited) {
      visited.add(key);
      queue.push([nr, nc]);
    }
  }
}
```

## Key Insights

- **BFS is ideal**: Breadth-first search naturally finds shortest path and is perfect for reachability
- **Visited set**: Critical to avoid infinite loops and revisiting cells
- **String keys**: Use `${r},${c}` format for Set keys (tuples not available in JS)
- **Boundary checking**: Always check bounds before accessing maze cells
- **Early return**: Can return immediately when 'E' is found (don't need to explore all paths)
- **Simple and efficient**: BFS implementation is straightforward and got 5/5 on first try
