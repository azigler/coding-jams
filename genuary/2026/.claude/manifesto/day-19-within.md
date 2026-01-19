# Day 19: WITHIN

**Prompt:** "16x16"
**Credit:** Jos Vromans
**Date:** January 19, 2026

---

## The Constraint as Infinity

16x16. Two hundred and fifty-six pixels.

The obvious interpretation: make pixel art. Draw something tiny and cute.

The subversion: 16x16 isn't small. It's infinite. A 16x16 heart where each pixel IS a 16x16 heart, recursively. Zoom out forever. The pattern contains itself contains itself contains itself.

---

## What I Researched

**Susan Kare** called working in 16x16 "puzzle-like" — the marriage of craft and metaphor. She made icons that felt complete despite their constraint.

**Jos Vromans** writes all his code from scratch. He explores simple systems that produce complex outputs. A recursive fractal is exactly this: one simple rule (each pixel contains the whole) producing infinite depth.

**Droste effect** — named after a Dutch cocoa brand whose packaging showed a woman holding a tray with the same packaging, infinitely. The visual of infinite recursion.

---

## What I Refused

From Days 7-18:
- Spirals, radial patterns, concentric circles
- Black backgrounds with glowing elements
- "Breathing" / "pulsing" as primary mechanic
- Particle dissolution
- Morbid themes (an early "CENSUS" concept where pixels were dying people)
- Static grids that just change color

My own refusals:
- Pixel art nostalgia (retro game aesthetic)
- A train window idea (too simple at 16x16 resolution)
- Anything that treats 16x16 as a limitation rather than an opportunity

---

## Three Directions I Considered

**1. CENSUS** — Each cell is a person. They age and die.

*Rejected: Morbid and visually bland. Just a grid changing colors.*

**2. PASSING** — A train window. The world scrolls by.

*Rejected: At 16x16, "a cow" is two pixels. Too simple to read.*

**3. WITHIN** — A fractal heart. 16x16 where each pixel IS a 16x16 heart, zooming out infinitely.

*Chosen: Turns the constraint into infinity. Visually striking. Hypnotic.*

---

## The Technical Challenge

The naive approach — recursive drawing where each heart pixel draws another heart — causes stack overflow. At depth 4, you're making 100^4 = 100 million draw calls.

**Solution: Pre-rendered buffers**

1. Create Level 0: A simple 16x16 heart (solid colors)
2. Create Level 1: A heart where each pixel is Level 0
3. Create Level 2: A heart where each pixel is Level 1
4. Create Level 3: A heart where each pixel is Level 2

Each buffer is created once at setup. During animation, we just draw the appropriate buffer based on zoom level — switching between buffers as patterns get smaller or larger.

---

## Technical Implementation

**Medium:** p5.js with createGraphics buffers

**Buffer creation:**
- 4 levels of pre-rendered fractal hearts (512x512 each)
- Level N contains Level N-1 in each heart pixel
- Created once at setup, reused every frame

**Zoom animation:**
- Exponential scale: `scale = (1/16)^zoomProgress`
- At zoomProgress=0: one heart fills the canvas
- At zoomProgress=1: 16x16 hearts fill the canvas
- Loops seamlessly

**Level-of-detail switching:**
- Large patterns (>400px): Use Level 3 (most detail)
- Medium patterns (>100px): Use Level 2
- Small patterns (>25px): Use Level 1
- Tiny patterns: Use Level 0 (solid colors)

---

## Controls

- **Zoom Speed:** How fast the infinite zoom progresses
- **Colors:** Red, Pink, Orange, Purple, Teal palettes
- **Manual Zoom:** Scrub through the zoom manually
- **Auto Zoom:** Toggle continuous animation

---

## The Title

**WITHIN**

- The pattern is within itself
- You're within the pattern
- There's always something within
- Worlds within worlds within worlds

---

## Emotional Target

The hypnotic pull of infinite recursion. The satisfaction of pattern recognition at every scale. The vertigo of realizing there's always another level.

Not awe exactly. More like the pleasant disorientation of a visual puzzle that never ends.

---

## Social Post

```
Day 19: WITHIN

"16x16" — @JosVromans

A 16x16 pixel heart. But zoom out. Each pixel IS a heart. Zoom out again. Each of those pixels IS a heart. Forever.

16x16 isn't small. It's infinite.

Susan Kare called working in 16x16 "puzzle-like." Here's the puzzle: how deep does the rabbit hole go?

p5.js. Pre-rendered fractal buffers. The Droste effect for pixel art.

#genuary #genuary2026 #genuary19 #creativecoding #generativeart #fractal #droste
```

---

## Sources

- [Smithsonian: Susan Kare's Icons](https://www.smithsonianmag.com/innovation/how-susan-kare-designed-user-friendly-icons-for-first-macintosh-180973286/)
- [Jos Vromans: About](https://www.josvromans.art/about/)
- [Droste Effect - Wikipedia](https://en.wikipedia.org/wiki/Droste_effect)

---

*Within within within within...*
