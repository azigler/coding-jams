/**
 * Day 24: ALMOST
 *
 * "Perfectionist's nightmare." — Sophia (fractal kitty)
 *
 * Every element is almost where it should be. None are.
 * 12x12 grid. 144 elements. Each rotated 0-3 degrees,
 * shifted 0-3 pixels, sized wrong by 0-3%.
 *
 * The nightmare isn't chaos—chaos is ignorable.
 * The nightmare is the near-miss: the thing that SHOULD be right but isn't.
 *
 * After the psychological phenomenon of "Not Just Right Experiences"
 * that drives perfectionist anxiety.
 *
 * Medium: p5.js
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface GridElement {
  // Ideal position (where it SHOULD be)
  idealX: number;
  idealY: number;
  idealSize: number;
  idealRotation: number;
  idealBrightness: number;

  // Actual position (with micro-errors)
  actualX: number;
  actualY: number;
  actualSize: number;
  actualRotation: number;
  actualBrightness: number;

  // Error values (for interpolation)
  errorX: number;
  errorY: number;
  errorSize: number;
  errorRotation: number;
  errorBrightness: number;
}

interface AlmostState {
  elements: GridElement[];
  gridSize: number;
  showingPerfect: boolean;
  perfectRevealTime: number;
}

// ============================================================================
// GAUSSIAN RANDOM
// ============================================================================

function gaussianRandom(mean: number, stdDev: number, random: () => number): number {
  // Box-Muller transform
  const u1 = random();
  const u2 = random();
  const z0 = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// GRID GENERATION
// ============================================================================

function createGrid(
  width: number,
  height: number,
  controls: ControlState
): AlmostState {
  const gridSize = Math.floor((controls.gridSize ?? 12) as number);
  const seed = Math.floor((controls.seed ?? 42) as number);
  const imperfection = (controls.imperfection ?? 1) as number;

  const random = createSeededRandom(seed);

  const padding = Math.min(width, height) * 0.08;
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;
  const cellWidth = availableWidth / gridSize;
  const cellHeight = availableHeight / gridSize;
  const elementSize = Math.min(cellWidth, cellHeight) * 0.7;

  const elements: GridElement[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const idealX = padding + cellWidth * (col + 0.5);
      const idealY = padding + cellHeight * (row + 0.5);
      const idealSize = elementSize;
      const idealRotation = 0;
      const idealBrightness = 85; // HSB brightness

      // Generate micro-errors (normally distributed)
      const maxRotationError = 3.5 * imperfection; // degrees
      const maxPositionError = 4 * imperfection; // pixels
      const maxSizeError = 0.06 * imperfection; // proportion
      const maxBrightnessError = 4 * imperfection; // HSB units

      const errorRotation = gaussianRandom(0, maxRotationError * 0.5, random);
      const errorX = gaussianRandom(0, maxPositionError * 0.5, random);
      const errorY = gaussianRandom(0, maxPositionError * 0.5, random);
      const errorSize = gaussianRandom(0, maxSizeError * 0.5, random);
      const errorBrightness = gaussianRandom(0, maxBrightnessError * 0.5, random);

      elements.push({
        idealX,
        idealY,
        idealSize,
        idealRotation,
        idealBrightness,
        actualX: idealX + errorX,
        actualY: idealY + errorY,
        actualSize: idealSize * (1 + errorSize),
        actualRotation: errorRotation,
        actualBrightness: idealBrightness + errorBrightness,
        errorX,
        errorY,
        errorSize,
        errorRotation,
        errorBrightness,
      });
    }
  }

  return {
    elements,
    gridSize,
    showingPerfect: false,
    perfectRevealTime: 0,
  };
}

// ============================================================================
// RENDERING
// ============================================================================

function drawElement(
  p: p5,
  el: GridElement,
  showPerfect: boolean,
  cornerRadius: number
): void {
  const x = showPerfect ? el.idealX : el.actualX;
  const y = showPerfect ? el.idealY : el.actualY;
  const size = showPerfect ? el.idealSize : el.actualSize;
  const rotation = showPerfect ? el.idealRotation : el.actualRotation;
  const brightness = showPerfect ? el.idealBrightness : el.actualBrightness;

  p.push();
  p.translate(x, y);
  p.rotate(p.radians(rotation));

  // Subtle shadow
  p.noStroke();
  p.fill(0, 0, 0, 15);
  p.rect(2, 2, size, size, cornerRadius);

  // Main element
  p.fill(220, 15, brightness); // Slight warm hue
  p.stroke(0, 0, 40, 30);
  p.strokeWeight(0.5);
  p.rectMode(p.CENTER);
  p.rect(0, 0, size, size, cornerRadius);

  p.pop();
}

function drawGrid(p: p5, state: AlmostState, controls: ControlState): void {
  const cornerRadius = (controls.cornerRadius ?? 0.15) as number;
  const showPerfect = state.showingPerfect;

  // Calculate corner radius as proportion of element size
  const avgSize =
    state.elements.reduce((sum, el) => sum + el.idealSize, 0) /
    state.elements.length;
  const radius = avgSize * cornerRadius;

  for (const el of state.elements) {
    drawElement(p, el, showPerfect, radius);
  }
}

function drawPerfectIndicator(p: p5, state: AlmostState): void {
  if (state.showingPerfect) {
    p.push();
    p.fill(0, 0, 30);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text('PERFECT', p.width / 2, p.height - 25);
    p.pop();
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  gridSize: 12,
  imperfection: 1,
  cornerRadius: 0.15,
  seed: 42,
  showPerfect: 0,
};

const controlConfigs: Record<string, ControlConfig> = {
  gridSize: {
    label: 'Grid Size',
    min: 6,
    max: 16,
    defaultValue: 12,
    step: 1,
    format: (v: number) => `${Math.floor(v)}x${Math.floor(v)}`,
  },
  imperfection: {
    label: 'Imperfection',
    min: 0,
    max: 2,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => {
      if (v === 0) return 'Perfect';
      if (v < 0.5) return 'Subtle';
      if (v < 1.2) return 'Noticeable';
      return 'Obvious';
    },
  },
  cornerRadius: {
    label: 'Corner Radius',
    min: 0,
    max: 0.5,
    defaultValue: 0.15,
    step: 0.05,
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
  seed: {
    label: 'Seed',
    min: 1,
    max: 999,
    defaultValue: 42,
    step: 1,
  },
  showPerfect: {
    label: 'Show Perfect',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
    format: (v: number) => (v >= 0.5 ? 'ON' : 'OFF'),
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'framed' as const,
  viewingDistance: 1,
  dimensions: { width: 1, height: 1 },
  animated: false,
  suggestedZone: 'Main Gallery',
  canBecomeArchitecture: false,
  placard: `Every element is almost where it should be. None are. Count the imperfections if you can—but can you find them all? Or are you counting things that aren't wrong? After the psychological phenomenon of "Not Just Right Experiences" that drives perfectionist anxiety.`,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let lastControlHash = '';

function getControlHash(controls: ControlState): string {
  return `${controls.gridSize}-${controls.imperfection}-${controls.seed}`;
}

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 24,
  prompt: "Perfectionist's nightmare.",
  creditName: 'Sophia (fractal kitty)',
  creditUrl: 'https://www.fractalkitty.com/',
  recording: {
    enabled: true,
    duration: 8,
    filename: 'genuary-2026-day-24',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.rectMode(p.CENTER);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    (p as any)._almostState = createGrid(p.width, p.height, controls);
    lastControlHash = getControlHash(controls);

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check if controls changed that require regeneration
    const newHash = getControlHash(controls);
    if (newHash !== lastControlHash) {
      (p as any)._almostState = createGrid(p.width, p.height, controls);
      lastControlHash = newHash;
    }

    // Get state
    let state: AlmostState = (p as any)._almostState;
    if (!state) {
      state = createGrid(p.width, p.height, controls);
      (p as any)._almostState = state;
    }

    // Handle "Show Perfect" toggle
    const showPerfectControl = (controls.showPerfect ?? 0) as number;
    state.showingPerfect = showPerfectControl >= 0.5;

    // Draw background (warm cream)
    p.background(40, 8, 96);

    // Draw grid
    drawGrid(p, state, controls);

    // Draw indicator when showing perfect
    drawPerfectIndicator(p, state);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Initialize state
    const state = createGrid(p.width, p.height, controls);

    // Draw
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.rectMode(p.CENTER);
    p.background(40, 8, 96);
    drawGrid(p, state, controls);
  },
};

// Claude's Choice — settings for maximum near-miss anxiety
export function getClaudesChoice(): Partial<ControlState> {
  return {
    gridSize: 12,
    imperfection: 1.0, // Noticeable but not obvious
    cornerRadius: 0.12, // Slightly rounded
    seed: 137, // Golden prime
    showPerfect: 0,
  };
}

export { controlConfigs, defaultControls };
export default config;
