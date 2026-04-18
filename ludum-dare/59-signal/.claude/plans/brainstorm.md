# Brainstorm — LD59 "Signal"

Status: **OPEN — no direction locked.** We are still diverging. Do not start
writing code against any of these. When Andrew picks, we collapse this into a
spec in `specs/` and close the rest.

## Theme parse

"Signal" is a loaded word. Useful readings:

1. **Electromagnetic signal** — radio waves, SETI, deep-space probes, Morse,
   jamming, tuning, frequency. Andrew is leaning this way.
2. **Information signal** — signal vs noise, pattern-matching under static,
   a hidden message in a crowd of garbage.
3. **Social signal** — costly signaling, gesture, flag, semaphore. What you
   choose to project tells others who you are.
4. **Distress signal** — SOS, lighthouse, flare, last transmission.
5. **Traffic signal** — coordinating flow. Rules-at-intersections as a system.
6. **Tell / poker signal** — reading someone before they act.
7. **Cellular signal** — a creature's internal chemistry, pheromone trails,
   hormone cascades.

Avoid: anything that reads as "generic sci-fi with a radio in it." The theme
has to show up in the verb, not just the skin.

## Directions under consideration

### A. **Deep-space listener** (radio / space — Andrew's current lean)

You run a one-person listening post on the edge of known space. Signals come
in from distant sources — you tune, filter, decode, and triage them. Some are
real. Most are noise. One, if you find it in time, changes everything.

- **Verb:** tune. Pull a dial, narrow a filter, reconstruct a waveform.
- **Core mechanic:** a frequency dial + spectrogram where real signals hide
  inside noise. Correct tuning reveals a decoded fragment; wrong tuning gets
  a ghost/misread.
- **Tension:** more signals arrive than you can process. You choose what to
  chase. You will miss things.
- **Ending:** probably 1-3 "resolutions" where Andrew's one-weekend taste
  gets to shine. A final signal that recontextualizes everything.
- **Why it works for Signal:** the verb IS the theme. Perfect alignment.
- **Risk:** spectrogram visuals are easy to make look like every other
  sci-fi thing. Design choice to make it feel _bespoke_ — diegetic UI,
  handmade fonts, analog-console feel, maybe pencil/ink art.
- **Tech:** plain canvas + Web Audio for generated noise/tones. No engine
  overhead. Render style is 100% our control.

### B. **Semaphore runner**

A medieval (or alt-history) courier runs between signal hills, relaying flags
and torches. Each hill shows what you brought. Mess up the relay and armies
move based on the wrong report. You start seeing villages burn because of a
flag you set wrong three hills ago.

- **Verb:** run and signal.
- **Core mechanic:** platformer-ish traversal + timing-based flag puzzles.
- **Why Signal:** semaphore = pre-electronic signal network.
- **Risk:** two mechanics (traversal + signaling) is probably too much for
  72h by one person. Cut traversal?

### C. **Tower tuner** (puzzle / roguelike)

A city-block radio tower where you route wires through a grid to broadcast
clean signal to the right buildings. Every turn, buildings change what
frequency they accept. Interference from adjacent wires scrambles things.
It's Signal meets pipe-dream meets frequency puzzles.

- **Verb:** route.
- **Core mechanic:** wire routing + frequency conflict resolution.
- **Why Signal:** transmission as puzzle.
- **Risk:** reads as generic-indie-puzzle unless the art/frame is very
  specific. What's the world? Who are we? Why do we care?

### D. **The quiet town** (narrative / found-footage)

A small town where every resident's dialogue is static. You carry a tuner.
Get close to someone with the right frequency and you catch _fragments_ of
what they're really thinking. The town hides a single coherent thing, and
you reconstruct it by tuning into different people, in different places, at
different times.

- **Verb:** eavesdrop.
- **Core mechanic:** walk around a small 2D map, hold tuner, hunt for clear
  audio in a sea of static.
- **Why Signal:** literal signal as the core verb, but turned social.
- **Risk:** needs writing. A lot of writing. Andrew is a strong writer (see
  zig-voice skill) but dialogue at scale takes days.

### E. **One-way conversation**

You're on one side of a comms link to a dying/drifting spacecraft. Light-speed
delay means every message you send takes minutes to arrive; their reply takes
minutes to come back. The game is a text conversation played out in real time
across the weekend, where your choices matter but you can never take them
back once sent and can never react in time to surprises.

- **Verb:** write and wait.
- **Core mechanic:** chat window + timer + branching consequences.
- **Why Signal:** the delay IS the signal's physical reality. Speed of light.
- **Risk:** "player waits in real life" is novel but hostile to jam
  judges who need to play in one sitting. Collapse the delay to 15-20 seconds?

## Other sparks (not developed yet)

- A pigeon that carries sealed messages across a map, but sometimes the wind
  reads them too.
- You are the noise. You disrupt someone else's signal and watch their world
  distort.
- A lighthouse you have to keep lit, but the pattern you blink out determines
  which ships come and which don't.
- A deaf character in a world of talking NPCs — "signal" as sign language,
  lip-reading, context.

## Selection criteria

When Andrew picks, the filter is:
1. **Is the verb the theme?** Signal should be a thing you _do_, not a thing
   you're _near_.
2. **Can a solo human ship this in 72h with taste intact?** Content scope vs
   mechanic scope. If it needs 40 NPCs of writing, cut.
3. **Does the visual/audio identity have a chance of being bespoke?** What
   does the game look like? What does it sound like? If the answer is
   "generic sci-fi," restart.
4. **Is there a moment-to-moment loop that's fun for 30 seconds?** Judges
   play for ~5 minutes. The first 30 seconds decide everything.
5. **Is there at least one ending / resolution that lands?** Jam games
   without an ending feel like prototypes, and score lower on Mood.

## Decision capture

When Andrew picks a direction, add a `## Locked direction` section here with
the date and one-paragraph summary, then start `specs/overview.md`.
