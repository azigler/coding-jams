# Day 26: ZONING

**Prompt:** "Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again."
**Credit:** Piero
**Date:** January 26, 2026

---

## The Prompt

Piero's prompt sounds technical: recursive grids, subdivision, cells within cells. The obvious interpretation is Mondrian—split a rectangle, split the children, color the leaves. Every CS student has done this assignment.

But Piero isn't asking for an algorithm. He's asking for a response to recursion itself.

---

## Research

**Recursive subdivision of urban space and Zipf's law** — A paper showing that cities grow through recursive subdivision. A city is a collection of villages, each village a collection of neighborhoods, each neighborhood a collection of blocks. The distribution follows a power law: many small cells, few large ones. This isn't design; it's emergence.

**Michael Fogleman's Quadtree Art** — Using quadtrees to adaptively subdivide images based on variance. Areas of high detail get more subdivision. This is recursion with purpose—the grid responds to what it contains.

**Isometric city builders** — SimCity, Monument Valley, voxel art. The bird's-eye view that lets you see both the plan AND the height. Looking down at a model city. The god-view of urban planning.

**The insight:** Most recursive grid implementations are flat. But cities aren't flat—they grow UP as they subdivide. Dense areas have tall buildings. The recursion depth should become literal HEIGHT.

---

## Forbidden Patterns Acknowledged

From Days 7-25:
- Spirals of any kind
- Concentric circles, radial patterns
- Black backgrounds with glowing elements
- "Breathing/pulsing" as main mechanic
- Perlin noise flow fields
- Text on canvas
- Split-screen comparisons
- Fractals with zoom (Day 19)
- Particle dissolution (Day 13)
- Seeking behaviors (Day 20)
- Hatching (Day 22)
- Blend mode transparency (Day 23)
- Micro-imperfection grids (Day 24)
- Cursor-responsive creatures (Day 25)

My own refusals:
- Static Mondrian-style grids (too decorative)
- Uniform recursion (boring)
- The word "fractal" in the title

---

## My Artistic Identity for This Day

I am drawn to the violence of organization.

Every grid cell that splits is a boundary drawn, a space claimed, a potential foreclosed. Recursive subdivision looks orderly but feels relentless—the bureaucracy of geometry. I want to show not the grid, but the gridding.

The city didn't exist and then existed. The open field became zones became districts became blocks. Each line was drawn by someone. Each line is still there.

---

## Three Directions Considered

**1. FLAT ZONING**
A white canvas with colored cells based on density. Clean, minimal, architectural.

*Rejected: Too generic. Looks like every other Mondrian subdivision assignment.*

**2. ISOMETRIC CITY (chosen)**
Each cell rendered as a 3D isometric block. Recursion depth = building height. You're looking down at a city that builds itself. Dense areas become downtown towers. Open areas stay as low foundations.

*Chosen: Visually striking. The city metaphor becomes literal. Dramatic shadows and depth. Memorable.*

**3. CRACKING ICE / KINTSUGI**
Lines appear as organic cracks spreading through a surface, filled with gold. The violence of division made beautiful.

*Rejected: Beautiful but loses the urban/organizational connection.*

---

## The Title

**ZONING**

- Urban planning: zoning laws that divide space by use
- Mental states: "in the zone" or "zoning out"
- The bureaucratic act of claiming, categorizing, controlling

The title makes the metaphor explicit without being heavy-handed.

---

## Medium: Canvas 2D API

Not p5.js. Not WebGL. Raw Canvas 2D with isometric projection.

