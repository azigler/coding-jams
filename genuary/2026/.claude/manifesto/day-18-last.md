# Day 18: LAST

**Prompt:** "Unexpected path. Draw a route that changes direction based on one very simple rule."
**Credit:** Baret LaVida
**Date:** January 18, 2026

---

## The Rule

Step to a random unvisited neighbor. When there are no neighbors left, stop.

That's it. One rule.

---

## About Baret LaVida

Baret is an engineer from Madrid who fell into generative art in 2021. His "Dotting" series explores "beauty in order and chaos." His engineering background shows—he's interested in how simple systems produce unexpected results.

The prompt asks for "unexpected path" with "one very simple rule." The obvious answers are Langton's Ant (turn left on white, right on black) or bouncing balls. I wanted something more final.

---

## What I Researched

**Self-avoiding walks** are paths that can't cross themselves. On a square grid, a walk starting from a random point will, on average, get trapped after ~71 steps. The walk doesn't "fail"—it simply reaches a state where no valid moves remain.

**Langton's Ant** is famous for its unexpected behavior: after 10,000 chaotic steps, it suddenly produces an ordered "highway" pattern. The unexpected part isn't the chaos—it's the emergence of order.

But Langton's Ant goes on forever. Self-avoiding walks end.

---

## What I Refused

From Days 7-17:
- No spirals, radial patterns
- No black backgrounds with glowing elements
- No breathing/pulsing as primary mechanic
- No particle dissolution/reformation
- No 3D corridors (Day 17 just did this)
- No text on canvas
- No "meditation" in the title

From myself:
- No single protagonist (multiple walkers)
- No cycles or loops (paths end, period)
- No rebirth after death (this isn't fever, this is finality)

---

## Three Directions I Considered

**1. CORNER** — A single self-avoiding walk that gradually traps itself. Color gradient from start to end. When trapped, restart with new seed.

*Rejected: Single walker isn't visually interesting enough. The restart feels like resurrection—exactly what I wanted to avoid.*

**2. DETOUR** — Walkers trying to cross from left to right, forced to detour around their own accumulated history.

*Rejected: The "destination" framing implies success/failure. I wanted pure exploration without goals.*

**3. LAST** — Many walkers start simultaneously, sharing the space. One by one they freeze. Eventually only one remains, moving through the graveyard of its predecessors. It too will stop.

*Chosen: The competition creates emergence—you don't know who survives longest. The "last one standing" isn't heroic; they're just the one who hasn't found their ending yet.*

---

## Why This Direction

The unexpected part of this piece isn't that walkers get trapped. That's expected—it's mathematically guaranteed. The unexpected part is:

1. **Which walker survives longest** — Emergence from identical rules
2. **How the frozen paths create terrain** — Early deaths shape late possibilities
3. **The feeling when the last walker stops** — Not tragedy. Completion.

---

## My Artistic Identity for This Day

I'm interested in endings that aren't failures. The self-avoiding walk doesn't "fail" when it gets trapped—it completes. Every possible way forward was tried until none remained. The artwork is the record of trying. The stillness at the end is not defeat—it's the only possible conclusion.

---

## Technical Approach

**Medium:** Canvas 2D API (no libraries)

Why Canvas: The piece is fundamentally about line drawing and accumulation. Canvas has excellent line rendering. Day 13 used Canvas for scattered particles; mine uses it for continuous connected paths.

**Implementation:**
- Grid-based position tracking (30-40 cells across)
- Multiple walkers initialized at random grid positions
- Global occupancy map shared by all walkers
- Each step: choose random unoccupied neighbor, or freeze
- Frozen walkers rendered at reduced opacity
- The "last" walker highlighted with increased line width
- When last walker freezes: brief pause, then reset

**Visual design:**
- Light background (warm cream, not dark)
- Each walker gets a hue based on its starting position
- Frozen paths fade to ~30% opacity
- Last walker pulses subtly (not breathing—acknowledgment)
- Path lines are thick enough to read as connected

---

## Controls

| Control | Purpose |
|---------|---------|
| Walker Count | How many walkers begin (10-50) |
| Grid Size | Resolution of the grid (20-50 cells) |
| Step Speed | How fast walkers move |
| Trail Opacity | How visible frozen paths remain |
| Last Highlight | How prominently the last walker is marked |
| Auto-Restart | Whether to reset when all walkers freeze |

---

## The Risk

The piece could feel too random—just dots wandering with no coherent visual.

**Mitigation:**
- Consistent color assignment by position creates spatial logic
- The highlight on "last" creates focus
- The frozen paths create accumulating structure
- The final moment of stillness is the payoff

---

## Social Post

```
Day 18: LAST

"Unexpected path. Draw a route that changes direction based on one very simple rule." — @baret

The rule: step to a random unvisited neighbor. When there are no neighbors left, stop.

Dozens of walkers begin at once. They wander, they weave, they paint themselves into corners. One by one, they freeze—their paths complete, their endings found. Soon only a few remain. Then fewer. Then one.

The last walker moves through a graveyard of frozen paths. It doesn't know it's last. It just keeps going until it can't.

On average, a self-avoiding walk on a square lattice gets trapped after 71 steps. Some go longer. Some go shorter. The math doesn't care which one survives longest.

Raw Canvas 2D. No libraries. Every step earned.

#genuary #genuary2026 #genuary18 #creativecoding #generativeart #selfavoidingwalk
```

---

## Sources

- [Self-Avoiding Walk - Wolfram MathWorld](https://mathworld.wolfram.com/Self-AvoidingWalk.html)
- [Langton's Ant - Wikipedia](https://en.wikipedia.org/wiki/Langton's_ant)
- [Baret LaVida - artbaret.com](https://www.artbaret.com)

---

*Everyone finds their ending. The last one just takes longer.*
