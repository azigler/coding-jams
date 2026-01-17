# Day 17: STARE

**Prompt:** "Wallpaper group."
**Credit:** Ivan Dianov
**Date:** January 17, 2026

---

## The Problem With the Obvious

Everyone will make a tiling generator. A head-on view of one of the 17 wallpaper groups, maybe with some animation. Mathematical. Clean. Forgettable.

But nobody *looks* at wallpaper that way. You don't stand square to a wall examining the repeat. You glimpse wallpaper from bed. You see it in peripheral vision at 3am walking to the bathroom. You notice it when you're low to the ground—a child, or someone who fell asleep on the couch.

The prompt is "wallpaper group." The answer isn't the mathematics. It's the *experience* of wallpaper.

---

## The Scene

You're low to the floor. Maybe you're a child who got out of bed. Maybe you fell asleep somewhere you shouldn't have and woke in the dark. You're looking down a long hallway in the middle of the night.

It's dark, but not pitch black. Warm pools of light from wall sconces illuminate sections of the walls. The wallpaper pattern emerges from shadow, visible in patches, then recedes into darkness again. The pattern repeats—you can see it echoing down the corridor, getting smaller with perspective, disappearing into the far end.

The hallway is quiet. Nothing moves. You're just... looking.

---

## Why This Works

**The wallpaper group mathematics are present:** The walls are tiled with a proper symmetry group (p4m or cmm—something with clear geometric repetition that reads at a distance).

**But the subject is memory:** That specific childhood feeling of nighttime hallways. The vulnerability of being small. The way familiar spaces become strange in darkness. The wallpaper you've seen a thousand times, suddenly visible.

**The perspective is the concept:** Low camera, looking up slightly. The kind of view you have when you're not standing like an adult. This changes everything about how the pattern reads—foreshortened, receding, partially obscured.

---

## Research That Shaped This

**William Morris** wrote about masking the construction of patterns to create "satisfying mystery." But he was talking about daytime, about decoration. At night, in partial light, that mystery becomes something else—not satisfying, but *present*. The pattern asserts itself.

**The 17 wallpaper groups** are a mathematical certainty (Fedorov, 1891). But their emotional reality is domestic. They live in hallways and bedrooms, not textbooks.

**Childhood perception:** Research on environmental psychology shows that children experience architectural spaces differently—lower vantage points, different proportions, heightened awareness of lighting conditions. A hallway that's mundane to an adult can feel endless to a child.

---

## What I Refused

From Days 7-16:
- Spirals, radial patterns, concentric circles
- Black backgrounds with floating elements
- "Breathing" or "pulsing" as primary mechanic
- Particle dissolution/reformation
- Head-on abstract visualizations
- The word "meditation"

New refusals for Day 17:
- **Glowing anything** (no bloom, no neon, no particle glow—this has been overused)
- Head-on tiling generators
- Clinical/mathematical presentations
- Treating wallpaper as the whole subject rather than context

---

## Technical Implementation

**Medium:** Three.js

Why Three.js:
- Proper 3D perspective (foreshortening, depth)
- Real lighting (point lights for sconces, falloff, shadows)
- Texture mapping for wallpaper on walls
- Camera positioning at unusual angles
- First proper 3D scene in this Genuary (Day 12 was WEBGL but still a single object)

**Scene construction:**
- Long rectangular hallway (narrow, tall ceiling for that "endless" feeling)
- Floor (dark wood or carpet)
- Walls with wallpaper texture (procedurally generated or pre-made pattern)
- 2-3 wall sconces with warm point lights
- Camera at ~0.3m height, looking down the hall
- Subtle depth fog for atmosphere

**Wallpaper pattern:**
- p4m (square lattice with diagonal mirrors) or cmm (rectangular with glide reflections)
- Muted colors—this isn't bright daytime. Creams, dusty blues, faded greens.
- Generated as a texture, tiled on the wall geometry

**Lighting:**
- Warm point lights (2700K color temperature)
- Soft falloff so the pattern fades into darkness between lights
- No harsh shadows—this is gentle, sleepy lighting
- Slight ambient so you can see the far end of the hall

---

## Controls

| Control | Purpose |
|---------|---------|
| Pattern | Switch between wallpaper group variations |
| Light Warmth | Color temperature of sconces |
| Hallway Length | How far the corridor extends |
| Camera Height | Adjustable perspective (child to adult) |
| Ambient Light | How much you can see in the shadows |
| Time of Night | Subtle blue shift for deeper night |

---

## The Title

**STARE**

Still works. You're staring down a hallway. The hallway stares back.

---

## Emotional Target

That specific 3am feeling. The house is quiet. Everyone else is asleep. You're somewhere you're not usually at this hour, seeing familiar things made strange by darkness and angle. The wallpaper you've never noticed is suddenly the only thing to look at.

Not fear. Not wonder. Just... presence. The peculiar alertness of being awake when you shouldn't be.

---

## Social Post

```
Day 17: STARE

"Wallpaper group." — @IvanDianov

3am. You're low to the floor—maybe you fell asleep on the couch, maybe you're six years old and got out of bed. You're looking down the hallway.

Wall sconces cast warm pools of light. Between them, darkness. The wallpaper emerges and recedes—the same pattern repeating into the distance, getting smaller, disappearing.

There are exactly 17 ways to tile a plane. This is one of them. But the mathematics aren't the point. The point is that feeling of being small and awake in a sleeping house, noticing the walls for the first time.

Three.js. Perspective. 2700K warmth.

#genuary #genuary2026 #genuary17 #creativecoding #threejs #generativeart #wallpapergroup
```

---

## The Risk

The scene might not read as "wallpaper group"—it could feel like a 3D rendering exercise.

Mitigation: Make the wallpaper pattern clearly geometric and repeating. Include controls to switch patterns. The prompt connection should be clear even if the execution is unconventional.

---

## Sources

- [William Morris and wallpaper design - V&A](https://www.vam.ac.uk/articles/william-morris-and-wallpaper-design)
- [Wallpaper group - Wikipedia](https://en.wikipedia.org/wiki/Wallpaper_group)
- [Environmental psychology and childhood spatial perception](https://www.sciencedirect.com/topics/psychology/environmental-psychology)

---

*The hallway waits.*