Why:
- Full control over draw order (painter's algorithm for isometric)
- Precise isometric math without 3D engine overhead
- Clean geometric shapes with sharp edges
- Performance for many animated blocks

---

## Technical Approach

**Isometric projection:**
- Classic 2:1 isometric (common in pixel art and city builders)
- Each block has three visible faces: top, left, right
- Consistent lighting: top brightest, left medium, right darkest
- Draw back-to-front for correct occlusion

**Data structure:** Array of cells, each with:
```
{
  x, y,           // grid position (not screen position)
  width, height,  // cell dimensions in grid units
  depth,          // recursion depth
  buildingHeight, // current animated height (grows over time)
  targetHeight,   // final height (based on depth)
  birthTime,      // for animation
  hue             // color variation
}
```

**Subdivision logic:**
- Start with one cell covering entire grid
- Each interval, pick a cell to subdivide (weighted by area)
- Split into 2-4 children (not always binary)
- Children start at height 0, grow upward over time
- Deeper recursion = taller target height

**Visual palette:**
- Warm concrete/terracotta tones (NOT primary Mondrian colors)
- Slight hue variation per block for visual interest
- Dark edges/outlines for definition
- Soft shadow beneath blocks (or ambient occlusion fake)
- Light warm background (sand, cream)

**Animation:**
- Blocks grow upward with easing when born
- One subdivision per 0.8-2 seconds (controllable)
- Continuous growth creates "city rising" effect
- Optional: camera slowly rotates around the grid

**Controls:**
- Growth speed
- Color palette (concrete / terracotta / cool glass / monochrome)
- Maximum recursion depth
- Block height multiplier
- Seed for reproducibility

---

## Emotional Target

The awe and unease of watching a city build itself.

Each subdivision is a new building rising. The skyline grows more complex. Downtown emerges where recursion runs deep. Suburbs stay low where space remains open.

There's something satisfying about watching it grow—and something unsettling about how it never stops. The city doesn't ask permission. It just builds.

---

## Museum Integration

**Display Type:** `architectural` / `sculpture`

This becomes a living diorama—a model city that builds itself.

**How it works:**
- **Floor option:** Looking down at a growing city beneath your feet. Buildings rise from the floor. You're a giant watching urban development.
- **Table option:** A central table/pedestal with the city growing on it. Visitors gather around like city planners.
- **Wall projection:** Isometric city on a large wall, buildings growing outward.

**Suggested Zone:** Recursion Room (central feature)

**Dimensions:** 2m x 2m minimum for table display, larger for floor

**Animated:** Yes—continuous growth. The city never stops building.

**Placard:**
*"Watch a city zone itself. Each subdivision creates a new building. Recursion depth becomes height—the deeper the division, the taller the tower. Downtown emerges where the algorithm runs deepest. After the recursive subdivision of urban space, which follows Zipf's law: many small lots, few large ones. The same pattern as real cities."*

---

## Risk/Challenge

- **Draw order complexity:** Isometric requires back-to-front sorting. With many blocks, this could get expensive.
- **Visual clutter:** Too many small blocks could become noise. Need to cap recursion depth.
- **Color harmony:** Warm palette needs careful tuning to avoid looking muddy.
- **Height scaling:** Need to find the right ratio between recursion depth and building height.

Mitigation: Start simple, tune parameters iteratively. The controls let viewers find settings that work.

---

## Social Post

```
Day 26: ZONING

"Recursive Grids." — @paboracle

Watch a city build itself.

Each subdivision creates a new building. Recursion depth becomes height. Downtown emerges where the algorithm runs deepest.

Isometric projection. Warm terracotta. The skyline rises one split at a time.

After the recursive subdivision of urban space—the same pattern that shapes real cities.

#genuary #genuary2026 #genuary26 #creativecoding #generativeart #isometric #recursion
```

---

## Sources

- [Recursive subdivision of urban space and Zipf's law](https://www.sciencedirect.com/science/article/abs/pii/S0378437113009941)
- [Michael Fogleman's Quadtree Art](https://www.michaelfogleman.com/static/quads/)
- [An Overview of Fractal Geometry Applied to Urban Planning](https://www.mdpi.com/2073-445X/11/4/475)

---

*The city doesn't ask permission. It just builds.*

