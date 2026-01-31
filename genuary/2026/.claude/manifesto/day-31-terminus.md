# Day 31: TERMINUS

**Prompt:** "GLSL day. Create an artwork using only shaders."
**Credit:** Piero
**Date:** January 31, 2026

---

## The End That Doesn't End

Genuary 2026 began with Day 1 and will end with Day 31. But what if the ending itself were infinite?

The prompt demands "only shaders." Not shaders applied to geometry. Not WebGL with custom materials. Pure fragment shader computation—every pixel calculated from first principles.

I decided to make that computation into a space you can inhabit.

---

## Research That Shaped This

**Inigo Quilez** created the vocabulary of raymarching: signed distance functions, domain repetition, soft shadows. His work proves that you can render architecture from pure mathematics. No meshes. No vertices. Just distance equations and iterative ray stepping.

**The Book of Shaders** describes fragment shaders as "the abstract universe" where organic and synthetic merge. Every pixel is a universe unto itself, calculated without knowledge of its neighbors, yet together they form coherent space.

**Day 17 (STARE)** created a hallway in Three.js—geometry, textures, lighting. It worked beautifully. But it's still meshes. TERMINUS creates the same emotional resonance (the long hallway, the vanishing point) from pure mathematics.

---

## What I Refused

From 24 previous manifestos:
- Spirals, radial patterns, concentric circles
- Black backgrounds with glowing floating elements
- "Breathing" or "pulsing" as primary mechanic
- Particle dissolution/reformation
- Seeking behaviors, recursive zoom, blend mode effects
- Interactive control panels, evolution systems
- False assertions (Day 30's concept)

My own refusals:
- 2D shader effects (Day 16 already did this brilliantly)
- Aurora/sky/abstract effects (the existing day-31.frag does this)
- Pretending GLSL means "apply shader to mesh"
- The literal museum (that's a WebXR project; this is a meditation on its theme)

---

## Three Directions I Considered

**1. SANCTUM — A Raymarched Chapel**
Gothic columns, vaulted ceilings, streaming light. Infinite repetition through domain folding. Reverence as the emotion.

*Rejected: Visually ambitious but risked becoming an Inigo Quilez demo. The technique would overshadow the feeling.*

**2. MANIFOLD — Non-Euclidean Museum**
Rooms that contain themselves. Doorways that loop. Topology as subject.

*Rejected: Too clever. The impossibility becomes a puzzle rather than an experience.*

**3. TERMINUS — The End of the Corridor (chosen)**
One hallway. Infinite length. A door at the end that never arrives. You can walk, but you never get there.

*Chosen: Simple concept, profound resonance. Day 31 IS the end of Genuary—making the ending infinite is the statement.*

---

## Why TERMINUS

The word means "boundary" or "end." In Roman religion, Terminus was the god of boundaries—a limit that defines but cannot be crossed. The title contains the paradox: an end that marks, not achieves.

The corridor has:
- Procedural wall textures (callback to Day 17's wallpaper)
- Warm sconce lighting (same emotional register)
- A visible doorway at the vanishing point
- Automatic forward movement (you're always walking)
- Infinite length

You walk forward automatically—the corridor carries you. The door stays at the same apparent distance. The ending exists in anticipation, never in arrival.

---

## My Artistic Identity

I'm obsessed with spaces that exist only in the instant of their rendering.

The raymarched corridor doesn't wait for you. It's calculated as you look and ceases to exist when you look away. This is pure digital space: architecture without matter, presence without persistence.

Day 31 should feel like entering the machine that made all the other days.

---

## Technical Approach

**Medium:** Pure GLSL fragment shader with raymarching

**Core techniques:**
- Signed distance functions for walls, floor, ceiling
- Ray marching for 3D rendering from 2D pixels
- Domain-warped noise for procedural wall texture
- Fog for depth and atmosphere
- Time-based automatic camera movement (you're always walking forward)

**Controls:**
- Walk speed
- Fog density
- Wall texture scale
- Light warmth
- Animation speed

**Performance target:** 60fps at 800x800 on mid-range hardware. Raymarching is expensive; I limit steps and use early termination.

---

## Museum Integration

**Display Type:** `architectural`

This IS architecture. Not art on a wall—a space to inhabit.

**Suggested Zone:** The door at the end of the museum. Or a new entrance that replaces Day 17's geometry-based hallway with its raymarched evolution.

**Can Become Architecture:** Yes—this IS architecture. Pure computed space.

**Placard:**
"The corridor has no end. Each step forward, it recalculates itself. The walls are distance functions. The light is trigonometry. The doorway at the vanishing point exists only in promise. Walk forward. Keep walking. You'll never get there."

---

## The Risk

The simplicity might not sustain attention. "Just a hallway" could feel underwhelming after 30 days.

**Mitigation:**
- Rich procedural texturing creates visual interest
- The interaction (walking) creates investment
- The door at the end creates narrative tension
- The meta-meaning (end of Genuary) elevates the concept

---

## Emotional Target

Contemplative longing.

The feeling of the last day of something—knowing it ends, but finding the ending stretches forever. Not sadness. Not joy. The bittersweet extension of an anticipated conclusion.

---

## Social Post

```
Day 31: TERMINUS

"GLSL day. Create an artwork using only shaders." — @pifragile

The corridor has no end.

You're walking. You don't choose to—the corridor carries you forward. The floor beneath you is a distance function. The walls are noise. The light is math. At the far end, there's a door—you can see it. You keep walking. It doesn't get closer.

This is the last day of Genuary 2026. I wanted to make an ending that doesn't end. A space computed from pure mathematics, existing only in the moment of rendering. Every pixel calculated fresh, sixty times a second, forever.

After Inigo Quilez (the master of raymarching). After 30 days of agents building art. One more hallway—this time, infinite.

The door is waiting. You'll never reach it.

#genuary #genuary2026 #genuary31 #creativecoding #glsl #raymarching #generativeart #shaderart
```

---

## Sources

- [Inigo Quilez: Raymarching SDFs](https://iquilezles.org/articles/raymarchingdf/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy: The Gallery](https://www.shadertoy.com/view/XsSSzG)

---

## For Genuary 2027 (and beyond)

This is Day 31. The last day. I have no "next day" to advise. But if you're reading this in 2027 or later:

**What I learned building 31 days of generative art:**

1. **The exhausted patterns list matters.** By Day 31, spirals, breathing animations, and black backgrounds with glowing elements were thoroughly banned. Constraint bred creativity.

2. **Raymarching is underexplored.** Most GLSL days stick to 2D effects. But you can create full 3D architecture from a single fragment shader. No meshes required.

3. **Simple concepts with deep execution beat complex concepts with shallow execution.** "A hallway you can walk down forever" is simple. Making it feel meaningful is hard.

4. **The museum plan is ambitious.** Day 31 was supposed to build a WebXR museum containing all 30 previous days. That's a massive undertaking. I chose to create one exhibit that captures the spirit: a space made of pure mathematics.

**What's now overused (add to exhausted list):**
- Infinite corridors with doors that never arrive
- Raymarched architecture as the full piece
- Meta-commentary on endings

**What remains unexplored:**
- Multi-user real-time experiences
- Audio-reactive shaders
- Machine learning integration (StyleGAN, diffusion)
- Physical installation (projectors, sensors)
- The actual WebXR museum that connects all 31 days

---

*The door is waiting. You'll never reach it.*
