# Challenge 1: 🎁 Filter the defective gifts - Solution Log

## Problem Summary

- **Difficulty:** easy
- **Function:** `filterGifts`

Filter out gifts whose names contain the `#` character.

## Attempts

### JavaScript

- ✅ Completed (6 stars) - `elfo-del-dom` achievement unlocked

### TypeScript

- ✅ Completed (6 stars) - `santa-script` achievement unlocked

### Python

- ✅ Completed (6 stars) - `piton-festivo` and `rey-de-la-nieve-multilingue` achievements unlocked

## Approach

Simple filter operation:

- JavaScript: `gifts.filter(gift => !gift.includes('#'))`
- TypeScript: Same as JS with types
- Python: List comprehension `[gift for gift in gifts if '#' not in gift]`

## Key Insights

- Very straightforward problem for the first challenge
- Each language has idiomatic ways to filter:
  - JS/TS: `array.filter()`
  - Python: list comprehension
- All solutions scored 5/5 on code quality
