# Depths - Ludum Dare 57 Game Specifications

## Game Overview

A whimsical game about navigating deep folder structures under time pressure. Players take on the role of an office worker who must find a specific file in a chaotic company server within a strict time limit.

## Core Concept

- **Theme Integration**: "Depths" is interpreted as navigating deep folder structures
- **Genre**: Casual / Time Management / Puzzle
- **Platform**: Web Browser
- **Technology**: Phaser 3 + Bun + Vite
- **Development Time**: 48-72 hours (Ludum Dare Jam)

## Specification Documents

| Domain | Description | Link |
|--------|-------------|------|
| Technical Setup | Development environment and build configuration | [Technical](specs/technical.md) |
| Game Design | Core gameplay mechanics and rules | [Game Design](specs/game-design.md) |
| UI/UX | User interface and experience design | [UI/UX](specs/ui-ux.md) |
| Assets | Graphics, sounds, and other assets | [Assets](specs/assets.md) |
| Content | Game text, folder structure, and file names | [Content](specs/content.md) |

## Minimum Viable Product

1. Desktop interface with two applications (Mail and Server)
2. Timer-based gameplay (60 seconds)
3. Clickable folder navigation
4. Win/lose conditions
5. Basic sound effects
6. Minimal but cohesive visual style

## Enhancements

| Enhancement | Description | Link |
|-------------|-------------|------|
| Consequences | Penalties and effects for wrong clicks | [Consequences](specs/enhancement-plan-consequences.md) |
| Progressive Difficulty | Level system and power-ups | [Progressive](specs/enhancement-plan-progressive.md) |
| Directory Structure | Deep, branching folder hierarchies | [Directory](specs/enhancement-plan-directory.md) |
| Easter Eggs | Hidden content and special interactions | [Easter Eggs](specs/enhancement-plan-easter-eggs.md) |
| Content Generation | Procedural content and file generation | [Content](specs/enhancement-plan-content.md) |
| Theme Generator | Dynamic company theme system | [Theme](specs/enhancement-plan-theme.md) |

## Workflow Enhancements

| Enhancement | Description | Link |
|-------------|-------------|------|
| Simple DevOps | GitHub Actions deployment to Pages | [DevOps](specs/devops-plan-simple.md) |

## Enhancement Priority

1. **Consequences System** (5 hours)
   - Immediate gameplay impact
   - Uses existing mechanics
   - Quick implementation

2. **Progressive Difficulty** (5 hours)
   - Builds on core timer
   - Adds replayability
   - Clear implementation path

3. **Directory Structure** (5 hours)
   - Expands core mechanic
   - Creates depth
   - Modular implementation

4. **Easter Eggs** (5 hours)
   - Adds fun factor
   - Independent development
   - Quick wins

5. **Content Generation** (5 hours)
   - Enhances replayability
   - Complex but modular
   - Backend focused

6. **Theme Generator** (5 hours)
   - Adds personality
   - Visual polish
   - Final enhancement
