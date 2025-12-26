# Challenge 3: 👶 Help the intern - Solution Log

## Problem Summary
- **Difficulty:** easy
- **Function:** `drawGift`

Draw a `size x size` square box with a border made of `symbol`. Inside is empty (spaces).

## Attempts

### JavaScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript
- ✅ Completed (6 stars, 5/5 quality) - First attempt

### Python
- ✅ Completed (6 stars, 5/5 quality) - First attempt

## Approach

Simple pattern:
1. If size < 2, return empty string
2. Top row: symbol repeated `size` times
3. Middle rows (size-2 of them): symbol + spaces(size-2) + symbol
4. Bottom row: symbol repeated `size` times
5. Join with newlines

```javascript
lines.push(symbol.repeat(size))           // top
for (i = 0; i < size - 2; i++) {
  lines.push(symbol + " ".repeat(size-2) + symbol)  // middle
}
lines.push(symbol.repeat(size))           // bottom
return lines.join("\n")
```

## Key Insights

- Edge case: size=2 has no middle rows (just top and bottom)
- Edge case: size < 2 returns empty string
- All languages have similar string repeat operations
