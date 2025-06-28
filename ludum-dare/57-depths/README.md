# Depths - Ludum Dare 57

> [!NOTE]
> April 4–7, 2025 (72 hours)

- **Demo:** [Play the latest version](https://azigler.github.io/coding-jams)
- **Source:** [Read the source code](https://github.com/azigler/coding-jams/tree/main/ludum-dare/57-depths)
- **Ludum Dare Entry:** [View on LDJam](https://ldjam.com/events/ludum-dare/57/folder-depth)

---

A game about navigating deep folder structures under time pressure. Players take on the role of an office worker who must find a specific file in a chaotic company server within a strict time limit.

## Game Design

- **Theme**: "Depths" interpreted as navigating deep folder structures
- **Genre**: Casual / Time Management / Puzzle
- **Platform**: Web Browser
- **Technology**: Phaser 3 + Bun + Vite

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

### Building

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
