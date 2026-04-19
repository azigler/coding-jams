---
name: manifesto
description: Structure for writing creative-decision documents (design pivots, direction locks, devlog posts). Adopted from the Genuary 2026 daily manifesto pattern. Forces taste into the open by requiring explicit rejections, considered options, and reasoning — not just "here's what I did."
---

# Manifesto

A structure for writing creative-decision documents during a jam or daily
creative-coding challenge. Originates in the Genuary 2026 daily manifestos
(`coding-jams/genuary/2026/.claude/manifesto/`) where each daily piece
ships alongside a written defense of the artistic choices.

A manifesto is NOT a devlog in the "here's what I did today" sense. It's an
**argument**. Reading one should teach a stranger what the maker was
considering, what they rejected, and why the thing they shipped is the
thing they shipped.

## When to write a manifesto

- Locking a game direction from an open brainstorm
- Choosing a visual aesthetic
- Picking a core mechanic from several candidates
- Each major creative pivot during a jam
- Every public devlog post on ldjam.com (keep shorter than internal ones)

## Structure

Use these headings (or close variants). Skip a heading if it genuinely has
nothing to say — but preferring elision over filler only works if most
sections are full.

### 1. Title + metadata
A short, *named* title — not "Day 2 Devlog" but "THE QUIET TOWN" or "FIXED
POINT" or "TERMINUS." The title is a promise. Include date, jam / day
number, and any relevant constraint (theme, time limit).

### 2. Why this title
One paragraph establishing the title's meaning. Etymology. Metaphor. The
link between name and work. This sets the conceptual frame.

### 3. The journey (or: research that shaped this)
What you read, what you saw, what prior work influenced this. Name specific
sources — artists, games, books, prior days/pieces. Avoid vague "inspired
by" language; cite concretely.

### 4. What I refused
Explicit rejections. A list. Things from the cliché-pile of this theme or
prompt, things you could have done but chose not to. This is the **single
most important section** — it shows taste by naming what was available and
not taken.

For LD59 Signal, refusals might include:
- Generic radio-operator with dials and codebook
- Waveform-match rhythm games
- "Tune to alien signals" narrative puzzles
- Default neon-on-black sci-fi aesthetic

### 5. Directions considered
3-4 named alternatives, each with:
- One-sentence mechanic / concept
- Why you considered it (what attracted you)
- **Why you rejected it** (the critical move)

This section is where your taste proves out. A rejection like "*too clever.
The impossibility becomes a puzzle rather than an experience*" is a real
argument. "*Didn't feel right*" is not.

### 6. The chosen direction
The one you're going with. Name it. Describe the mechanic in one
paragraph. Describe the first 10 seconds of play. This section should be
short because most of the thinking already happened above.

### 7. Why this one
One paragraph arguing from first principles: what criterion this passes
that others failed. Point back to your refusals and your considerations.

### 8. Technical approach
Medium. Tech stack. Core techniques. Performance target if applicable.
Keep to 5-10 lines; this is not where the art lives.

### 9. The risk
What could still kill this direction. Be honest — if the risk is "it might
be boring," say that. Then mitigation strategies.

### 10. Placard / closing line
One or two sentences that could accompany the finished piece — the voice
the work speaks in. Often the best lines in a Genuary manifesto.

## Voice rules

- **Declarative.** "I refused X" not "X was rejected." First person, present-
  imperfect.
- **Named.** Sources, prior work, other artists — by name.
- **Specific.** "warm sconce lighting" beats "pleasant atmosphere." "every
  7th letter encodes the hidden word" beats "steganographic puzzle."
- **Confident.** You made a choice. Don't hedge with "I thought maybe."
- **No hype.** "This is going to be AMAZING" dies on the page. The work
  argues for itself through specificity.

## Voice to follow

Write in Andrew's voice when authoring manifestos for his jam entries. Load
the `/zig-voice` skill for the authoritative style reference. Match rhythm,
sentence length variance, and the "no generic" bias.

## Shorter variants

- **Public devlog post on ldjam.com**: sections 1, 4 (terse, 3 bullets), 6,
  10. 200-400 words. A mini-manifesto that still shows taste.
- **Spec-preamble**: sections 1, 2, 6, 7 prepended to the spec in
  `specs/overview.md`. Justifies why this spec exists.
- **Commit message for a creative pivot**: section 6 summarized in one
  line + section 4 in the body as bullets. "why we rejected X" goes in
  the commit so future-you remembers.

## Examples

Read these for voice and structure:

- `coding-jams/genuary/2026/.claude/manifesto/day-31-terminus.md` —
  masterclass in the full structure; notice the "3 Directions Considered"
  section and the **What I Refused** list.
- `coding-jams/genuary/2026/.claude/manifesto/day-11-fixed-point.md` —
  shorter form, heavy on "The Journey" (four attempts tracked).

## Anti-patterns

- Starting with "Today I built X" — that's a changelog, not a manifesto
- Generic title like "Day 2" — name the piece, not the slot
- Skipping "What I refused" because "nothing obvious to reject" — that
  answer means you haven't brainstormed widely enough; go back
- Hedging every claim — pick a position and defend it; a manifesto with
  no edge is filler
- Starting a sentence with "Basically" or "Essentially" — cut. The
  manifesto voice is declarative.
