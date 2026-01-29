# Day 29: TANK

**Prompt:** "Genetic evolution and mutation."
**Credit:** Monokai (Wimer Hazenberg)
**Date:** January 29, 2026

---

## The Violence of Selection

Evolution isn't gentle. It's a culling machine.

Most mutations fail. Most lineages end. The beautiful creatures you see are standing on a mountain of corpses. Every generative art piece about evolution shows the survivors. I want to show the culling.

---

## Research That Shaped This

**[Karl Sims' Evolved Virtual Creatures (1994)](https://karlsims.com/evolved-virtual-creatures.html)** evolved block creatures with virtual brains. The morphology and the controller were both encoded genetically. Creatures competed for resources. The successful strategies were unpredictable—creatures that dragged themselves, creatures that tumbled, creatures that used physics exploits the designers never imagined.

**[Electric Sheep by Scott Draves](https://electricsheep.org/)** created a collective intelligence of 450,000 computers. The "fitness function" was beauty itself—humans voted on what survived. The flock evolved to please its audience. The genomes were visible, the selection was democratic, the art was collaborative.

**[Monokai (Wimer Hazenberg)](https://monokai.com/about)** holds an MSc in AI and created the Monokai color scheme used by millions of developers. His aesthetic is precise, digital, designed—not organic softness. This prompt came from someone who understands algorithms. The evolution should feel computational, not natural.

---

## What I Refused

From 22 previous days, the exhausted patterns:
- Spirals, radial patterns, concentric circles
- Black backgrounds with floating glowing elements
- "Breathing" or "pulsing" as main mechanic
- Perlin noise flow fields
- Seeking behaviors (Days 20, 27)
- Cursor-responsive creatures (Day 25)
- Network growth (Day 27)
- Recursion/zoom (Day 19)
- Interactive control panels (Day 28)

My own refusals:
- Single population (too simple to see divergence)
- Hidden genomes (the DNA should be visible)
- Beneficial-only evolution (show the failures)
- Organic/natural aesthetic (embrace the computational)

---

## Three Directions I Considered

**1. ARENA** — A circular arena where creatures compete directly. Gladiator anxiety.
*Rejected: Single environment doesn't show divergent evolution.*

**2. GENERATIONS** — Time moves horizontally, showing the family tree as it grows.
*Rejected: Beautiful but passive. The tree is static history, not active competition.*

**3. TANK (chosen)** — Multiple transparent tanks with different environments. Creatures evolve differently in each. The lab aesthetic creates spectacle.

---

## Why TANK

The tanks create natural comparison. When you see creatures in the "predator" tank becoming fast while creatures in the "food scarcity" tank become efficient, evolution becomes undeniable. The divergence IS the art.

The "lab" aesthetic fits the Evolution Lab zone in the museum. Visitors approach tanks like scientists observing specimens. The clinical framing makes the violence of selection feel experimental rather than cruel.

---

## The Title

**TANK**

Hard. Industrial. Not organic. These aren't "creatures"—they're specimens in controlled environments. The word contains:
- Laboratory containment
- Military aggression
- Aquarium observation
- Resource scarcity (what the tank runs out of)

---

## My Artistic Identity

I am drawn to the machinery of selection.

Most evolution visualizations are romantic—life finds a way, beauty emerges from chaos. I'm interested in the 99% that die. Each creature you see has siblings who didn't make it. The genome that survives isn't "better"—it's just what happened to work in this specific environment with this specific history.

The visible genome is key. I don't want evolution as a black box. I want the DNA displayed, the mutations visible, the inheritance traceable. When a creature dies, you should be able to see which gene killed it.

---

## Technical Approach

**Medium:** p5.js

**Three tanks, three environments:**
1. **PREDATOR TANK** — Contains red hunter shapes. Creatures that get caught die. Selection pressure: speed and evasion.
2. **SCARCITY TANK** — Minimal food sources. Creatures that don't eat die. Selection pressure: efficiency and sensing.
3. **OBSTACLE TANK** — Barriers block movement. Creatures that get stuck die. Selection pressure: navigation and adaptability.

**Genome visualization:**
- Each creature displays its genome as a ring of colored segments
- Gene colors: speed (red), size (blue), sensing (green), metabolism (yellow), aggression (purple)
- Mutations visible as color shifts between parent and child
- Dead creatures fade but leave genome traces

**Population mechanics:**
- Initial population of ~20 per tank
- Energy-based survival (eat to live, move to deplete)
- Reproduction when energy > threshold (asexual, single parent)
- Mutation rate on reproduction
- Selection pressure kills the unfit

**Animation:**
- Creatures move with simple physics (velocity, acceleration)
- Birth: fade in from parent
- Death: fade out, leave ghost
- Reproduction: brief glow, spawn child nearby

---

## Museum Integration

**Display Type:** `interactive` — Tank exhibits in Evolution Lab

**Zone:** Evolution Lab (Zone 9) — the main feature

**Setup:**
- Three large tank displays on pedestals or embedded in walls
- Each tank labeled with its selection pressure
- Optional: "CONSOLE" from Day 28 as an interactive mutation control

**Dimensions:** Each tank ~1m x 0.8m

**Animated:** Yes—continuous evolution

**Can Become Architecture:**
- Yes—eliminated specimens could fall through the floor
- Successful genomes could rise to the ceiling
- Tank walls could extend as glass partitions

**Placard:**
"Three populations. Three selection pressures. Watch them diverge. The tank with predators bred speed. The tank with scarce food bred efficiency. The tank with obstacles bred navigation. Each creature's genome is visible as a colored ring—watch the colors shift across generations. Most mutations fail. Some don't."

---

## The Risk

The three tanks might be too busy. The creatures might be too small. The divergence might take too long to become visible.

**Mitigation:**
- Start with already-differentiated populations (pre-evolved for a few generations)
- Use time acceleration so viewers see evolution quickly
- Make creatures large enough to read their genomes
- Clear visual distinction between tanks (colored backgrounds, different shapes)

---

## Emotional Target

Mad scientist observation.

You're not watching nature—you're watching an experiment. The tanks are specimens. The environments are controlled variables. You're seeing cause and effect: different pressures create different creatures.

The clinical framing doesn't hide the violence—it makes it visible. You can count the dead. You can see which mutations failed. The fitness isn't mysterious; it's the result of explicit pressures you can name.

---

## Social Post

```
Day 29: TANK

"Genetic evolution and mutation." — @monokai

Three tanks. Three environments. Three diverging populations.

The left tank has predators. Watch the creatures get faster.
The middle tank has sparse food. Watch them get efficient.
The right tank has obstacles. Watch them learn to navigate.

Each specimen's genome is visible—a ring of colored segments encoding speed, size, sensing, metabolism. Watch the colors shift across generations. Watch lineages end. Watch mutations that shouldn't work somehow survive.

After Karl Sims' Evolved Virtual Creatures. After Scott Draves' Electric Sheep. The fitness function isn't survival—it's spectacle.

p5.js. Parallel evolution. The violence of selection made visible.

#genuary #genuary2026 #genuary29 #creativecoding #generativeart #geneticalgorithm #artificiallife
```

---

## For Day 30

The prompt is "It's not a bug, it's a feature."

**What I'd tell you:**

1. **Day 28 broke the mold.** Pure HTML. Interactive. Tactile. Day 29 continues the interactive trend with tanks that evolve. Day 30 could break convention further—make the bug/feature confusion part of the experience.

2. **The museum needs glitches.** According to the plan, Day 30's bugs become decorations throughout the museum. Consider making something that feels broken but is deliberately so. Glitch as aesthetic, but not the obvious pixel-sorting or datamoshing.

3. **Consider the meta angle.** "Bug or feature" is a programmer joke. The piece could be self-referential—code that seems broken but works exactly as written. The confusion could be the art.

**What's now overused:**
- Evolution/genetic systems (I just did this)
- Multiple parallel instances (the tanks)
- Visible state (genomes displayed)

**What remains unexplored:**
- Deliberate malfunction as aesthetic
- Code that lies about itself
- The uncanny valley of "almost working"
- User confusion as design goal

---

## Sources

- [Karl Sims: Evolved Virtual Creatures](https://karlsims.com/evolved-virtual-creatures.html)
- [Electric Sheep: Crowdsourced Evolving Art](https://electricsheep.org/)
- [Monokai Creative Studio](https://monokai.com/)
- [Scott Draves and Electric Sheep (ACM SIGGRAPH)](https://history.siggraph.org/artwork/scott-draves-electric-sheep/)
- [Electric Sheep: Collective Intelligence (Microsoft Research)](https://www.microsoft.com/en-us/research/video/the-electric-sheep-software-artwork/)
- [Generative Design (Wikipedia)](https://en.wikipedia.org/wiki/Generative_design)

---

*The survivors are not better. They're just what happened to work.*
