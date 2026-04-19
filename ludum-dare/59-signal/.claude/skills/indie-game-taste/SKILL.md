---
name: indie-game-taste
description: Filters for making an indie game jam entry that feels bespoke, not generic. Load before any brainstorming, design, visual, or scoping decision. Captures hard-won lessons from LD59 concept work and from watching Phase Chorus miss.
---

# Indie Game Taste

Filters to reject generic AI-slop output and converge on something that feels
specifically-made by a specific human over a specific weekend. Load this
BEFORE brainstorming, BEFORE picking visual direction, BEFORE locking scope.

This skill encodes taste learned the hard way on LD59. It supersedes default
instincts toward safe, known genres with "theme" spray-painted on them.

## Rule 0: The verb is the theme, or the theme is skin

If the player's primary verb has nothing to do with the theme, the theme is
wallpaper and the game will score poorly on Theme. Ask: **what would I do to
this concept if I swapped the theme?** If the game still works — the theme
is skin. Reject.

Valid test: "listen to radio signals" passes for Signal. "Move boxes around a
grid" does NOT pass just because the boxes emit waves.

## Rule 1: Player agency is the first filter, not the third

If the player taps a button and then watches a system sort itself out — that
is a simulation, not a game. Player agency means:
- Every action changes state in a way the player can READ
- The state change opens or closes options for the next action
- The system is NOT converging without them

**Phase Chorus failed this.** Kuramoto synchrony tends toward coherence on
its own; the player's tap is a small perturbation in a self-ordering system.
Observation dressed as gameplay. Do not mistake visible animation for
agency.

**Simple test:** if the player stopped playing mid-run, would the game still
reach its end state? If yes — it's not a game.

## Rule 2: Intrinsic to the medium, or it's a reskin

For each mechanic, ask: **could I rename the pieces to something unrelated
and have the same game?** If yes, the mechanic is not intrinsic to the theme;
you've found a generic puzzle-genre with a costume.

Examples from LD59 brainstorm:
- "Sympathetic cascade" — could rename resonators to colors and have Kami.
  Skinnable → reject as Signal-specific.
- "Polyvalent shape — one signal, many decoders" — you'd have to invent a
  new name for "message decoded differently by different readers" and
  you'd end up back at "signal." Intrinsic → keep.
- "Steganography — hide a message inside another message" — hiddenness is
  literally signal theory. Intrinsic → keep.

## Rule 3: I can picture myself playing it in 10 seconds, or it's not a game yet

If the concept can't be described as:
1. What you see on screen frame 1
2. What you do with your hands
3. What happens in response
4. Why you do it again

…then it's an idea, not a game. Sharpen it until it has those four parts, or
drop it. Abstract mechanics like "you compose a waveform" fail this until
you can say "you drag notes onto a staff and hear the chord."

## Rule 4: Reject the default-for-theme aesthetic

Every theme has an AI-slop default:
- Signal → radio dial + static + codebook
- Space → starfield + sci-fi console
- Depths → submarine + sonar + cave
- Signal (harder) → waveform oscilloscope + neon green

If your first visual sketch is the default, STOP. Sketch three non-default
frames before committing:
- What if it were hand-drawn ink on paper?
- What if it were set in 1970s / 1880s / a specific non-tech era?
- What if the setting were domestic (a kitchen, a bedroom)?
- What if the whole game were text-only?
- What if it were entirely black except for one color?

A bespoke visual identity is a taste problem, not an engineering problem.
Put the 80% of taste work into the art direction, not the engine.

## Rule 5: The 30-second bet

Jam judges decide within 30 seconds whether to keep playing. The first 30
seconds must include:
- A visual that doesn't look like every other jam entry
- A piece of text/copy/dialogue with a specific voice (not "your adventure
  begins…")
- The player's first successful action, where they feel: *wait, what was
  that — I want to do it again*

Design the 30-second experience deliberately. Scripting it on paper before
code beats discovering it in production.

## Rule 6: One mechanic, deep. Not three mechanics, shallow.

Baba Is You has ONE rule (words on the floor are the game's rules). Stephen's
Sausage Roll has ONE rule (sausages roll and cook on tile). Patrick's
Parabox has ONE rule (boxes contain themselves).

If your concept has two "because X AND Y" systems, you are authoring a
Unity asset flip, not a jam. Pick the deepest single idea and mine it for
5-10 levels.

## Rule 7: Hand-design over procedural

In 48-72 hours, hand-crafted content outperforms procedural content on taste
every time. Procedural tends to AI-slop. Five hand-designed levels that each
say something specific >> 50 procgen levels that feel anonymous.

## Rule 8: Copy should have a voice

A jam game's title-screen text, level names, post-level message, and "you
win" screen together form a MINI ESSAY. Make every line specific. "Level 1:
Tutorial" is dead. "Level 1: The First Whisper" is alive.

Follow `/zig-voice` for tone when writing for an Andrew-solo jam entry.

## Rule 9: Audio is taste, not polish

A bespoke audio identity — even a tiny one — moves a jam game from "nice
student project" to "specific artist's work." Do not defer audio to "if
there's time." Allocate ~15% of remaining budget to it.

For Signal: the audio CAN BE the game (even if the mechanic isn't sound).
Think: intermittent static, a tuning tone, a morse tick, a typewriter clack,
the hiss of a vinyl groove. One or two sounds, carefully placed, beat a
library.

## Rule 10: The ending is a deliverable

Jam games without endings feel like prototypes and score lower on Mood. Your
game must end. The ending doesn't have to be long — it can be ten seconds
of silence after the last puzzle, a single line of text, a fade. But there
must be a *thing that happens* that signals "this was the whole thing."

## The taste loop

When brainstorming a new direction, run it through every rule above. If it
fails any of 0, 1, 2, 3 — drop it and reach for another. If it passes 0–3
but fails 6 — scope it down. Only lock when it passes all ten.

## Anti-patterns to name out loud

If you find yourself reaching for any of these, stop and reach further:

- **"Radio operator with codebook"** — done in LD57+58+59 multiple times
- **"Top-down spaceship with frequencies"** — default sci-fi
- **"Waveform match game"** — rhythm-clone with theme paint
- **"Sokoban but signals"** — grid-puzzle with word-swap
- **"Platformer where you collect X signals"** — genre flex, no design
