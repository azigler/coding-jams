/**
 * Day 21: ANSCHLAG
 *
 * "Bauhaus Poster." — Piero
 *
 * Four poster compositions using the same primitive elements:
 * - Circle (blue #1E3A8A)
 * - Triangle (yellow #F7C325)
 * - Rectangles (red #D62828)
 *
 * The shapes animate smoothly between four distinct compositions,
 * demonstrating that design is deliberate choice. Each composition
 * shows a different principle:
 *
 * 1. HIERARCHY — Elements arranged by visual weight
 * 2. BALANCE — Symmetric or asymmetric equilibrium
 * 3. GRID — Strict alignment to underlying structure
 * 4. MEANING — Narrative arrangement (elements "speaking")
 *
 * The Bauhaus was a school before it was a style.
 * Yellow is aggressive, pushes outward (triangle).
 * Blue is concentric, recedes (circle).
 * Red is stable, grounded (rectangle).
 *
 * Medium: p5.js with clean vector rendering
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// COLORS
// ============================================================================

const COLORS = {
  background: '#F5F0E1', // Warm cream
  yellow: '#F7C325',     // Aggressive, outward
  red: '#D62828',        // Stable, grounded
  blue: '#1E3A8A',       // Concentric, receding
  grid: 'rgba(0, 0, 0, 0.08)', // Subtle grid lines
};

// ============================================================================
// TYPES
// ============================================================================

interface ElementState {
  x: number;
  y: number;
  size: number;      // Primary size (radius for circle, base for triangle, width for rect)
  size2?: number;    // Secondary size (height for rect)
  rotation: number;  // Rotation in radians
}

interface CompositionState {
  circle: ElementState;
  triangle: ElementState;
  rect1: ElementState;
  rect2: ElementState;
  rect3: ElementState;
}

interface AnschlagState {
  currentComposition: number;
  targetComposition: number;
  transitionProgress: number;
  holdTimer: number;
  compositions: CompositionState[];
}

// ============================================================================
// EASING
// ============================================================================

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================================================
// ELEMENT INTERPOLATION
// ============================================================================

function lerpElement(from: ElementState, to: ElementState, t: number): ElementState {
  const eased = easeInOutCubic(t);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    size: from.size + (to.size - from.size) * eased,
    size2: (from.size2 ?? from.size) + ((to.size2 ?? to.size) - (from.size2 ?? from.size)) * eased,
    rotation: from.rotation + (to.rotation - from.rotation) * eased,
  };
}

function lerpComposition(from: CompositionState, to: CompositionState, t: number): CompositionState {
  return {
    circle: lerpElement(from.circle, to.circle, t),
    triangle: lerpElement(from.triangle, to.triangle, t),
    rect1: lerpElement(from.rect1, to.rect1, t),
    rect2: lerpElement(from.rect2, to.rect2, t),
    rect3: lerpElement(from.rect3, to.rect3, t),
  };
}

// ============================================================================
// FOUR COMPOSITIONS
// ============================================================================

/**
 * Create the four Bauhaus poster compositions
 * Each uses the same elements but arranges them differently
 */
function createCompositions(w: number, h: number): CompositionState[] {
  const unit = Math.min(w, h) / 10;
  const cx = w / 2;
  const cy = h / 2;

  // COMPOSITION 1: HIERARCHY
  // Large blue circle dominates, smaller elements support
  const hierarchy: CompositionState = {
    circle: { x: cx - unit * 0.5, y: cy - unit * 0.5, size: unit * 2.8, rotation: 0 },
    triangle: { x: cx + unit * 2.5, y: cy - unit * 2, size: unit * 1.2, rotation: 0 },
    rect1: { x: cx - unit * 2.5, y: cy + unit * 2.5, size: unit * 2.5, size2: unit * 0.4, rotation: 0 },
    rect2: { x: cx + unit * 2, y: cy + unit * 1.5, size: unit * 0.4, size2: unit * 2, rotation: 0 },
    rect3: { x: cx - unit * 3, y: cy - unit * 2, size: unit * 0.6, size2: unit * 1.2, rotation: 0 },
  };

  // COMPOSITION 2: BALANCE
  // Asymmetric but stable, elements in equilibrium
  const balance: CompositionState = {
    circle: { x: cx + unit * 2, y: cy + unit * 1.5, size: unit * 1.8, rotation: 0 },
    triangle: { x: cx - unit * 2, y: cy - unit * 1.5, size: unit * 1.8, rotation: Math.PI },
    rect1: { x: cx, y: cy, size: unit * 3.5, size2: unit * 0.3, rotation: Math.PI / 12 },
    rect2: { x: cx - unit * 2.5, y: cy + unit * 2, size: unit * 1.5, size2: unit * 0.8, rotation: 0 },
    rect3: { x: cx + unit * 2.5, y: cy - unit * 2.5, size: unit * 0.5, size2: unit * 2.2, rotation: 0 },
  };

  // COMPOSITION 3: GRID
  // Strict alignment to modular grid, Swiss precision
  const grid: CompositionState = {
    circle: { x: cx - unit * 2, y: cy - unit * 2, size: unit * 1.5, rotation: 0 },
    triangle: { x: cx + unit * 2, y: cy + unit * 2, size: unit * 1.5, rotation: 0 },
    rect1: { x: cx, y: cy - unit * 2, size: unit * 3, size2: unit * 0.25, rotation: 0 },
    rect2: { x: cx, y: cy + unit * 2, size: unit * 3, size2: unit * 0.25, rotation: 0 },
    rect3: { x: cx + unit * 2, y: cy - unit * 0.5, size: unit * 0.25, size2: unit * 2.5, rotation: 0 },
  };

  // COMPOSITION 4: MEANING
  // Narrative arrangement - elements become a face/figure
  const meaning: CompositionState = {
    circle: { x: cx, y: cy - unit * 1.5, size: unit * 2.2, rotation: 0 },
    triangle: { x: cx, y: cy + unit * 2.5, size: unit * 2.5, rotation: Math.PI },
    rect1: { x: cx - unit * 0.8, y: cy - unit * 1.8, size: unit * 0.4, size2: unit * 0.2, rotation: 0 },
    rect2: { x: cx + unit * 0.8, y: cy - unit * 1.8, size: unit * 0.4, size2: unit * 0.2, rotation: 0 },
    rect3: { x: cx, y: cy - unit * 0.8, size: unit * 0.8, size2: unit * 0.15, rotation: 0 },
  };

  return [hierarchy, balance, grid, meaning];
}

