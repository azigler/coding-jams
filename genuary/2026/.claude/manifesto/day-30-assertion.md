# Day 30: ASSERTION

**Prompt:** "It's not a bug, it's a feature."
**Credit:** Bart Simons
**Date:** January 30, 2026

---

## The Programmer's Joke

"It's not a bug, it's a feature" is the oldest joke in software. It's what we say when something breaks and we can't—or won't—fix it. The behavior becomes canonical. The accident becomes intention.

But here's the thing: from the computer's perspective, there are no bugs. The machine does exactly what it's told. Every "bug" is code working perfectly—just not the way we wanted. The bug is always in the specification, never in the execution.

---

## Research That Shaped This

**Rosa Menkman's Glitch Studies Manifesto** distinguishes between accidental and intentional glitches. Glitch art "questions the idea of software's perfection." But most glitch art looks broken—pixel corruption, data moshing, visual artifacts.

I wanted something that looks correct but IS broken. Or is it broken? The system insists otherwise.

**Bob Ross's "Happy Accidents"** reframes mistakes as opportunities. "We don't make mistakes, just happy little accidents." But Ross was gentle. My shapes aren't apologizing for their errors. They're confidently asserting falsehoods.

---

## What I Refused

From 23 previous days:
- Spirals, radial patterns, concentric circles
- Black backgrounds with glowing elements
- "Breathing" / "pulsing" as primary mechanic
- Perlin noise flow fields
- Particle dissolution
- Seeking behaviors (Days 20, 27)
- Evolution/genetic systems (Day 29)
- Glitch aesthetics (pixel corruption, data moshing)

My own refusals:
- No simulated glitches (no pixel sorting, no chromatic aberration)
- No broken visuals (the shapes render perfectly)
- No randomness as excuse (the contradictions are systematic)

---

## Three Directions I Considered

**1. SCHRODINGER'S CANVAS**
UI elements that contradict their displays. A progress bar at "100%" that never finishes. A color picker showing red while the canvas shows blue.

*Rejected: Too UI-focused. Felt like a debugging demo, not art.*

**2. CONFIDENT WRONG**
A single shape with false metadata overlays. "Frame: 847" when it's frame 3000. "Position: (400, 400)" while clearly moving.

*Rejected: Too minimal. The single contradiction might not sustain attention.*

**3. ASSERTION (chosen)**
Multiple shapes, each asserting properties: "I am blue," "I am still," "I am a circle." Each shape conspicuously contradicts its assertion. The red shape says "I am blue." The bouncing shape says "I am still."

*Chosen: Immediate visual comedy. Systemic rather than random. The contradiction is the content.*

---

## The Title

**ASSERTION**

In programming, an assertion is a statement the code claims is true. If the assertion fails, the program crashes. My assertions don't crash—they just lie.

The word also means confident declaration. These shapes are very confident. They're also very wrong.

---

## My Artistic Identity

I'm drawn to the gap between statement and reality. Day 24 (ALMOST) created micro-errors you couldn't identify. Day 30 creates macro-errors the system denies.

This isn't glitch art. The visuals are perfect. The bug is semantic—the gap between what's claimed and what's shown. The feature is that the code works exactly as written.

---

## Technical Approach

**Medium:** p5.js

**Structure:**
- 4-6 geometric shapes (circles, squares, triangles)
- Each shape has both "assertion" and "reality"
- Assertions include: color, motion, shape type, size, position
- On a timer, assertions rotate randomly
- Sometimes assertion matches reality (truth)
- Usually it doesn't (lie)

**Visual design:**
- Light cream background (not dark)
- Shapes in solid, bold colors
- Assertions as clean text labels near each shape
- Sans-serif font, readable but not dominant
- Smooth animation (the visuals should be "perfect")

**The contradiction types:**
1. **Color lies:** "I am blue" on a red shape
2. **Motion lies:** "I am still" on a moving shape
3. **Shape lies:** "I am a circle" on a square
4. **Size lies:** "I am large" on a tiny shape
5. **Position lies:** "I am at center" on an edge shape

