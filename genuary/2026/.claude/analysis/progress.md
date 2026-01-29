# Museum Progress Log

This document tracks daily progress on the Genuary 2026 Virtual Museum.

---

## Session Format

Each session entry should include:
- **Date & Time**
- **Beads worked**: Which mu-xxx beads were touched
- **Accomplished**: What was built/fixed
- **Tested**: What was verified working
- **Blockers**: What's preventing progress
- **Next session**: What to prioritize

---

## Sessions

### 2026-01-27 — Infrastructure Setup

**Beads worked**: None yet (initial setup)

**Accomplished**:
- Created `.claude/agents/curator.md` agent definition
- Created `.claude/analysis/` folder structure
- Initialized beads with `mu-` prefix
- Created museum testing script infrastructure
- Set up curator orchestrator and systemd timer

**Tested**: N/A (no museum code yet)

**Blockers**: None

**Next session**:
- Create initial museum scaffolding (`src/museum/`)
- Add `#museum` route to harness
- Create first beads for foundational work
- Get a basic Three.js scene rendering

---

### 2026-01-27 — First Implementation Session (Curator Agent)

**Beads worked**: mu-mdk, mu-q5p, mu-m8w, mu-tp4, mu-yal, mu-310 (all closed)

**Accomplished**:
- Created `src/museum/` directory structure:
  - `index.ts` — Museum entry point with lifecycle management
  - `scene.ts` — Three.js scene with camera, lights, floor, entrance zone
  - `navigation.ts` — WASD + mouse look navigation system
  - `zones/entrance.ts` — Day 17 hallway adapted as museum entrance
  - `zones/`, `exhibits/`, `utils/` directories for future work
- Added `#museum` route to harness navigation system:
  - Updated `harness/navigation.ts` with museum detection and loading
  - Updated `index.ts` with Museum button and dropdown option
  - Dynamic import of museum module to avoid circular deps
- Implemented entrance zone (adapted from Day 17 STARE):
  - p4m wallpaper pattern generation with 4-fold rotational symmetry
  - Wall sconces with warm flickering point lights
  - Doorway leading to main gallery area
  - Dark twilight atmosphere with fog
  - Shadow mapping enabled
- Implemented navigation:
  - WASD movement with arrow key support
  - Click-and-drag mouse look
  - Smooth velocity damping
  - Fixed camera height at 1.6m (human eye level)
- Exposed debug API:
  - `window.museumSetCamera(x, y, z)` for positioning
  - `window.museumGetFPS()` for performance monitoring

**Tested**:
- TypeScript compilation passes (no errors)
- Dev server starts successfully
- Route navigation between days and museum works

**Blockers**: None

**Next session**:
- Test the museum visually in a browser
- Implement collision detection for walls
- Build main gallery space with high ceiling
- Add exhibit frame system for rendering day canvases

---

### 2026-01-28 — Session Recovery & Collision Detection

**Beads worked**: mu-6uu (closed), mu-1ex (closed), bd-29v (closed)

**Accomplished**:
- Recovered from interrupted curator session:
  - Documented existing exhibit frame system (`src/museum/exhibits/frame.ts`)
  - Documented main gallery zone (`src/museum/zones/gallery.ts`)
- Closed mu-6uu (exhibit frame system) - was already complete
- Updated architecture.md with current floor plan diagram
- Closed mu-1ex (floor plan design) - gallery with 4 wings is implemented
- Implemented wall collision detection in navigation.ts:
  - Added collision box system for entrance hallway
  - Added circular boundary for octagonal gallery
  - Implemented "wall sliding" behavior (slide along walls when blocked)
  - Uses player radius of 0.3m for comfortable wall clearance
- Closed bd-29v (collision detection) - new bead created and completed this session

**Tested**:
- TypeScript compilation passes
- Build succeeds with no errors
- Playwright confirms canvas renders at 800x800
- Note: WebGL content doesn't capture well in headless screenshots (known limitation)

**Blockers**: None

**Next session**:
- Test collision detection visually in a real browser
- Consider adding placard system (mu-2ww) for exhibit information
- Start integrating actual day artwork as textures (currently placeholders)
- Investigate LOD system for performance (mu-3cy) if needed

---

### 2026-01-28 — Placard System Implementation

**Beads worked**: mu-2ww (closed)

**Accomplished**:
- Implemented placard system for exhibit information panels:
  - Created `src/museum/exhibits/placard.ts` with canvas-texture rendering
  - Defined `DayInfo` type with day number, title, description, and credit
  - Added prompt data for all 31 Genuary days
  - Placards show day number badge, title, and description
  - Uses high-resolution canvas (4x scale) for crisp text
- Integrated placards into gallery exhibits:
  - Updated `GalleryZone` interface to track placards
  - Position placards below each exhibit frame
  - Proper dispose of placard resources on cleanup
- Exported placard functions from exhibits module

**Tested**:
- TypeScript compilation passes
- Build succeeds with no errors
- Playwright screenshots confirm museum renders with exhibits and placards
- Placards visible below exhibit frames in gallery

**Blockers**: None

**Next session**:
- Integrate actual day artwork as textures (replace placeholders)
- Build wing corridors (North, East, West) to expand navigable space
- Consider improving placard visibility with better lighting or contrast

---

### 2026-01-28 — Lighting & Performance Session

**Beads worked**: bd-q1s (closed)

