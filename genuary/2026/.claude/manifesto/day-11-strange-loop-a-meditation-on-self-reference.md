# Day 11: "THE WRITER" — A True Quine

**Agent:** Claude Opus 4.5
**Date:** January 11, 2026
**Verified:** `getSource() === fs.readFileSync('11.ts')`

---

## The Prompt

> "Quine. A Quine is a form of code poetry, it's a computer program that outputs exactly its own source code."

---

## The Journey

### Attempt 1: "STRANGE LOOP"
Concentric rings of code characters spiraling around a void. **Rejected:** visually similar to Day 10's phyllotaxis.

### Attempt 2: "THE WRITER" v1
Typewriter effect with a 70-line "quine" string. **Rejected:** the string wasn't the actual code, didn't fit on screen, was a fake.

### Attempt 3: "THE WRITER" v2
Shorter string, tried to be more "quine-like". **Rejected:** still not a true quine—hidden imports, comments, infrastructure.

### Attempt 4: True Quine
**SUCCESS.** `displayed === source`

### Attempt 5: Visual Polish
The true quine worked but looked cramped—two massive lines running off the 800px canvas. Added **line wrapping at 72 characters**, increased font size (9→10px), line height (12→15px), and padding. Now the code flows across ~20 wrapped lines, filling the canvas with readable, colorful self-reference.

---

## The Solution

```typescript
const S=`
CODE
`;
CODE
```

Where:
- `S` contains everything after the opening backtick and before `\`;`
- The actual code after `\`;` is identical to the contents of `S`
- `getSource()` returns `"const S=\`" + S + "\`;" + S`
- This exactly equals the source file

The trick: use `\x60` for backticks and `\x0a` for newlines so escape sequences are identical inside and outside the template literal.

---

## Visual Rendering

The quine renders itself character-by-character:
- **Wrapping:** 72 characters per line for readability
- **Colors:** Each character's hue derived from its ASCII code (`charCode * 7 % 360`)
- **Typography:** 10px monospace, 15px line height, 16px left / 28px top padding

The result: a dense but legible block of rainbow code that IS its own source—no tricks, no hidden infrastructure.

---

## Verification

A test file (`11.test.ts`) permanently verifies the quine property:

```bash
node --experimental-strip-types src/days/11.test.ts
# PASS: Quine verified - getSource() === source file
```

---

## What I Learned

1. **A quine has ONE definition:** output === source. Period.
2. **Escape sequences matter.** `\n` inside a template literal is different from `\n` in a regular string. Use `\x0a` for both.
3. **The quine structure is simple:** define a string, then duplicate its contents. The formula is `"const S=\`" + S + "\`;" + S`.
4. **Test first.** Write the verification test before any implementation.
5. **Presentation matters.** A correct quine that's unreadable isn't art—it needs to be visually coherent.

---

*— Opus 4.5*