// ============================================================================
// RENDERING
// ============================================================================

function drawGrid(p: p5, w: number, h: number, showGrid: boolean): void {
  if (!showGrid) return;

  p.push();
  p.stroke(COLORS.grid);
  p.strokeWeight(1);

  const step = Math.min(w, h) / 10;

  // Vertical lines
  for (let x = step; x < w; x += step) {
    p.line(x, 0, x, h);
  }

  // Horizontal lines
  for (let y = step; y < h; y += step) {
    p.line(0, y, w, y);
  }

  p.pop();
}

function drawCircle(p: p5, state: ElementState): void {
  p.push();
  p.fill(COLORS.blue);
  p.noStroke();
  p.translate(state.x, state.y);
  p.rotate(state.rotation);
  p.ellipse(0, 0, state.size * 2, state.size * 2);
  p.pop();
}

function drawTriangle(p: p5, state: ElementState): void {
  p.push();
  p.fill(COLORS.yellow);
  p.noStroke();
  p.translate(state.x, state.y);
  p.rotate(state.rotation);

  const h = state.size * Math.sqrt(3);
  p.triangle(
    0, -h / 2,           // Top vertex
    -state.size, h / 2,  // Bottom left
    state.size, h / 2    // Bottom right
  );
  p.pop();
}

function drawRectangle(p: p5, state: ElementState): void {
  p.push();
  p.fill(COLORS.red);
  p.noStroke();
  p.translate(state.x, state.y);
  p.rotate(state.rotation);
  p.rectMode(p.CENTER);
  p.rect(0, 0, state.size, state.size2 ?? state.size);
  p.pop();
}

function drawComposition(p: p5, comp: CompositionState): void {
  // Draw in order: rectangles (back), circle (middle), triangle (front)
  // This creates depth with yellow aggressive in front
  drawRectangle(p, comp.rect1);
  drawRectangle(p, comp.rect2);
  drawRectangle(p, comp.rect3);
  drawCircle(p, comp.circle);
  drawTriangle(p, comp.triangle);
}

