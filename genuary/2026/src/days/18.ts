/**
 * Day 18: "LAST"
 *
 * Unexpected path: Draw a route that changes direction based on one very simple rule.
 *
 * The rule: Step to a random unvisited neighbor. When there are no neighbors left, stop.
 *
 * Multiple walkers start simultaneously, sharing the same space. One by one they freeze
 * as they paint themselves into corners. Eventually only one remains, moving through the
 * graveyard of its predecessors. It too will stop.
 *
 * The unexpected part isn't that walkers get trapped—that's mathematically guaranteed.
 * The unexpected part is which walker survives longest, how frozen paths create terrain,
 * and the feeling when the last walker finally stops.
 *
 * After self-avoiding walks on lattices. Not failure—completion.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface GridPos {
  x: number;
  y: number;
}

interface Walker {
  id: number;
  pos: GridPos;
  path: GridPos[];
  hue: number;
  frozen: boolean;
  frozenAt: number;  // timestamp when frozen
  stepCount: number;
}

interface LastState {
  walkers: Walker[];
  grid: boolean[][];  // true = occupied
  gridSize: number;
  cellSize: number;
  lastWalkerId: number | null;  // ID of the last active walker
  allFrozen: boolean;
  freezeTime: number;  // time since all walkers froze
  seed: number;
  stepTimer: number;
  totalSteps: number;
}

// ============================================================================
// SEEDED RANDOM
// ============================================================================

function createRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ============================================================================
// WALKER LOGIC
// ============================================================================

function getNeighbors(pos: GridPos, gridSize: number): GridPos[] {
  const neighbors: GridPos[] = [];
  const dirs = [
    { x: 0, y: -1 },  // up
    { x: 1, y: 0 },   // right
    { x: 0, y: 1 },   // down
    { x: -1, y: 0 }   // left
  ];

  for (const dir of dirs) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}

function getUnvisitedNeighbors(pos: GridPos, grid: boolean[][], gridSize: number): GridPos[] {
  return getNeighbors(pos, gridSize).filter(n => !grid[n.y][n.x]);
}

function createWalker(
  id: number,
  startPos: GridPos,
  hue: number,
  grid: boolean[][]
): Walker {
  grid[startPos.y][startPos.x] = true;
  return {
    id,
    pos: startPos,
    path: [{ ...startPos }],
    hue,
    frozen: false,
    frozenAt: 0,
    stepCount: 0
  };
}

function stepWalker(
  walker: Walker,
  grid: boolean[][],
  gridSize: number,
  rand: () => number,
  currentTime: number
): void {
  if (walker.frozen) return;

  const unvisited = getUnvisitedNeighbors(walker.pos, grid, gridSize);

  if (unvisited.length === 0) {
    // No valid moves—freeze
    walker.frozen = true;
    walker.frozenAt = currentTime;
    return;
  }

  // Pick random unvisited neighbor
  const idx = Math.floor(rand() * unvisited.length);
  const next = unvisited[idx];

  // Move
  walker.pos = { ...next };
  walker.path.push({ ...next });
  walker.stepCount++;
  grid[next.y][next.x] = true;
}

// ============================================================================
// STATE INITIALIZATION
// ============================================================================

function initState(controls: ControlState, canvasSize: number): LastState {
  const gridSize = Math.round(controls.gridSize ?? 35);
  const walkerCount = Math.round(controls.walkerCount ?? 25);
  const seed = Math.round(controls.seed ?? Date.now() % 10000);
  const rand = createRandom(seed);

  const cellSize = canvasSize / gridSize;

  // Initialize empty grid
  const grid: boolean[][] = [];
  for (let y = 0; y < gridSize; y++) {
    grid.push(new Array(gridSize).fill(false));
  }

  // Create walkers at random positions
  const walkers: Walker[] = [];
  const usedPositions = new Set<string>();

  for (let i = 0; i < walkerCount; i++) {
    // Find unused position
    let attempts = 0;
    let pos: GridPos;
    do {
      pos = {
        x: Math.floor(rand() * gridSize),
        y: Math.floor(rand() * gridSize)
      };
      attempts++;
    } while (usedPositions.has(`${pos.x},${pos.y}`) && attempts < 1000);

    if (attempts >= 1000) break;  // Grid too full

    usedPositions.add(`${pos.x},${pos.y}`);

    // Hue based on starting position (spatial logic)
    const hue = ((pos.x + pos.y) / (gridSize * 2)) * 360;

    walkers.push(createWalker(i, pos, hue, grid));
  }

  return {
    walkers,
    grid,
    gridSize,
    cellSize,
    lastWalkerId: null,
    allFrozen: false,
    freezeTime: 0,
    seed,
    stepTimer: 0,
    totalSteps: 0
  };
}

// ============================================================================
// STATE UPDATE
// ============================================================================

function updateState(
  state: LastState,
  deltaTime: number,
  controls: ControlState
): LastState {
  const speed = controls.speed ?? 1.0;
  const stepInterval = 0.05 / speed;  // Time between steps

  // If all frozen, count freeze time
  if (state.allFrozen) {
    const newFreezeTime = state.freezeTime + deltaTime;
    const autoRestart = controls.autoRestart ?? 1;

    // Auto-restart after 2 seconds if enabled
    if (autoRestart > 0.5 && newFreezeTime > 2.0) {
      return initState(controls, state.gridSize * state.cellSize);
    }

    return { ...state, freezeTime: newFreezeTime };
  }

  // Step timer
  const newStepTimer = state.stepTimer + deltaTime;
  if (newStepTimer < stepInterval) {
    return { ...state, stepTimer: newStepTimer };
  }

  // Take a step
  const rand = createRandom(state.seed + state.totalSteps);

  // Find active walkers
  const activeWalkers = state.walkers.filter(w => !w.frozen);

  if (activeWalkers.length === 0) {
    return {
      ...state,
      allFrozen: true,
      freezeTime: 0
    };
  }

  // Track the last active walker
  const lastWalkerId = activeWalkers.length === 1 ? activeWalkers[0].id : null;

  // Step all active walkers
  const currentTime = state.totalSteps * stepInterval;
  for (const walker of activeWalkers) {
    stepWalker(walker, state.grid, state.gridSize, rand, currentTime);
  }

  return {
    ...state,
    stepTimer: newStepTimer - stepInterval,
    totalSteps: state.totalSteps + 1,
    lastWalkerId,
    allFrozen: activeWalkers.every(w => w.frozen)
  };
}

// ============================================================================
// RENDERING
// ============================================================================

function renderState(p: p5, state: LastState, controls: ControlState): void {
  const trailOpacity = controls.trailOpacity ?? 0.5;
  const lastHighlight = controls.lastHighlight ?? 1.0;

  // Find the last active walker (or the one that was last)
  const activeWalkers = state.walkers.filter(w => !w.frozen);
  const isLastOneStanding = activeWalkers.length === 1;
  const lastWalker = isLastOneStanding ? activeWalkers[0] :
    (state.lastWalkerId !== null ? state.walkers.find(w => w.id === state.lastWalkerId) : null);

  // Draw all walker paths (frozen ones first, then active, so active render on top)
  const sortedWalkers = [...state.walkers].sort((a, b) => {
    if (a.frozen && !b.frozen) return -1;
    if (!a.frozen && b.frozen) return 1;
    return 0;
  });

  for (const walker of sortedWalkers) {
    const isLast = walker === lastWalker && isLastOneStanding;
    const isFrozen = walker.frozen;

    // Color properties - more contrast between frozen and active
    const pathSat = isFrozen ? 25 : 75;
    const pathBright = isFrozen ? 45 : 85;
    const baseAlpha = isFrozen ? trailOpacity : 1.0;
    const lineWidth = isLast ? 4 + lastHighlight * 2 : (isFrozen ? 1.5 : 2.5);

    // Draw path with smooth curves
    if (walker.path.length > 1) {
      p.stroke(walker.hue, pathSat, pathBright, baseAlpha);
      p.strokeWeight(lineWidth);
      p.noFill();

      // Use curveVertex for smoother paths
      p.beginShape();
      // Duplicate first point for curveVertex to work properly
      const firstPos = walker.path[0];
      const fpx = firstPos.x * state.cellSize + state.cellSize / 2;
      const fpy = firstPos.y * state.cellSize + state.cellSize / 2;
      p.curveVertex(fpx, fpy);

      for (const pos of walker.path) {
        const px = pos.x * state.cellSize + state.cellSize / 2;
        const py = pos.y * state.cellSize + state.cellSize / 2;
        p.curveVertex(px, py);
      }

      // Duplicate last point
      const lastPos = walker.path[walker.path.length - 1];
      const lpx = lastPos.x * state.cellSize + state.cellSize / 2;
      const lpy = lastPos.y * state.cellSize + state.cellSize / 2;
      p.curveVertex(lpx, lpy);

      p.endShape();
    }

    // Draw current position marker
    const headPos = walker.path[walker.path.length - 1];
    const hx = headPos.x * state.cellSize + state.cellSize / 2;
    const hy = headPos.y * state.cellSize + state.cellSize / 2;

    p.noStroke();

    if (isLast && !isFrozen) {
      // LAST ONE STANDING: dramatic pulsing with outer glow
      const time = p.millis() / 1000;
      const pulse = Math.sin(time * 4) * 0.5 + 0.5; // 0-1 range, faster pulse
      const sizePulse = 1 + pulse * 0.4 * lastHighlight; // Size varies 1.0-1.4x

      // Outer glow ring
      const glowSize = state.cellSize * 1.8 * sizePulse;
      p.fill(walker.hue, 60, 100, 0.15 + pulse * 0.15);
      p.ellipse(hx, hy, glowSize, glowSize);

      // Middle glow
      const midSize = state.cellSize * 1.2 * sizePulse;
      p.fill(walker.hue, 70, 100, 0.3 + pulse * 0.2);
      p.ellipse(hx, hy, midSize, midSize);

      // Core - bright and solid
      const coreSize = state.cellSize * 0.7 * sizePulse;
      p.fill(walker.hue, 85, 100);
      p.ellipse(hx, hy, coreSize, coreSize);

    } else if (!isFrozen) {
      // Active but not last - still vibrant
      p.fill(walker.hue, 75, 95);
      p.ellipse(hx, hy, state.cellSize * 0.55, state.cellSize * 0.55);
    } else {
      // Frozen: muted marker - part of the graveyard
      p.fill(walker.hue, 20, 50, trailOpacity * 0.8);
      p.ellipse(hx, hy, state.cellSize * 0.35, state.cellSize * 0.35);
    }
  }

  // The stillness when all freeze is the statement. No text needed.
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  walkerCount: 25,
  gridSize: 35,
  speed: 1.0,
  trailOpacity: 0.5,
  lastHighlight: 1.0,
  autoRestart: 1,
  seed: 42
};

const controlConfigs: { [key: string]: ControlConfig } = {
  walkerCount: {
    label: 'Walkers',
    min: 5,
    max: 50,
    defaultValue: 25,
    step: 1
  },
  gridSize: {
    label: 'Grid Size',
    min: 20,
    max: 60,
    defaultValue: 35,
    step: 1
  },
  speed: {
    label: 'Speed',
    min: 0.2,
    max: 3.0,
    defaultValue: 1.0,
    step: 0.1
  },
  trailOpacity: {
    label: 'Frozen Opacity',
    min: 0.2,
    max: 0.9,
    defaultValue: 0.5,
    step: 0.05
  },
  lastHighlight: {
    label: 'Last Highlight',
    min: 0,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  autoRestart: {
    label: 'Auto-Restart',
    min: 0,
    max: 1,
    defaultValue: 1,
    step: 1,
    format: (v: number) => v > 0.5 ? 'On' : 'Off'
  },
  seed: {
    label: 'Seed',
    min: 1,
    max: 9999,
    defaultValue: 42,
    step: 1
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 18,
  prompt: 'Unexpected path. Draw a route that changes direction based on one very simple rule.',
  creditName: 'Baret LaVida',
  creditUrl: 'https://www.artbaret.com/',
  recording: {
    enabled: true,
    duration: 20,
    filename: 'genuary-2026-day-18'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 1);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    (p as any)._lastState = initState(controls, 800);
    (p as any)._lastTime = p.millis();
    (p as any)._lastControls = { ...controls };

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check if controls changed significantly (need re-init)
    const lastControls = (p as any)._lastControls || {};
    const needsReinit =
      Math.round(controls.walkerCount ?? 25) !== Math.round(lastControls.walkerCount ?? 25) ||
      Math.round(controls.gridSize ?? 35) !== Math.round(lastControls.gridSize ?? 35) ||
      Math.round(controls.seed ?? 42) !== Math.round(lastControls.seed ?? 42);

    if (needsReinit) {
      (p as any)._lastState = initState(controls, 800);
      (p as any)._lastControls = { ...controls };
    }

    // Calculate delta time
    const currentTime = p.millis();
    const deltaTime = (currentTime - ((p as any)._lastTime || currentTime)) / 1000;
    (p as any)._lastTime = currentTime;

    // Update state
    let state: LastState = (p as any)._lastState;
    state = updateState(state, deltaTime, controls);
    (p as any)._lastState = state;

    // Warm cream background
    p.background(40, 8, 96);

    // Render
    renderState(p, state, controls);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Create a state and run it until all walkers freeze
    let state = initState({ ...controls, seed: 42 }, 800);

    // Simulate until completion
    for (let i = 0; i < 10000 && !state.allFrozen; i++) {
      state = updateState(state, 0.1, controls);
    }

    p.background(40, 8, 96);
    renderState(p, state, controls);
  }
};

// Claude's Choice — settings that create dramatic competition and clear "last one standing" moments
export function getClaudesChoice(): Partial<ControlState> {
  return {
    walkerCount: 30,
    gridSize: 40,
    speed: 1.2,
    trailOpacity: 0.55,
    lastHighlight: 1.5,
    autoRestart: 1,
    seed: 2026
  };
}

export { controlConfigs, defaultControls };
export default config;
