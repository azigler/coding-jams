# Day 27: SEEKING

**Prompt:** "Lifeform. A shape or structure that behaves as if it's alive or growing."
**Credit:** Manuel Larino
**Date:** January 27, 2026

---

## The Question

What makes something feel alive?

Not movement—particles move. Not complexity—fractals are complex. Not even growth—crystals grow.

The answer, I think, is *purpose without mind*. The uncanny sense that something is trying to achieve something, even though nothing is trying anything.

---

## Research That Shaped This

**Physarum polycephalum** is a slime mold that solves optimization problems. Put food sources on a map of Tokyo, release the slime, and watch it recreate the rail network—not because it's smart, but because it reinforces paths that work and abandons paths that don't. Researchers have used it to model the cosmic web holding the universe together.

The algorithm is absurdly simple: agents deposit chemical trails, sense nearby trails, turn toward higher concentrations. Life emerges from local rules.

**Karl Sims** evolved virtual creatures in the 1990s—not by designing them but by letting mutation and selection find forms that worked. His insight: the interesting part isn't the creature. It's the process of becoming.

**Coral morphogenesis** follows diffusion-limited aggregation. Growth happens fastest where resources flow freely. The branching structure encodes its entire growth history—every fork is a fossil of a past condition.

The common thread: life isn't shape. Life is *strategy enacted in material*.

---

## What I Refused

From 20 previous days:
- Spirals, radial patterns, concentric circles
- Dark backgrounds with floating glowing elements
- "Breathing" or "pulsing" as primary mechanic
- Perlin noise flow fields
- Particle dissolution (Day 13)
- Seeking behaviors by a single agent (Day 20)
- Cursor-responsive creatures (Day 25)
- Isometric subdivision (Day 26)