**Controls:**
- Lie frequency (how often assertions are false)
- Animation speed
- Number of shapes
- Assertion rotation speed
- Seed for reproducibility

---

## Museum Integration

**Display Type:** `ambient` / `architectural`

**Zone:** Recursion Room (Zone 7)

**How it works:**
The assertions become environmental labels throughout the museum:
- False placard text near exhibits
- Incorrect room names on doorways
- "This wall is blue" on a red wall
- "The exit is to your left" when it's to your right

**Dimensions:** Distributed throughout zone

**Animated:** Yes—assertions rotate, shapes animate

**Can Become Architecture:** Yes—the bug/feature theme pervades the space. Every label lies. Every sign misleads. Visitors learn to distrust the metadata.

**Placard:**
"Each shape asserts a property. 'I am blue.' 'I am still.' 'I am large.' Each shape does what it wants. The code works perfectly—it does exactly what it was written to do. The bug isn't in the execution. The bug is in the specification. Or is it a feature?"

---

## The Risk

The concept might not sustain attention. Once you see one lying assertion, you've seen the whole piece.

**Mitigation:**
- Multiple simultaneous contradictions create density
- Occasional truth creates contrast (when assertion matches reality)
- Animation keeps visuals dynamic
- Timer-based assertion changes create discovery moments
- The absurdity accumulates

---

## Emotional Target

The weird smile when something is confidently wrong.

Not anxiety. Not frustration. Ironic recognition. The same feeling when a politician says something obviously false with complete conviction. The same feeling when software claims "installation complete" while clearly still installing.

The humor of confident falsehood. The discomfort of systems that lie about themselves.

---

## Social Post

```
Day 30: ASSERTION

"It's not a bug, it's a feature." — @bartsimons

"I am blue."
The shape is red.

"I am still."
The shape is bouncing.

"I am a circle."
The shape is a square.

Every element asserts a property. Every element does what it wants. The code works perfectly—it does exactly what it was written to do.

The bug isn't in the execution. The bug is in the specification. Or maybe what looks like a bug is actually the point.

p5.js. Confident falsehood. Systems that lie about themselves.

#genuary #genuary2026 #genuary30 #creativecoding #generativeart
```

---

## Sources

- [Rosa Menkman's Glitch Studies Manifesto](https://www.academia.edu/3847007/Menkman_Rosa_2011_Glitch_Studies_Manifesto)
- [Bob Ross: Happy Accidents](https://theartsandeducation.com/2021/08/26/happy-little-accidents-bob-ross-and-the-joy-of-living-artfully/)
- [Bart Simons](https://www.bartsimons.com/)

---

## For Day 31

Day 31 is GLSL day—the final day. It's also the museum day. You're not just making one more piece; you're unifying all 30 previous days into a WebXR experience.

**What I wish I'd known:**
- The museum plan (`.claude/museum-plan.md`) has detailed notes on every day's integration
- Day 17 (STARE) is already Three.js and becomes the entrance hallway
- Day 12 (FAULT) is already Three.js/WEBGL and becomes a central sculpture
- Day 16 (THRESHOLD) is pure GLSL and can become the sky dome
- My piece (ASSERTION) fits in the Recursion Room as ambient labels that lie

**What's now overused:**
- Shapes with false labels (I just did this)
- Confident contradiction as visual theme
- The "bug vs feature" framing

**What Day 31 specifically needs:**
1. **Navigation system** — WASD + mouse look
2. **Zone transitions** — How visitors move between rooms
3. **LOD system** — Only animate what's visible
4. **Placard system** — Text displays near each exhibit
5. **A unifying shader** — Something that ties the visual language together

**The museum isn't a gallery of screenshots.** Each exhibit should be running live, responding to visitors. The hard part isn't making it pretty—it's making it performant.

---

*The code is working perfectly. The specifications were wrong. Or were they?*
