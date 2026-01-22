/**
 * Day 22: WEIGHT
 *
 * "Pen plotter ready." — Sophia (fractal kitty)
 *
 * A form emerges from hatching alone—no outline, no fill.
 * Thousands of parallel strokes, closer where dark, farther where light.
 * The shape is implied by the accumulated labor of the machine.
 *
 * After Vera Molnár, who taught herself FORTRAN in 1968 to make
 * a plotter draw what she imagined.
 *
 * Medium: Pure SVG generation, genuinely plotter-ready
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface Stroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface WeightState {
  strokes: Stroke[];
  revealedCount: number;
  lastRevealTime: number;
}

// ============================================================================
// SHAPE FUNCTIONS
// ============================================================================

/**
 * Stone/pebble shape - a soft rounded organic form
 * Returns 1 if point is inside, 0 if outside, gradient at edges
 */
function stoneShape(x: number, y: number, cx: number, cy: number, size: number): number {
  // Normalize coordinates to -1 to 1 range
  const nx = (x - cx) / size;
  const ny = (y - cy) / size;

  // Squished ellipse with slight variation
  const rx = 0.85;
  const ry = 1.0;

  // Add subtle wobble for organic feel
  const angle = Math.atan2(ny, nx);
  const wobble = 0.05 * Math.sin(angle * 3) + 0.03 * Math.sin(angle * 5);

  const dist = Math.sqrt((nx / rx) ** 2 + (ny / ry) ** 2) - wobble;

  // Soft edge
  if (dist > 1.0) return 0;
  if (dist < 0.9) return 1;
  return 1 - (dist - 0.9) / 0.1;
}

/**
 * Drop/tear shape - pointed at top, round at bottom
 */
function dropShape(x: number, y: number, cx: number, cy: number, size: number): number {
  const nx = (x - cx) / size;
  const ny = (y - cy) / size;

  // Shift center down so drop bulges at bottom
  const shiftedNy = ny + 0.2;

  // Varying radius: wider at bottom, narrow at top
  const verticalFactor = 0.5 - shiftedNy * 0.4;
  const rx = Math.max(0.1, verticalFactor);

  const dist = Math.sqrt((nx / rx) ** 2 + (shiftedNy) ** 2);

  if (dist > 1.0) return 0;
  if (dist < 0.85) return 1;
  return 1 - (dist - 0.85) / 0.15;
}

/**
 * Egg shape - classic ovoid
 */
function eggShape(x: number, y: number, cx: number, cy: number, size: number): number {
  const nx = (x - cx) / size;
  const ny = (y - cy) / size;

  // Egg is narrower at top
  const ry = 1.0;
  const rx = 0.7 - ny * 0.15;

  const dist = Math.sqrt((nx / Math.max(0.3, rx)) ** 2 + (ny / ry) ** 2);

  if (dist > 1.0) return 0;
  if (dist < 0.85) return 1;
  return 1 - (dist - 0.85) / 0.15;
}

/**
 * Circle shape - simple but elegant
 */
function circleShape(x: number, y: number, cx: number, cy: number, size: number): number {
  const nx = (x - cx) / size;
  const ny = (y - cy) / size;

  const dist = Math.sqrt(nx ** 2 + ny ** 2);

  if (dist > 1.0) return 0;
  if (dist < 0.9) return 1;
  return 1 - (dist - 0.9) / 0.1;
}

// Shape selector
const SHAPES = [stoneShape, dropShape, eggShape, circleShape];
const SHAPE_NAMES = ['Stone', 'Drop', 'Egg', 'Circle'];

// ============================================================================
// GRAYSCALE / DENSITY FUNCTION
// ============================================================================

/**
 * Calculate the "darkness" at a point - controls hatching density
 * Returns 0-1 where 1 is darkest (densest hatching)
 */
