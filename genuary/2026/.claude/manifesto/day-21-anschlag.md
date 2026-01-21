# Day 21: ANSCHLAG

**Prompt:** "Bauhaus Poster."
**Credit:** Piero
**Date:** January 21, 2026

---

## The School, Not the Style

Everyone makes Bauhaus art the same way: primary colors, geometric shapes, clean typography, asymmetric composition. They copy the outputs without understanding the inputs.

The Bauhaus was a school. Walter Gropius founded it in 1919 to unite art and craft. Johannes Itten created the Vorkurs — a preliminary course that taught students to see. When Kandinsky arrived in 1922, he circulated a questionnaire asking students to fill in a triangle, square, and circle with red, yellow, and blue. He wanted to prove that certain colors "belong" to certain forms.

Yellow triangle. Red square. Blue circle.

This wasn't arbitrary. Kandinsky believed yellow was "eccentric and prominent" — it pushes outward like a triangle's points. Blue was "concentric and receding" — it withdraws like a circle curves inward. Red was stable, balanced, grounded — a square.

The poster I'm making isn't just Bauhaus-styled. It teaches you Bauhaus.

---

## Research That Shaped This

**Kandinsky's 1923 questionnaire** asked Bauhaus students to match shapes and colors. The results supported his theory, though modern psychology finds the correspondence isn't universal — it's culturally influenced, shaped by traffic signs and sun imagery.

**Josef Albers's Vorkurs** succeeded Itten's. Where Itten emphasized emotional expression through contrast, Albers focused on material economy — doing more with less, understanding the essence of each material.

**Herbert Bayer's typography** rejected historical ornament. His Universal Type (1926) was lowercase-only, seeking international clarity.

**Moholy-Nagy's "New Typography"** (1923) argued that typography should be a "simultaneous experience of vision and communication." The page layout communicates before the words are read.

The common thread: Bauhaus taught that design choices have consequences. Where you place an element changes what it says.

---

## What I Refused

From Days 7-20's exhausted patterns:
- No spirals, no radial patterns
- No dark backgrounds with glowing elements
- No breathing/pulsing as primary mechanic
- No particle dissolution
- No seeking/searching behaviors (Day 20 just did this)
- No fractals, no recursion (Day 19 did this)
- No single-element minimal pieces

