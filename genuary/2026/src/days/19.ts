/**
 * Day 19: "WITHIN"
 *
 * 16x16 — but infinite.
 *
 * A 16x16 pixel heart that zooms out infinitely, creating a fractal
 * where the pattern tiles into itself. Uses cached buffers to avoid
 * recursive rendering overhead.
 *
 * The trick: pre-render the heart at multiple detail levels, then
 * composite them during the zoom animation.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// THE 16x16 PATTERN - A SMILEY FACE
// ============================================================================

const PATTERN: number[][] = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
];

// ============================================================================
// COLORS
// ============================================================================

interface ColorPalette {
  background: [number, number, number];
  heart: [number, number, number];
}

const PALETTES: ColorPalette[] = [
  { background: [30, 30, 40], heart: [255, 220, 60] },    // Yellow on dark
  { background: [245, 245, 240], heart: [255, 180, 0] },  // Orange on cream
  { background: [20, 25, 35], heart: [100, 220, 255] },   // Cyan on dark
  { background: [240, 235, 250], heart: [180, 100, 220] }, // Purple on light
  { background: [25, 35, 25], heart: [120, 255, 120] },   // Green on dark
];

// ============================================================================
// BUFFER MANAGEMENT
// ============================================================================

interface FractalBuffers {
  // Level 0: simple 16x16 heart (solid colors)
  // Level 1: 16x16 where each heart pixel contains level 0
  // Level 2: 16x16 where each heart pixel contains level 1
  levels: any[]; // p5.Graphics[]
  palette: ColorPalette;
  size: number;
}

function createHeartBuffer(
  p: p5,
  size: number,
  palette: ColorPalette,
  innerBuffer: any | null
): any {
  const buffer = p.createGraphics(size, size);
  const cellSize = size / 16;

  buffer.noStroke();

  for (let py = 0; py < 16; py++) {
    for (let px = 0; px < 16; px++) {
      const isHeart = PATTERN[py][px] === 1;
      const x = px * cellSize;
      const y = py * cellSize;

      if (isHeart && innerBuffer) {
        // Draw the inner buffer (fractal recursion)
        buffer.image(innerBuffer, x, y, cellSize, cellSize);
      } else {
        // Draw solid color
        const color = isHeart ? palette.heart : palette.background;
        buffer.fill(color[0], color[1], color[2]);
        buffer.rect(x, y, cellSize + 1, cellSize + 1);
      }
    }
  }

  return buffer;
}

function createFractalBuffers(p: p5, palette: ColorPalette): FractalBuffers {
  const baseSize = 512; // Size of each buffer
  const levels: any[] = [];

  // Level 0: Simple solid heart
  levels[0] = createHeartBuffer(p, baseSize, palette, null);

  // Level 1: Heart made of level 0 hearts
  levels[1] = createHeartBuffer(p, baseSize, palette, levels[0]);

  // Level 2: Heart made of level 1 hearts
  levels[2] = createHeartBuffer(p, baseSize, palette, levels[1]);

  // Level 3: Heart made of level 2 hearts (max detail)
  levels[3] = createHeartBuffer(p, baseSize, palette, levels[2]);

  return { levels, palette, size: baseSize };
}

// ============================================================================
// RENDERING
// ============================================================================

function drawFractalZoom(
  p: p5,
  buffers: FractalBuffers,
  canvasSize: number,
  zoomProgress: number // 0 to 1, where 1 = zoomed out by 16x
): void {
  const palette = buffers.palette;
  p.background(palette.background[0], palette.background[1], palette.background[2]);

  // INFINITE ZOOM:
  // At zoomProgress=0: One heart fills the canvas (centered, red in middle)
  // As we zoom out: That heart shrinks, surrounded by other hearts in heart pattern
  // At zoomProgress=1: Pattern is 1/16th size, loops back to look like zoomProgress=0

  // Scale: 1 = fills canvas, 1/16 = one level out
  const scale = Math.pow(1 / 16, zoomProgress);

  // Size of one heart unit at current zoom
  const unitSize = canvasSize * scale;

  // Use level 0 (solid colors) consistently - no LOD switching, no jitter
  const buffer = buffers.levels[0];

  // At zoomProgress=0: Draw single heart centered
  // At higher zoom: Draw the heart pattern, centered on the canvas

  // Center point of the canvas
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  // The smiley pattern is roughly centered in the 16x16 grid
  // We want this center to align with canvas center
  const patternCenterX = 7.5;
  const patternCenterY = 7.5;

  // Grid origin so that pattern center = canvas center
  const gridOriginX = cx - patternCenterX * unitSize;
  const gridOriginY = cy - patternCenterY * unitSize;

  // Draw multiple copies of the pattern for seamless infinite zoom
  // Range of grid copies to draw (extends beyond single pattern)
  const tilesNeeded = Math.ceil(canvasSize / (unitSize * 16)) + 2;

  for (let tileY = -tilesNeeded; tileY <= tilesNeeded; tileY++) {
    for (let tileX = -tilesNeeded; tileX <= tilesNeeded; tileX++) {
      const tileOffsetX = tileX * 16 * unitSize;
      const tileOffsetY = tileY * 16 * unitSize;

      // Draw the 16x16 heart pattern for this tile
      for (let py = 0; py < 16; py++) {
        for (let px = 0; px < 16; px++) {
          if (PATTERN[py][px] === 1) {
            const x = gridOriginX + tileOffsetX + px * unitSize;
            const y = gridOriginY + tileOffsetY + py * unitSize;

            // Only draw if visible on canvas
            if (
              x + unitSize > 0 &&
              x < canvasSize &&
              y + unitSize > 0 &&
              y < canvasSize
            ) {
              p.image(buffer, x, y, unitSize, unitSize);
            }
          }
        }
      }
    }
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  speed: 0.1,
  palette: 0,
  manualZoom: 0,
  autoZoom: 1,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  speed: {
    label: 'Zoom Speed',
    min: 0.02,
    max: 0.3,
    defaultValue: 0.1,
    step: 0.01,
  },
  palette: {
    label: 'Colors',
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1,
    format: (v: number) => ['Red', 'Pink', 'Orange', 'Purple', 'Teal'][Math.round(v)] || 'Red',
  },
  manualZoom: {
    label: 'Manual Zoom',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 0.01,
  },
  autoZoom: {
    label: 'Auto Zoom',
    min: 0,
    max: 1,
    defaultValue: 1,
    step: 1,
    format: (v: number) => (v > 0.5 ? 'On' : 'Off'),
  },
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 19,
  prompt: '16x16',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  recording: {
    enabled: true,
    duration: 10,
    filename: 'genuary-2026-day-19',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.noStroke();
    p.imageMode(p.CORNER);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const paletteIndex = Math.round(controls.palette ?? 0);
    const palette = PALETTES[paletteIndex] || PALETTES[0];

    // Create the fractal buffers
    (p as any)._fractalBuffers = createFractalBuffers(p, palette);
    (p as any)._startTime = p.millis();
    (p as any)._lastPalette = paletteIndex;

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    const speed = controls.speed ?? 0.08;
    const paletteIndex = Math.round(controls.palette ?? 0);
    const autoZoom = (controls.autoZoom ?? 1) > 0.5;
    const manualZoom = controls.manualZoom ?? 0;

    // Recreate buffers if palette changed
    if (paletteIndex !== (p as any)._lastPalette) {
      const palette = PALETTES[paletteIndex] || PALETTES[0];
      (p as any)._fractalBuffers = createFractalBuffers(p, palette);
      (p as any)._lastPalette = paletteIndex;
    }

    const buffers: FractalBuffers = (p as any)._fractalBuffers;

    // Calculate zoom progress (0 to 1, loops)
    let zoomProgress: number;
    if (autoZoom) {
      const time = (p.millis() - ((p as any)._startTime || 0)) / 1000;
      zoomProgress = (time * speed) % 1;
    } else {
      zoomProgress = manualZoom;
    }

    drawFractalZoom(p, buffers, 800, zoomProgress);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const paletteIndex = Math.round(controls.palette ?? 0);
    const palette = PALETTES[paletteIndex] || PALETTES[0];

    const buffers = createFractalBuffers(p, palette);
    drawFractalZoom(p, buffers, 800, 0.3);
  },
};

export function getClaudesChoice(): Partial<ControlState> {
  return {
    speed: 0.1,
    palette: 0,
    autoZoom: 1,
  };
}

export { controlConfigs, defaultControls };
export default config;