function getDarkness(x: number, y: number, cx: number, cy: number, size: number): number {
  const nx = (x - cx) / size;
  const ny = (y - cy) / size;

  // Simulate 3D lighting from upper-left
  // Light comes from (-0.5, -0.7) direction
  const lightX = -0.5;
  const lightY = -0.7;

  // Surface normal approximation (assuming sphere-like surface)
  const dist = Math.sqrt(nx ** 2 + ny ** 2);
  if (dist > 0.95) return 0.9; // Edge is dark

  // Simple dot product with light direction
  const surfaceZ = Math.sqrt(Math.max(0, 1 - dist ** 2));
  const dotProduct = -(nx * lightX + ny * lightY - surfaceZ * 0.5);

  // Map to 0-1 range (invert so shadow is dark)
  const darkness = 0.3 + 0.6 * (1 - (dotProduct + 1) / 2);

  return Math.max(0.1, Math.min(1, darkness));
}

// ============================================================================
// HATCHING GENERATION
// ============================================================================

/**
 * Generate all hatching strokes for the shape
 */
function generateStrokes(
  w: number,
  h: number,
  controls: ControlState
): Stroke[] {
  const strokes: Stroke[] = [];

  const cx = w / 2;
  const cy = h / 2;
  const size = Math.min(w, h) * 0.35;

  const shapeIndex = Math.floor((controls.shape ?? 0) as number);
  const shapeFn = SHAPES[shapeIndex] || stoneShape;

  const angle = ((controls.angle ?? 45) as number) * Math.PI / 180;
  const minSpacing = (controls.minSpacing ?? 2) as number;
  const maxSpacing = (controls.maxSpacing ?? 12) as number;
  const jitter = (controls.jitter ?? 0.3) as number;

  // We'll scan perpendicular to the hatch angle
  const scanAngle = angle + Math.PI / 2;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cosScan = Math.cos(scanAngle);
  const sinScan = Math.sin(scanAngle);

  // Bounding box for scanning
  const diagonal = Math.sqrt(w ** 2 + h ** 2);
  const scanStart = -diagonal / 2;
  const scanEnd = diagonal / 2;

  // Adaptive scanning: spacing based on local darkness
  let scanPos = scanStart;
  const seed = Math.floor((controls.seed ?? 42) as number);
  let randomState = seed;

  // Simple seeded random
  const seededRandom = () => {
    randomState = (randomState * 1103515245 + 12345) & 0x7fffffff;
    return randomState / 0x7fffffff;
  };

  while (scanPos < scanEnd) {
    // Sample darkness at this scan line to determine spacing
    const sampleX = cx + scanPos * cosScan;
    const sampleY = cy + scanPos * sinScan;
    const shapeMask = shapeFn(sampleX, sampleY, cx, cy, size);

    if (shapeMask > 0.1) {
      const darkness = getDarkness(sampleX, sampleY, cx, cy, size);
      const spacing = maxSpacing - (maxSpacing - minSpacing) * darkness * shapeMask;

      // Generate stroke along this scan line
      const stroke = generateStrokeAlongLine(
        cx, cy, size, scanPos, cosA, sinA, cosScan, sinScan,
        shapeFn, jitter, seededRandom
      );

      if (stroke) {
        strokes.push(stroke);
      }

      scanPos += spacing;
    } else {
      // Outside shape, use max spacing to scan quickly
      scanPos += maxSpacing;
    }
  }

  return strokes;
}

/**
 * Generate a single stroke along a scan line
 */
function generateStrokeAlongLine(
  cx: number,
  cy: number,
  size: number,
  scanPos: number,
  cosA: number,
  sinA: number,
  cosScan: number,
  sinScan: number,
  shapeFn: (x: number, y: number, cx: number, cy: number, size: number) => number,
  jitter: number,
  random: () => number
): Stroke | null {
  // Find start and end of stroke (where it intersects shape)
  const diagonal = size * 3;
  let strokeStart: { x: number; y: number } | null = null;
  let strokeEnd: { x: number; y: number } | null = null;

  // Scan along the hatch direction
  const step = 2;
  for (let t = -diagonal; t <= diagonal; t += step) {
    const x = cx + scanPos * cosScan + t * cosA;
    const y = cy + scanPos * sinScan + t * sinA;

    const mask = shapeFn(x, y, cx, cy, size);

    if (mask > 0.3) {
      if (!strokeStart) {
        strokeStart = { x, y };
      }
      strokeEnd = { x, y };
    }
  }

  if (strokeStart && strokeEnd &&
      Math.hypot(strokeEnd.x - strokeStart.x, strokeEnd.y - strokeStart.y) > 3) {
    // Add jitter
    const jitterAmount = jitter * 2;
    return {
      x1: strokeStart.x + (random() - 0.5) * jitterAmount,
      y1: strokeStart.y + (random() - 0.5) * jitterAmount,
      x2: strokeEnd.x + (random() - 0.5) * jitterAmount,
      y2: strokeEnd.y + (random() - 0.5) * jitterAmount,
    };
  }

  return null;
}

