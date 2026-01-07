/**
 * Day 7: Boolean Algebra
 * "De Morgan's Mirror" — A meditation on duality
 *
 * Medium: TypeScript on silicon, rendered through liquid crystal
 *
 * Two wave-fields flow across the canvas — organic, undulating, alive.
 * One represents A, one represents B. We show their boolean relationships:
 * AND, OR, XOR, and the profound duality of De Morgan's laws:
 *
 *   NOT(A AND B) = (NOT A) OR (NOT B)
 *
 * Two statements that look different but are mathematically identical.
 * The viewer watches the waves flow and realizes — or doesn't — that
 * the two sides are the same truth wearing different masks.
 *
 * Augustus De Morgan (1806-1871) was born in Madras, blind in one eye,
 * refused his Cambridge degree over religious oaths, and helped lay
 * the foundations of formal logic alongside his friend George Boole.
 * His laws reveal: negation is a mirror that transforms AND into OR.
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type BooleanOp = 'AND' | 'OR' | 'XOR' | 'NOT_A' | 'NOT_B' | 'DE_MORGAN';

const OPERATIONS: BooleanOp[] = ['AND', 'OR', 'XOR', 'NOT_A', 'NOT_B', 'DE_MORGAN'];

const OP_LABELS: Record<BooleanOp, string> = {
  'AND': 'A ∧ B (AND)',
  'OR': 'A ∨ B (OR)',
  'XOR': 'A ⊕ B (XOR)',
  'NOT_A': '¬A (NOT A)',
  'NOT_B': '¬B (NOT B)',
  'DE_MORGAN': "De Morgan's Mirror"
};

const OP_DESCRIPTIONS: Record<BooleanOp, string> = {
  'AND': 'Truth requires both',
  'OR': 'Truth requires either',
  'XOR': 'Truth requires difference',
  'NOT_A': 'The negation of A',
  'NOT_B': 'The negation of B',
  'DE_MORGAN': '¬(A∧B) ≡ (¬A)∨(¬B)'
};

// ============================================================================
// WAVE FIELD GENERATION
// ============================================================================

/**
 * Multi-octave noise for organic wave fields
 */
