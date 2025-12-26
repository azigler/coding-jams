# Challenge 4: 🧮 Decipher the Santa PIN - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `decodeSantaPin`

Decode a 4-digit PIN from encrypted blocks in brackets. Each block generates one digit:

- Normal blocks: `[nOP...]` where `n` is a digit (0-9) and `OP` are operations (`+` adds 1, `-` subtracts 1)
- Special block: `[<]` repeats the previous digit
- Operations use mod 10 arithmetic (9+1=0, 0-1=9)
- Must return exactly 4 digits, otherwise return null

## Attempts

### JavaScript

- ✅ Completed (6 stars, 5/5 quality) - First attempt

### TypeScript

- ✅ Completed (6 stars) - First attempt

### Python

- ✅ Completed (6 stars, 4/5 quality) - First attempt

## Approach

1. **Extract blocks**: Use regex to find all blocks between brackets `\[([^\]]+)\]`
2. **Validate length**: If fewer than 4 blocks, return null
3. **Process each block**:
   - If block is `'<'`: Repeat the last digit (or return null if no previous digit)
   - Otherwise: Extract the first character as the initial digit, then apply operations in order
4. **Apply operations**: `+` adds 1, `-` subtracts 1, with mod 10 arithmetic
5. **Return result**: Join all 4 digits into a string

### Algorithm

```javascript
// Extract blocks with regex
const blocks = code.match(/\[([^\]]+)\]/g).map(m => m.slice(1, -1));

// Process each block
for (const block of blocks) {
  if (block === '<') {
    digits.push(digits[digits.length - 1]);  // Repeat previous
  } else {
    let digit = parseInt(block[0]);
    for (const op of block.slice(1)) {
      digit = op === '+' ? (digit + 1) % 10 : (digit - 1 + 10) % 10;
    }
    digits.push(digit);
  }
}
```

## Key Insights

- **Regex parsing**: Using `\[([^\]]+)\]` to extract block contents efficiently
- **Mod 10 arithmetic**: For subtraction, add 10 before mod to handle negative: `(digit - 1 + 10) % 10`
- **Edge cases**:
  - Fewer than 4 blocks → return null
  - `[<]` as first block → return null (no previous digit)
  - Empty blocks or invalid format → handled by validation
- **String operations**: All languages have similar string manipulation, making the port straightforward