// ============================================================================
// SVG EXPORT
// ============================================================================

/**
 * Generate SVG string for plotter export
 */
function generateSVG(strokes: Stroke[], w: number, h: number, strokeWidth: number): string {
  const paths = strokes.map(s =>
    `<line x1="${s.x1.toFixed(2)}" y1="${s.y1.toFixed(2)}" x2="${s.x2.toFixed(2)}" y2="${s.y2.toFixed(2)}"/>`
  ).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${w}mm" height="${h}mm"
     viewBox="0 0 ${w} ${h}">
  <g fill="none" stroke="#000000" stroke-width="${strokeWidth}" stroke-linecap="round">
    ${paths}
  </g>
</svg>`;
}

/**
 * Download SVG file
 */
function downloadSVG(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// RENDERING
// ============================================================================

function drawStrokes(p: p5, strokes: Stroke[], count: number, strokeWeight: number): void {
  p.stroke(20);
  p.strokeWeight(strokeWeight);
  p.strokeCap(p.ROUND);

  const drawCount = Math.min(count, strokes.length);
  for (let i = 0; i < drawCount; i++) {
    const s = strokes[i];
    p.line(s.x1, s.y1, s.x2, s.y2);
  }
}

function drawProgress(p: p5, current: number, total: number): void {
  if (current >= total) return;

  const percent = Math.floor((current / total) * 100);
  p.push();
  p.fill(100);
  p.noStroke();
  p.textSize(12);
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.text(`${percent}%`, p.width - 20, p.height - 20);
  p.pop();
}

function drawExportButton(p: p5): void {
  const btnW = 100;
  const btnH = 30;
  const btnX = p.width - btnW - 20;
  const btnY = 20;

  // Store button bounds for click detection
  (p as any)._exportBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };

  p.push();
  p.fill(40);
  p.noStroke();
  p.rect(btnX, btnY, btnW, btnH, 4);
  p.fill(255);
  p.textSize(12);
  p.textAlign(p.CENTER, p.CENTER);
  p.text('Export SVG', btnX + btnW / 2, btnY + btnH / 2);
  p.pop();
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(w: number, h: number, controls: ControlState): WeightState {
  const strokes = generateStrokes(w, h, controls);
  return {
    strokes,
    revealedCount: 0,
    lastRevealTime: 0,
  };
}

function updateState(
  state: WeightState,
  currentTime: number,
  controls: ControlState
): WeightState {
  const speed = (controls.speed ?? 1) as number;
  const strokesPerSecond = 50 * speed;

  const elapsed = currentTime - state.lastRevealTime;
  const newStrokes = Math.floor(elapsed * strokesPerSecond / 1000);

  if (newStrokes > 0 && state.revealedCount < state.strokes.length) {
    return {
      ...state,
      revealedCount: Math.min(state.strokes.length, state.revealedCount + newStrokes),
      lastRevealTime: currentTime,
    };
  }

  return state;
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  shape: 0,
  angle: 45,
  minSpacing: 2,
  maxSpacing: 12,
  jitter: 0.3,
  speed: 1,
  strokeWeight: 1,
  seed: 42,
};

const controlConfigs: Record<string, ControlConfig> = {
  shape: {
    label: 'Shape',
    min: 0,
    max: 3,
    defaultValue: 0,
    step: 1,
    format: (v: number) => SHAPE_NAMES[Math.floor(v)] || 'Stone',
  },
  angle: {
    label: 'Hatch Angle',
    min: 0,
    max: 180,
    defaultValue: 45,
    step: 5,
    format: (v: number) => `${v}°`,
  },
  minSpacing: {
    label: 'Min Spacing',
    min: 1,
    max: 5,
    defaultValue: 2,
    step: 0.5,
  },
  maxSpacing: {
    label: 'Max Spacing',
    min: 6,
    max: 20,
    defaultValue: 12,
    step: 1,
  },
  jitter: {
    label: 'Jitter',
    min: 0,
    max: 2,
    defaultValue: 0.3,
    step: 0.1,
  },
  speed: {
    label: 'Draw Speed',
    min: 0.2,
    max: 5,
    defaultValue: 1,
    step: 0.2,
  },
  strokeWeight: {
    label: 'Stroke Weight',
    min: 0.5,
    max: 3,
    defaultValue: 1,
    step: 0.25,
  },
  seed: {
    label: 'Seed',
    min: 1,
    max: 999,
    defaultValue: 42,
    step: 1,
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'framed',
  viewingDistance: 1.5,
  dimensions: { width: 0.8, height: 0.8 },
  animated: true,
  suggestedZone: 'Poster Gallery',
  canBecomeArchitecture: true,
  placard: `The plotter draws lines. It cannot fill. What you see is thousands of parallel strokes, closer where dark, farther where light. The shape has no outline—only the accumulated labor of a machine pretending to be a hand. After Vera Molnár, who taught herself FORTRAN in 1968 to make a plotter draw what she imagined.`,
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

let lastControlHash = '';

function getControlHash(controls: ControlState): string {
  return `${controls.shape}-${controls.angle}-${controls.minSpacing}-${controls.maxSpacing}-${controls.jitter}-${controls.seed}`;
}

const config: DayConfig = {
  day: 22,
  prompt: 'Pen plotter ready.',
  creditName: 'Sophia (fractal kitty)',
  creditUrl: 'https://www.fractalkitty.com/',
  recording: {
    enabled: true,
    duration: 20,
    filename: 'genuary-2026-day-22',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.background(250, 248, 242); // Warm paper color

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    (p as any)._weightState = initState(p.width, p.height, controls);
    (p as any)._lastTime = p.millis();
    lastControlHash = getControlHash(controls);

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check if controls changed that affect stroke generation
    const newHash = getControlHash(controls);
    if (newHash !== lastControlHash) {
      (p as any)._weightState = initState(p.width, p.height, controls);
      (p as any)._lastTime = p.millis();
      lastControlHash = newHash;
    }

    // Update state
    let state: WeightState = (p as any)._weightState;
    if (!state) {
      state = initState(p.width, p.height, controls);
      (p as any)._weightState = state;
    }

    const currentTime = p.millis();
    state = updateState(state, currentTime, controls);
    (p as any)._weightState = state;

    // Clear and draw
    p.background(250, 248, 242);

    const strokeWeight = (controls.strokeWeight ?? 1) as number;
    drawStrokes(p, state.strokes, state.revealedCount, strokeWeight);

    // Draw progress if still revealing
    drawProgress(p, state.revealedCount, state.strokes.length);

    // Draw export button
    drawExportButton(p);
  },

  mousePressed: (p: p5) => {
    const bounds = (p as any)._exportBtnBounds;
    if (bounds &&
        p.mouseX >= bounds.x && p.mouseX <= bounds.x + bounds.w &&
        p.mouseY >= bounds.y && p.mouseY <= bounds.y + bounds.h) {
      // Export SVG
      const state: WeightState = (p as any)._weightState;
      const controls: ControlState = (p as any)._controls || { ...defaultControls };
      if (state && state.strokes.length > 0) {
        const strokeWeight = (controls.strokeWeight ?? 1) as number;
        const svg = generateSVG(state.strokes, p.width, p.height, strokeWeight);
        downloadSVG(svg, 'weight-plotter.svg');
      }
    }
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    p.background(250, 248, 242);

    const strokes = generateStrokes(p.width, p.height, controls);
    const strokeWeight = (controls.strokeWeight ?? 1) as number;
    drawStrokes(p, strokes, strokes.length, strokeWeight);
  },
};

// Claude's Choice — balanced settings for visual impact
export function getClaudesChoice(): Partial<ControlState> {
  return {
    shape: 0, // Stone
    angle: 45,
    minSpacing: 2,
    maxSpacing: 10,
    jitter: 0.4,
    speed: 2,
    strokeWeight: 1,
    seed: 137, // A nice prime
  };
}

export { controlConfigs, defaultControls };
export default config;
