# Challenge 21: 🤖 The cleaning robot - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `clearGifts`

Extension of Challenge 20 - now when a row becomes completely filled with gifts, the robot removes it. All rows above shift down, and a new empty row appears at the top.

## Attempts

### JavaScript

- ✅ Completed (7 stars, 5/5 quality) - Fixed: store column count before removal

### TypeScript

- ✅ Completed (7 stars, 5/5 quality) - Fixed: store column count before removal

### Python

- ✅ Completed (7 stars, 5/5 quality) - Fixed: store column count before removal

## Approach

1. **Copy warehouse**: Create deep copy to avoid mutating input
2. **Store column count**: Save original column count before processing
3. **For each drop**: Find lowest empty cell in column and place gift
4. **Check if complete**: If row is now all '#', remove it and add empty row at top
5. **Use stored column count**: Use original column count when creating new row (not result[0].length which may not exist)

### Algorithm

```javascript
const cols = warehouse[0].length; // Store before processing

for (const col of drops) {
  // Find drop position
  // Place gift
  if (row is complete) {
    result.splice(dropRow, 1);
    result.unshift(new Array(cols).fill('.')); // Use stored count
  }
}
```

## Key Insights

- **Store column count**: Critical bug - must store `warehouse[0].length` before processing, not use `result[0].length` after splice (result may be in unexpected state)
- **Row removal**: Use `splice()` to remove row, then `unshift()` to add empty row at top
- **Warehouse size**: Always maintains same dimensions (rows and cols)
- **Row shifting**: When row is removed, all rows above automatically shift down (splice handles this)
- **Bug fix**: The issue was using `result[0].length` after splice - should use stored original column count
