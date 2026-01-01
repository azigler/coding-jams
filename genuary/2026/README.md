# Genuary 2026

Daily generative art challenge for January 2026. This project contains 31 days of creative coding prompts, with each day implemented as a modular TypeScript module.

- **Demo:** [Explore all 31 days](https://azigler.github.io/coding-jams/genuary-2026/)

## What is Genuary?

[Genuary](https://genuary.art/) is an annual, month-long creative coding challenge where artists create generative art daily based on specific prompts. It's a celebration of algorithmic art, creative coding, and the vibrant community of generative artists worldwide.

## Tech Stack

### Primary: **p5.js** with **TypeScript**

We've chosen **p5.js** as the primary framework for this project because:

- **Beginner-friendly**: Designed for artists and creative coders, not just engineers
- **Versatile**: Excellent for 2D graphics, can handle 3D, and supports custom shaders
- **Rich ecosystem**: Extensive examples, tutorials, and community resources
- **TypeScript support**: Great type definitions available (`@types/p5`)
- **Quick iteration**: Perfect for daily creative coding challenges

### Build Tool: **Vite**

- Fast hot module replacement for quick iteration
- Excellent TypeScript support out of the box
- Modern ES modules
- Simple configuration

### Why Not Three.js or Vanilla WebGL?

While we could use Three.js (more powerful for 3D) or vanilla WebGL (most control), p5.js is the best choice for:

1. **Learning curve**: As a first-time Genuary participant, p5.js has the gentlest learning curve
2. **Prompt variety**: Most Genuary prompts work great in 2D with p5.js
3. **Speed**: You can quickly prototype ideas without wrestling with WebGL boilerplate
4. **Flexibility**: When you need 3D (Day 8 "A City", Day 15 shadows), p5.js has WebGL support. When you need shaders (Day 31), p5.js supports custom shaders. When you need HTML-only (Day 28), the architecture supports it.

**Note**: You can always add Three.js or vanilla WebGL later if a specific prompt calls for it!

## Project Structure

```
genuary/2026/
├── src/
│   ├── days/          # 31 day modules (01.ts - 31.ts)
│   ├── utils/         # Shared utility functions
│   ├── types.ts       # TypeScript type definitions
│   └── index.ts       # Main loader/orchestrator
├── index.html         # Shell page that loads any day
├── package.json
├── tsconfig.json
├── vite.config.ts
└── prompts.md         # All 31 prompts for reference
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev
```

1. Open your browser to `http://localhost:3000`

The app will automatically load today's prompt (if it's January) or Day 1 by default. Use the navigation controls to switch between days.

The app will automatically load today's prompt (if it's January) or Day 1 by default. Use the navigation controls to switch between days.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## How to Work on a Day

Each day is a separate TypeScript file in `src/days/`. Here's the structure:

```typescript
import type { DayConfig } from '../types';
import { createCanvas } from '../utils/canvas';

const config: DayConfig = {
  day: 1,
  prompt: 'One color, one shape.',
  credit: 'Piero',
  
  setup: (p: p5) => {
    createCanvas(p);
    p.background(240);
    p.noLoop(); // Use if you want a static image
  },
  
  draw: (p: p5) => {
    // Your creative code here!
    p.fill(100, 150, 255);
    p.noStroke();
    p.circle(p.width / 2, p.height / 2, 200);
  }
};

export default config;
```

### Available p5.js Functions

The `DayConfig` type supports these optional functions:

- `setup(p: p5)` - Called once at the start
- `draw(p: p5)` - Called every frame (for animations)
- `windowResized(p: p5)` - Called when window is resized
- `mousePressed(p: p5)` - Called on mouse click
- `keyPressed(p: p5)` - Called on key press

### Utilities

Check out `src/utils/` for helper functions:

- **canvas.ts**: Canvas creation utilities
- **colors.ts**: Color manipulation helpers

## Learning Resources

### p5.js

- [p5.js Official Documentation](https://p5js.org/reference/)
- [p5.js Learn Page](https://p5js.org/learn/)
- [The Coding Train - p5.js Tutorials](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6Zy51Q-x9tMWIv9cueOFTFA)

### Generative Art

- [Genuary Official Site](https://genuary.art/)
- [Creative Coding Best Practices](https://github.com/terkelg/awesome-creative-coding)
- [The Book of Shaders](https://thebookofshaders.com/) - Great for Day 31!

### The Artists Behind the Prompts

All prompts are credited to amazing generative artists. Explore their work:

- [Piero](https://pifragile.com/) - Days 1, 5, 21, 26, 28, 31
- [PaoloCurtoni](https://www.paolocurtoni.com/) - Days 3, 7, 8, 9, 23
- [Sophia (fractal kitty)](https://www.fractalkitty.com/) - Days 10, 22, 24
- [Manuel Larino](https://mlarino.com/) - Days 4, 11, 25, 27
- And many more! Check `prompts.md` for all credits.

## Special Days

Some days have special requirements:

- **Day 28**: HTML elements only - no canvas, no libraries (handled specially in the loader)
- **Day 31**: GLSL shaders only - p5.js has shader support, or use vanilla WebGL

## Recording Animations as GIFs

Each day can record its animation as a GIF using `gif.js`, which works entirely in the browser - no server needed!

### How It Works

1. **Click "Download Timelapse"**: This restarts the animation and records it frame-by-frame
2. **Automatic Compilation**: Frames are compiled to GIF in the browser using Web Workers
3. **Automatic Download**: The GIF downloads automatically when encoding completes

### Recording Configuration

```typescript
recording: {
  enabled: true,
  duration: 8, // seconds
  filename: 'genuary-2026-day-01'
}
```

### Download Buttons

- **Download Image**: Saves the final/complete artwork as a high-res PNG
- **Download Timelapse**: Records the animation and downloads it as a GIF

The timelapse button will show "⏹️ Recording..." while capturing, then automatically download the GIF when done.

## Tips for First-Time Participants

1. **Start simple**: Don't feel pressured to make something complex. Many beautiful pieces are elegantly simple.

2. **Iterate quickly**: The daily format rewards quick iteration. Get something working, then refine.

3. **Reference other art**: Look at how other artists have interpreted similar prompts. (But make it your own!)

4. **Learn as you go**: Each prompt is a learning opportunity. If you don't know how to do something, that's the perfect time to learn.

5. **Share your work**: Tag it #genuary2026 on social media and share with the community!

6. **Have fun**: The goal is creative exploration and learning, not perfection.

## License

MIT License - feel free to use this structure for your own Genuary projects!

## Acknowledgments

All prompts are from [genuary.art](https://genuary.art/) and are credited to their respective artists. This is a learning project to participate in the Genuary 2026 challenge.