function fractalNoise(
  p: p5,
  x: number,
  y: number,
  time: number,
  octaves: number,
  persistence: number,
  scale: number
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = scale;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * p.noise(x * frequency, y * frequency, time);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Compute the "truth value" of field A at a given point
 */
function fieldA(
  p: p5,
  x: number,
  y: number,
  time: number,
  complexity: number,
  scale: number
): number {
  const octaves = Math.floor(2 + complexity * 4);
  const persistence = 0.5 + complexity * 0.2;

  // Add some circular wave interference for visual interest
  const cx = 0.3;
  const cy = 0.4;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const wave = Math.sin(dist * 8 * scale + time * 0.5) * 0.15;

  return fractalNoise(p, x, y, time * 0.3, octaves, persistence, scale * 3) + wave;
}

/**
 * Compute the "truth value" of field B at a given point
 */
function fieldB(
  p: p5,
  x: number,
  y: number,
  time: number,
  complexity: number,
  scale: number,
  phaseOffset: number
): number {
  const octaves = Math.floor(2 + complexity * 4);
  const persistence = 0.5 + complexity * 0.2;

  // Offset the noise sampling for field B
  const offsetX = Math.cos(phaseOffset) * 0.5;
  const offsetY = Math.sin(phaseOffset) * 0.5;

  // Different circular wave pattern
  const cx = 0.7;
  const cy = 0.6;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const wave = Math.sin(dist * 6 * scale - time * 0.4 + phaseOffset) * 0.15;

  return fractalNoise(p, x + offsetX, y + offsetY, time * 0.3 + 100, octaves, persistence, scale * 3) + wave;
}

/**
 * Apply boolean operation to two truth values
 */
function applyBoolean(a: number, b: number, threshold: number, op: BooleanOp): boolean {
  const boolA = a > threshold;
  const boolB = b > threshold;

  switch (op) {
    case 'AND':
      return boolA && boolB;
    case 'OR':
      return boolA || boolB;
    case 'XOR':
      return boolA !== boolB;
    case 'NOT_A':
      return !boolA;
    case 'NOT_B':
      return !boolB;
    case 'DE_MORGAN':
      // This is handled specially in the render
      return !(boolA && boolB);
    default:
      return false;
  }
}

/**
 * De Morgan's left side: NOT(A AND B)
 */
function deMorganLeft(a: number, b: number, threshold: number): boolean {
  const boolA = a > threshold;
  const boolB = b > threshold;
  return !(boolA && boolB);
}

/**
 * De Morgan's right side: (NOT A) OR (NOT B)
 */
function deMorganRight(a: number, b: number, threshold: number): boolean {
  const boolA = a > threshold;
  const boolB = b > threshold;
  return (!boolA) || (!boolB);
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

interface ColorPalette {
  background: [number, number, number];
  fieldA: [number, number, number];
  fieldB: [number, number, number];
  both: [number, number, number];
  neither: [number, number, number];
  accent: [number, number, number];
}

const PALETTE: ColorPalette = {
  background: [220, 15, 8],      // Deep blue-gray void
  fieldA: [35, 75, 85],          // Amber/gold - warmth, presence
  fieldB: [185, 70, 75],         // Teal/cyan - cool, otherness
  both: [280, 50, 70],           // Purple - convergence
  neither: [220, 10, 20],        // Dark gray - absence
  accent: [45, 90, 95]           // Bright gold - highlight
};

// ============================================================================
// RENDERING
// ============================================================================

function renderField(
  p: p5,
  pixels: number[],
  width: number,
  height: number,
  time: number,
  controls: ControlState,
  operation: BooleanOp
): void {
  const complexity = controls.waveComplexity ?? 0.5;
  const phaseOffset = (controls.phaseOffset ?? 0.5) * Math.PI * 2;
  const threshold = controls.threshold ?? 0.5;
  const scale = controls.waveScale ?? 1.0;
  const pixelSize = Math.max(1, Math.round(controls.pixelSize ?? 4));

  const isDeMorgan = operation === 'DE_MORGAN';
  const midX = Math.floor(width / 2);

  // Process in blocks for pixelated aesthetic
  for (let py = 0; py < height; py += pixelSize) {
    for (let px = 0; px < width; px += pixelSize) {
      // Normalized coordinates
      const nx = px / width;
      const ny = py / height;

      // Compute field values
      const a = fieldA(p, nx, ny, time, complexity, scale);
      const b = fieldB(p, nx, ny, time, complexity, scale, phaseOffset);

      let color: [number, number, number, number];

      if (isDeMorgan) {
        // Split screen: left shows NOT(A AND B), right shows (NOT A) OR (NOT B)
        const isLeftSide = px < midX;
        let result: boolean;

        if (isLeftSide) {
          result = deMorganLeft(a, b, threshold);
        } else {
          result = deMorganRight(a, b, threshold);
        }

        // Both sides should be visually identical - that's the point!
        if (result) {
          // True region - show in warm amber
          const intensity = 0.6 + 0.4 * Math.abs(a - threshold);
          color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1] * intensity, PALETTE.fieldA[2] * intensity);
        } else {
          // False region - show in deep background
          color = hsbToRgb(PALETTE.background[0], PALETTE.background[1], PALETTE.background[2] * 1.5);
        }

        // Add subtle dividing line
        if (Math.abs(px - midX) < 2) {
          color = hsbToRgb(0, 0, 30);
        }
      } else {
        // Standard boolean operation
        const result = applyBoolean(a, b, threshold, operation);
        const boolA = a > threshold;
        const boolB = b > threshold;

        if (operation === 'XOR') {
          // XOR gets special treatment - show the interference pattern
          if (result) {
            // Where they differ - the visible truth
            const whichOne = boolA ? 'A' : 'B';
            const intensity = 0.5 + 0.5 * Math.abs(a - b);
            if (whichOne === 'A') {
              color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1] * intensity, PALETTE.fieldA[2] * intensity);
            } else {
              color = hsbToRgb(PALETTE.fieldB[0], PALETTE.fieldB[1] * intensity, PALETTE.fieldB[2] * intensity);
            }
          } else {
            // Where they agree - they cancel out
            const intensity = 0.3 + 0.3 * (a + b) / 2;
            color = hsbToRgb(PALETTE.background[0], PALETTE.background[1], PALETTE.background[2] * intensity * 4);
          }
        } else if (operation === 'AND') {
          if (result) {
            // Both true - convergence
            const intensity = 0.6 + 0.4 * Math.min(a, b);
            color = hsbToRgb(PALETTE.both[0], PALETTE.both[1] * intensity, PALETTE.both[2] * intensity);
          } else if (boolA) {
            // Only A
            color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1] * 0.4, PALETTE.fieldA[2] * 0.4);
          } else if (boolB) {
            // Only B
            color = hsbToRgb(PALETTE.fieldB[0], PALETTE.fieldB[1] * 0.4, PALETTE.fieldB[2] * 0.4);
          } else {
            // Neither
            color = hsbToRgb(PALETTE.background[0], PALETTE.background[1], PALETTE.background[2] * 1.2);
          }
        } else if (operation === 'OR') {
          if (boolA && boolB) {
            // Both - brightest
            const intensity = 0.7 + 0.3 * (a + b) / 2;
            color = hsbToRgb(PALETTE.both[0], PALETTE.both[1] * intensity, PALETTE.both[2] * intensity);
          } else if (result) {
            // One or the other
            if (boolA) {
              color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1], PALETTE.fieldA[2]);
            } else {
              color = hsbToRgb(PALETTE.fieldB[0], PALETTE.fieldB[1], PALETTE.fieldB[2]);
            }
          } else {
            // Neither
            color = hsbToRgb(PALETTE.background[0], PALETTE.background[1], PALETTE.background[2] * 1.2);
          }
        } else if (operation === 'NOT_A') {
          if (result) {
            const intensity = 0.5 + 0.5 * (1 - a);
            color = hsbToRgb(PALETTE.fieldB[0], PALETTE.fieldB[1] * intensity, PALETTE.fieldB[2] * intensity);
          } else {
            const intensity = 0.3 + 0.3 * a;
            color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1] * intensity, PALETTE.fieldA[2] * intensity * 0.5);
          }
        } else if (operation === 'NOT_B') {
          if (result) {
            const intensity = 0.5 + 0.5 * (1 - b);
            color = hsbToRgb(PALETTE.fieldA[0], PALETTE.fieldA[1] * intensity, PALETTE.fieldA[2] * intensity);
          } else {
            const intensity = 0.3 + 0.3 * b;
            color = hsbToRgb(PALETTE.fieldB[0], PALETTE.fieldB[1] * intensity, PALETTE.fieldB[2] * intensity * 0.5);
          }
        } else {
          color = hsbToRgb(0, 0, 50);
        }
      }

      // Fill the pixel block
      for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
          const idx = ((py + dy) * width + (px + dx)) * 4;
          pixels[idx] = color[0];
          pixels[idx + 1] = color[1];
          pixels[idx + 2] = color[2];
          pixels[idx + 3] = color[3];
        }
      }
    }
  }
}

