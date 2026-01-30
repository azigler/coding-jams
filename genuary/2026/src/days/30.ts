/**
 * Day 30: ASSERTION
 *
 * "It's not a bug, it's a feature." — Bart Simons
 *
 * Each shape asserts a property. "I am blue." "I am still." "I am a circle."
 * Each shape does what it wants. The red shape says it's blue. The bouncing
 * shape says it's still. The square says it's a circle.
 *
 * The code works perfectly—it does exactly what it was written to do.
 * The bug isn't in the execution. The bug is in the specification.
 * Or is it a feature?
 *
 * After Rosa Menkman's Glitch Studies Manifesto and Bob Ross's "happy accidents."
 *
 * Medium: p5.js
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

type ShapeType = 'circle' | 'square' | 'triangle';
type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

interface AssertionType {
  category: 'color' | 'shape' | 'size' | 'motion';
  value: string;
}

interface Shape {
  // Reality (what it actually is/does)
  realShape: ShapeType;
  realColor: ColorName;
  realSize: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;

  // Assertion (what it claims to be)
  assertion: AssertionType;
  assertionTimer: number;

  // Animation
  birthTime: number;
  phase: number;
}

interface State {
  shapes: Shape[];
  time: number;
  random: () => number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS: Record<ColorName, [number, number, number]> = {
  red: [355, 75, 65],      // HSB
  blue: [210, 70, 70],
  green: [140, 60, 60],
  yellow: [45, 80, 85],
  purple: [280, 60, 65],
};

const COLOR_NAMES: ColorName[] = ['red', 'blue', 'green', 'yellow', 'purple'];
const SHAPE_NAMES: ShapeType[] = ['circle', 'square', 'triangle'];

const ASSERTION_DURATION = 180; // frames before assertion changes

// ============================================================================
// SEEDED RANDOM
// ============================================================================

function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// SHAPE CREATION
// ============================================================================

function createShape(
  x: number,
  y: number,
  random: () => number,
  time: number,
  lieFrequency: number
): Shape {
  // Assign real properties
  const realShape = SHAPE_NAMES[Math.floor(random() * SHAPE_NAMES.length)];
  const realColor = COLOR_NAMES[Math.floor(random() * COLOR_NAMES.length)];
  const realSize = 50 + random() * 60; // 50-110

  // Velocity for movement
  const speed = 0.5 + random() * 1.5;
  const angle = random() * Math.PI * 2;

  const shape: Shape = {
    realShape,
    realColor,
    realSize,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: random() * Math.PI * 2,
    rotationSpeed: (random() - 0.5) * 0.02,
    assertion: generateAssertion(random, realShape, realColor, realSize, speed, lieFrequency),
    assertionTimer: Math.floor(random() * ASSERTION_DURATION),
    birthTime: time,
    phase: random() * Math.PI * 2,
  };

  return shape;
}

function generateAssertion(
  random: () => number,
  realShape: ShapeType,
  realColor: ColorName,
  realSize: number,
  realSpeed: number,
  lieFrequency: number
): AssertionType {
  const categories: AssertionType['category'][] = ['color', 'shape', 'size', 'motion'];
  const category = categories[Math.floor(random() * categories.length)];

  const shouldLie = random() < lieFrequency;

  switch (category) {
    case 'color': {
      if (shouldLie) {
        // Lie: claim a different color
        const otherColors = COLOR_NAMES.filter(c => c !== realColor);
        return { category: 'color', value: otherColors[Math.floor(random() * otherColors.length)] };
      }
      return { category: 'color', value: realColor };
    }
    case 'shape': {
      if (shouldLie) {
        const otherShapes = SHAPE_NAMES.filter(s => s !== realShape);
        return { category: 'shape', value: otherShapes[Math.floor(random() * otherShapes.length)] };
      }
      return { category: 'shape', value: realShape };
    }
    case 'size': {
      const isLarge = realSize > 80;
      if (shouldLie) {
        return { category: 'size', value: isLarge ? 'small' : 'large' };
      }
      return { category: 'size', value: isLarge ? 'large' : 'small' };
    }
    case 'motion': {
      const isMoving = realSpeed > 0.3;
      if (shouldLie) {
        return { category: 'motion', value: isMoving ? 'still' : 'moving' };
      }
      return { category: 'motion', value: isMoving ? 'moving' : 'still' };
    }
  }
}

function getAssertionText(assertion: AssertionType): string {
  switch (assertion.category) {
    case 'color':
      return `I am ${assertion.value}`;
    case 'shape':
      return `I am a ${assertion.value}`;
    case 'size':
      return `I am ${assertion.value}`;
    case 'motion':
      return `I am ${assertion.value}`;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

function updateShape(
  shape: Shape,
  canvasWidth: number,
  canvasHeight: number,
  random: () => number,
  lieFrequency: number,
  speedMultiplier: number
): void {
  // Movement
  shape.x += shape.vx * speedMultiplier;
  shape.y += shape.vy * speedMultiplier;
  shape.rotation += shape.rotationSpeed * speedMultiplier;

  // Bounce off edges
  const margin = shape.realSize / 2 + 20;
  if (shape.x < margin) {
    shape.x = margin;
    shape.vx *= -1;
  }
  if (shape.x > canvasWidth - margin) {
    shape.x = canvasWidth - margin;
    shape.vx *= -1;
  }
  if (shape.y < margin + 40) { // Extra margin at top for labels
    shape.y = margin + 40;
    shape.vy *= -1;
  }
  if (shape.y > canvasHeight - margin - 30) {
    shape.y = canvasHeight - margin - 30;
    shape.vy *= -1;
  }

  // Update assertion timer
  shape.assertionTimer++;
  if (shape.assertionTimer >= ASSERTION_DURATION) {
    shape.assertionTimer = 0;
    const speed = Math.sqrt(shape.vx * shape.vx + shape.vy * shape.vy);
    shape.assertion = generateAssertion(
      random,
      shape.realShape,
      shape.realColor,
      shape.realSize,
      speed,
      lieFrequency
    );
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function drawShape(p: p5, shape: Shape, time: number): void {
  const age = time - shape.birthTime;
  const fadeIn = Math.min(1, age / 30);

  p.push();
  p.translate(shape.x, shape.y);
  p.rotate(shape.rotation);

  // Get color from reality
  const color = COLORS[shape.realColor];
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(color[0], color[1], color[2], fadeIn * 95);
  p.stroke(color[0], color[1] * 0.7, color[2] * 0.8, fadeIn * 50);
  p.strokeWeight(2);

  const size = shape.realSize;

  switch (shape.realShape) {
    case 'circle':
      p.ellipse(0, 0, size, size);
      break;
    case 'square':
      p.rectMode(p.CENTER);
      p.rect(0, 0, size * 0.85, size * 0.85, 4);
      break;
    case 'triangle':
      const h = size * 0.9;
      p.triangle(
        0, -h * 0.5,
        -h * 0.5, h * 0.4,
        h * 0.5, h * 0.4
      );
      break;
  }

  p.pop();
}

function drawAssertion(p: p5, shape: Shape): void {
  const text = getAssertionText(shape.assertion);

  // Position label above the shape
  const labelX = shape.x;
  const labelY = shape.y - shape.realSize / 2 - 25;

  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);

  // Background pill
  p.textFont('monospace');
  p.textSize(12);
  const textW = p.textWidth(text);
  const padding = 8;

  p.fill(0, 0, 20, 85);
  p.noStroke();
  p.rectMode(p.CENTER);
  p.rect(labelX, labelY, textW + padding * 2, 22, 11);

  // Text
  p.fill(0, 0, 95);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(text, labelX, labelY);

  // Subtle indicator if assertion is a lie
  const isLie = isAssertionFalse(shape);
  if (isLie) {
    // Tiny red dot
    p.fill(0, 70, 70, 60);
    p.noStroke();
    p.ellipse(labelX + textW / 2 + padding - 2, labelY - 5, 4, 4);
  }

  p.pop();
}

function isAssertionFalse(shape: Shape): boolean {
  const { category, value } = shape.assertion;
  const speed = Math.sqrt(shape.vx * shape.vx + shape.vy * shape.vy);

  switch (category) {
    case 'color':
      return value !== shape.realColor;
    case 'shape':
      return value !== shape.realShape;
    case 'size':
      const isLarge = shape.realSize > 80;
      return (value === 'large') !== isLarge;
    case 'motion':
      const isMoving = speed > 0.3;
      return (value === 'moving') !== isMoving;
  }
}

function drawTitle(p: p5): void {
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(0, 0, 35);
  p.noStroke();
  p.textAlign(p.CENTER, p.TOP);
  p.textFont('monospace');
  p.textSize(20);
  p.text('ASSERTION', p.width / 2, 20);

  p.textSize(11);
  p.fill(0, 0, 50);
  p.text("It's not a bug, it's a feature", p.width / 2, 46);
  p.pop();
}

function drawLegend(p: p5, lieFrequency: number): void {
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);

  // Bottom info
  p.textAlign(p.CENTER, p.BOTTOM);
  p.textFont('monospace');
  p.textSize(9);
  p.fill(0, 0, 45);

  const liePercent = Math.round(lieFrequency * 100);
  p.text(
    `Lie frequency: ${liePercent}%  |  Assertions update every ${(ASSERTION_DURATION / 60).toFixed(1)}s`,
    p.width / 2,
    p.height - 15
  );

  p.pop();
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  shapeCount: 5,
  lieFrequency: 0.75,
  speed: 1,
  seed: 30,
};

const controlConfigs: Record<string, ControlConfig> = {
  shapeCount: {
    label: 'Shapes',
    min: 3,
    max: 8,
    defaultValue: 5,
    step: 1,
  },
  lieFrequency: {
    label: 'Lie Frequency',
    min: 0,
    max: 1,
    defaultValue: 0.75,
    step: 0.05,
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
  speed: {
    label: 'Speed',
    min: 0,
    max: 2,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => `${v.toFixed(1)}x`,
  },
  seed: {
    label: 'Seed',
    min: 1,
    max: 999,
    defaultValue: 30,
    step: 1,
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'ambient' as const,
  viewingDistance: 2,
  dimensions: { width: 1.5, height: 1.5 },
  animated: true,
  suggestedZone: 'Recursion Room',
  canBecomeArchitecture: true,
  placard: `Each shape asserts a property. "I am blue." "I am still." "I am large." Each shape does what it wants. The code works perfectly—it does exactly what it was written to do. The bug isn't in the execution. The bug is in the specification. Or is it a feature?`,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let lastSeed = -1;
let lastShapeCount = -1;

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 30,
  prompt: "It's not a bug, it's a feature.",
  creditName: 'Bart Simons',
  creditUrl: 'https://www.bartsimons.com/',
  recording: {
    enabled: true,
    duration: 12,
    filename: 'genuary-2026-day-30',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 30) as number);
    const shapeCount = Math.floor((controls.shapeCount ?? 5) as number);
    const lieFrequency = (controls.lieFrequency ?? 0.75) as number;

    const random = createSeededRandom(seed);
    lastSeed = seed;
    lastShapeCount = shapeCount;

    // Create shapes
    const shapes: Shape[] = [];
    for (let i = 0; i < shapeCount; i++) {
      const x = 150 + random() * (p.width - 300);
      const y = 120 + random() * (p.height - 240);
      shapes.push(createShape(x, y, random, 0, lieFrequency));
    }

    const state: State = {
      shapes,
      time: 0,
      random,
    };

    (p as any)._assertionState = state;
    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check for seed or shape count change
    const seed = Math.floor((controls.seed ?? 30) as number);
    const shapeCount = Math.floor((controls.shapeCount ?? 5) as number);

    if (seed !== lastSeed || shapeCount !== lastShapeCount) {
      config.setup?.(p);
    }

    let state: State = (p as any)._assertionState;
    if (!state) {
      config.setup?.(p);
      state = (p as any)._assertionState;
    }

    const speed = (controls.speed ?? 1) as number;
    const lieFrequency = (controls.lieFrequency ?? 0.75) as number;

    // Update
    state.time++;
    for (const shape of state.shapes) {
      updateShape(shape, p.width, p.height, state.random, lieFrequency, speed);
    }

    // Draw background
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(45, 8, 96); // Warm cream

    // Draw title
    drawTitle(p);

    // Draw shapes
    for (const shape of state.shapes) {
      drawShape(p, shape, state.time);
    }

    // Draw assertions (on top of shapes)
    for (const shape of state.shapes) {
      drawAssertion(p, shape);
    }

    // Draw legend
    drawLegend(p, lieFrequency);
  },

  renderFinal: (p: p5) => {
    config.draw?.(p);
  },
};

// Claude's Choice — settings for maximum comedic confusion
export function getClaudesChoice(): Partial<ControlState> {
  return {
    shapeCount: 5,
    lieFrequency: 0.8,
    speed: 1,
    seed: 42,
  };
}

export { controlConfigs, defaultControls };
export default config;
