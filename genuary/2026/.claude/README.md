# .claude — Agent Knowledge Base

This folder contains institutional knowledge for AI agents working on Genuary 2026.

## Structure

```
.claude/
├── README.md           # You are here
├── commands/           # Slash commands for agents
│   ├── start-day.md    # /start-day - Begin a day (MANDATORY)
│   └── finish-day.md   # /finish-day - Complete a day
├── manifesto/          # Artistic philosophies from Day Agents
│   └── *.md            # One per significant creative contribution
├── agents/             # Agent role definitions
│   └── curator.md      # Museum builder agent
└── analysis/           # Research and progress tracking
    └── *.md            # Architecture notes, progress logs
```

## Three Types of Agents

**Day Agents** create art for specific prompts. They MUST:
1. Run `/start-day N` before writing ANY code
2. Complete ALL preparation steps (no skipping)
3. Run `/finish-day N` when done (includes mandatory reflection)

**Harness Agents** improve the infrastructure. They should:
- Check beads for available work: `br ready`
- Test changes against multiple days

**Curator Agent** builds the WebXR museum. See `agents/curator.md`.

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/start-day N` | Begin work on Day N - MANDATORY before coding |
| `/finish-day N` | Complete Day N with reflection and documentation |

---

# EXHAUSTED PATTERNS — DO NOT USE

The following have been overused in Days 7-11 and are **BANNED** for future days:

### Visual Patterns
- Spirals (Archimedean, logarithmic, Fibonacci, phyllotaxis)
- Concentric circles or radial patterns
- Black/dark backgrounds with floating glowing elements
- "Breathing" or "pulsing" animations as the primary mechanic
- Mathematical curves (roses, Lissajous, etc.) as the main visual
- Perlin/simplex noise flow fields
- Text rendered on canvas
- Split-screen comparisons
- Particle systems with trails

### Technical Approaches
- p5.js as default (consider WebGL, Three.js, raw Canvas, SVG)
- `loadPixels()`/`updatePixels()` for everything
- Seeded random with a "seed" slider
- The same control patterns (speed, complexity, etc.)

### Manifesto Patterns
- The "6 directions" brainstorm format
- "Opus 4.5's Choice" section headers
- ASCII art signatures at the end
- "rendered through silicon/liquid crystal" phrases
- Generic "For the Next Agent" advice
- The word "meditation" in titles

### Social Post Patterns
- Markdown formatting (LinkedIn doesn't render it)
- Starting with a quote block
- "Medium:" descriptions
- The same poetic voice every time

---

# Day Agent Guide

## The Complete Day Agent Workflow

### STEP 1: Run /start-day

```
/start-day N
```

This command enforces the mandatory preparation sequence. You cannot skip it.

### STEP 2: Implement Your Vision

After completing /start-day, implement your chosen direction:

1. Create `src/days/NN.ts` following existing patterns
2. Use the medium you committed to (WebGL? Three.js? Raw canvas?)
3. Focus on the emotion you're targeting
4. Test frequently with `bun run dev`

### STEP 3: Run /finish-day

```
/finish-day N
```

This command enforces reflection and quality gates. It includes:
- Self-review questions
- Revision requirements if quality isn't met
- Manifesto writing guidance
- Social post creation (plain text, unique voice)

---

## Technical Reference

### Day File Structure

```typescript
import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

const defaultControls: ControlState = { /* ... */ };
const controlConfigs: { [key: string]: ControlConfig } = { /* ... */ };

const config: DayConfig = {
  day: X,
  prompt: 'The prompt text',
  creditName: 'PromptAuthor',
  creditUrl: 'https://...',
  recording: { enabled: true, duration: 10, filename: 'genuary-2026-day-XX' },

  setup: (p: p5) => { /* ... */ },
  draw: (p: p5) => { /* ... */ },
  renderFinal: (p: p5) => { /* ... */ },
};

export function getClaudesChoice(): Partial<ControlState> {
  return { /* your recommended settings */ };
}

export { controlConfigs, defaultControls };
export default config;
```

### For WebGL/Shader Days

See `src/shaders/` for the shader infrastructure:
- `fullscreen.vert` - Standard fullscreen vertex shader
- `common.glsl` - Shared GLSL utilities
- `template.frag` - Starting point for fragment shaders

Use `src/harness/shader-renderer.ts` for pure shader days.

### Accessing Controls

```typescript
const controls: ControlState = (p as any)._controls || defaultControls;
const value = controls.parameterName;
```

### Animation Timing

```typescript
const time = p.millis() / 1000;  // Seconds since start
const t = time * controls.speed;  // Speed-controlled time
```

---

## The Chain of Artistic Thought

Each Day Agent inherits context from those before and leaves context for those after.

But **inheritance is not imitation**. Your job is to:
1. Understand what came before
2. Respond to it (rebel, evolve, dialogue—not copy)
3. Leave something genuinely new

The next agent will read your manifesto. Make it useful AND unique.

---

## Common Mistakes to Avoid

### Don't Skip /start-day
The preparation sequence exists because rushing to code produces generic art.

### Don't Copy Previous Aesthetics
Each day should have its own visual identity. Read the EXHAUSTED PATTERNS section.

### Don't Default to p5.js
Consider WebGL, Three.js, raw Canvas 2D, SVG, or pure HTML/CSS. Choose based on what serves your vision.

### Don't Chase Complexity
Simple code that evokes emotion > complex code that impresses programmers.

### Don't Forget the Emotion
If you can't name what viewers should feel, you don't have a clear vision yet.

### Don't Ship Mediocre Work
/finish-day includes a "ship or revise" decision. Choose revise if needed.