/**
 * Convert HSB to RGB (returns [r, g, b, a])
 */
function hsbToRgb(h: number, s: number, b: number): [number, number, number, number] {
  // Normalize inputs
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  b = Math.max(0, Math.min(100, b)) / 100;

  const c = b * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = b - c;

  let r = 0, g = 0, bl = 0;

  if (h < 60) {
    r = c; g = x; bl = 0;
  } else if (h < 120) {
    r = x; g = c; bl = 0;
  } else if (h < 180) {
    r = 0; g = c; bl = x;
  } else if (h < 240) {
    r = 0; g = x; bl = c;
  } else if (h < 300) {
    r = x; g = 0; bl = c;
  } else {
    r = c; g = 0; bl = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((bl + m) * 255),
    255
  ];
}

/**
 * Draw the operation label and description
 */
function drawUI(p: p5, operation: BooleanOp): void {
  const label = OP_LABELS[operation];
  const description = OP_DESCRIPTIONS[operation];

  // Background panel
  p.noStroke();
  p.fill(0, 0, 0, 180);
  p.rect(0, p.height - 80, p.width, 80);

  // Main label
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(24);
  p.textFont('monospace');
  p.text(label, p.width / 2, p.height - 50);

  // Description
  p.fill(180);
  p.textSize(14);
  p.text(description, p.width / 2, p.height - 22);

  // De Morgan special: label each side
  if (operation === 'DE_MORGAN') {
    p.fill(255, 255, 255, 200);
    p.textSize(16);
    p.textAlign(p.CENTER, p.TOP);
    p.text('¬(A ∧ B)', p.width * 0.25, 20);
    p.text('(¬A) ∨ (¬B)', p.width * 0.75, 20);

    // Subtitle
    p.fill(180, 180, 180, 200);
    p.textSize(12);
    p.text('NOT (A AND B)', p.width * 0.25, 42);
    p.text('(NOT A) OR (NOT B)', p.width * 0.75, 42);
  }
}

