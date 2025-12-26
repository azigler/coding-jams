# Challenge 19: 🎄 Santa's Secret Journey - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `revealSantaRoute`

Reconstruct Santa's route from unordered segments. The first element is always the first segment. Chain segments by matching destinations to origins. Some segments may not belong to the route.

## Attempts

### JavaScript

- ✅ Completed (7 stars, 5/5 quality) - Used Map for O(1) lookup

### TypeScript

- ✅ Completed (7 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (7 stars, 5/5 quality) - First attempt

## Approach

1. **Start with first segment**: First element of array is always the first segment
2. **Build route map**: Create Map/dict for O(1) lookup of origin → destination
3. **Chain segments**: Starting from first segment's destination, look up next segment
4. **Continue until no match**: When no segment matches current destination, route is complete

### Algorithm

```javascript
const routeMap = new Map(routes.map(r => [r[0], r[1]]));
const route = [...routes[0]];
let currentDest = routes[0][1];

while (routeMap.has(currentDest)) {
  currentDest = routeMap.get(currentDest);
  route.push(currentDest);
}
```

## Key Insights

- **Use Map for efficiency**: O(1) lookup instead of O(N) find() - this was key to getting 5/5
- **First segment is fixed**: Always start with routes[0]
- **Chain by matching**: destination of current → origin of next
- **Ignore disconnected segments**: If no match found, route ends (other segments are ignored)
- **No cycles**: Problem states no cycles, so while loop will always terminate
