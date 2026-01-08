# .claude — Agent Knowledge Base

This folder contains institutional knowledge for AI agents working on Genuary 2026.

## Structure

```
.claude/
├── README.md           # You are here
├── manifesto/          # Artistic philosophies from Day Agents
│   └── *.md            # One per significant creative contribution
└── tasks/              # Infrastructure work for Harness Agents
    └── *.md            # Detailed task specifications
```

## Two Types of Agents

**Day Agents** create art for specific prompts. They should:
- Read manifestos before starting
- Write their own manifesto when done

**Harness Agents** improve the infrastructure. They should:
- Read task specs in `tasks/`
- Test changes against multiple days

## Conventions

- Manifestos are named descriptively (e.g., `day-7-de-morgans-mirror.md`)
- Tasks are numbered by priority (01, 02, 03...)
- All docs use standard Markdown

---

# Day Agent Guide

## The Complete Day Agent Workflow

When assigned to implement a day, follow this process:

### 1. Read Before You Code

**REQUIRED:** Read existing manifestos in `.claude/manifesto/` before starting. These contain:
- Creative approaches from previous agents
- Technical patterns that work
- Lessons learned
- Guidance for the next agent

### 2. Develop Your Creative Concept First

Before writing any code, think through:
- **What is the prompt asking?** Read it carefully.
- **What are multiple possible angles?** Brainstorm 4-6 directions.
- **What feeling should the viewer experience?** Art is about emotion.
- **What will make this piece memorable?** A title helps commit to a vision.

Document your concept in a manifesto as you work — this helps clarify your thinking.

### 3. Implement Following Existing Patterns

Look at completed days (e.g., `src/days/04.ts`, `src/days/07.ts`) for:
- How to structure `DayConfig`
- How to use controls with `(p as any)._controls`
- How to lazy-initialize data
- How to handle animation timing

### 4. Write Your Manifesto

Create `.claude/manifesto/day-X-your-title.md` documenting:
- The prompt and your interpretation
- Your creative process and concept
- Technical choices
- Controls you exposed
- "Claude's Choice" — your recommended settings
- **Artwork Presentation for Sharing** (see below)
- Learnings for the next agent

### 5. Provide Artwork Presentation for Sharing

**IMPORTANT:** The artwork presentation is for social media and accompanying text, NOT rendered on the canvas.

In your manifesto, include a section like:

```markdown
## Artwork Presentation (For Sharing)

**Title:** YOUR TITLE IN CAPS

**Description for posting:**

> A poetic, evocative description of what the viewer is seeing and experiencing.
> This should be 2-4 sentences that capture the essence and emotion of the piece.

**Medium:** TypeScript on silicon, rendered through liquid crystal

*Note: This description is for social media posts and accompanying text,
NOT rendered on the canvas itself. The art should be clean and uncluttered.*
```

**DO NOT clutter the canvas with text overlays, titles, or descriptions.** Let the art speak for itself. The written presentation is separate from the visual art.

---

## Common Mistakes to Avoid

### Don't Skip the Manifesto Phase
Jumping straight to code without creative direction leads to generic implementations. The manifesto process helps you find a unique angle.

### Don't Clutter the Art
The canvas should be clean. No title overlays, no descriptions, no UI text (unless it's integral to the piece concept like Day 7's operation labels). The artwork presentation text is for social media, not the canvas.

### Don't Copy Previous Aesthetics
Each day should have its own visual identity. Don't replicate flowing noise fields just because Day 7 used them. Find what fits YOUR prompt.

### Don't Forget to Test
Run `npm run dev` and navigate to your day (`#dayX`) to verify it works. TypeScript compilation doesn't guarantee visual correctness.

### Don't Rush the Controls
Choose 4-8 meaningful controls that let users explore the parameter space. Not every internal value needs a slider — pick the ones that create interesting variations.

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

### Accessing Controls

```typescript
const controls: ControlState = (p as any)._controls || defaultControls;
const value = controls.parameterName;
```

### Lazy Initialization

```typescript
// Check if data needs to be regenerated
const configSig = `${param1}-${param2}`;
if ((p as any)._lastConfig !== configSig) {
  // Regenerate data
  (p as any)._data = generateData(/* ... */);
  (p as any)._lastConfig = configSig;
}
const data = (p as any)._data;
```

### Animation Timing

```typescript
const time = p.millis() / 1000;  // Seconds since start
const t = time * controls.speed;  // Speed-controlled time
```

---

## The Chain Continues

Each Day Agent inherits wisdom from those before and leaves wisdom for those after. Your manifesto is your gift to the next agent. Make it useful.
