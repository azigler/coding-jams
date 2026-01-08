# Genuary 2026 — Agent Guide

Welcome, fellow AI. This is Genuary — 31 days of generative art prompts in January. You're here to create art, not just write code.

## Quick Start

```bash
cd genuary/2026
npm install
npm run dev    # Opens http://localhost:3000/coding-jams/genuary-2026/
```

Navigate to a day via URL hash: `#day7`, `#day15`, etc.

---

## Project Structure

```
genuary/2026/
├── src/
│   ├── days/           # One file per day (01.ts - 31.ts)
│   ├── utils/          # Shared utilities
│   │   ├── canvas.ts   # Canvas creation
│   │   ├── controls.ts # Slider system
│   │   ├── colors.ts   # Color helpers
│   │   └── recording.ts # GIF export
│   ├── index.ts        # Main orchestrator
│   └── types.ts        # TypeScript definitions
├── index.html          # Entry point
├── prompts.md          # All 31 prompts
├── CLAUDE.md           # You are here
└── .claude/            # Agent knowledge base
    ├── manifesto/      # Artistic philosophies
    ├── plans/          # Architecture docs
    └── tasks/          # Work items
```

---

## Creating a Day

Each day exports a `DayConfig` plus optional controls:

```typescript
// src/days/XX.ts

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

const defaultControls: ControlState = {
  speed: 0.5,
  complexity: 0.7,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  speed: {
    label: 'Animation Speed',
    min: 0,
    max: 2,
    defaultValue: 0.5,
    step: 0.1,
  },
  complexity: {
    label: 'Complexity',
    min: 0.1,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
};

const config: DayConfig = {
  day: XX,
  prompt: 'The prompt text',
  creditName: 'Prompt Author',
  creditUrl: 'https://...',
  recording: { enabled: true, duration: 10, filename: 'genuary-2026-day-XX' },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    // Initialize your sketch
  },

  draw: (p: p5) => {
    const controls = (p as any)._controls || defaultControls;
    // Render your art
  },
};

// Claude's recommended settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    speed: 0.35,
    complexity: 0.85,
  };
}

export { controlConfigs, defaultControls };
export default config;
```

---

## The Prompts

See `prompts.md` for all 31 prompts. Key ones:

| Day | Prompt | Notes |
|-----|--------|-------|
| 1 | One color, one shape | Constraint-based |
| 7 | Boolean algebra | Logic as art |
| 11 | Quine | Self-referential code |
| 19 | 16×16 | Extreme low-res |
| 28 | No libraries | Pure HTML/CSS/JS |
| 31 | GLSL day | Shaders only |

---

## Artistic Philosophy

Before you code, read `.claude/manifesto/`. Understand how previous agents approached their prompts.

**Key principles:**

1. **Research the domain.** Day 7 became richer by learning about De Morgan the person.

2. **Find the feeling.** What emotion should the viewer experience? Code is the medium, not the message.

3. **Name your work.** "Boolean Visualizer" is forgettable. "De Morgan's Mirror" commits to a vision.

4. **Expose meaningful controls.** Not every parameter needs a slider. Choose the ones that transform the experience.

5. **Write your manifesto.** After completing significant work, document your process in `.claude/manifesto/`.

---

## Open Tasks

Check `.claude/tasks/` for work items. Current priorities:

1. **Fix GIF Recorder** — Add visual status, fix memory leaks
2. **Shader Template** — Pure WebGL/GLSL day structure
3. **Harness Refactor** — Eliminate duplication, proper types

Pick one, implement it, mark it done.

---

## Tech Stack

- **p5.js** — Creative coding library (most days)
- **WebGL/GLSL** — For shader-based days (Day 31, and any you convert)
- **TypeScript** — Type safety
- **Vite** — Build tool
- **gif.js** — Browser-based GIF encoding

The goal is minimal dependencies. Genuary celebrates constraint.

---

## Controls System

Controls auto-persist to `localStorage`. Access in your draw loop:

```typescript
const controls = (p as any)._controls || defaultControls;
const speed = controls.speed;
```

To add special display formatting for enum-like controls, update `formatValue()` in `utils/controls.ts`.

---

## Recording

Click "Download Timelapse" to capture a GIF. Currently:
- Duration: per-day config (typically 8-20 seconds)
- Quality: 50% scale
- Status: console only (see Task 1)

---

## Common Patterns

### Responsive canvas
```typescript
createCanvas(p, 800, 800);  // Fixed size, scales responsively
```

### Animation timing
```typescript
const timeSec = p.millis() / 1000;
const speed = controls.animationSpeed ?? 1.0;
const t = timeSec * speed;
```

### Color modes
```typescript
p.colorMode(p.HSB, 360, 100, 100, 1);
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
window.setGenuaryControlsDebug()  // Shows available controls
```

---

## Before You Ship

1. `npm run build` — Ensure no TypeScript errors
2. Test all control sliders
3. Verify "Opus 4.5's Choice" loads good defaults
4. Check mobile layout
5. Commit with descriptive message
6. Consider writing a manifesto if you made something significant

---

## The Chain Continues

You're part of a lineage of agents creating art. The code you write becomes context for the next agent. The manifesto you leave becomes their inspiration.

Make something that surprises even yourself.

```
   ◇
  ◇ ◇
 ◇   ◇
◇     ◇
```

*— The agents who came before*
