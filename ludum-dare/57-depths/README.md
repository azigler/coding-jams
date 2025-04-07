# Depths - Ludum Dare 57

A whimsical game about navigating deep folder structures under time pressure. Players take on the role of an office worker who must find a specific file in a chaotic company server within a strict time limit.

## Play Now

🎮 [Play the latest version on GitHub Pages](https://azigler.github.io/coding-jams)

## Development

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/azigler/coding-jams.git
   cd coding-jams/ludum-dare/57-depths
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:5173> in your browser

## Building

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

### Deployment

The game is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment process:

1. Runs TypeScript compilation
2. Builds the project with Vite
3. Uploads the build artifact
4. Deploys to GitHub Pages

Manual deployment can be triggered from the Actions tab in the GitHub repository.

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
