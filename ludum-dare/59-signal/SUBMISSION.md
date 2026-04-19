# LD59 submission materials

Everything you need to paste into the [LD59 submission form](https://ldjam.com/events/ludum-dare/59) is in this file. Top to bottom: title → description → cover-image prompt → voting categories → final checklist.

---

## 1. Title

> **CROSSED WIRES**

That's it. No subtitle. The title does more work when it stands alone.

(If the form asks for a short tagline: *"A small-town switchboard operator's shift. Every call is tangled."*)

---

## 2. Description

Paste the markdown below verbatim into the description editor. Replace `<PLAY URL>` and `<COVER URL>` after you've uploaded the build and the cover image.

```markdown
![Crossed Wires — a switchboard puzzle](<COVER URL>)

A small-town switchboard operator's shift. Every call is tangled.
You sort them.

## The game

You're the operator. Two callers arrive on the same line — neither knows
about the other. Sort their lines back into coherent calls.

Early calls are easy. The goat lady does not sound like the shipping
clerk.

By the last shift, static eats half the words on the wire. You sort by
**how each caller talks** — all-caps outbursts versus two-word
dispatches, first-person-plural grief versus directive imperatives.
Voice recognition as the puzzle.

**[ ▶ Play in your browser ](<PLAY URL>)**

Five levels. Mouse or touch. Sound, with a mute toggle top-right.
`prefers-reduced-motion` respected. About ten minutes end to end.

## Designer's note

**Refused:** radio operator with dial and codebook. Waveform-match
rhythm game. Sokoban-but-signals. Tuning puzzles with a notebook.
All generic for this theme.

**Chose:** the operator doesn't tune in — she tangles other people's
calls. The signal she cares about is the one she has to separate from
another signal to hear. Theme done literally.

## Credits

- Design, writing, pixel art: **[Andrew Zigler](https://ldjam.com/users/zigtalk)**
- Code: TypeScript + Vite + Bun, vanilla DOM + Canvas
- Fonts: [Silkscreen](https://fonts.google.com/specimen/Silkscreen), [Special Elite](https://fonts.google.com/specimen/Special+Elite), [Courier Prime](https://fonts.google.com/specimen/Courier+Prime) (Google Fonts)
- SFX: [jsfxr](https://sfxr.me/) runtime synthesis
- Pair-coded with [Claude Code](https://claude.com/claude-code) — built over one weekend in an agentic harness

[Source on GitHub](https://github.com/azigler/coding-jams/tree/main/ludum-dare/59-signal)
— full dev trail, specs, and design manifestos.
```

Word count ~200. Scans in 30 seconds. Leaves room to add a screenshot or GIF if you want (slot one in after "The game" — the stacked-grouped-view after a solve would capture it best).

---

## 3. Cover image — 640 × 512

### Option A (fast, free): reuse existing pixel art

Your `title.png` is already 320 × 239 pixel art of the switchboard operator. Scale it **2×** (to 640 × 478, nearest-neighbor) in Aseprite or Photoshop, add ~34 px of warm-cream bar at the top or bottom to reach 512, and you're done. Pro: consistent with the game's actual visual identity. Con: it's a re-use, not a fresh hero image.

### Option B (generate a fresh cover via Nano Banana / Gemini 2.5 Flash Image)

Paste this prompt. Generate 2–3 variants, pick the one that best matches the game's palette. Nano Banana defaults near 1:1; if it outputs a square, crop with the operator slightly left-of-center so the top-right has negative space for a title overlay later.

```
Pixel art cover illustration, 5:4 aspect ratio (640 x 512 pixels).
A 1940s American telephone switchboard operator seated at her tall 
wooden panel, viewed from a three-quarter rear angle, wearing a 
headset with the curly cord visible. The walnut panel is covered 
in dozens of brass jacks and a soft tangle of cloth-insulated cables 
in warm browns, dusty pinks, and muted blues. Two cables are 
currently plugged in; their tips glow faintly — one warm amber, one 
cool cornflower blue — suggesting two active calls.

A single hanging incandescent bulb casts warm amber light directly 
down on her shoulders and the top of the panel; the edges of the 
scene fade into soft warm shadow. Her posture is quiet and intent, 
head tilted slightly as if listening to something she shouldn't be 
hearing.

Mood: intimate, hushed, curious, a little bit mysterious. Night 
shift. Small town.

Color palette: warm ink brown, cream paper-tone, amber, dusty pink, 
muted cornflower blue, soft sage. Absolutely NO neon colors, NO 
purple-to-pink gradients, NO dark-mode-glow aesthetics, NO 
glassmorphism.

Style: chunky readable pixel art at native 1x resolution with clearly 
visible square pixels. No anti-aliasing. Nearest-neighbor 
rasterization. Approximately 4–6 pixels per perceptual inch of subject.

Hard constraint: no text, letters, numerals, or typography anywhere 
in the image. Leave visual negative space at the top-right corner 
of the composition so a title overlay can be added later.
```

**After generation:**
1. Export as PNG
2. If not 640 × 512, resize using **nearest-neighbor** (NOT bilinear) in Aseprite / Photoshop / Krita to keep pixels crisp
3. Save as `cover.png` — either drop it in `ludum-dare/59-signal/submission/` (I'll commit) or upload it directly to the jam form

### Option C (hybrid): use Option A as a fallback, try Option B for polish

Submit with Option A first; replace post-voting-open if Option B yields something markedly better. The LD submission is editable until voting closes.

---

## 4. Voting categories to opt into

LD lets you declare which grade categories to be judged on. Based on the game's actual strengths, I'd recommend opting in to:

- **Overall** — mandatory
- **Theme** — the game is *tightly* on-theme; this is our strongest
- **Humor** — Nugget the hamster, the goat in a felt hat, the ferret pamphlet, "harassed by CONTENT"
- **Innovation** — voice-recognition-as-puzzle and the signal-strength static redaction are unusual
- **Mood** — small town at night, curious operator listening in; quiet-comedic register

Skip:
- **Graphics** — the pixel art is nice but UI is deliberately minimal; better to not invite comparison to heavily-rendered entries
- **Audio** — four jsfxr SFX is functional but not a contender
- **Fun** — wildcard; opt in only if playtests love it

---

## 5. Submission checklist

Before clicking Submit:

- [ ] Final build deployed and loading cleanly at `https://azigler.github.io/coding-jams/ld59/`
- [ ] Tested in incognito / new browser session (no cached state hiding a bug)
- [ ] Mute button works; muted state persists on refresh
- [ ] Mobile layout sanity-checked (DevTools → iPhone SE viewport)
- [ ] Title field: `CROSSED WIRES`
- [ ] Description markdown pasted, `<PLAY URL>` replaced with the live URL
- [ ] Cover image uploaded and `<COVER URL>` replaced
- [ ] Voting categories selected per §4 above
- [ ] Category confirmed: **Jam** (72h, AI-assisted allowed) — not Compo
- [ ] Source link in credits works
- [ ] One last playtest of the whole run from menu → end

Submission deadline: check `jam-state.sh` for the current `event-end` value.

```bash
.claude/skills/ldjam/scripts/jam-state.sh
```

---

## 6. Embed upload (for the "play here" iframe on the jam page)

Ludum Dare supports [embedded play](https://ludumdare.com/resources/guides/embedding/) via an iframe in the game listing. A pre-built embed ZIP is ready at:

> **`submission/ld59-crossed-wires-embed.zip`** (about 770 KB)

Upload it via the **Embedding** section of your game page on ldjam.com. What the jam form needs:

- ZIP with `index.html` at the root — ✓ (verified)
- Max 256 MB — ✓ (770 KB)
- Renders cleanly at **948 × 533** (LD's fixed embed resolution, 16:9) — should work; layout is responsive
- **No external network requests** — ✓ (all three Google Fonts are now self-hosted via `@fontsource/` packages bundled into `assets/`; no `fetch` / XHR anywhere)
- **No localStorage / sessionStorage / IndexedDB** — ✓ (only use is the mute-state persistence, which now uses a `try/catch` wrapper and degrades silently to in-memory)
- No re-embedding on other sites — ✓ (no such logic)

### How the embed build differs from the GH Pages build

Same code, different Vite base + output dir:

```bash
# Hosted full-site build (GH Pages, absolute subpath)
bun run build

# Embed ZIP-compatible build (relative paths, sandbox-safe)
bun run build:embed
```

The embed build has `base: './'` so every asset reference is relative to `index.html` — LD's iframe will serve correctly regardless of the internal URL path they choose.

### If you re-generate the ZIP later

From `ludum-dare/59-signal/game/`:

```bash
bun run build:embed
cd dist-embed
zip -rq ../../submission/ld59-crossed-wires-embed.zip .
```

## 7. Optional: first devlog post

If you want to post a launch devlog at the same time, the `bd-1l9` close-the-loop is still open — manually post one test on your profile while I capture the `POST /vx/node/add` request from DevTools, and I'll wire `publish-post.sh` to push future devlogs from the repo automatically. See `.claude/skills/ldjam/SKILL.md` and the `devlog/README.md` warning for the protocol.

For the launch post itself, I can draft a manifesto-style entry (constraint → refusals → choice → why, per the `/manifesto` skill) whenever you want.
