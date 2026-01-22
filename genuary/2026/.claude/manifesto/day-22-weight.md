# Day 22: WEIGHT

**Prompt:** "Pen plotter ready."
**Credit:** Sophia (fractal kitty)
**Date:** January 22, 2026

---

## The Medium Is the Constraint

Pen plotters can't fill. They draw lines. One at a time.

This isn't a limitation—it's a revelation. When you can't fill, you hatch. When you hatch, you see the labor. Every stroke is visible. The form isn't given; it's accumulated.

Vera Molnár understood this. In 1968 she taught herself FORTRAN at the Sorbonne, feeding algorithms to a plotter that drew what she imagined. Her "Interruptions" series—grids of parallel lines, randomly rotated, with deliberate gaps—showed that imperfection is what makes algorithmic art human. The gaps are the subject.

I'm not making gaps. I'm making density.

---

## What I Researched

**Vera Molnár's "machine imaginaire":** Before she had a computer, she pretended to be one. She followed rules mechanically to see what the rules produced. The plotter was the realization of what she'd been imagining.

**Hatching as rendering:** Dürer, Rembrandt, Picasso—hatching predates plotters by centuries. But hand hatching is gestural; plotter hatching is systematic. The machine version reveals the algorithm.

**Genuary's plotter guide:** Lines only. Minimize pen lifts. No fills. Export SVG.

---

## What I Refused

From Days 7-21:
- Spirals (exhausted)
- Breathing/pulsing (exhausted)
- Black backgrounds with glowing elements (exhausted)
- Particle systems (exhausted)
- Seeking behaviors (Day 20 just did this)
- Fractals/recursion (Day 19)
- Bauhaus compositions (Day 21)

From plotter clichés:
- Generative spirals (every plotter tutorial starts here)
- Flow fields (Tyler Hobbs's territory)
- Text rendering (Day 11 was text-as-code)
- Geometric tiling (too easy, no emotion)

---

## Three Directions I Considered

**1. INTERRUPTIONS:** Homage to Molnár—grid of rotated lines with gaps. The animation shows the grid constructing itself.

*Rejected: Too direct a copy. Molnár did it perfectly already.*

**2. CONTOURS:** Topographic hatching. Contour lines where each "elevation" is drawn as parallel strokes.

*Rejected: Visually interesting but conceptually thin. "Plotter draws a map" isn't a statement.*

**3. WEIGHT:** A form with no outline, only hatching. Density varies to create apparent grayscale. The shape emerges from accumulation.

*Chosen: The form IS the hatching. Not hatching-inside-a-shape but shape-from-hatching. The distinction matters.*

---

## The Title

**WEIGHT**

- Visual weight: darker = denser = heavier
- Physical weight: the form suggests mass, substance
- Stroke weight: pen pressure on paper
- Emotional weight: presence, gravitas

The hatching creates weight. Without it, there's nothing.

---

## My Artistic Identity for This Day

I am interested in what hatching reveals that fills conceal. A filled shape is complete—done, closed. A hatched shape is still being drawn. You can see the labor. You can count the strokes.

The plotter doesn't hide its work; it accumulates it in public.

---

## Technical Approach

**Medium:** Pure SVG generation (no p5.js, no canvas)

**Algorithm:**
1. Define a shape (ellipse, rounded form) mathematically
2. Generate parallel scan lines across the canvas
3. Where scan lines intersect the shape, draw strokes
4. Stroke density varies with a "grayscale" function (distance from center, noise, gradient)
5. Animate by revealing strokes sequentially
6. Export the complete SVG for actual plotting

**Controls:**
- Shape: different base forms
- Density range: min/max stroke spacing
- Angle: hatching direction
- Randomness: jitter in stroke positions
- Animation speed: how fast strokes appear
- Export: download SVG button

**Why SVG directly:**
- Native plotter format
- No translation loss
- Can render in browser AND send to AxiDraw
- The output is genuinely plotter-ready, not a simulation

---

## Museum Integration

**Display Type:** `framed`
**Viewing Distance:** 1.5m
**Dimensions:** 0.8m x 0.8m
**Animated:** Yes (in browser), No (final export)
**Suggested Zone:** Poster Gallery
**Can Become Architecture:** Yes—hatching pattern could tile as wall texture

**Placard:**
"The plotter draws lines. It cannot fill. What you see is thousands of parallel strokes, closer where dark, farther where light. The shape has no outline—only the accumulated labor of a machine pretending to be a hand. After Vera Molnár, who taught herself FORTRAN in 1968 to make a plotter draw what she imagined."

---

## The Risk

The adaptive hatching might look like a rendering technique rather than an artistic choice. "Oh, it's just halftoning with lines" is the dismissive reading.

**Mitigation:** The shape matters. I'll choose a form that resonates—something elemental. A stone. A drop. Something that wants to be held. The form's emotional register elevates the technique from demonstration to statement.

---

## Social Post

```
Day 22: WEIGHT

"Pen plotter ready." — @fractalkitty

No outline. No fill. Only strokes.

Thousands of parallel lines, closer where the form is dark, farther where it's light. The shape emerges from accumulation—you can count the strokes if you're patient enough.

After Vera Molnár, who taught herself FORTRAN in 1968 to make a plotter draw what she imagined. She called the deliberate imperfections "interruptions." Mine are called hatching.

This isn't a simulation of plotter art. Export the SVG, send it to an AxiDraw, and watch it draw.

#genuary #genuary2026 #genuary22 #creativecoding #penplotter #generativeart #svg
```

---

## Sources

- [Vera Molnár: The Grande Dame of Generative Art (Sotheby's)](https://www.sothebys.com/en/articles/vera-molnar-the-grande-dame-of-generative-art)
- [The Power of the Plotter (Right Click Save)](https://www.rightclicksave.com/article/the-power-of-the-plotter-generative-art-aleksandra-jovanic-julien-gachadoat-feral-file-graph-interview)
- [Genuary Plotter Guide](https://genuary.art/plotter-ready)

---

*The shape has no edge. Only strokes, accumulating.*
