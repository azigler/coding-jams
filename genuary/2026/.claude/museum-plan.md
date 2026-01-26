# Genuary 2026 Virtual Museum Plan

**Target:** Day 31 — Build a WebXR virtual museum showcasing all 31 days of generative art.

---

## The Vision

A 3D metaverse-like experience where visitors walk through a virtual museum. The art doesn't just hang on walls—**the art becomes the museum itself**.

- Day 17's hallway (STARE) becomes the entrance corridor
- Day 15's invisible creature (THERE) lurks in a cozy side room
- Wallpaper days tile the walls
- City days (Day 8) are visible through windows
- Shader days become ambient lighting or the sky
- The architecture itself is generated from the month's work

---

## Technical Stack

- **Three.js** — 3D rendering, scene graph, lighting
- **WebXR** — VR headset support (optional, fallback to WASD+mouse)
- **Existing Day Code** — Import and adapt, not recreate

### Entry Points

1. **Desktop:** WASD movement, mouse look
2. **Mobile:** Touch joystick, gyro look
3. **VR:** WebXR controllers and locomotion

---

## Museum Floor Plan

```
                              ┌─────────────────────────────────────────┐
                              │            THE SKY DOME                  │
                              │         (Day 16 THRESHOLD)               │
                              │    GLSL shader as ceiling/atmosphere     │
                              └─────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                                                                                   │
    │   ┌───────────┐     ┌───────────────────────┐     ┌───────────────────────┐     │
    │   │  COZY     │     │                       │     │      EVOLUTION        │     │
    │   │  ROOM     │     │    MAIN GALLERY       │     │         LAB           │     │
    │   │           │     │                       │     │                       │     │
    │   │ Day 15    │     │  Framed works:        │     │   Day 29 creatures    │     │
    │   │ THERE     │─────│  Days 7, 10, 13,      │─────│   in tanks            │     │
    │   │           │     │  18, 19               │     │                       │     │
    │   │ (hidden   │     │                       │     │   Interactive         │     │
    │   │ creature) │     │  Central sculpture:   │     │   evolution console   │     │
    │   └───────────┘     │  Day 11 (FIXED POINT) │     └───────────────────────┘     │
    │         │           │  Day 12 (FAULT)       │                 │                 │
    │         │           └───────────────────────┘                 │                 │
    │         │                       │                             │                 │
    │   ┌─────┴───────────────────────┴─────────────────────────────┴─────┐           │
    │   │                                                                   │           │
    │   │                    THE ENTRANCE HALLWAY                          │           │
    │   │                       (Day 17 STARE)                             │           │
    │   │                                                                   │           │
    │   │   Wall sconces, p4m wallpaper, low perspective spawn point       │           │
    │   │                                                                   │           │
    │   └───────────────────────────────────────────────────────────────────┘           │
    │         │                       │                             │                 │
    │   ┌─────┴─────┐           ┌─────┴─────┐               ┌───────┴───────┐         │
    │   │           │           │           │               │               │         │
    │   │ WINDOWS   │           │ AUTOMATON │               │   POSTER      │         │
    │   │ GALLERY   │           │ CHAMBER   │               │   GALLERY     │         │
    │   │           │           │           │               │               │         │
    │   │ Day 8     │           │ Day 9     │               │ Day 21        │         │
    │   │ CITY      │           │ FEVER     │               │ Bauhaus       │         │
    │   │ BREATHES  │           │ DREAM     │               │ posters       │         │
    │   │           │           │           │               │               │         │
    │   │ (skybox   │           │ (floor    │               │ Day 22        │         │
    │   │  outside) │           │  pattern) │               │ Pen plotter   │         │
    │   │           │           │           │               │ works         │         │
    │   └───────────┘           └───────────┘               └───────────────┘         │
    │                                                                                   │
    │   ┌───────────────────────────────────────────────────────────────────┐         │
    │   │                      RECURSION ROOM                                │         │
    │   │                                                                    │         │
    │   │   Day 19 WITHIN as infinite zoom portal                           │         │
    │   │   Day 26 Recursive grids as floor/ceiling                         │         │
    │   │   Day 30 Bug/Feature as glitch decorations                        │         │
    │   │                                                                    │         │
    │   └───────────────────────────────────────────────────────────────────┘         │
    │                                                                                   │
    │   ┌───────────────────────────────────────────────────────────────────┐         │
    │   │                    TRANSPARENCY CHAMBER                            │         │
    │   │                                                                    │         │
    │   │   Day 23 Transparency: layered glass panels                       │         │
    │   │   Day 25 Organic Geometry: sculptural furniture                   │         │
    │   │   Day 27 Lifeform: growing on glass walls                         │         │
    │   │                                                                    │         │
    │   └───────────────────────────────────────────────────────────────────┘         │
    │                                                                                   │
    └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Per-Day Integration Notes (Days 7-20)

### Day 7: DE MORGAN'S MIRROR (Boolean Algebra)
- **Display Type:** Framed wall art (split-screen works well on a wall)
- **Display Size:** 2m x 2m (large enough to see both sides)
- **Zone:** Main Gallery
- **Integration Notes:**
  - Use the De Morgan mode (operation=5) for the museum display
  - Animated: YES - the waves should flow
  - Consider placing near Day 10 for "mathematical art" grouping
  - Placard should explain De Morgan's laws for context
- **Performance:** Low impact (pixel shaders are efficient)

### Day 8: CITY BREATHES (Metropolis)
- **Display Type:** Window view / Skybox
- **Display Size:** N/A - becomes the outside world
- **Zone:** Windows Gallery
- **Integration Notes:**
  - **ARCHITECTURAL CANDIDATE** - render as exterior view through windows
  - The breathing windows at night create perfect "outside" atmosphere
  - Could tile multiple instances for a wraparound city view
  - Animated: YES - essential for breathing effect
  - The moon and stars provide ambient lighting reference
- **Performance:** Medium (many windows animating)
- **Technical Challenge:** Need to render to a cubemap or use as a 2D backdrop through windows

### Day 9: FEVER DREAM (Cellular Automaton)
- **Display Type:** Floor pattern OR interactive terminal
- **Display Size:** Variable (room-sized floor pattern OR terminal display)
- **Zone:** Automaton Chamber
- **Integration Notes:**
  - **ARCHITECTURAL CANDIDATE** - could be the floor of a chamber
  - The fire/ice/ash colors create dramatic ground surface
  - Alternatively: place as an interactive wall display
  - Animated: YES - the fever cycles are the point
  - Consider using it as a "warning floor" near the entrance (heat = danger)
- **Performance:** High (full grid simulation per frame)
- **Technical Challenge:** Running CA simulation in 3D context

### Day 10: PHYLLOTAXIS CATHEDRAL (Polar Coordinates)
- **Display Type:** Framed art OR ceiling dome pattern
- **Display Size:** 2m x 2m framed, OR dome ceiling
- **Zone:** Main Gallery or Cathedral dome
- **Integration Notes:**
  - The golden spiral pattern could be a skylight or dome ceiling
  - If framed: use the golden palette (colorMode: 0)
  - Animated: YES - gentle rotation reveals Fibonacci spirals
  - Natural partner with Day 7 for "mathematical beauty" section
- **Performance:** Medium (many seed elements)

### Day 11: FIXED POINT (Quine)
- **Display Type:** Floating text sculpture
- **Display Size:** 1.5m x 1.5m x 0.2m (floating panel)
- **Zone:** Main Gallery - central sculpture pedestal
- **Integration Notes:**
  - A true quine deserves a pedestal position
  - The rainbow text renders well as a floating panel
  - Static display (the code itself IS the art)
  - Animated: NO - but could have subtle glow pulse
  - Consider making it slightly translucent so visitors can walk around
- **Performance:** Very low (static text rendering)

### Day 12: FAULT (Boxes)
- **Display Type:** 3D sculpture
- **Display Size:** 2m x 2m x 2m (floating in space)
- **Zone:** Main Gallery - sculpture area
- **Integration Notes:**
  - **PERFECT FOR 3D INTEGRATION** - already Three.js/WEBGL
  - The fracturing cube should float in the center of a room
  - Visitors can walk around it during the fracture/heal cycle
  - Animated: YES - the cycle is the experience
  - Light cream background in original matches museum aesthetic
- **Performance:** Low-Medium (27 box fragments)
- **Technical Advantage:** Already in Three.js - easiest integration

### Day 13: SOMEONE (Self Portrait)
- **Display Type:** Framed portrait
- **Display Size:** 1m x 1m (intimate viewing)
- **Zone:** Main Gallery - portrait section
- **Integration Notes:**
  - Faces emerging from noise need attention to watch
  - Place at eye level for emotional connection
  - Animated: YES - the emergence/dissolution is essential
  - Consider placing alone on a wall for contemplation
- **Performance:** Medium (particle system)

### Day 15: THERE (Invisible Creature)
- **Display Type:** Room installation
- **Display Size:** Entire room (3m x 3m)
- **Zone:** Cozy Room (dedicated space)
- **Integration Notes:**
  - **ARCHITECTURAL CANDIDATE** - becomes an ENTIRE ROOM
  - The shadow on the wall, cookies on plate, footprints on floor
  - Visitors enter a warm room and notice the creature's presence
  - Place cookies on a 3D plate, footprints appear on the floor
  - The shadow must be cast on the room's actual wall geometry
  - Mouse/controller interaction should work (creature responds to visitor)
  - Animated: YES - creature behavior is the experience
- **Performance:** Medium (shadow animation, dust particles)
- **Technical Challenge:** Projecting 2D shadow behavior onto 3D room geometry

### Day 16: THRESHOLD (Order/Disorder)
- **Display Type:** Architectural - ceiling/sky dome
- **Display Size:** Entire museum ceiling
- **Zone:** Sky Dome (overhead environment)
- **Integration Notes:**
  - **ARCHITECTURAL CANDIDATE** - becomes the SKY
  - The order/disorder boundary creates a dynamic ceiling
  - The blue (order) and orange (disorder) zones provide ambient lighting
  - Animated: YES - the shifting boundary is mesmerizing from below
  - Consider using it as a directional indicator (order=calm, disorder=exciting areas)
- **Performance:** Medium (GLSL shader - GPU efficient)
- **Technical Advantage:** Already GLSL - can render to a skybox texture

### Day 17: STARE (Wallpaper Group)
- **Display Type:** Architectural - entrance hallway
- **Display Size:** 3m wide x 25m long x 3m high
- **Zone:** Entrance Hallway (primary architecture)
- **Integration Notes:**
  - **ARCHITECTURAL FOUNDATION** - the museum's entrance IS this piece
  - Already Three.js - direct integration possible
  - The p4m wallpaper tiles the walls
  - Wall sconces provide warm lighting
  - Low camera spawn point creates the childhood memory effect
  - Visitors spawn here and walk toward the light
  - Animated: YES - subtle light flicker
- **Performance:** Low (static geometry with point lights)
- **Technical Advantage:** Already Three.js with proper lighting, fog, textures

### Day 18: LAST (Unexpected Path)
- **Display Type:** Floor pattern OR framed art
- **Display Size:** 2m x 2m (wall) or room-sized floor
- **Zone:** Main Gallery OR Automaton Chamber floor
- **Integration Notes:**
  - Self-avoiding walks create beautiful accumulated patterns
  - Could be the floor pattern in the Automaton Chamber (replacing Day 9)
  - Alternatively: frame the final accumulated path as wall art
  - Animated: YES during accumulation, then static when complete
  - The "graveyard of paths" metaphor works well in a museum context
- **Performance:** Low-Medium (path rendering)

### Day 19: WITHIN (16x16 Fractal)
- **Display Type:** Portal / Window to infinity
- **Display Size:** 2m x 2m (but appears infinite)
- **Zone:** Recursion Room - central feature
- **Integration Notes:**
  - The infinite zoom creates a "portal" effect
  - Frame it as a window into another dimension
  - Visitors lean in and get lost in the recursion
  - Animated: YES - the zoom is the experience
  - Consider adding depth effect (zoom into the screen as visitors approach)
- **Performance:** Medium (multi-level buffer rendering)

### Day 20: TRACE (One Line)
- **Display Type:** 3D line sculpture OR framed drawing
- **Display Size:** 1.5m x 1.5m (framed) OR 3D space
- **Zone:** Main Gallery
- **Integration Notes:**
  - The seeking creature's trace could be extruded into 3D
  - As a 2D work: frame the accumulated line drawing
  - As a 3D work: the line floats in space, creature still seeking
  - The attractor could be the visitor's position
  - Animated: YES - the search IS the art
- **Performance:** Low (single path rendering)

---

## Upcoming Days (21-31) - Suggested Roles

| Day | Prompt | Suggested Display | Museum Role |
|-----|--------|-------------------|-------------|
| 21 | Bauhaus Poster | Framed posters | Poster Gallery walls - multiple posters |
| 22 | Pen Plotter | Framed drawings | Poster Gallery - archival section |
| 23 | Transparency | Glass panels | Transparency Chamber walls |
| 24 | Perfectionist's Nightmare | Glitch display | Recursion Room glitches |
| 25 | Organic Geometry | 3D sculpture | Transparency Chamber furniture |
| 26 | Recursive Grids | Floor/ceiling | Recursion Room architecture |
| 27 | Lifeform | Wall growth | Transparency Chamber - organic walls |
| 28 | HTML Only | Meta exhibit | Special browser-in-museum display |
| 29 | Genetic Evolution | Tank exhibits | Evolution Lab - main feature |
| 30 | Bug/Feature | Glitch effects | Throughout museum - intentional bugs |
| 31 | GLSL | Everything | Sky, ambient, final integration |

---

## Museum Zones and Emotional Flow

### Zone 1: THE ENTRANCE (Day 17)
**Emotion:** Wonder, memory, vulnerability
- Visitors spawn low to the ground in a warm hallway
- Sconces illuminate patches of wallpaper
- The feeling of being small in a big space
- Walk toward the light at the end

### Zone 2: MAIN GALLERY (Central hub)
**Emotion:** Discovery, contemplation
- High ceiling reveals the sky dome (Day 16)
- Central sculptures: Day 11 (quine) and Day 12 (fracturing cube)
- Framed works: Days 7, 10, 13, 18/20
- Multiple exits to other zones

### Zone 3: THE COZY ROOM (Day 15)
**Emotion:** Warmth, recognition, presence
- Small side room with warm lighting
- Cookies on a plate, dust in sunbeams
- Something is here with you
- The shadow waves, hops, peeks

### Zone 4: WINDOWS GALLERY (Day 8)
**Emotion:** Vastness, solitude, urban poetry
- Windows overlooking the breathing city
- Night sky with stars and moon
- Thousands of tiny lives behind glass
- A meditation on distance

### Zone 5: AUTOMATON CHAMBER (Day 9)
**Emotion:** Chaos, pattern, fever
- Floor alive with cellular fire
- The fever dream spreading beneath your feet
- Cool blue to hot white to ash
- Rebirth flickers of green

### Zone 6: POSTER GALLERY (Days 21, 22)
**Emotion:** Precision, craft, history
- Bauhaus-inspired posters on clean walls
- Pen plotter drawings in archival frames
- A celebration of deliberate design
- Gallery lighting, quiet contemplation

### Zone 7: RECURSION ROOM (Days 19, 26, 30)
**Emotion:** Vertigo, infinity, playful unease
- The infinite zoom portal (Day 19)
- Recursive grid floor and ceiling (Day 26)
- Intentional glitches as decoration (Day 30)
- Getting lost in layers

### Zone 8: TRANSPARENCY CHAMBER (Days 23, 25, 27)
**Emotion:** Growth, transformation, organic beauty
- Glass walls with layered transparency
- Organic geometry furniture to sit on
- Lifeforms growing on surfaces
- Light filtering through layers

### Zone 9: EVOLUTION LAB (Day 29)
**Emotion:** Life, competition, emergence
- Creatures evolving in tank displays
- Interactive console to guide evolution
- The drama of survival and adaptation
- Scientific wonder

---

## Museum Checklist for Day 31 Agent

### IMMEDIATE IMPORTS (Already Three.js)

- [ ] **Day 17 (STARE):** Direct import - becomes entrance hallway
  - Copy hallway geometry, lighting, wallpaper texture generation
  - Adjust scale to fit museum dimensions
  - Add doorways to other zones

- [ ] **Day 12 (FAULT):** Direct import - becomes central sculpture
  - Copy fragment generation and animation
  - Position in main gallery center
  - May need lighting adjustments

### TEXTURE/SHADER IMPORTS

- [ ] **Day 16 (THRESHOLD):** Render to skybox texture
  - Create a cube map or hemisphere texture
  - Apply as museum ceiling/sky
  - Controls: static snapshot or animated

- [ ] **Day 9 (FEVER DREAM):** Render to floor texture
  - Create an animated floor texture for Automaton Chamber
  - Need to port CA simulation to run in museum context
  - Or: pre-render animation frames as a texture atlas

- [ ] **Day 7 (DE MORGAN'S MIRROR):** Render to canvas for framed display
  - Create a 2D canvas texture
  - Apply to a framed plane in Main Gallery
  - Animate the waves

### 2D-TO-3D ADAPTATIONS

- [ ] **Day 15 (THERE):** Adapt shadow system to 3D room
  - Room geometry: walls, floor, ceiling
  - Project shadow behavior onto wall plane
  - 3D cookies, footprints, dust particles
  - Mouse/controller for creature interaction

- [ ] **Day 8 (CITY BREATHES):** Render as window view
  - Create window geometry with city backdrop
  - Either cubemap or 2D parallax layers
  - Animated breathing windows

- [ ] **Day 19 (WITHIN):** Create portal frame
  - Render fractal zoom to a texture
  - Display on a framed portal
  - Potentially add depth-based zoom speed

### FRAMED WORKS (Standard 2D-to-3D)

- [ ] Day 7: Boolean waves on framed canvas
- [ ] Day 10: Phyllotaxis on framed canvas or dome
- [ ] Day 11: Quine text on floating panel
- [ ] Day 13: Face dissolution on portrait frame
- [ ] Day 18 or 20: Path drawing on framed canvas

### NEW BUILDS (Days 21-30 Pending)

These will need to be built with museum integration in mind:
- [ ] Day 21: Bauhaus posters (framed)
- [ ] Day 22: Pen plotter works (framed)
- [ ] Day 23: Glass panel geometry
- [ ] Day 24: Glitch effects system
- [ ] Day 25: Organic furniture meshes
- [ ] Day 26: Recursive grid shader
- [ ] Day 27: Growing lifeform system
- [ ] Day 28: Browser-in-museum display
- [ ] Day 29: Evolution tank system
- [ ] Day 30: Bug/feature glitch decorations

### INFRASTRUCTURE NEEDS

- [ ] **Navigation system:** WASD + mouse look
- [ ] **Collision detection:** Walls, furniture, exhibits
- [ ] **Placard system:** Text displays near each exhibit
- [ ] **Lighting system:** Ambient + point lights per zone
- [ ] **Zone transitions:** Doorways, corridors, line of sight
- [ ] **Performance LOD:** Disable distant animations
- [ ] **Optional WebXR:** VR controller support

### PERFORMANCE BUDGET

Target: 60fps on mid-range hardware (GTX 1060 / M1 Mac)

| Component | Budget |
|-----------|--------|
| Total draw calls | < 500 |
| Total triangles | < 500K |
| Active animations | < 5 simultaneously |
| Texture memory | < 256MB |
| Shader complexity | LOD by distance |

**LOD Strategy:**
- **Near (< 5m):** Full animation, full detail
- **Medium (5-15m):** Reduced animation, medium detail
- **Far (> 15m):** Static snapshot, low detail
- **Out of view:** Suspended entirely

---

## Visitor Journey

### The Intended Path

1. **SPAWN** in entrance hallway (Day 17) - low perspective, warm light
2. **WALK** toward the light, notice the wallpaper
3. **EMERGE** into Main Gallery, ceiling reveals (Day 16)
4. **DISCOVER** central sculptures (Days 11, 12)
5. **NOTICE** doorway to Cozy Room - something catches your eye
6. **ENTER** Cozy Room (Day 15) - realize you're not alone
7. **RETURN** to Main Gallery, explore framed works
8. **FIND** Windows Gallery (Day 8) - the city outside
9. **DESCEND** to Automaton Chamber (Day 9) - the floor is alive
10. **ASCEND** to Poster Gallery - calm after chaos
11. **ENTER** Recursion Room - vertigo and infinity
12. **DISCOVER** Transparency Chamber - organic beauty
13. **END** at Evolution Lab - life finds a way

### Emotional Arc

```
WONDER (hallway) -> DISCOVERY (gallery) -> WARMTH (cozy room) ->
CONTEMPLATION (windows) -> CHAOS (automata) -> PRECISION (posters) ->
VERTIGO (recursion) -> GROWTH (transparency) -> LIFE (evolution)
```

---

## Technical Challenges

### 1. Animated Pieces in Museum Context

**Problem:** Multiple animated pieces running simultaneously could tank performance.

**Solution:**
- Only animate pieces visible to camera (frustum culling)
- Reduce update frequency for distant pieces
- Use LOD textures for non-interactive exhibits
- Pre-render some animations as video textures

### 2. Day 15 Shadow Projection

**Problem:** The shadow creature was designed for 2D canvas. Need to project onto 3D wall.

**Solution:**
- Render shadow to a texture
- Apply texture to wall plane in the Cozy Room
- Calculate shadow position based on "creature" position (invisible in 3D)
- Footprints become decals on floor mesh

### 3. Day 8 City as Exterior

**Problem:** The city was a 2D layered scene. Need to make it feel like an outside view.

**Solution:**
- Render city layers to parallax planes
- Place behind window geometry with slight depth
- Or: render to cubemap for full 360 exterior
- Animate breathing windows on textures

### 4. GLSL Shaders in Three.js

**Problem:** Day 16 is pure GLSL. Need to integrate with Three.js.

**Solution:**
- Use Three.js ShaderMaterial
- Pass uniforms from museum controls
- Render to a skybox texture (CubeCamera or Equirectangular)
- Or: apply directly to ceiling geometry

### 5. Interaction Transfer

**Problem:** Many pieces respond to mouse. In 3D, mouse doesn't map directly.

**Solution:**
- Raycast from camera center (where visitor looks)
- Or: use controller position in VR
- Or: disable interaction for some exhibits
- Day 15 could respond to visitor proximity instead of cursor

---

## Updates Log

| Date | Day | Update |
|------|-----|--------|
| 2026-01-21 | — | Initial plan created |
| 2026-01-21 | — | Expanded with floor plan, per-day integration notes, checklist, visitor journey |
| 2026-01-21 | 21 | ANSCHLAG: Four cycling Bauhaus poster compositions. Same primitives (circle, triangle, rectangles), four arrangements. Demonstrates composition as meaning. Can serve as multiple poster frames or tiled wallpaper in Poster Gallery. |
| 2026-01-22 | 22 | WEIGHT: Pen plotter-ready adaptive hatching. A form emerges from thousands of parallel strokes—no outline, no fill, only density variation. Genuinely plotter-ready SVG export. Framed in Poster Gallery as archival drawing. Hatching pattern could also tile as architectural wall texture. |
| 2026-01-23 | 23 | LAMINAE: Thin colored sheets drift through the same space. Blend modes (multiply, screen, overlay) create color emergence at overlaps. X-junction visual cues trigger perceptual depth—your brain insists shapes are at different depths, but they're flat. Can become the glass walls of the Transparency Chamber. After Moholy-Nagy and Albers. |
| 2026-01-24 | 24 | ALMOST: A grid of identical elements where every element is slightly wrong—rotated 0-3°, shifted 0-3px, sized wrong by 0-3%. No single element is identifiably wrong; all are. Creates the "Not Just Right Experience" that drives perfectionist anxiety. Framed in Main Gallery among "proper" art—the wrongness should be discovered, not announced. Static display rewards close inspection. |
| 2026-01-26 | 26 | ZONING: Isometric city that builds itself. Each recursive subdivision creates a new building block. Recursion depth = building height. Downtown towers emerge where algorithm runs deepest. Warm terracotta palette. Can display as floor diorama (looking down at growing city), table sculpture, or wall projection. The city doesn't ask permission—it just builds. After recursive subdivision of urban space and Zipf's law. |

---

*The museum isn't built on Day 31. It's built every day, one exhibit at a time.*