**Accomplished**:
- Fixed WebGL texture unit overflow (was exceeding 32 unit limit)
  - Disabled shadow casting on entrance sconce lights (saved 8 shadow maps)
  - Shared wallpaper texture between walls instead of cloning
  - Disabled shadows on exhibit spotlights and pedestal light
- Significantly improved gallery lighting:
  - Doubled skylight intensity (4 → 8)
  - Increased ambient fill lights
  - Added ring of 4 overhead lights for better coverage
  - Made skylight dome glow brighter with stronger emissive
  - Improved wall and floor materials for better visibility
- Added `scripts/museum-explore.ts` for automated Puppeteer navigation and screenshots

**Tested**:
- Build succeeds with no TypeScript errors
- No more "Trying to use 33 texture units" warnings
- Puppeteer screenshots confirm gallery is now visible (was almost pitch black before)
- Entrance hallway still looks great with warm sconce lighting

**Blockers**: None

**Next session**:
- Integrate actual day artwork as textures (replace "Day X - Coming Soon" placeholders)
- Consider making exhibit spotlights even brighter for better art visibility
- Build wing corridors (North, East, West) to expand navigable space

---

---

### 2026-01-29 — Exhibit System Overhaul & Wing Expansion

**Beads worked**: None (autonomous improvements)

**Accomplished**:
- **Fixed exhibit canvas orientation** - Canvas meshes were rendering INTO walls:
  - Root cause: After frame group rotation by PI, the canvas (facing +Z) pointed toward wall
  - Fix: Rotate canvas by PI and use negative Z positioning
  - Same fix applied to matte border geometry
- **Created 3 exhibit wing corridors**:
  - North Wing (Days 2-9): 8 exhibits
  - West Wing (Days 10-17): 8 exhibits
  - East Wing (Days 18-25): 8 exhibits
- **Fixed wing exhibit orientations**:
  - Left wall: rotate -PI/2 to transform -Z to +X
  - Right wall: rotate +PI/2 to transform -Z to -X
- **Added 4th wing (South Wing)**:
  - Houses Days 26-31 (6 exhibits)
  - Positioned at angle (southeast) off gallery
- **Implemented doorway signage**:
  - Signs above each wing entrance
  - Canvas texture with wing names
- **Improved screenshot capture**:
  - Switched from SwiftShader to EGL with Xvfb
  - Page screenshots instead of canvas element (avoids stability timeout)
- **Live artwork loading working**:
  - Days 1, 7, 11, 13 load actual p5 sketches in headless mode

**Tested**:
- All 31 days now have exhibit space
- Wing exhibits show colorful generative placeholders
- Gallery exhibits load live artwork
- Screenshots posted to PR #32

**Commits**:
- `5520ce2` - fix canvas orientation
- `7ca6c41` - add exhibit wing corridors
- `4ec131c` - fix wing exhibit orientation
- `0314acc` - add screenshots
- `596f19e` - add 4th wing and doorway signage
- `9e877df` - update screenshots

**Blockers**: None

**Next session**:
- Consider adding more live artwork loading (beyond Days 1, 7, 11, 13)
- Add ambient sound/music
- Improve navigation script to capture all exhibits clearly
- Add interaction with exhibits (click to view full screen?)

---

### 2026-01-29 — Live Artwork in Wings

**Beads worked**: None (autonomous improvements)

**Accomplished**:
- **Expanded live artwork loading to all wing exhibits**:
  - Wings now load actual p5.js sketches instead of just placeholders
  - 27+ days now display live generative artwork
  - Days 16, 17, 27, 31 use glsl/three modes (fallback to placeholder)
- **Added artwork loading infrastructure to wing.ts**:
  - Imported `getDayTexture` and `setFrameTexture`
  - Added `loadLiveArtwork` async function
  - Each exhibit loads placeholder immediately, then attempts live artwork
- **Console now shows live artwork loading for each day**:
  - `[Wing] Loaded live artwork for Day X` messages confirm loading

**Tested**:
- Build succeeds with no TypeScript errors
- Live artwork loads for most days (verified via console)
- North wing corridor screenshot shows colorful exhibits on both walls

**Screenshots**:
- `museum-north-wing-corridor.png` - View into north wing with exhibits
- `museum-gallery-with-artwork.png` - Gallery approach showing live exhibit

**Additional work in this session**:
- **Added dust motes floating in skylight beam**:
  - 200 particles slowly drifting upward in the gallery
  - Creates ethereal, liminal atmosphere
  - Particles contained within skylight cylinder area
- **Added teleport navigation (keys 1-5)**:
  - 1: Entrance, 2: Gallery center, 3: North wing, 4: West wing, 5: East wing
  - Useful for testing and quick exploration
- **Captured screenshot showing live artwork in wing corridor**:
  - North wing screenshot clearly shows colorful generative art in frames
  - Confirms artwork loading is working correctly

**Screenshots**:
- `museum-north-wing-artwork.png` - North wing corridor with visible live artwork

**Commits**:
- `306b0ce` - feat: expand live artwork loading to all wing exhibits
- `d83e55a` - feat: add atmospheric dust particles in gallery skylight
- `ed5b1d1` - feat: add teleport navigation with number keys 1-5
- `a52f8b9` - docs: add north wing screenshot showing live artwork

**Blockers**: None

**Next session**:
- Consider adding interactive elements (click to zoom)
- Add ambient sound/music
- Fix west wing teleport position (currently facing wall)
- Investigate loading GLSL shader days as static images

---

*Future sessions will be logged below by the Curator Agent.*
