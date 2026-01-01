# Quick Start Guide

## Installation & Running

```bash
cd genuary/2026
npm install
npm run dev
```

The app will open at `http://localhost:3000` and automatically load today's prompt (if it's January) or Day 1.

## Working on a Day

1. Open `src/days/XX.ts` (where XX is the day number, 01-31)
2. Replace the TODO comment in the `draw` function with your creative code
3. Save and see your changes instantly with hot reload!

## Example: Day 1 Implementation

Here's a simple example for Day 1 ("One color, one shape"):

```typescript
draw: (p: p5) => {
  p.background(240);
  p.fill(100, 150, 255);
  p.noStroke();
  p.circle(p.width / 2, p.height / 2, 200);
}
```

## Key p5.js Functions You'll Use

- `p.background(color)` - Set background color
- `p.fill(color)` - Set fill color
- `p.stroke(color)` - Set stroke (outline) color
- `p.noStroke()` / `p.noFill()` - Disable stroke/fill
- `p.circle(x, y, diameter)` - Draw a circle
- `p.rect(x, y, width, height)` - Draw a rectangle
- `p.line(x1, y1, x2, y2)` - Draw a line
- `p.width` / `p.height` - Canvas dimensions
- `p.mouseX` / `p.mouseY` - Mouse position
- `p.random(min, max)` - Random number
- `p.map(value, start1, stop1, start2, stop2)` - Map a value from one range to another

## Tips

- Use `p.noLoop()` in setup for static images
- Remove `p.noLoop()` to enable animations
- Use `p.frameCount` for time-based animations
- Check `prompts.md` for the full prompt text and credits

For more p5.js help, see: https://p5js.org/reference/
