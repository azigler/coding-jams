# CROSSED WIRES — Asset brief for Zig

Everything the game needs from you. Create what you have time for, in
priority order. Anything missing gets a CSS fallback.

## Global constraints

- **Format:** PNG, transparent background unless noted
- **Color mode:** full color OR single-color silhouette (I'll colorize via
  CSS `filter: hue-rotate` or mask technique if silhouette). Tell me which
  in the filename: `*-color.png` vs `*-mask.png`.
- **Style:** pixel art, 1:1 pixels (no antialiasing). Aseprite with "Nearest
  neighbor" scaling. Export at 1x.
- **Palette constraint** (match the game's): please don't use pure black,
  pure white, saturated purple, or cyan neon. Stick near:
  - Ink: `#302a20` (warm near-black)
  - Paper: `#f1e9d7` (warm off-white)
  - Amber: `#cb7a33`
  - Ink-blue: `#425e8a`
  - Sage: `#7c9e6b`
  - Muted red: `#a64a48`
  Freely sample from these or adjacent hues.

## Priority 1 — Title illustration

**File:** `title.png` (color, no transparency)
**Dimensions:** **320 × 240 px** (will render 2x-3x depending on screen)
**Subject:** A 1940s telephone switchboard operator, seated at a tall brass
switchboard panel, wearing a headset. Pencil in hand or a small notebook
on her lap. Side or 3/4 view. Wooden panels, brass jacks as small dots,
cloth cables coiled. Warm single-bulb overhead lamp casting light down.
Shadowy edges, the operator centered in warm light. She is listening —
head slightly tilted.
**Mood:** intimate, quiet, a single person in a softly-lit night room.
**Transparency:** NO — full opaque illustration. The game will set this as
a small framed image on the main menu.

## Priority 2 — Conversation icons (speakers)

**Files:** `speaker-mother.png`, `speaker-office.png`, `speaker-doctor.png`,
  `speaker-school.png`, `speaker-neighbor.png`, `speaker-grocer.png`,
  `speaker-letter.png`, `speaker-caller.png`, `speaker-dispatcher.png`,
  `speaker-insurance.png`, `speaker-law.png`
**Dimensions:** **16 × 16 px** each (render at 2x, so 32px on desktop)
**Style:** single-color silhouette (suffix `-mask.png`), transparent
background. I'll tint them to match each conversation's assigned color.
**Subjects** (literal pictographs — keep simple):
- `mother` → a small house with a chimney
- `office` → a typewriter, side-view
- `insurance` → a clipboard with a dent in the corner
- `law` → a stamped envelope
- `doctor` → a stethoscope (loop + drum)
- `school` → a small open book
- `neighbor` → two houses side by side
- `grocer` → a paper bag with a carrot poking out
- `letter` → a folded letter or a flame
- `caller` → a candlestick phone (receiver off the hook)
- `dispatcher` → a circular dial with a cross on it
**Transparency:** YES — transparent background. Mask PNG in any single
dark color; I'll CSS-colorize per conversation.

These are optional nice-to-haves. If time's short, skip — the game works
fine without icons (color dots suffice).

## Priority 3 — Background paper texture

**File:** `paper-texture.png`
**Dimensions:** **512 × 512 px**, tileable
**Subject:** subtle warm paper grain/fibers. Near-invisible — should read
as "paper" but not be legible as individual marks. Low contrast.
**Style:** color, opaque. I'll overlay at 15-30% CSS opacity.
**Transparency:** NO.

Lowest priority. A subtle CSS gradient is a fine fallback.

## Priority 4 — End card decoration

**File:** `end-ornament.png`
**Dimensions:** **96 × 96 px**
**Subject:** a small decorative pen-flourish or Art-Deco ornament, like an
old-timey newspaper end-mark. Could be a stylized telephone receiver, a
fleuron, a tiny cable bow.
**Style:** single-color silhouette, transparent background.
**Transparency:** YES.

## Aseprite export settings

When you're ready to export:

1. **File → Export Sprite Sheet** if you want one combined spritesheet, OR
   **File → Export** for individual PNGs.
2. **Sheet type:** Packed (if spritesheet) — OR just export each file
   individually, simpler.
3. **Pixel density:** 1x (we'll scale in CSS with `image-rendering:
   pixelated;`).
4. **Output:** PNG, no JSON needed (we'll reference filenames directly).
5. **Frames:** single frame per file unless you want animation — no
   animations in v1 scope.

Save everything into:
`ludum-dare/59-signal/game/public/assets/`

Filename discipline:
- All lowercase
- Hyphen-separated
- `-mask.png` suffix = silhouette I'll colorize
- `-color.png` suffix (or no suffix) = full-color illustration as-is

## Spritesheet option (if you go that route)

If you'd rather do ONE spritesheet for all 11 speaker icons:
- **File:** `speakers.png`
- **Dimensions:** 176 × 16 (11 frames × 16px wide, stacked horizontally)
  OR 16 × 176 (stacked vertically — your call).
- Export as a flat PNG. Tell me which axis. I'll slice with CSS
  `background-position`.

## Sanity checks before handing off

- [ ] Every PNG opens cleanly and is the stated dimension at 1x
- [ ] Silhouette files use a single dark color against fully-transparent background
- [ ] Color files are opaque
- [ ] No pure black / pure white pixels
- [ ] File size — each < 100KB (pixel art should be tiny)

Drop the files in `ludum-dare/59-signal/game/public/assets/` or hand me a
zip; I'll commit them myself.