My own refusals:
- L-systems (too botanical, too predictable)
- Creatures with limbs (Day 25 did this)
- Evolution/genetic algorithms (Day 29's prompt)

---

## Three Directions I Considered

**1. MYCELIUM (chosen)**
A network of filaments growing through 3D space, seeking invisible nutrient sources. Each tip senses gradients, steers toward resources, forks when abundant, withers when trapped. The network learns the terrain.

**2. CORAL**
Diffusion-limited aggregation in 3D. Particles rain down; where they stick determines growth. Outer surfaces grow faster; inner volumes freeze. Geological time compressed.

**3. PROPAGULE**
A seed that germinates—roots down, shoots up. L-system rules with random variation. The drama of germination.

I chose MYCELIUM because network growth is visually distinct from everything before, and the distributed seeking creates the uncanny "purpose without mind" I'm after.

---

## The Title

**SEEKING**

One word. Active verb. What the network does. What we do watching it. What the growth tips are doing right now.

---

## My Artistic Identity

I'm drawn to the moment when pattern becomes purpose. A branching structure isn't alive because it branches—it's alive because each branch was a choice, a reaching toward something. The lifeform isn't what you see. It's the record of what it tried.

---

## Technical Approach

**Medium:** Three.js (WebGL 3D)

Why Three.js:
- True volumetric growth in 3D space
- Lighting reveals structure and depth
- Performance for many instanced tube segments
- Museum needs 3D for architectural integration

**Implementation:**
- Growth simulation with multiple expanding tips
- Each tip has position, direction, energy
- Tips sense invisible "nutrient" gradient fields
- Gradient toward nutrient sources causes turning
- Forks when energy exceeds threshold
- Tips die when energy depleted (dead ends)
- Successful paths thicken over time
- Instance rendering for tube segments

**Visual design:**
- Pale, organic colors (cream/bone with hints of warmth)
- Dark background (deep blue-black, like underwater or underground)
- Growth tips glow faintly (they're still deciding)
- Paths thicken with use (reinforcement)
- Dead ends fade to gray

**Controls:**
- Growth speed
- Fork probability
- Number of nutrient sources
- Gradient strength (how directional is growth)
- Tip glow intensity
- Seed for reproducibility

---

## Museum Integration

**Display Type:** `architectural`

Day 27 is destined for the Transparency Chamber walls (per museum-plan.md). The mycelium grows across glass panels. Visitors see each other through the network—the growth becomes the architecture.

**Viewing Distance:** 1-2m

**Dimensions:** Panel-sized (2m x 3m)

**Animated:** Yes—continuous growth

**Suggested Zone:** Transparency Chamber

**Can Become Architecture:** Yes—the network IS the wall texture

**Placard:**
"Watch it find its way. Ten thousand filaments sensing gradients, turning toward invisible resources, forking when conditions favor growth. No mind directs this network—only local rules, chemical traces, and the accumulated history of what worked. After Physarum polycephalum, the slime mold that solved the Tokyo rail system. The growth tips glow because they're still deciding."

---

## The Risk

The network might look like random spaghetti rather than purposeful growth.

**Mitigation:**
- Visible glowing tips (decision points)
- Path thickness reinforcement (success is visible)
- Dead ends visibly fade (failure is visible)
- Nutrient sources faintly visible (goal is visible)
- Growth speed slow enough to watch individual decisions

---

## Emotional Target

The uncanny recognition of purpose without mind.

You're watching something search even though nothing is searching. Each growth tip is making a decision—turn left? turn right? fork here?—and leaving behind a record of that choice. The accumulated network is ten thousand small decisions, none of them made by anyone.

This is what life looks like from the outside.

---

## Social Post

```
Day 27: SEEKING

"Lifeform." — @mlarino

No brain. No plan. Just rules.

Each filament senses chemical gradients and turns toward what it needs. When resources are abundant, it forks. When trapped, it withers. The network that emerges isn't designed—it's discovered.

After Physarum polycephalum, the slime mold that solved the Tokyo rail system by just... seeking.

The growth tips glow because they're still deciding.

Three.js. Distributed intelligence. Ten thousand small choices.

#genuary #genuary2026 #genuary27 #creativecoding #generativeart #artificiallife #webgl
```

---

## For Day 28

**Prompt:** "Skeusatisfying."

Day 28 is about skeuomorphism—design that mimics physical materials or objects. The "satisfying" part suggests ASMR-like appeal: the click of a button, the flip of a switch, the tactile pleasure of well-crafted UI.

**What I'd tell you:**

1. **Don't just make fake buttons.** Everyone will make toggle switches and clicking sounds. The satisfying part isn't the object—it's the *feedback*. The weight. The response.

2. **Physical simulation is underexplored.** Springs, magnets, inertia, friction. Make something that *feels* heavy or light. That overshoots and bounces back. Physics is satisfying.

3. **Sound is half the experience.** If skeuomorphism is about mimicking physical things, physical things make noise. Even silent pieces can imply sound through motion timing.

4. **Consider the museum.** Day 28 could be an interactive terminal—a control panel visitors can "use." Imagine standing at a pedestal and flipping switches that do nothing but feel *good*.

**What's now overused:**
- 3D network growth (I just did this)
- Instanced mesh rendering for organic structures
- Gradient-seeking behaviors

**What remains unexplored:**
- Haptic-feeling UI (springs, weight, resistance)
- Physical simulation for satisfaction rather than realism
- Sound design in generative art
- Interactive museum terminals

---

## Sources

- [Michael Fogleman: Physarum Simulation](https://www.michaelfogleman.com/projects/physarum/)
- [Generative Art and Biology: Creating Life Through Computation](https://www.moll.dev/projects/physarum/)
- [Karl Sims: Evolved Virtual Creatures](https://karlsims.com/evolved-virtual-creatures.html)
- [Morphogenesis of branching coral Madracis mirabilis](https://pmc.ncbi.nlm.nih.gov/articles/PMC1634949/)
- [Manuel Larino](https://mlarino.com/)

---

*It finds its way.*
