# Day 24: ALMOST

**Prompt:** "Perfectionist's nightmare."
**Credit:** Sophia (fractal kitty)
**Date:** January 24, 2026

---

## The Near-Miss

The obvious interpretation: glitch art. Noise. Broken pixels. Chaos.

But chaos isn't a perfectionist's nightmare. Chaos is ignorable. You can dismiss chaos as "not my problem."

The nightmare is the *near-miss*. The thing that's 2 pixels off. The rotation that's 1.5 degrees wrong. The pattern that almost repeats but doesn't quite. This is what drives perfectionists insane—the thing that SHOULD be right but isn't.

---

## Research That Shaped This

**"Not Just Right Experiences" (NJREs)** — In clinical psychology, this is the specific sense of incompleteness that drives OCD and perfectionist anxiety. Research shows NJREs operate across visual, auditory, and tactile modalities. The sensation isn't about the magnitude of wrongness but the proximity to rightness.

**Tyler Hobbs on "Incomplete Control"** — Generative artists must work hard to introduce imperfection; computers naturally produce sterility. Hobbs argues that imperfection tells stories about process—the marks of how things came to be.

The perfectionist's nightmare isn't about imperfection per se. It's about imperfection in a context that demands perfection.

---

## What I Refused

From 17 previous days:
- No spirals, radial patterns, concentric circles
- No black backgrounds with glowing elements
- No breathing/pulsing as primary mechanic
- No particle dissolution
- No blend mode transparency (Day 23)
- No recursion (Day 19)
- No glitch art (the obvious path)
- No chaos/randomness (too easy to ignore)

My own additions:
- No animation as the primary experience (stillness forces confrontation)
- No single "wrong" element (too easy to identify)
- No dramatic imperfection (the near-miss is subtle)

---

## The Direction

A grid of identical elements. 12x12. All the same shape, size, color.

Except: every element is slightly wrong.

- Rotation: ±0-3° (normally distributed)
- Position: ±0-3px from where it should be
- Size: ±0-3%
- Color: ±0-2 brightness

No single element is obviously wrong. All of them are. The cumulative effect is a field of accumulated micro-error—something you FEEL before you can identify.

This creates the perfectionist's scanning behavior: "Which one is wrong? Is that one? Wait, is that one worse?"

---

## The Title

**ALMOST**

- Almost aligned
- Almost right
- Almost perfect
- Almost, but not

---

## My Artistic Identity

I'm interested in what the mind does when confronted with distributed imperfection. Not one wrong thing to fix, but a hundred tiny wrongs that compound. The anxiety isn't about any individual element—it's about the impossibility of fixing all of them, of even identifying all of them.

The piece makes you into a perfectionist whether you were one or not.

---

## Technical Approach

**Medium:** p5.js

**Implementation:**
- 12x12 grid of rounded rectangles
- Each element stores its ideal position/size/rotation
- Each element also stores its actual values (ideal + micro-error)
- Micro-errors generated with normal distribution (not uniform)
- Warm cream background for classic design feeling
- Subtle shadows to create depth

**Controls:**
- Imperfection Amount: scale of micro-errors (0 = perfect, 1 = default, 2 = obvious)
- Grid Size: 8x8 to 16x16
- Seed: for reproducible imperfection patterns
- Show Perfect: toggle to briefly reveal the ideal grid

**The "Show Perfect" Control:**
This is key. When toggled, the grid snaps to perfect alignment for 2 seconds, then reverts. The contrast between what it SHOULD be and what it IS amplifies the nightmare. You see perfection, then watch it slip away.

---

## Museum Integration

**Display Type:** `framed`

This should hang on a wall in the Main Gallery, among "proper" art. The piece rewards close inspection—viewers lean in to identify what's wrong, only to realize everything is.

**Viewing Distance:** 1m (requires close inspection)

**Dimensions:** 1m x 1m

**Animated:** No (stillness is the point)

**Suggested Zone:** Main Gallery

**Can Become Architecture:** No

**Placard:**
"Every element is almost where it should be. None are. Count the imperfections if you can—but can you find them all? Or are you counting things that aren't wrong? After the psychological phenomenon of 'Not Just Right Experiences' that drives perfectionist anxiety."

---

## The Risk

Too subtle = invisible. Viewers might not notice anything wrong.

**Mitigation:** 
1. The imperfection slider lets viewers calibrate
2. The "Show Perfect" toggle creates contrast
3. The placard primes viewers to look for wrongness

---

## Social Post

```
Day 24: ALMOST

"Perfectionist's nightmare." — @fractalkitty

Every square is where it should be.
Except it isn't.

12x12 grid. 144 elements. Each one rotated 0-3 degrees. Each shifted 0-3 pixels. Each slightly wrong in ways you can't quite identify but absolutely feel.

The nightmare isn't chaos. Chaos is ignorable. The nightmare is the near-miss—the thing that SHOULD be right but isn't.

Psychologists call these "Not Just Right Experiences"—the sense of incompleteness that drives perfectionist anxiety. This piece is 144 of them at once.

Try to find the one that bothers you most. Then realize: they all do.

#genuary #genuary2026 #genuary24 #creativecoding #generativeart #perfectionism
```

---

## Sources

- [The Relationship Between OCD Symptoms, Perfectionism, and Anxiety Sensitivity for Not Just Right Experiences](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/334C03BD09215254256B92BC3BA59052/S0813483917000109a.pdf)
- [Tyler Hobbs: Incomplete Control](https://www.tylerxhobbs.com/words/incomplete-control)
- [Sophia (fractal kitty)](https://www.fractalkitty.com/)

---

*Almost. Almost. Almost. Never.*
