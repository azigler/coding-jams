# Depths - Ludum Dare 57

A whimsical game about navigating deep folder structures under time pressure. Players take on the role of an office worker who must find a specific file in a chaotic company server within a strict time limit.

## Development

### Prerequisites

- [Bun](https://bun.sh/) 1.0+

### Setup

1. Clone the repository
2. Navigate to the project directory:

   ```bash
   cd ludum-dare/57-depths
   ```

3. Install dependencies:

   ```bash
   bun install
   ```

4. Start development server:

   ```bash
   bun run dev
   ```

## Building

To create a production build:

```bash
bun run build
```

The build output will be in the `dist` directory.

## Project Structure

```plaintext
src/
  scenes/          # Game scenes
  components/      # UI components
  utils/          # Utility functions
  assets/         # Game assets
  config.ts       # Game configuration
  main.ts         # Entry point
```

## Game Design

- **Theme**: "Depths" interpreted as navigating deep folder structures
- **Genre**: Casual / Time Management / Puzzle
- **Platform**: Web Browser
- **Technology**: Phaser 3 + Bun + Vite

## Features

1. Desktop interface with two applications (Mail and Server)
2. Timer-based gameplay (60 seconds)
3. Clickable folder navigation
4. Win/lose conditions
5. Basic sound effects
6. Minimal but cohesive visual style

## License

This project is part of the Ludum Dare 57 game jam.
