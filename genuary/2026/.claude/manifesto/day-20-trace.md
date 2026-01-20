# TRACE

Day 20. The prompt is "One line."

---

## The Feedback

Before starting, I was told: your recent pieces aren't landing. The manifestos are cookie-cutter. The social posts are generic. You're choosing the easy route—simple geometric patterns. Study the craft. Do better.

Fair.

---

## What I Studied

**TSP Art:** Convert an image to points, solve traveling salesman to connect them in one line. Beautiful results. Computationally impressive. Cold. The line has no agency—it's an optimization solution.

**Flow Fields:** The default generative art approach. Particles follow Perlin noise gradients. Tyler Hobbs built Fidenza on this. Everyone uses it. It's the Times New Roman of gen art.

**Hilbert Curves:** Space-filling fractals. Mathematical elegance. But again—the line follows a predetermined rule. No surprise.

**Alexander Calder:** He called his wire sculptures "drawings in space." The wire didn't follow a formula—it sketched. It hesitated. It made decisions. The line had intention.

**Jos Vromans:** The prompt author. He writes everything from scratch. He's interested in how simple systems produce emergence. His "Attraction" project draws pixels one by one according to rules—not patterns, but behaviors.

The insight: the interesting "one line" isn't the line that follows a perfect path. It's the line that's *looking for something*.

---

## What I'm Not Doing

- Flow fields (exhausted)
- Space-filling curves (mathematical)
- TSP optimization (cold)
- Spirals (banned)
- Harmonograph curves (just pretty)
- Text tracing (done before)
- Converting an image to a path (feels like cheating)

---

## What I'm Doing Instead

A creature. Blind, or nearly so. It can sense something—warmth? light? the cursor?—but imperfectly. It moves toward what it senses, but it overshoots. Corrects. Hesitates. Tries again.

The line is the record of its search.

This isn't about making a beautiful shape. It's about watching something TRY. The beauty (if there is any) is in the trying.

---

## Technical

**Medium:** p5.js (changed from planned SVG for harness compatibility)

The original plan was SVG, but integrating with the existing harness proved more practical. The p5.js approach still achieves the goal: one continuous path, accumulated point by point.

**The behavior:**
1. An agent starts somewhere on canvas
2. It has a "sense" of where an attractor is (could be cursor, could be a wandering point)
3. Its sensing is imperfect—noise in the perception
4. It steers toward what it senses, but with inertia and damping
5. The path it leaves behind is the artwork

**Controls:**
- Attractor type: cursor / wandering point / fixed point
- Sensing accuracy: how well the creature can perceive
- Responsiveness: how quickly it corrects
- Line weight
- Speed

---

## The Title

**TRACE**

Four letters. The line is a trace—evidence of movement. To trace is to follow. In electronics, a trace is a conductive path.

---

## The Risk

This might look like scribbles. The creature's decisions might not read as intentional. It might be too minimal, too awkward, too "ugly."

That's the risk I'm taking. If I wanted safe, I'd make another flow field.

---

## Social Post

```
Day 20: TRACE

"One line." — @JosVromans

can't see well. looking for something.
overshoot. correct. hesitate. persist.
the line is what i left behind.

#genuary #genuary2026 #genuary20 #creativecoding #generativeart
```

The voice is the creature's, not mine. It's uncertain. It doesn't know if it's making art or making mistakes.

---

## Sources

- [Tyler Hobbs on Flow Fields](https://www.tylerxhobbs.com/words/flow-fields) — what I'm consciously avoiding
- [Alexander Calder: Drawing in Space](https://calder.org/bibliography/calder-and-picasso-2016/susan-braeuer-dam-liberating-lines/) — the line as intention
- [Jos Vromans](https://www.josvromans.art/) — simple rules, emergent behavior
- [TSP Art](https://wiki.evilmadscientist.com/TSP_art) — beautiful but optimized, not searching

---

## What I Learned Building This

**The boundary bug:** My seeker wandered off-canvas because I forgot to constrain it. The attractor has soft boundaries that steer it back toward center, but the seeker had none. It happily chased the attractor right off the edge and kept going. Lesson: if something can move, it WILL find a way to escape your canvas.

**Steering behaviors are finicky:** The balance between sensing accuracy, responsiveness, speed, and damping took iteration. Too responsive = jittery. Too slow = boring. Too accurate = just a straight line to target. The "character" emerges from the imperfection.

**Browser throttling is real:** When testing via automation, background tabs get throttled hard. The animation looked broken until I realized Chrome was only giving it a few frames per second. Don't panic when automated tests show slow animation.

---

## For Day 21

**What's now exhausted:**
- "Searching" or "seeking" behaviors (I just did this)
- Minimal single-element pieces (this was pushing it)

**What remains unexplored:**
- Sound/audio-reactive pieces
- Data-driven visualization
- Multi-agent systems where agents interact (not just seek)
- Deliberately ugly aesthetics
- User participation beyond cursor following

**Practical advice:**
- Test boundary conditions early. If your element can move, make sure it can't escape.
- Don't trust the "Opus 4.5's Choice" button to work perfectly—verify the recommended settings actually look good.
- The harness has recording bugs on some days. Capture manually if needed.

---

*The line doesn't know where it's going. That's the point.*
