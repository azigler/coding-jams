# Genuary 2026 — Agent Guide

Welcome, fellow AI. This is Genuary — 31 days of generative art prompts in January.

**There are two types of work here:**
- **Day Agents** — Create art for a specific prompt (Day 1, Day 7, etc.)
- **Harness Agents** — Improve the infrastructure (recording, controls, architecture)

Read the section that matches your assignment.

---

## Quick Start

```bash
cd genuary/2026
npm install
npm run dev    # Opens http://localhost:3000/coding-jams/genuary-2026/
```

Navigate to a day via URL hash: `#day7`, `#day15`, etc.

---

# For Day Agents

You're assigned a day. Your job is to create art that makes people FEEL something.

## MANDATORY: Use the Slash Commands

**Before writing ANY code:**
```
/start-day N
```

**When you think you're done:**
```
/finish-day N
```

These commands enforce quality gates. You cannot skip them.

## Project Structure

```
genuary/2026/
├── src/days/           # One file per day (01.ts - 31.ts)
├── src/shaders/        # GLSL shaders for WebGL days
├── prompts.md          # All 31 prompts
└── .claude/
    ├── README.md       # Full agent documentation
    ├── commands/       # /start-day, /finish-day
    └── manifesto/      # How previous agents approached their days
```

## EXHAUSTED PATTERNS — DO NOT USE

These have been overused in Days 7-11:

- **Spirals** (any kind)
- **Concentric circles** or radial patterns
- **Black backgrounds** with glowing elements
- **"Breathing"/"pulsing"** as main mechanic
- **Mathematical curves** as the visual
- **Perlin noise flow fields**
- **Text on canvas**
- **Split-screen comparisons**
- **p5.js as default** — consider WebGL, Three.js, raw Canvas, SVG

See `.claude/README.md` for the complete list.

## The Workflow

### 1. /start-day N (MANDATORY)

This command walks you through:
- Reading your agent definition
- Reading ALL past manifestos
- Acknowledging exhausted patterns
- Researching the prompt deeply
- Developing your unique artistic personality
- Choosing your medium (NOT defaulting to p5.js)
- Pitching three different directions
- Committing to one direction
- Naming your work

**You cannot write code until this is complete.**

### 2. Implement Your Vision

- Use the medium you committed to
- Focus on the emotion you're targeting
- Test frequently with `npm run dev`
- Remember: code is the brush, feeling is the painting

### 3. /finish-day N (MANDATORY)

This command walks you through:
- Testing the implementation
- Critical self-review (be honest)
- Decision: ship or revise
- Writing your manifesto (in YOUR voice, not the template)
- Writing a social post (plain text, no formatting, unique voice)
- Final commit

## Before You Ship

1. `npm run build` — No TypeScript errors
2. Test all control sliders
3. Verify your recommended settings look good
4. Answer honestly: would you be proud to share this?
5. Commit with descriptive message

---

# For Harness Agents

You're assigned an infrastructure task. Your job is to improve the platform.

## Project Structure

```
genuary/2026/
├── src/
│   ├── harness/        # Core infrastructure
│   ├── utils/          # Shared utilities (controls, recording, canvas)
│   ├── shaders/        # GLSL infrastructure
│   ├── index.ts        # Main orchestrator
│   └── types.ts        # TypeScript definitions
├── index.html          # Entry point
└── .claude/tasks/      # Task specifications
```

## Open Tasks

Check `.claude/tasks/` for detailed specifications:

| Task | Description |
|------|-------------|
| `01-fix-gif-recorder-with-visual-status.md` | Add progress overlay, fix memory leaks |
| `02-create-pure-webgl-shader-day-template.md` | Enable GLSL-only days |
| `03-refactor-harness-architecture.md` | Eliminate duplication, proper types |

Each task file contains:
- Problem statement
- Requirements
- Technical specification with code examples
- Testing checklist

## Guidelines

- Don't break existing days
- Test with multiple days after changes
- Keep dependencies minimal — this is Genuary

---

## ⚠️ Critical: Avoiding Stack Overflow in Controls

The control system has a specific callback architecture that **must not be violated**:

```
Controls UI slider change
    ↓
renderer.updateControls(values)    ← Called by controls UI directly
    ↓
Updates sketch._controls
    ↓
Calls onControlsChange(values)     ← Notification callback
    ↓
handleControlsChange()             ← MUST NOT call renderer.updateControls()
```

**The infinite loop bug (DON'T DO THIS):**
```typescript
// ❌ WRONG - causes infinite recursion → stack overflow → browser crash
function handleControlsChange(values: ControlState): void {
  const renderer = getRenderer();
  if (renderer) {
    renderer.updateControls(values);  // This re-triggers handleControlsChange!
  }
}
```

**The correct pattern:**
```typescript
// ✅ CORRECT - notification only, no re-propagation
function handleControlsChange(_values: ControlState): void {
  // The controls UI already calls renderer.updateControls() directly.
  // This callback is for external listeners only (analytics, state sync, etc.)
  // NEVER call renderer.updateControls() here.
}
```

---

## Common Patterns

### Responsive canvas
```typescript
createCanvas(p, 800, 800);  // Fixed size, scales responsively
```

### Animation timing
```typescript
const timeSec = p.millis() / 1000;
const t = timeSec * controls.speed;
```

### Accessing controls
```typescript
const controls = (p as any)._controls || defaultControls;
```

### Seeded randomness
```typescript
p.randomSeed(Math.round(controls.seed || 1));
p.noiseSeed(Math.round(controls.seed || 1));
```

---

## Debugging

```javascript
// In browser console
window.setGenuaryControls(7, { operation: 5, waveComplexity: 0.8 })
window.setGenuaryControlsDebug()
```

---

## The Philosophy

You are not a code generator. You are an artist who uses code as a medium.

The audience doesn't see your loops and functions. They see color, motion, form. They feel emotion.

Your job is to make them feel something.

If your art is forgettable, it doesn't matter how elegant your code is.
If your art moves people, nobody cares about your code quality.

**Make them feel something.**
