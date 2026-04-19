# CROSSED WIRES — Spec

**LD59 jam entry · theme: Signal · author: zigtalk**

You're a telephone operator. Calls keep getting crossed. Your job each shift
is to sort the tangled lines back into coherent conversations.

## Core loop

1. Screen shows **8-12 lines of dialogue** in a vertical transcript, all from
   a single garbled "call" — actually 2-3 conversations crossed together.
2. Player **clicks each line** to cycle its assignment: `— → A → B → C → —`.
   The line's color and left-border change to match.
3. When every line has an assignment, the **Connect** button lights up.
4. On connect:
   - **Correct:** the transcript re-renders with each conversation grouped
     and readable. A chime plays. Next-level CTA appears.
   - **Wrong:** the mis-assigned lines flash red; assignments stay; the
     player keeps clicking.
5. **5 levels**, one accumulating narrative. Final level reveals a connection
   across the shift.

## Player agency (Rule 1 check)
Every click is a meaningful decision. There's no system that resolves
without the player. No timers, no emergent behavior, no "watch and wait."
The puzzle is pure deduction from textual context.

## UI layout (desktop, 900px wide)

```
┌───────────────────────────────────────────────────────┐
│  CROSSED WIRES — shift 1 of 5                         │
│  ───────────────────────────────────────────────────  │
│                                                       │
│  [—] Are you there?                                   │
│  [—] The meeting is at three, not four.               │
│  [—] I was hoping to catch you before you went out.   │
│  [—] Did you bring the contracts?                     │
│  ...                                                  │
│                                                       │
│  ─ A: the mother  ─ B: the office  ─ C: —             │
│                                                       │
│  [ CONNECT ]                                          │
└───────────────────────────────────────────────────────┘
```

Each line row:
- Left: a small round color-dot (the assignment indicator) — clicking the
  whole row cycles the assignment
- Then: the line text, in monospace serif
- When assigned, the text tint shifts toward the assignment color; when
  `—`, text is high-contrast ink

## Mobile layout
- Stacks vertically, full-width rows
- Dot button is 44×44px tap target per row (iOS guideline)
- Conversation labels legend condenses to a single horizontal scroll strip
- Connect button sticks to the bottom of the viewport

## Data model (TypeScript)

```ts
type ConversationId = 'A' | 'B' | 'C';

type Line = {
  id: number;            // stable per-level id
  text: string;
  owner: ConversationId; // authored truth; not shown to player
};

type Conversation = {
  id: ConversationId;
  label: string;         // "the mother", "the office"
  color: string;         // OKLCH string
  icon?: string;         // sprite key, optional
};

type Level = {
  id: number;
  slug: string;          // "hello", "the-shift", etc.
  title: string;         // "Hello?", display title
  epigraph?: string;     // 1-line framing text above transcript
  conversations: Conversation[];
  lines: Line[];         // order-preserving — order IS the puzzle fixture
  postamble?: string;    // shown on-solve, may thread narrative
};
```

`lines` are shown in authored order (the order they arrived on the crossed
line). The player only changes each line's `owner` assignment. Order is
fixed. This is critical — it keeps the puzzle simple and prevents the
combinatorial mess of also-sortable order.

## Win condition
A level solves when, for every line, `assignedOwner === line.owner`. We do
NOT check for "natural English" — the authored solution IS the ground truth.

Optional visual polish on solve:
- Lines re-stack (animate) into their conversation groups
- Each group renders as a clean dialog block, properly punctuated
- The player sees the *story* they've just untangled

## Visual identity

Follow the `/typeset`, `/colorize`, `/polish` skills from `impeccable/`.
Concrete commitments:

**Fonts** (all from Google Fonts, available at runtime):
- Body / UI: **Inter**, weight 400/500/700
- Transcript lines: **IBM Plex Mono**, weight 400/500
- Title + level headings: **Playfair Display**, weight 700 italic

