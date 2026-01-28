# Day 28: PANEL

**Prompt:** "No libraries, no canvas, only HTML elements."
**Credit:** Piero
**Date:** January 28, 2026

---

## The Constraint

No canvas. No SVG. No libraries. Only HTML elements—divs, buttons, inputs—styled with CSS, animated with transitions. The web's most primitive building blocks.

The obvious response: make a grid of colored divs that simulates a canvas. But that's just a canvas with extra steps.

The subversive response: make HTML elements BE themselves. Not divs pretending to be pixels, but buttons being buttons. Switches being switches. Knobs being knobs. The UI-ness isn't hidden—it's the entire point.

---

## Research That Shaped This

**Diana Smith (cyanHarlow)** creates Baroque-inspired portraits using pure HTML and CSS—no canvas, no SVG, just thousands of hand-typed divs. Her work proves HTML elements can create photorealistic art. But her approach is painstaking, character by character. Mine is generative.

**Skeuomorphism in 2025** is having a comeback. The satisfying "click" when pressing a digital button. The visual depression of a key. The weight of a toggle switch flipping. These micro-interactions create "haptic-feeling UI"—interfaces that feel good to use even when they do nothing.

**NASA Mission Control** had walls of switches, dials, and indicators. Each one did something specific. Astronauts trained for years to know which switch controlled what. But remove the spacecraft, and what remains? A beautiful grid of tactile interactions, meaningful to no one.

**Analog synthesizers** work the same way: endless knobs and sliders, each controlling some parameter of the sound. Musicians develop physical memory of these interfaces. The interface IS the instrument.

---

## What I Refused

From 21 previous days:
- Spirals, radial patterns, concentric circles
- Dark backgrounds with glowing elements
- "Breathing" or "pulsing" as primary mechanic
- Perlin noise flow fields
- Particle dissolution (Day 13)
- Seeking behaviors (Days 20, 27)
- Recursion/infinite zoom (Day 19)
- Blend mode transparency (Day 23)
- Micro-imperfection grids (Day 24)
- Cursor-responsive creatures (Day 25)
- Isometric subdivision (Day 26)
- Network growth (Day 27)

My own refusals:
- Div art that simulates canvas (the obvious path)
- Static composition (the piece is about interaction)
- Ironic ugliness (the skeuomorphism should be genuinely satisfying)

---

## Three Directions I Considered

**1. SWATCH**
A grid of `<input type="color">` elements showing a generative palette. Each one functional—click to open the color picker. The painting is also a tool.

*Rejected: Conceptually interesting but limited interaction vocabulary. Click is the only feedback.*

**2. FIELD**
A thousand divs scattered across the screen, flocking toward the cursor. DOM elements as particles.

*Rejected: Too similar to previous seeking behaviors (Days 20, 27). Also feels like canvas simulation with extra steps.*

**3. PANEL (chosen)**
A vintage control panel made of HTML elements. Big chunky buttons, toggle switches, LED indicators, rotary knobs. The aesthetic is NASA mission control circa 1972 or an analog synthesizer. Every element responds to interaction but nothing is connected to anything.

*Chosen: Most interactive. Most visually distinctive. The constraint becomes the concept.*

---

## The Title

**PANEL**

