/**
 * Day 9: "FEVER DREAM"
 *
 * A thermodynamic cellular automaton where heat spreads like contagion,
 * fever kills, and the rules themselves shift based on global state.
 *
 * The crazy rules:
 * 1. Heat spreads from hot cells to cold neighbors
 * 2. Cells above the fever threshold die (become ash)
 * 3. Ash absorbs heat, cooling its neighbors
 * 4. The fever threshold shifts based on average grid temperature
 * 5. Spontaneous ignition events create new hot spots
 * 6. The system never reaches equilibrium — it dreams forever
 *
 * Medium: Cellular fever, emergent panic, silicon hallucination
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

// Cell states
const COLD = 0;      // Dormant, waiting
const WARMING = 1;   // Getting excited
const HOT = 2;       // Fever peak, spreading
const DYING = 3;     // Fever break, about to become ash
const ASH = 4;       // Aftermath, absorbs heat
const REBIRTH = 5;   // Regenerating from ash

interface Cell {
  state: number;
  temperature: number;  // 0-1
  age: number;          // How long in current state
  hue: number;          // Slight color variation
}

// ============================================================================
// GRID MANAGEMENT
// ============================================================================

function createGrid(cols: number, rows: number, rand: () => number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Start mostly cold with some random seeds
      const temp = rand() < 0.02 ? 0.3 + rand() * 0.4 : rand() * 0.1;
      grid[y][x] = {
        state: temp > 0.3 ? WARMING : COLD,
        temperature: temp,
        age: 0,
        hue: rand() * 30 - 15  // Color variation
      };
    }
  }
  return grid;
}

function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

// ============================================================================
// THE CRAZY RULES
// ============================================================================

function getNeighborTemperatures(grid: Cell[][], x: number, y: number): number[] {
  const temps: number[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;
      temps.push(grid[ny][nx].temperature);
    }
  }
  return temps;
}

function countNeighborStates(grid: Cell[][], x: number, y: number, state: number): number {
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;
      if (grid[ny][nx].state === state) count++;
    }
  }
  return count;
}

function calculateGlobalTemperature(grid: Cell[][]): number {
  let total = 0;
  let count = 0;

  for (const row of grid) {
    for (const cell of row) {
      total += cell.temperature;
      count++;
    }
  }

  return total / count;
}

function updateGrid(
  grid: Cell[][],
  controls: ControlState,
  rand: () => number,
  globalTemp: number
): Cell[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = cloneGrid(grid);

  const spreadRate = controls.spreadRate ?? 0.15;
  const baseFeverThreshold = controls.feverThreshold ?? 0.75;
  const ashCooling = controls.ashCooling ?? 0.1;
  const rebirthChance = controls.rebirthChance ?? 0.02;
  const ignitionChance = controls.ignitionChance ?? 0.001;
  const feedbackStrength = controls.feedbackStrength ?? 0.3;

  // THE CRAZY RULE: Fever threshold shifts with global temperature
  // When the grid is hot, it's HARDER to survive (threshold drops)
  // When the grid is cold, fever is less deadly (threshold rises)
  const feverThreshold = baseFeverThreshold - (globalTemp * feedbackStrength);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const newCell = newGrid[y][x];
      const neighborTemps = getNeighborTemperatures(grid, x, y);
      const avgNeighborTemp = neighborTemps.reduce((a, b) => a + b, 0) / neighborTemps.length;
      const hotNeighbors = countNeighborStates(grid, x, y, HOT);
      const ashNeighbors = countNeighborStates(grid, x, y, ASH);

      // Age increment
      newCell.age = cell.age + 1;

      // RULE 1: Heat spreads from hot neighbors
      if (hotNeighbors > 0) {
        newCell.temperature += spreadRate * (hotNeighbors / 8);
      }

      // RULE 2: Temperature diffusion (heat seeks equilibrium locally)
      const diffusion = (avgNeighborTemp - cell.temperature) * 0.1;
      newCell.temperature += diffusion;

      // RULE 3: Ash absorbs heat (cools neighbors indirectly by being cold)
      if (ashNeighbors > 0) {
        newCell.temperature -= ashCooling * (ashNeighbors / 8);
      }

      // RULE 4: Spontaneous ignition (lightning strikes)
      if (cell.state === COLD && rand() < ignitionChance) {
        newCell.temperature = 0.5 + rand() * 0.3;
        newCell.state = WARMING;
        newCell.age = 0;
      }

      // STATE TRANSITIONS based on temperature
      switch (cell.state) {
        case COLD:
          if (newCell.temperature > 0.2) {
            newCell.state = WARMING;
            newCell.age = 0;
          }
          break;

        case WARMING:
          if (newCell.temperature > 0.5) {
            newCell.state = HOT;
            newCell.age = 0;
          } else if (newCell.temperature < 0.15) {
            newCell.state = COLD;
            newCell.age = 0;
          }
          break;

        case HOT:
          // RULE 5: Fever death (the crazy adaptive threshold)
          if (newCell.temperature > feverThreshold) {
            newCell.state = DYING;
            newCell.age = 0;
          } else if (newCell.temperature < 0.4) {
            newCell.state = WARMING;
            newCell.age = 0;
          }
          // Hot cells continue heating up
          newCell.temperature += 0.02;
          break;

        case DYING:
          // Quick transition to ash
          newCell.temperature *= 0.7;
          if (cell.age > 3) {
            newCell.state = ASH;
            newCell.age = 0;
            newCell.temperature = 0.05;
          }
          break;

        case ASH:
          // RULE 6: Rebirth from ash
          if (cell.age > 10 && rand() < rebirthChance && avgNeighborTemp > 0.15 && avgNeighborTemp < 0.4) {
            newCell.state = REBIRTH;
            newCell.age = 0;
            newCell.temperature = 0.25;
          }
          // Ash slowly warms if surrounded by heat
          newCell.temperature += (avgNeighborTemp - cell.temperature) * 0.05;
          break;

        case REBIRTH:
          // Quick flash then become warming
          if (cell.age > 2) {
            newCell.state = WARMING;
            newCell.age = 0;
          }
          break;
      }

      // Clamp temperature
      newCell.temperature = Math.max(0, Math.min(1, newCell.temperature));
    }
  }

  return newGrid;
}

// ============================================================================
// RENDERING
// ============================================================================

function getCellColor(cell: Cell, p: p5, globalTemp: number): [number, number, number, number] {
  const t = cell.temperature;
  const age = cell.age;

  // Color palette based on state and temperature
  switch (cell.state) {
    case COLD: {
      // Deep blue-purple, barely visible pulse
      const pulse = Math.sin(age * 0.1) * 0.1 + 0.9;
      const h = 240 + cell.hue;
      const s = 60 + t * 30;
      const b = 15 + t * 25;
      return hsbToRgb(h, s * pulse, b);
    }

    case WARMING: {
      // Yellow-orange, growing excitement
      const h = 45 - t * 20 + cell.hue;
      const s = 70 + t * 25;
      const b = 40 + t * 50;
      return hsbToRgb(h, s, b);
    }

    case HOT: {
      // Bright white-yellow, fever peak
      const pulse = Math.sin(age * 0.3) * 0.1 + 0.9;
      const h = 50 - t * 30 + cell.hue;
      const s = 30 - t * 20;  // Desaturates toward white
      const b = 85 + t * 15;
      return hsbToRgb(h, s * pulse, b);
    }

    case DYING: {
      // Red, the fever break
      const fade = 1 - (age / 5);
      const h = 0 + cell.hue;
      const s = 80 * fade;
      const b = 70 * fade + 10;
      return hsbToRgb(h, s, b);
    }

    case ASH: {
      // Dark gray-brown, aftermath
      const h = 30 + cell.hue;
      const s = 20;
      const b = 12 + Math.sin(age * 0.05) * 3;
      return hsbToRgb(h, s, b);
    }

    case REBIRTH: {
      // Green flash, new life
      const flash = 1 - (age / 4);
      const h = 120 + cell.hue;
      const s = 80 * flash;
      const b = 70 * flash + 20;
      return hsbToRgb(h, s, b);
    }

    default:
      return [0, 0, 0, 255];
  }
}

function hsbToRgb(h: number, s: number, b: number): [number, number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  b = Math.max(0, Math.min(100, b)) / 100;

  const c = b * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = b - c;

  let r = 0, g = 0, bl = 0;

  if (h < 60) { r = c; g = x; bl = 0; }
  else if (h < 120) { r = x; g = c; bl = 0; }
  else if (h < 180) { r = 0; g = c; bl = x; }
  else if (h < 240) { r = 0; g = x; bl = c; }
  else if (h < 300) { r = x; g = 0; bl = c; }
  else { r = c; g = 0; bl = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((bl + m) * 255),
    255
  ];
}

function renderGrid(p: p5, grid: Cell[][], cellSize: number, globalTemp: number): void {
  p.loadPixels();

  const rows = grid.length;
  const cols = grid[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const color = getCellColor(cell, p, globalTemp);

      // Fill the cell
      for (let dy = 0; dy < cellSize && y * cellSize + dy < p.height; dy++) {
        for (let dx = 0; dx < cellSize && x * cellSize + dx < p.width; dx++) {
          const px = x * cellSize + dx;
          const py = y * cellSize + dy;
          const idx = (py * p.width + px) * 4;

          p.pixels[idx] = color[0];
          p.pixels[idx + 1] = color[1];
          p.pixels[idx + 2] = color[2];
          p.pixels[idx + 3] = color[3];
        }
      }
    }
  }

  p.updatePixels();
}

// ============================================================================
// SEEDED RANDOM
// ============================================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  cellSize: 6,
  spreadRate: 0.12,
  feverThreshold: 0.72,
  ashCooling: 0.08,
  rebirthChance: 0.025,
  ignitionChance: 0.0008,
  feedbackStrength: 0.25,
  simulationSpeed: 1
};

const controlConfigs: { [key: string]: ControlConfig } = {
  cellSize: {
    label: 'Cell Size',
    min: 2,
    max: 12,
    defaultValue: 6,
    step: 1
  },
  spreadRate: {
    label: 'Heat Spread Rate',
    min: 0.05,
    max: 0.3,
    defaultValue: 0.12,
    step: 0.01
  },
  feverThreshold: {
    label: 'Base Fever Threshold',
    min: 0.5,
    max: 0.9,
    defaultValue: 0.72,
    step: 0.02
  },
  ashCooling: {
    label: 'Ash Cooling Power',
    min: 0.02,
    max: 0.2,
    defaultValue: 0.08,
    step: 0.01
  },
  rebirthChance: {
    label: 'Rebirth Chance',
    min: 0.005,
    max: 0.1,
    defaultValue: 0.025,
    step: 0.005
  },
  ignitionChance: {
    label: 'Spontaneous Ignition',
    min: 0.0001,
    max: 0.005,
    defaultValue: 0.0008,
    step: 0.0001
  },
  feedbackStrength: {
    label: 'Global Feedback',
    min: 0,
    max: 0.5,
    defaultValue: 0.25,
    step: 0.05
  },
  simulationSpeed: {
    label: 'Simulation Speed',
    min: 0.25,
    max: 3,
    defaultValue: 1,
    step: 0.25
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 9,
  prompt: 'Crazy automaton. Cellular automata with crazy rules.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  recording: {
    enabled: true,
    duration: 25,
    filename: 'genuary-2026-day-09'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.pixelDensity(1);
    p.noSmooth();
    p.frameRate(30);

    const controls: ControlState = (p as any)._controls || defaultControls;
    const cellSize = Math.round(controls.cellSize ?? 6);
    const cols = Math.floor(p.width / cellSize);
    const rows = Math.floor(p.height / cellSize);

    // Initialize state
    const rand = seededRandom(42);
    (p as any)._grid = createGrid(cols, rows, rand);
    (p as any)._rand = seededRandom(Date.now());
    (p as any)._lastCellSize = cellSize;
    (p as any)._frameAccumulator = 0;
    (p as any)._globalTemp = 0;
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || defaultControls;
    const cellSize = Math.round(controls.cellSize ?? 6);
    const simulationSpeed = controls.simulationSpeed ?? 1;

    // Regenerate grid if cell size changed
    if (cellSize !== (p as any)._lastCellSize) {
      const cols = Math.floor(p.width / cellSize);
      const rows = Math.floor(p.height / cellSize);
      const rand = seededRandom(42);
      (p as any)._grid = createGrid(cols, rows, rand);
      (p as any)._lastCellSize = cellSize;
    }

    let grid: Cell[][] = (p as any)._grid;
    const rand: () => number = (p as any)._rand;

    // Update simulation (variable speed)
    (p as any)._frameAccumulator += simulationSpeed;
    while ((p as any)._frameAccumulator >= 1) {
      const globalTemp = calculateGlobalTemperature(grid);
      (p as any)._globalTemp = globalTemp;
      grid = updateGrid(grid, controls, rand, globalTemp);
      (p as any)._grid = grid;
      (p as any)._frameAccumulator -= 1;
    }

    // Render
    const globalTemp = (p as any)._globalTemp || 0;
    renderGrid(p, grid, cellSize, globalTemp);
  },

  renderFinal: (p: p5) => {
    // Run simulation to a visually interesting state
    const controls: ControlState = (p as any)._controls || defaultControls;
    const cellSize = Math.round(controls.cellSize ?? 6);
    const cols = Math.floor(p.width / cellSize);
    const rows = Math.floor(p.height / cellSize);

    const rand = seededRandom(42);
    let grid = createGrid(cols, rows, rand);

    // Run for a fixed number of steps to get interesting patterns
    for (let i = 0; i < 150; i++) {
      const globalTemp = calculateGlobalTemperature(grid);
      grid = updateGrid(grid, controls, rand, globalTemp);
    }

    const globalTemp = calculateGlobalTemperature(grid);
    renderGrid(p, grid, cellSize, globalTemp);
  }
};

// Claude's Choice — settings that create dramatic fever cycles
export function getClaudesChoice(): Partial<ControlState> {
  return {
    cellSize: 5,
    spreadRate: 0.14,
    feverThreshold: 0.68,
    ashCooling: 0.1,
    rebirthChance: 0.03,
    ignitionChance: 0.001,
    feedbackStrength: 0.3,
    simulationSpeed: 1.25
  };
}

export { controlConfigs, defaultControls };
export default config;
