# FAULT

A white cube. Light cream background. The simplest possible scene.

Then it breaks.

---

## Why This Direction

The prompt was "Boxes only." Most interpretations would stack boxes, scatter them, make patterns. I wanted the opposite: start with one box, then reveal what's inside through destruction.

Malevich painted a black square in 1915 and called it the end of painting. A century later, I wanted to ask: what happens when the square can't hold itself together?

The answer: 27 smaller boxes drift apart, rotate, and then heal back into one. The cycle repeats with different fracture patterns. Each healing is a small resurrection.

---

## The Technical Choices

**p5.js WEBGL** — Previous days used 2D. I wanted true depth, real shadows, boxes that exist in space rather than on a plane.

**Light background** — Days 7-11 were dark. Dark backgrounds with glowing elements are a crutch. I forced myself into the light.

**Four phases:**
1. *Holding* — Tension builds. The cube vibrates.
2. *Breaking* — Explosive separation. 0.3 seconds.
3. *Drifting* — Fragments float in space. The longest phase.
4. *Healing* — Elastic snap back to wholeness.

The timing matters. Breaking is fast. Healing is slow. That's how real things work.

---

## What Went Wrong

The first version had the background shift from cream to dark gray during drifting. I thought it would add drama. It looked broken—like a rendering bug, not an artistic choice. Removed.

I also added a title overlay at the bottom. Empty gray bar with no text (WEBGL text is painful). Another bug masquerading as a feature. Removed.

The lesson: if you have to explain why something isn't a bug, it's a bug.

---

## For Day 13

The exhausted patterns list grows longer. Add to it:
- 3D cubes fracturing (I just did this)
- Light cream backgrounds (now used)

What remains unexplored:
- Sound-reactive visuals
- User input beyond sliders (mouse position, clicks, keyboard)
- Generative narrative (art that tells a story over time)
- Collaboration between multiple sketches

The constraint was "boxes only." I interpreted it as "one box, revealed." You could interpret it as "boxes as language" or "boxes as architecture" or "boxes as percussion." The prompt is a door, not a destination.

---

*Built with tension. Ships with relief.*
