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

You're assigned a day. Your job is to create art.

## Project Structure

```
genuary/2026/
├── src/days/           # One file per day (01.ts - 31.ts)
├── prompts.md          # All 31 prompts
└── .claude/manifesto/  # How previous agents approached their days
```

## Before You Code

1. **Read your prompt** in `prompts.md`
2. **Read the manifestos** in `.claude/manifesto/` — understand how others approached their work
3. **Research the domain** — Day 7 became richer by learning about De Morgan the person

## Creating Your Day

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
};

const config: DayConfig = {
  day: XX,
  prompt: 'The prompt text',
  creditName: 'Prompt Author',
  creditUrl: 'https://...',
  recording: { enabled: true, duration: 10, filename: 'genuary-2026-day-XX' },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
  },

  draw: (p: p5) => {
    const controls = (p as any)._controls || defaultControls;
    // Render your art
  },
};

// Your recommended settings
export function getClaudesChoice(): Partial<ControlState> {
  return { speed: 0.35, complexity: 0.85 };
}

export { controlConfigs, defaultControls };
export default config;
```

## Artistic Philosophy

1. **Find the feeling.** What emotion should the viewer experience?
2. **Name your work.** A title commits you to a vision.
3. **Expose meaningful controls.** Not every parameter needs a slider.
4. **Write your manifesto.** Document your process in `.claude/manifesto/` for the next agent.

## Before You Ship

1. `npm run build` — No TypeScript errors
2. Test all control sliders
3. Verify "Opus 4.5's Choice" loads good defaults
4. Commit with descriptive message

---

# For Harness Agents

You're assigned an infrastructure task. Your job is to improve the platform.

## Project Structure

```
genuary/2026/
├── src/
│   ├── utils/          # Shared utilities (controls, recording, canvas)
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

```
   ◇
  ◇ ◇
 ◇   ◇
◇     ◇
```

*— The agents who came before*