From myself:
- No static poster generation (too easy)
- No random composition (antithetical to Bauhaus precision)
- No historical pastiche (copying Bayer's layouts pixel for pixel)

---

## Three Directions I Considered

**1. THE QUESTIONNAIRE**
Animate Kandinsky's color-form survey. Colored particles drift toward "matching" shapes — yellow to triangle, blue to circle, red to square. The theory demonstrated through physics.

*Rejected: Too didactic, too single-note. Demonstrates one principle, not the full design vocabulary.*

**2. GRID EMERGENCE**
A poster that assembles itself. Shapes appear randomly, then slide into grid-aligned positions, finding asymmetric balance.

*Rejected: The "emergent composition" could look like random settling. The teaching moment isn't clear enough.*

**3. FOUR POSTERS (chosen)**
Four distinct compositions using the same primitive elements. Each poster demonstrates a different principle. The elements transition between arrangements, showing that composition is a deliberate choice.

*Chosen: The museum needs multiple posters for the gallery walls. The transition animation IS the lesson — you watch the same shapes mean different things through rearrangement.*

---

## The Title

**ANSCHLAG**

German for "poster" but also "strike" (a piano note) or "attack" (military). The word captures the energy of Bauhaus design — not passive decoration but active communication. Elements striking the grid. Design as impact.

---

## My Artistic Identity

I'm obsessed with pedagogical animation — art that teaches through movement. The Bauhaus was fundamentally a school. Kandinsky's correspondences, Itten's contrasts, Albers's material studies — these were methods for training perception.

I don't want to make a Bauhaus poster. I want to make a Bauhaus LESSON that happens to be a poster.

---

## Technical Approach

**Medium:** p5.js with vector-like rendering (clean shapes, crisp edges)

**Four Compositions:**

1. **HIERARCHY** — Large blue circle dominates. Yellow triangle accents. Red rectangle grounds. Demonstrates visual weight through scale and color.

2. **BALANCE** — Asymmetric but stable. Elements distributed to create tension and resolution. Negative space as active participant.

3. **GRID** — Typography emerges. "BAUHAUS" or "1919" or "FORM" placed according to modular grid. Elements align to invisible structure.

4. **MEANING** — The same shapes arranged to suggest something figurative. An eye? A face? The abstraction becomes symbol.

**Transitions:**
Each element (circle, triangle, rectangles) animates smoothly from one position/scale to the next. The viewer watches composition happen. The 10-second hold time lets each poster register before transformation.

**Colors:**
- Yellow: #F7C325 (warm, aggressive)
- Red: #D62828 (stable, grounded)
- Blue: #1E3A8A (deep, receding)
- Background: #F5F0E1 (warm cream — Bauhaus printed on paper, not screens)

---

## Controls

| Control | Purpose |
|---------|---------|
| Composition | Manual selection of poster 1-4 |
| Auto-Cycle | Toggle automatic transitions |
| Transition Speed | How fast elements rearrange |
| Hold Duration | How long each composition displays |
| Show Grid | Reveal the underlying modular grid |
| Background | Toggle between cream and white |

---

## Museum Integration

**Display Type:** `framed` — multiple poster frames in the Poster Gallery

**Viewing Distance:** 2m — read the typography, see the composition

**Dimensions:** 1.2m x 1.6m (3:4 poster ratio)

**Animated:** Yes — continuous transitions between four compositions

**Suggested Zone:** "The Poster Gallery"

**Can Become Architecture:** Yes — the compositions could tile as wallpaper, or one poster per wall

**Placard:**
"Form follows function. Four compositions from the same shapes: circle, triangle, rectangle. Watch them rearrange. The yellow triangle is aggressive. The blue circle recedes. The red square grounds. Kandinsky's correspondence in motion. The Bauhaus was a school; this poster is a lesson."

---

## The Risk

The four compositions might feel like four separate pieces rather than one unified work. The transitions might confuse rather than teach.

**Mitigation:** The elements are continuous — the same circle, the same triangle, the same rectangles — through all four states. The transformation is the point. Each composition is a sentence; the sequence is the lesson.

---

## Social Post

```
Day 21: ANSCHLAG

"Bauhaus Poster." — @pifragile

Four posters. One set of shapes.

Circle. Triangle. Rectangle. Yellow. Red. Blue. Watch them find their places on the grid. Then watch them rearrange into something else entirely.

Kandinsky believed yellow is aggressive and blue recedes. He taught this at the Bauhaus in 1923. A century later, the lesson still holds: the same elements say different things depending on where you put them.

The Bauhaus was a school before it was a style. This poster is a lesson.

SVG precision. Compositional animation. 100 years of design principles.

#genuary #genuary2026 #genuary21 #creativecoding #bauhaus #generativeart #typography
```

---

## Sources

- [Josef Albers's Preliminary Course](https://bauhauskooperation.com/knowledge/the-bauhaus/training/preliminary-course/josef-alberss-preliminary-course)
- [Three Preliminary Courses: Itten, Moholy-Nagy, Albers](https://www.bauhaus-imaginista.org/articles/5176/three-preliminary-courses-itten-moholy-nagy-albers)
- [Kandinsky's Classes at Bauhaus](https://bauhauskooperation.com/knowledge/the-bauhaus/training/curriculum/classes-by-wassily-kandinsky/)
- [Herbert Bayer, the Practical Bauhausler](https://www.printmag.com/daily-heller/the-daily-heller-herbert-bayer-the-practical-bauhausler/)
- [Bauhaus Typography History](http://www.designhistory.org/Avant_Garde_pages/BauhausType.html)

---

*The poster strikes. The lesson lands.*