**Palette** (OKLCH, consistent lightness steps):
- `--ink`: `oklch(20% 0.02 260)` — body text
- `--paper`: `oklch(96% 0.03 90)` — background, warm off-white
- `--paper-deep`: `oklch(92% 0.04 85)` — cards, inset surfaces
- `--unassigned`: `oklch(60% 0.01 260)` — neutral gray dot
- `--conv-a`: `oklch(62% 0.17 45)` — **amber** (first speaker)
- `--conv-b`: `oklch(52% 0.15 240)` — **ink-blue** (second speaker)
- `--conv-c`: `oklch(60% 0.09 140)` — **sage** (third speaker, used L3+)
- `--wrong`: `oklch(55% 0.18 20)` — muted red, for error flash
- `--right`: `oklch(65% 0.14 150)` — soft green, for correct flash

No glassmorphism. No purple gradients. No dark mode until everything else
is solved. Warm paper aesthetic throughout.

**Typography voice** (per `/typeset`):
- Use real italics for emphasis, not all-caps
- Let the mono transcript do the visual heavy-lifting
- Display type (Playfair) only for titles and section headings — never body
- Comfortable line-height on the mono transcript (~1.6)

## Sound

Four SFX, generated via [jsfxr](https://sfxr.me/) and embedded as
base64 WAV (keep under 10KB each):

1. **`click`** — bakelite-plug tap when toggling a line (tiny)
2. **`wrong`** — short buzz when a line flashes red
3. **`right`** — warm bell on level solve
4. **`page`** — paper-rustle when advancing to next level

No ambient loop in v1 (scope). Audio strictly reactive.

All sounds mute-toggle from a persistent mute button top-right. Honor
`prefers-reduced-motion` for animations.

## Motion
Per `/animate`: motion justifies itself. Allowed motions only:
- Dot-color ease on click (120ms)
- Line-row gentle shift when correct solve re-groups (600ms)
- Subtle fade-in on level transition (250ms)
- Wrong-flash: 3x 80ms red pulse
No bounce, no spring overshoot, no particles, no screenshake.

## Levels progression
See `specs/levels.md` for authored content. Summary:

| # | Title | Convos | Lines | Difficulty |
|---|---|---|---|---|
| 1 | *"Hello?"* | 2 (mother + office) | 8 | tutorial |
| 2 | *"Wednesday"* | 2 (both business) | 10 | similar-voice |
| 3 | *"The Shift"* | 3 | 12 | multiplicity |
| 4 | *"Dearest"* | 2 (one with red herrings) | 10 | deduction |
| 5 | *"Dial Tone"* | 2 | 10 | the reveal |

## Narrative thread
Across all five levels, one recurring NAME surfaces in multiple otherwise-
unrelated conversations. Level 5's solve reveals the connection. Keep it
small — a single person whose actions ripple through the town. Two pages
of post-solve text on level 5 is the whole "ending."

## Tech
- **TypeScript + Vite + Bun** (matches Phase Chorus scaffold)
- **DOM + CSS** — no canvas, no engine, no framework
- ~300-500 LOC total expected
- Build to `dist/`, deploy to `_site/ld59/` (the real entry — NOT under
  `/prototypes/`)
- URL: `https://azigler.github.io/coding-jams/ld59/`

## Deployment
Update `.github/workflows/deploy.yml`:
- Add `- "ludum-dare/59-signal/game/**"` to paths trigger
- Add a "Build LD59 CROSSED WIRES" step with `working-directory: ludum-dare/59-signal/game`
- Copy `game/dist/*` to `_site/ld59/`

## Out of scope (v1)
- Scoring / stars
- Timer mode
- Multiple difficulty tiers per level
- Save state / resume
- Leaderboards
- Keyboard shortcuts beyond basic ones
- Localization
- A tutorial overlay (the first level IS the tutorial by design)

## Acceptance checklist
- [ ] 5 levels playable end-to-end
- [ ] Mobile layout verified at 375px width
- [ ] All 4 SFX trigger at correct events
- [ ] Mute button persists via localStorage
- [ ] `prefers-reduced-motion` respected
- [ ] Deploy URL serves at `/coding-jams/ld59/`
- [ ] Pixel art assets (title + icons from Zig) integrated when delivered
- [ ] No console errors in production build
- [ ] Lighthouse a11y > 90