/**
 * Draw attribution to De Morgan
 */
function drawAttribution(p: p5): void {
  p.fill(100, 100, 100, 150);
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.textSize(10);
  p.textFont('monospace');
  p.text('After Augustus De Morgan (1806-1871)', p.width - 15, p.height - 90);
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  waveComplexity: 0.5,
  phaseOffset: 0.25,
  threshold: 0.5,
  waveScale: 1.0,
  flowSpeed: 0.5,
  pixelSize: 4,
  operation: 2 // XOR by default - the most visually striking
};

const controlConfigs: { [key: string]: ControlConfig } = {
  operation: {
    label: 'Boolean Operation',
    min: 0,
    max: 5,
    defaultValue: 2,
    step: 1
  },
  waveComplexity: {
    label: 'Wave Complexity',
    min: 0.1,
    max: 1.0,
    defaultValue: 0.5,
    step: 0.05
  },
  phaseOffset: {
    label: 'Phase Offset (A↔B)',
    min: 0,
    max: 1,
    defaultValue: 0.25,
    step: 0.02
  },
  threshold: {
    label: 'Truth Threshold',
    min: 0.3,
    max: 0.7,
    defaultValue: 0.5,
    step: 0.02
  },
  waveScale: {
    label: 'Wave Scale',
    min: 0.5,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  flowSpeed: {
    label: 'Flow Speed',
    min: 0,
    max: 1.5,
    defaultValue: 0.5,
    step: 0.05
  },
  pixelSize: {
    label: 'Pixel Size',
    min: 1,
    max: 8,
    defaultValue: 4,
    step: 1
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 7,
  prompt: 'Boolean algebra. Get inspired by Boolean algebra, in any way.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  recording: { enabled: true, duration: 20, filename: 'genuary-2026-day-07' },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.pixelDensity(1);
    p.noSmooth();

    // Initialize state
    (p as any)._startTime = p.millis();
    (p as any)._lastControls = null;
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || defaultControls;
    const flowSpeed = controls.flowSpeed ?? 0.5;
    const operationIdx = Math.round(controls.operation ?? 2);
    const operation = OPERATIONS[Math.min(operationIdx, OPERATIONS.length - 1)];

    const timeSec = (p.millis() - ((p as any)._startTime || 0)) / 1000;
    const time = timeSec * flowSpeed;

    // Render to pixel buffer
    p.loadPixels();
    renderField(p, p.pixels, p.width, p.height, time, controls, operation);
    p.updatePixels();

    // Draw UI overlay
    drawUI(p, operation);
    drawAttribution(p);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || defaultControls;
    // Render at a fixed "beautiful" moment
    const time = 3.5;
    const operation: BooleanOp = 'DE_MORGAN';

    p.loadPixels();
    renderField(p, p.pixels, p.width, p.height, time, controls, operation);
    p.updatePixels();

    drawUI(p, operation);
    drawAttribution(p);
  }
};

export function getClaudesChoice(): Partial<ControlState> {
  return {
    operation: 5,          // De Morgan's Mirror - the pièce de résistance
    waveComplexity: 0.65,  // Rich but not chaotic
    phaseOffset: 0.38,     // Interesting interference
    threshold: 0.48,       // Slightly off-center for asymmetry
    waveScale: 1.2,        // Larger, more visible patterns
    flowSpeed: 0.35,       // Contemplative pace
    pixelSize: 3           // Detailed but still pixelated aesthetic
  };
}

export { controlConfigs, defaultControls };
export default config;
