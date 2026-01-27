# Museum Architecture Notes

This document captures architectural decisions and spatial design thinking for the Genuary 2026 Virtual Museum.

## Design Philosophy

The museum should feel like a **place you remember**, not a tech demo. Think of spaces that have stuck with you:
- The hush of a library reading room
- The unexpected courtyard in a city block
- The way light falls through a skylight onto a single object

We're not recreating the Louvre. We're building something intimate, surprising, and emotionally coherent.

---

## Spatial Principles

### 1. Human Scale
- Ceiling heights: 3-4 meters (residential feel, not cathedral)
- Doorways: 2.2 meters (just above head height)
- Art viewing distance: 1.5-3 meters typical
- Corridors: 2-3 meters wide (intimate, not grand)

### 2. Sightlines
- Always give visitors something to look toward
- Avoid dead ends that feel like mistakes
- Use light to draw attention

### 3. Pacing
- Alternate between movement and pause
- Create "breathing rooms" between intense pieces
- The journey should have rhythm

---

## Zone Concepts

*These are working concepts, not final plans. Evolve as needed.*

### Entry Sequence
The first 30 seconds set expectations. Consider:
- Starting in a small, comfortable space
- A single compelling visual that draws you forward
- The moment of "opening up" into the main space

### Transition Spaces
Corridors and thresholds are opportunities:
- A hallway with changing light
- A doorway that frames what's beyond
- A stairway that changes your perspective

### Destination Spaces
Rooms where you stop and absorb:
- Clear focal point
- Comfortable viewing position
- Reason to linger

---

## Day Integration Ideas

*Brainstorming how specific days might become architecture.*

### High Potential for Architecture
- **Day 17 (STARE)**: Already a hallway — natural entrance
- **Day 8 (City)**: Could be visible through windows
- **Day 9 (Automaton)**: Floor pattern, reactive to footsteps
- **Day 16 (Threshold)**: Ceiling/skylight shader
- **Day 15 (THERE)**: Entire room with presence

### Natural Frame Pieces
- **Day 7 (De Morgan)**: Mathematical, works well framed
- **Day 21 (Anschlag)**: Poster aesthetic, gallery wall
- **Day 22 (Weight)**: Drawing quality, intimate viewing

### Sculptural Potential
- **Day 11 (Fixed Point)**: Text floating in space
- **Day 12 (Fault)**: Already 3D, can be placed directly
- **Day 20 (Trace)**: Line sculpture

---

## Technical Decisions

### Scene Organization
```
Scene
├── Environment (lighting, skybox)
├── Architecture (static geometry)
│   ├── Floors
│   ├── Walls
│   ├── Ceilings
│   └── Trim/Details
├── Exhibits (day integrations)
│   ├── Framed (render to texture)
│   ├── Sculptural (3D objects)
│   └── Architectural (part of building)
├── Navigation (player, camera)
└── UI (menus, placards)
```

### LOD Strategy
- **Near (< 5m)**: Full detail, full animation
- **Medium (5-15m)**: Reduced animation, medium detail
- **Far (> 15m)**: Static snapshot
- **Out of view**: Suspended

### Collision
- Simple box colliders for walls
- Invisible barriers at edges
- Consider "soft" boundaries (you can push against them slightly)

---

## Open Questions

*To be resolved through building and testing.*

1. How do we handle day pieces that aren't done yet?
   - Placeholder frames? Fog? "Under construction" tape?

2. What's the audio strategy?
   - Ambient soundscape? Silence? Per-zone audio?

3. How do we handle VR vs desktop differently?
   - Same space, different interaction models?
   - Scale adjustments needed?

4. What happens when you "complete" the museum?
   - Return to entrance? Credits sequence? Loop?

---

## References & Inspiration

*Add links to spaces, art, games that inspire the museum feel.*

- [Add as discovered during research]

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-27 | Initial document created |