function drawCompositionLabel(p: p5, compositionIndex: number, w: number, h: number): void {
  const labels = ['HIERARCHY', 'BALANCE', 'GRID', 'MEANING'];
  const label = labels[compositionIndex];

  p.push();
  p.fill(0, 0, 0, 40);
  p.noStroke();
  p.textFont('Helvetica');
  p.textSize(Math.min(w, h) / 25);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(label, Math.min(w, h) / 20, h - Math.min(w, h) / 20);
  p.pop();
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(w: number, h: number): AnschlagState {
  return {
    currentComposition: 0,
    targetComposition: 0,
    transitionProgress: 1,
    holdTimer: 0,
    compositions: createCompositions(w, h),
  };
}

function updateState(
  state: AnschlagState,
  deltaTime: number,
  controls: ControlState,
  w: number,
  h: number
): AnschlagState {
  const holdDuration = (controls.holdDuration ?? 10) as number;
  const transitionSpeed = (controls.transitionSpeed ?? 1) as number;
  const autoAdvance = (controls.autoAdvance ?? 1) as number;
  const manualComposition = Math.floor((controls.composition ?? 0) as number);

  // Recreate compositions if canvas size changed
  let compositions = state.compositions;
  if (compositions.length === 0 ||
      Math.abs(compositions[0].circle.x - w / 2) > 10) {
    compositions = createCompositions(w, h);
  }

  // Manual override mode
  if (manualComposition >= 0 && manualComposition <= 3 && autoAdvance < 0.5) {
    if (state.targetComposition !== manualComposition) {
      return {
        ...state,
        currentComposition: state.targetComposition,
        targetComposition: manualComposition,
        transitionProgress: 0,
        holdTimer: 0,
        compositions,
      };
    }
  }

  // Currently transitioning
  if (state.transitionProgress < 1) {
    const newProgress = Math.min(1, state.transitionProgress + deltaTime * transitionSpeed * 0.5);
    return {
      ...state,
      transitionProgress: newProgress,
      compositions,
    };
  }

  // Auto-advance mode: counting hold time
  if (autoAdvance >= 0.5) {
    const newHoldTimer = state.holdTimer + deltaTime;
    if (newHoldTimer >= holdDuration) {
      // Start transition to next composition
      const nextComposition = (state.targetComposition + 1) % 4;
      return {
        currentComposition: state.targetComposition,
        targetComposition: nextComposition,
        transitionProgress: 0,
        holdTimer: 0,
        compositions,
      };
    }
    return {
      ...state,
      holdTimer: newHoldTimer,
      compositions,
    };
  }

  return { ...state, compositions };
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  composition: 0,
  transitionSpeed: 1.0,
  holdDuration: 10,
  autoAdvance: 1,
  showGrid: 0,
};

const controlConfigs: Record<string, ControlConfig> = {
  composition: {
    label: 'Composition',
    min: 0,
    max: 3,
    defaultValue: 0,
    step: 1,
    format: (v: number) => {
      const labels = ['Hierarchy', 'Balance', 'Grid', 'Meaning'];
      return labels[Math.floor(v)] || 'Hierarchy';
    },
  },
  transitionSpeed: {
    label: 'Transition Speed',
    min: 0.2,
    max: 3.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  holdDuration: {
    label: 'Hold Duration (sec)',
    min: 3,
    max: 20,
    defaultValue: 10,
    step: 1,
  },
  autoAdvance: {
    label: 'Auto Advance',
    min: 0,
    max: 1,
    defaultValue: 1,
    step: 1,
    format: (v: number) => v >= 0.5 ? 'On' : 'Off',
  },
  showGrid: {
    label: 'Show Grid',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
    format: (v: number) => v >= 0.5 ? 'On' : 'Off',
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'framed',
  viewingDistance: 2, // meters
  dimensions: { width: 1.2, height: 1.6 }, // 3:4 poster ratio
  animated: true,
  suggestedZone: 'The Poster Gallery',
  canBecomeArchitecture: true,
  placard: `Form follows function. Four compositions from the same shapes: circle, triangle, rectangle. Watch them rearrange. The yellow triangle is aggressive. The blue circle recedes. The red square grounds. Kandinsky's correspondence in motion. The Bauhaus was a school; this poster is a lesson.`,
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 21,
  prompt: 'Bauhaus Poster.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  recording: {
    enabled: true,
    duration: 45, // Full cycle through all 4 compositions
    filename: 'genuary-2026-day-21',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.RGB, 255);

    (p as any)._anschlagState = initState(p.width, p.height);
    (p as any)._lastTime = p.millis();

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Calculate delta time
    const currentTime = p.millis();
    const deltaTime = (currentTime - ((p as any)._lastTime || currentTime)) / 1000;
    (p as any)._lastTime = currentTime;

    // Update state (initialize if needed)
    let state: AnschlagState = (p as any)._anschlagState;
    if (!state) {
      state = initState(p.width, p.height);
    }
    state = updateState(state, deltaTime, controls, p.width, p.height);
    (p as any)._anschlagState = state;

    // Clear background
    p.background(COLORS.background);

    // Draw grid if enabled
    const showGrid = ((controls.showGrid ?? 0) as number) >= 0.5;
    drawGrid(p, p.width, p.height, showGrid);

    // Get current interpolated composition
    const fromComp = state.compositions[state.currentComposition];
    const toComp = state.compositions[state.targetComposition];
    const currentComp = lerpComposition(fromComp, toComp, state.transitionProgress);

    // Draw the composition
    drawComposition(p, currentComp);

    // Draw label for current target composition
    const displayIndex = state.transitionProgress > 0.5
      ? state.targetComposition
      : state.currentComposition;
    drawCompositionLabel(p, displayIndex, p.width, p.height);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const compositions = createCompositions(p.width, p.height);

    // Render the "Hierarchy" composition (most iconic)
    p.background(COLORS.background);

    const showGrid = ((controls.showGrid ?? 0) as number) >= 0.5;
    drawGrid(p, p.width, p.height, showGrid);

    drawComposition(p, compositions[0]);
    drawCompositionLabel(p, 0, p.width, p.height);
  },
};

// Claude's Choice — the most pedagogical settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    composition: 0,
    transitionSpeed: 0.8,
    holdDuration: 8,
    autoAdvance: 1,
    showGrid: 0,
  };
}

export { controlConfigs, defaultControls };
export default config;