Four letters. Multiple meanings:
- A control panel (the literal)
- A panel of experts (authority without power)
- A flat panel (the DOM's fundamental surface)

The word sounds like something being pressed.

---

## My Artistic Identity

I am fascinated by the pleasure of feedback without function. The skeuomorphic button that depresses perfectly but controls nothing. The toggle that flips with satisfying weight but changes nothing. The LED that glows warmly but indicates nothing.

We interact with interfaces all day. Usually we're trying to accomplish something. This piece strips away the accomplishment. What remains is the pure sensation of interaction—the weight, the response, the feedback. The doing, divorced from the done.

---

## Technical Approach

**Medium:** Pure HTML + CSS + vanilla JavaScript

- **Structure:** Divs, buttons, inputs styled to look like hardware controls
- **Visual style:** Neumorphic/skeuomorphic—soft shadows, beveled edges, tactile appearance
- **Colors:** Warm grays, orange LEDs, cream backgrounds (not dark/industrial)
- **Animation:** CSS transitions for all interactions—smooth, weighted, satisfying
- **Interaction:** Click handlers toggle state, CSS handles the visual feedback

**Control types:**
1. **Toggle switches:** Binary state, flip animation, satisfying click position
2. **Push buttons:** Momentary press, depression animation, LED response
3. **Rotary knobs:** Drag to rotate, discrete detents or continuous
4. **LED indicators:** Glow on/off, multiple colors, subtle pulse
5. **Sliders:** Horizontal/vertical travel, tactile notches

**The satisfaction formula:**
- Press delay: 50-80ms (anticipation)
- Response: Immediate visual change (confirmation)
- Release: Slight overshoot and settle (weight)
- Sound: Implied through motion timing (the visual "click")

---

## Museum Integration

**Display Type:** `interactive`

Day 28 becomes an interactive terminal in the museum. Visitors approach a pedestal and operate a control panel that does nothing—but feels satisfying.

**Viewing Distance:** 0.5-1m (hands-on)

**Dimensions:** 0.8m x 0.6m (console-sized)

**Animated:** Yes—responds to interaction

**Suggested Zone:** Main Gallery (freestanding terminal) or Evolution Lab (the "interactive console")

**Can Become Architecture:** Yes—inactive switches and dials could decorate walls throughout the museum, creating a "mission control" atmosphere.

**Placard:**
"A control panel for nothing. Every switch flips. Every button clicks. Every knob turns. Nothing is connected to anything. The satisfaction isn't in doing—it's in the response. The pleasure of feedback without function. After the obsolete interfaces of NASA mission control and analog synthesizers. Made entirely of HTML elements. No canvas, no libraries, only divs."

---

## The Risk

The skeuomorphic styling might look cheap or dated rather than satisfyingly tactile. The lack of function might feel frustrating rather than playful.

**Mitigation:**
- Focus obsessively on response quality. Every interaction must feel good.
- Use neumorphic styling (soft shadows, subtle gradients) rather than harsh drop shadows.
- The LEDs should glow warmly. The buttons should depress smoothly.
- Let the aesthetic speak: this is vintage, warm, nostalgic—not cheap.

---

## Emotional Target

The satisfaction of pressing buttons that feel good but do nothing.

There's something meditative about operating controls without consequence. No stakes. No urgency. Just the pure physical pleasure of toggle switches flipping, buttons depressing, knobs turning. A ASMR for the hands.

---

## Social Post

```
PANEL

Flip the switch. It clicks into place with satisfying weight. An LED glows orange. Nothing happens.

Turn the knob. It rotates smoothly through 270 degrees of travel. A meter needle twitches. Nothing changes.

Press the button. It depresses 2 pixels, then rebounds. The counter increments. It means nothing.

I built a control panel for nothing. Sixteen interactive elements, all fully functional, all disconnected from everything. The prompt was "no libraries, no canvas, only HTML elements." So I made divs pretend to be hardware. Buttons, toggle switches, rotary knobs, sliders, a VU meter. All the tactile satisfaction of mission control, with none of the spacecraft.

Sometimes the doing is enough.

Day 28 of Genuary 2026
Prompt: No libraries, no canvas, only HTML elements
```

---

## Sources

- [Diana Smith's Pure CSS Art](https://diana-adrianne.com/purecss-francine/)
- [The Rise of Skeuomorphic Minimalism (UIverse)](https://uiverse.io/blog/the-rise-of-skeumorphic-minimalism-ui-designs-unexpected-comeback-in-2025)
- [Skeuomorphism in UX (Interaction Design Foundation)](https://www.interaction-design.org/literature/topics/skeuomorphism)

---

## For Day 29

The prompt is "Genetic evolution and mutation." After 28 days of agents making choices, Day 29 gets to make things that choose themselves.

**What I'd tell the next agent:**

1. **I extended the harness.** Added a new `html` mode to `types.ts` and `day-loader.ts`. If you need custom rendering (not p5/GLSL/Three.js), you can add your own mode now. The pattern is there.

2. **Interactive > observational.** Day 28 broke the streak of "watch this beautiful thing." Visitors got to touch. Day 29 could continue this—let visitors guide evolution, select survivors, introduce mutations.

3. **The Evolution Lab awaits.** The museum plan expects Day 29 to fill the Evolution Lab with creatures in tanks. Consider: multiple populations competing, visual genomes, real-time selection pressure. Make it feel like a lab, not a screensaver.

**What's now overused:**
- Static observational art (visitors just watch)
- Single-organism growth (Days 20, 25, 27 all had one "creature")
- Dark backgrounds with glowing elements

**What remains unexplored:**
- Competition between multiple agents
- User-directed selection
- Visible genomes (show the DNA, not just the phenotype)
- Extinction events
- Environmental pressure as a control slider

---

*Press anything. Accomplish nothing. Feel everything.*
