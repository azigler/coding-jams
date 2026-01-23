/**
 * Day 23: LAMINAE
 *
 * "Transparency. Explore the concept of transparency." — PaoloCurtoni
 *
 * Thin sheets of color drift through the same space.
 * Where they cross, new colors emerge—not blends, but presences.
 * Your brain perceives depth: this shape is in front, that one behind.
 * But there is no depth. Only transparency, and the mind's stubborn
 * need to make sense of impossible overlap.
 *
 * After Moholy-Nagy, who built machines to make shadows dance.
 * After Albers, who proved transparent colors create ghosts.
 *
 * Medium: p5.js with blend modes
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface Lamina {
  // Position and velocity
  x: number;
  y: number;
  vx: number;
  vy: number;

  // Size and rotation
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;

  // Appearance
  color: { r: number; g: number; b: number };
  opacity: number;

  // Shape type
  shapeType: 'ellipse' | 'rect' | 'polygon';
  polygonSides?: number;
}

interface LaminaeState {
  laminae: Lamina[];
  time: number;
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

const PALETTES = {
  // Moholy-Nagy inspired: bold primaries with black
  constructivist: [
    { r: 220, g: 50, b: 47 },   // Red
    { r: 38, g: 139, b: 210 },  // Blue
    { r: 250, g: 200, b: 50 },  // Yellow
    { r: 30, g: 30, b: 30 },    // Near black
  ],

  // Albers inspired: subtle warm tones
  albers: [
    { r: 230, g: 180, b: 120 }, // Tan
    { r: 180, g: 100, b: 80 },  // Terracotta
    { r: 120, g: 150, b: 180 }, // Steel blue
    { r: 200, g: 160, b: 100 }, // Gold ochre
  ],

  // Glass/light: cool translucent tones
  glass: [
    { r: 180, g: 220, b: 240 }, // Ice blue
    { r: 220, g: 180, b: 200 }, // Rose
    { r: 200, g: 240, b: 200 }, // Mint
    { r: 240, g: 230, b: 200 }, // Cream
  ],

  // Deep: saturated darks
  deep: [
    { r: 80, g: 40, b: 120 },   // Deep purple
    { r: 40, g: 80, b: 100 },   // Deep teal
    { r: 120, g: 40, b: 60 },   // Burgundy
    { r: 50, g: 70, b: 40 },    // Forest
  ],

  // Monochrome: grays only
  mono: [
    { r: 40, g: 40, b: 45 },
    { r: 100, g: 100, b: 105 },
    { r: 160, g: 160, b: 165 },
    { r: 200, g: 200, b: 205 },
  ],
};

const PALETTE_NAMES = ['Constructivist', 'Albers', 'Glass', 'Deep', 'Monochrome'];
const PALETTE_KEYS: (keyof typeof PALETTES)[] = ['constructivist', 'albers', 'glass', 'deep', 'mono'];

// Blend mode options
const BLEND_MODE_NAMES = ['Multiply', 'Screen', 'Overlay', 'Soft Light', 'Hard Light'];

// ============================================================================
// LAMINA GENERATION
// ============================================================================

function createLamina(
  w: number,
  h: number,
  palette: { r: number; g: number; b: number }[],
  index: number,
  total: number,
  controls: ControlState
): Lamina {
  const seed = (controls.seed ?? 42) as number;
  const seededRandom = createSeededRandom(seed + index * 1000);

  // Position: start distributed across canvas
  const margin = Math.min(w, h) * 0.1;
  const x = margin + seededRandom() * (w - 2 * margin);
  const y = margin + seededRandom() * (h - 2 * margin);

  // Velocity: slow drift
  const baseSpeed = (controls.speed ?? 0.5) as number;
  const angle = seededRandom() * Math.PI * 2;
  const speed = (0.2 + seededRandom() * 0.8) * baseSpeed * 0.5;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  // Size: varied but substantial
  const sizeBase = Math.min(w, h) * 0.25;
  const sizeVariation = 0.5 + seededRandom() * 1.0;
  const width = sizeBase * sizeVariation * (0.8 + seededRandom() * 0.4);
  const height = sizeBase * sizeVariation * (0.6 + seededRandom() * 0.8);

  // Rotation
  const rotation = seededRandom() * Math.PI * 2;
  const rotationSpeed = (seededRandom() - 0.5) * 0.002 * baseSpeed;

  // Color from palette
  const colorIndex = Math.floor(seededRandom() * palette.length);
  const color = palette[colorIndex];

  // Opacity
  const baseOpacity = (controls.opacity ?? 0.6) as number;
  const opacity = baseOpacity * (0.7 + seededRandom() * 0.3);

  // Shape type
  const shapes: ('ellipse' | 'rect' | 'polygon')[] = ['ellipse', 'rect', 'polygon'];
  const shapeIndex = Math.floor(seededRandom() * 3);
  const shapeType = shapes[shapeIndex];
  const polygonSides = shapeType === 'polygon' ? 5 + Math.floor(seededRandom() * 4) : undefined;

  return {
    x,
    y,
    vx,
    vy,
    width,
    height,
    rotation,
    rotationSpeed,
    color,
    opacity,
    shapeType,
    polygonSides,
  };
}

function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// UPDATE LOGIC
// ============================================================================

function updateLamina(lamina: Lamina, w: number, h: number, deltaTime: number): Lamina {
  // Update position
  let x = lamina.x + lamina.vx * deltaTime;
  let y = lamina.y + lamina.vy * deltaTime;
  let vx = lamina.vx;
  let vy = lamina.vy;

  // Soft bounce off edges with margin
  const margin = Math.max(lamina.width, lamina.height) * 0.5;

  if (x < margin) {
    x = margin;
    vx = Math.abs(vx) * 0.9;
  } else if (x > w - margin) {
    x = w - margin;
    vx = -Math.abs(vx) * 0.9;
  }

  if (y < margin) {
    y = margin;
    vy = Math.abs(vy) * 0.9;
  } else if (y > h - margin) {
    y = h - margin;
    vy = -Math.abs(vy) * 0.9;
  }

  // Update rotation
  const rotation = lamina.rotation + lamina.rotationSpeed * deltaTime;

  return {
    ...lamina,
    x,
    y,
    vx,
    vy,
    rotation,
  };
}

// ============================================================================
// RENDERING
// ============================================================================

function drawLamina(p: p5, lamina: Lamina): void {
  p.push();
  p.translate(lamina.x, lamina.y);
  p.rotate(lamina.rotation);

  p.noStroke();
  p.fill(lamina.color.r, lamina.color.g, lamina.color.b, lamina.opacity * 255);

  switch (lamina.shapeType) {
    case 'ellipse':
      p.ellipse(0, 0, lamina.width, lamina.height);
      break;

    case 'rect':
      p.rectMode(p.CENTER);
      // Rounded corners for softer X-junctions
      p.rect(0, 0, lamina.width, lamina.height, lamina.width * 0.15);
      break;

    case 'polygon':
      drawPolygon(p, lamina.width / 2, lamina.polygonSides || 6);
      break;
  }

  p.pop();
}

function drawPolygon(p: p5, radius: number, sides: number): void {
  p.beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * p.TWO_PI - p.HALF_PI;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);
}

function getBlendMode(p: p5, blendIndex: number): any {
  const modes = [p.MULTIPLY, p.SCREEN, p.OVERLAY, p.SOFT_LIGHT, p.HARD_LIGHT];
  return modes[blendIndex] || p.MULTIPLY;
}

function getBackgroundColor(paletteIndex: number): { r: number; g: number; b: number } {
  // Each palette gets a complementary background
  const backgrounds = [
    { r: 245, g: 242, b: 238 }, // Warm cream for constructivist
    { r: 250, g: 248, b: 242 }, // Warm white for albers
    { r: 240, g: 245, b: 250 }, // Cool white for glass
    { r: 35, g: 30, b: 40 },    // Dark for deep (exception)
    { r: 248, g: 248, b: 248 }, // Pure white for mono
  ];
  return backgrounds[paletteIndex] || backgrounds[0];
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(w: number, h: number, controls: ControlState): LaminaeState {
  const paletteIndex = Math.floor((controls.palette ?? 0) as number);
  const paletteKey = PALETTE_KEYS[paletteIndex] || 'constructivist';
  const palette = PALETTES[paletteKey];

  const count = Math.floor((controls.count ?? 5) as number);
  const laminae: Lamina[] = [];

  for (let i = 0; i < count; i++) {
    laminae.push(createLamina(w, h, palette, i, count, controls));
  }

  return {
    laminae,
    time: 0,
  };
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  count: 5,
  palette: 0,
  blendMode: 0,
  opacity: 0.6,
  speed: 0.5,
  seed: 42,
};

const controlConfigs: Record<string, ControlConfig> = {
  count: {
    label: 'Laminae',
    min: 2,
    max: 8,
    defaultValue: 5,
    step: 1,
  },
  palette: {
    label: 'Palette',
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1,
    format: (v: number) => PALETTE_NAMES[Math.floor(v)] || 'Constructivist',
  },
  blendMode: {
    label: 'Blend Mode',
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1,
    format: (v: number) => BLEND_MODE_NAMES[Math.floor(v)] || 'Multiply',
  },
  opacity: {
    label: 'Opacity',
    min: 0.3,
    max: 0.9,
    defaultValue: 0.6,
    step: 0.05,
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
  speed: {
    label: 'Speed',
    min: 0,
    max: 1.5,
    defaultValue: 0.5,
    step: 0.1,
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
  displayType: 'architectural' as const,
  viewingDistance: 2,
  dimensions: { width: 2, height: 3 },
  animated: true,
  suggestedZone: 'Transparency Chamber',
  canBecomeArchitecture: true,
  placard: `Thin sheets of color drift through the same space. Where they cross, new colors emerge—not blends, but presences. Your brain perceives depth: this shape is in front, that one behind. But there is no depth. Only transparency, and the mind's insistence on making sense of the impossible.`,
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

let lastControlHash = '';

function getControlHash(controls: ControlState): string {
  return `${controls.count}-${controls.palette}-${controls.seed}`;
}

const config: DayConfig = {
  day: 23,
  prompt: 'Transparency. Explore the concept of transparency.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-23',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    (p as any)._laminaeState = initState(p.width, p.height, controls);
    (p as any)._lastFrameTime = p.millis();
    lastControlHash = getControlHash(controls);

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check if controls changed that require regeneration
    const newHash = getControlHash(controls);
    if (newHash !== lastControlHash) {
      (p as any)._laminaeState = initState(p.width, p.height, controls);
      (p as any)._lastFrameTime = p.millis();
      lastControlHash = newHash;
    }

    // Get state
    let state: LaminaeState = (p as any)._laminaeState;
    if (!state) {
      state = initState(p.width, p.height, controls);
      (p as any)._laminaeState = state;
    }

    // Calculate delta time
    const currentTime = p.millis();
    const lastTime = (p as any)._lastFrameTime || currentTime;
    const deltaTime = Math.min(currentTime - lastTime, 100); // Cap delta to avoid jumps
    (p as any)._lastFrameTime = currentTime;

    // Update laminae positions
    const speed = (controls.speed ?? 0.5) as number;
    state.laminae = state.laminae.map((l) =>
      updateLamina(l, p.width, p.height, deltaTime * speed)
    );
    state.time += deltaTime;
    (p as any)._laminaeState = state;

    // Draw background
    const paletteIndex = Math.floor((controls.palette ?? 0) as number);
    const bg = getBackgroundColor(paletteIndex);
    p.background(bg.r, bg.g, bg.b);

    // Set blend mode
    const blendIndex = Math.floor((controls.blendMode ?? 0) as number);
    const blendMode = getBlendMode(p, blendIndex);
    p.blendMode(blendMode);

    // Draw laminae (back to front creates overlaps)
    for (const lamina of state.laminae) {
      drawLamina(p, lamina);
    }

    // Reset blend mode for any UI
    p.blendMode(p.BLEND);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Initialize state
    const state = initState(p.width, p.height, controls);

    // Advance time a bit for interesting overlap state
    for (let i = 0; i < 120; i++) {
      state.laminae = state.laminae.map((l) =>
        updateLamina(l, p.width, p.height, 16 * (controls.speed as number || 0.5))
      );
    }

    // Draw
    const paletteIndex = Math.floor((controls.palette ?? 0) as number);
    const bg = getBackgroundColor(paletteIndex);
    p.background(bg.r, bg.g, bg.b);

    const blendIndex = Math.floor((controls.blendMode ?? 0) as number);
    const blendMode = getBlendMode(p, blendIndex);
    p.blendMode(blendMode);

    for (const lamina of state.laminae) {
      drawLamina(p, lamina);
    }

    p.blendMode(p.BLEND);
  },
};

// Claude's Choice — settings for maximum transparency effect
export function getClaudesChoice(): Partial<ControlState> {
  return {
    count: 5,
    palette: 2, // Glass - translucent tones work best for transparency
    blendMode: 0, // Multiply - creates rich overlaps
    opacity: 0.55, // Enough to see through
    speed: 0.4, // Slow, contemplative drift
    seed: 137, // Golden prime
  };
}

export { controlConfigs, defaultControls };
export default config;
