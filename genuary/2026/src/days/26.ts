/**
 * Day 26: ZONING
 *
 * "Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again." — Piero
 *
 * Watch a city build itself. Each recursive subdivision creates a new building block.
 * Recursion depth becomes height—the deeper the division, the taller the tower.
 * Downtown emerges where the algorithm runs deepest.
 *
 * Isometric projection. Warm terracotta. The skyline rises one split at a time.
 *
 * Medium: Canvas 2D with isometric projection
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface Cell {
  x: number;           // Grid position (top-left)
  y: number;
  width: number;       // Grid dimensions
  height: number;
  depth: number;       // Recursion depth (0 = root)
  birthTime: number;   // When this cell was created (ms)
  currentHeight: number; // Current animated height
  targetHeight: number;  // Final height based on depth
  hue: number;         // Color variation
  id: number;          // Unique identifier
}

// ============================================================================
// ISOMETRIC PROJECTION
// ============================================================================

const ISO_ANGLE = Math.PI / 6; // 30 degrees
const ISO_COS = Math.cos(ISO_ANGLE);
const ISO_SIN = Math.sin(ISO_ANGLE);

function gridToScreen(
  gridX: number,
  gridY: number,
  gridZ: number,
  centerX: number,
  centerY: number,
  scale: number
): { x: number; y: number } {
  // Classic 2:1 isometric projection
  const screenX = (gridX - gridY) * ISO_COS * scale;
  const screenY = (gridX + gridY) * ISO_SIN * scale - gridZ * scale;
  return {
    x: centerX + screenX,
    y: centerY + screenY,
  };
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

interface ColorPalette {
  name: string;
  background: string;
  getBlockColors: (hue: number, depth: number) => { top: string; left: string; right: string };
}

const palettes: ColorPalette[] = [
  {
    // Terracotta / Mediterranean
    name: 'Terracotta',
    background: '#F5E6D3',
    getBlockColors: (hue: number, depth: number) => {
      const baseHue = 15 + hue * 25; // Orange-brown range
      const sat = 45 + depth * 5;
      const light = 65 - depth * 4;
      return {
        top: `hsl(${baseHue}, ${sat}%, ${light}%)`,
        left: `hsl(${baseHue}, ${sat + 5}%, ${light - 15}%)`,
        right: `hsl(${baseHue}, ${sat + 10}%, ${light - 25}%)`,
      };
    },
  },
  {
    // Cool Concrete
    name: 'Concrete',
    background: '#E8E8E8',
    getBlockColors: (hue: number, depth: number) => {
      const baseHue = 200 + hue * 30; // Blue-gray range
      const sat = 10 + depth * 2;
      const light = 70 - depth * 5;
      return {
        top: `hsl(${baseHue}, ${sat}%, ${light}%)`,
        left: `hsl(${baseHue}, ${sat}%, ${light - 12}%)`,
        right: `hsl(${baseHue}, ${sat}%, ${light - 22}%)`,
      };
    },
  },
  {
    // Vibrant / Toy blocks
    name: 'Vibrant',
    background: '#FFF8F0',
    getBlockColors: (hue: number, depth: number) => {
      const baseHue = (hue * 360 + depth * 40) % 360;
      const sat = 60 + depth * 5;
      const light = 60 - depth * 3;
      return {
        top: `hsl(${baseHue}, ${sat}%, ${light}%)`,
        left: `hsl(${baseHue}, ${sat}%, ${light - 15}%)`,
        right: `hsl(${baseHue}, ${sat + 10}%, ${light - 25}%)`,
      };
    },
  },
  {
    // Monochrome
    name: 'Monochrome',
    background: '#F0F0F0',
    getBlockColors: (_hue: number, depth: number) => {
      const light = 75 - depth * 8;
      return {
        top: `hsl(0, 0%, ${light}%)`,
        left: `hsl(0, 0%, ${light - 12}%)`,
        right: `hsl(0, 0%, ${light - 22}%)`,
      };
    },
  },
  {
    // Night City
    name: 'Night',
    background: '#1a1a2e',
    getBlockColors: (hue: number, depth: number) => {
      const baseHue = 200 + hue * 60;
      const sat = 50 + depth * 5;
      const light = 35 + depth * 5;
      return {
        top: `hsl(${baseHue}, ${sat}%, ${light}%)`,
        left: `hsl(${baseHue}, ${sat}%, ${light - 10}%)`,
        right: `hsl(${baseHue}, ${sat}%, ${light - 18}%)`,
      };
    },
  },
];

// ============================================================================
// CELL MANAGEMENT
// ============================================================================

let cells: Cell[] = [];
let nextId = 0;
let lastSubdivisionTime = 0;
const gridSize = 10; // Grid units

function createInitialCell(time: number): Cell {
  return {
    x: 0,
    y: 0,
    width: gridSize,
    height: gridSize,
    depth: 0,
    birthTime: time,
    currentHeight: 0,
    targetHeight: 0.5, // Base height for depth 0
    hue: Math.random(),
    id: nextId++,
  };
}

function resetCells(time: number, seed: number): void {
  // Seeded random for reproducibility
  const random = createSeededRandom(seed);

  cells = [];
  nextId = 0;
  lastSubdivisionTime = time;

  const initial = createInitialCell(time);
  initial.hue = random();
  cells.push(initial);
}

function subdivideCell(cell: Cell, time: number, seed: number): Cell[] {
  const random = createSeededRandom(seed + cell.id * 1000 + cells.length);

  // Decide split direction based on aspect ratio with some randomness
  const splitHorizontal = cell.width > cell.height
    ? random() < 0.8
    : cell.height > cell.width
      ? random() < 0.2
      : random() < 0.5;

  // Split position (not always center - adds visual interest)
  const splitRatio = 0.3 + random() * 0.4; // 30-70%

  const newCells: Cell[] = [];
  const newDepth = cell.depth + 1;
  const newTargetHeight = 0.5 + newDepth * 0.8; // Height increases with depth

  if (splitHorizontal) {
    // Split left/right
    const splitX = cell.x + cell.width * splitRatio;
    const leftWidth = splitX - cell.x;
    const rightWidth = cell.width - leftWidth;

    newCells.push({
      x: cell.x,
      y: cell.y,
      width: leftWidth,
      height: cell.height,
      depth: newDepth,
      birthTime: time,
      currentHeight: cell.currentHeight, // Start from parent height
      targetHeight: newTargetHeight,
      hue: random(),
      id: nextId++,
    });

    newCells.push({
      x: splitX,
      y: cell.y,
      width: rightWidth,
      height: cell.height,
      depth: newDepth,
      birthTime: time,
      currentHeight: cell.currentHeight,
      targetHeight: newTargetHeight,
      hue: random(),
      id: nextId++,
    });
  } else {
    // Split top/bottom
    const splitY = cell.y + cell.height * splitRatio;
    const topHeight = splitY - cell.y;
    const bottomHeight = cell.height - topHeight;

    newCells.push({
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: topHeight,
      depth: newDepth,
      birthTime: time,
      currentHeight: cell.currentHeight,
      targetHeight: newTargetHeight,
      hue: random(),
      id: nextId++,
    });

    newCells.push({
      x: cell.x,
      y: splitY,
      width: cell.width,
      height: bottomHeight,
      depth: newDepth,
      birthTime: time,
      currentHeight: cell.currentHeight,
      targetHeight: newTargetHeight,
      hue: random(),
      id: nextId++,
    });
  }

  return newCells;
}

function pickCellToSubdivide(maxDepth: number, seed: number): Cell | null {
  // Filter cells that can be subdivided
  const candidates = cells.filter(c => c.depth < maxDepth && c.width > 0.3 && c.height > 0.3);

  if (candidates.length === 0) return null;

  // Weight by area (larger cells more likely to be subdivided)
  const weights = candidates.map(c => c.width * c.height);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const random = createSeededRandom(seed + Date.now());
  let pick = random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    pick -= weights[i];
    if (pick <= 0) return candidates[i];
  }

  return candidates[candidates.length - 1];
}

// ============================================================================
// RENDERING
// ============================================================================

function drawBlock(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  centerX: number,
  centerY: number,
  scale: number,
  palette: ColorPalette
): void {
  const { x, y, width, height, currentHeight, hue, depth } = cell;

  if (currentHeight < 0.01) return; // Don't draw flat blocks

  const colors = palette.getBlockColors(hue, depth);

  // Calculate 8 corners of the block
  const z = currentHeight;

  // Bottom face corners (z = 0)
  const b1 = gridToScreen(x, y, 0, centerX, centerY, scale);
  const b2 = gridToScreen(x + width, y, 0, centerX, centerY, scale);
  const b3 = gridToScreen(x + width, y + height, 0, centerX, centerY, scale);
  const b4 = gridToScreen(x, y + height, 0, centerX, centerY, scale);

  // Top face corners (z = height)
  const t1 = gridToScreen(x, y, z, centerX, centerY, scale);
  const t2 = gridToScreen(x + width, y, z, centerX, centerY, scale);
  const t3 = gridToScreen(x + width, y + height, z, centerX, centerY, scale);
  const t4 = gridToScreen(x, y + height, z, centerX, centerY, scale);

  // Draw right face
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(b2.x, b2.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.closePath();
  ctx.fill();

  // Draw left face
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(b4.x, b4.y);
  ctx.lineTo(b3.x, b3.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.lineTo(t4.x, t4.y);
  ctx.closePath();
  ctx.fill();

  // Draw top face
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.lineTo(t4.x, t4.y);
  ctx.closePath();
  ctx.fill();

  // Draw edges for definition
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;

  // Top face edges
  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.lineTo(t4.x, t4.y);
  ctx.closePath();
  ctx.stroke();

  // Vertical edges
  ctx.beginPath();
  ctx.moveTo(b3.x, b3.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.moveTo(b2.x, b2.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.moveTo(b4.x, b4.y);
  ctx.lineTo(t4.x, t4.y);
  ctx.stroke();
}

function sortCellsForDrawing(cellsToSort: Cell[]): Cell[] {
  // Sort by position for correct isometric occlusion (back to front)
  // In isometric, we need to draw cells with lower (x + y) first
  return [...cellsToSort].sort((a, b) => {
    const posA = a.x + a.y;
    const posB = b.x + b.y;
    if (posA !== posB) return posA - posB;
    // If same position, draw shorter blocks first
    return a.currentHeight - b.currentHeight;
  });
}

// ============================================================================
// EASING
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ============================================================================
// SEEDED RANDOM
// ============================================================================

function createSeededRandom(seed: number): () => number {
  let state = Math.abs(Math.floor(seed)) || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  subdivisionSpeed: 1.5,
  maxDepth: 5,
  heightMultiplier: 1,
  colorPalette: 0,
  seed: 42,
};

const controlConfigs: Record<string, ControlConfig> = {
  subdivisionSpeed: {
    label: 'Subdivision Speed',
    min: 0.3,
    max: 5,
    defaultValue: 1.5,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.8) return 'Slow';
      if (v < 2) return 'Normal';
      if (v < 3.5) return 'Fast';
      return 'Rapid';
    },
  },
  maxDepth: {
    label: 'Max Depth',
    min: 2,
    max: 8,
    defaultValue: 5,
    step: 1,
    format: (v: number) => `${Math.floor(v)} levels`,
  },
  heightMultiplier: {
    label: 'Building Height',
    min: 0.3,
    max: 2,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.6) return 'Low';
      if (v < 1.2) return 'Normal';
      return 'Tall';
    },
  },
  colorPalette: {
    label: 'Palette',
    min: 0,
    max: 4.99,
    defaultValue: 0,
    step: 1,
    format: (v: number) => palettes[Math.floor(v)]?.name || 'Terracotta',
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
  dimensions: { width: 2, height: 2, depth: 0.5 },
  animated: true,
  suggestedZone: 'Recursion Room',
  canBecomeArchitecture: true,
  placard: `Watch a city zone itself. Each subdivision creates a new building. Recursion depth becomes height—the deeper the division, the taller the tower. Downtown emerges where the algorithm runs deepest. After the recursive subdivision of urban space, which follows Zipf's law: many small lots, few large ones. The same pattern as real cities.`,
};

// ============================================================================
// STATE
// ============================================================================

let lastSeed = -1;
let startTime = 0;
let canvas2d: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 26,
  prompt: 'Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-26',
  },

  setup: (p: p5) => {
    p.createCanvas(800, 800);
    p.noLoop(); // We'll use our own canvas

    // Create a 2D canvas for isometric rendering
    canvas2d = document.createElement('canvas');
    canvas2d.width = 800;
    canvas2d.height = 800;
    ctx = canvas2d.getContext('2d');

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 42) as number);

    startTime = p.millis();
    resetCells(0, seed);
    lastSeed = seed;

    p.loop();
  },

  draw: (p: p5) => {
    if (!ctx || !canvas2d) return;

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 42) as number);
    const subdivisionSpeed = (controls.subdivisionSpeed ?? 1.5) as number;
    const maxDepth = Math.floor((controls.maxDepth ?? 5) as number);
    const heightMultiplier = (controls.heightMultiplier ?? 1) as number;
    const paletteIndex = Math.floor((controls.colorPalette ?? 0) as number);
    const palette = palettes[paletteIndex] || palettes[0];

    // Reset if seed changed
    if (seed !== lastSeed) {
      startTime = p.millis();
      resetCells(0, seed);
      lastSeed = seed;
    }

    const currentTime = p.millis() - startTime;
    const subdivisionInterval = 1000 / subdivisionSpeed; // ms between subdivisions

    // Check if it's time to subdivide
    if (currentTime - lastSubdivisionTime > subdivisionInterval) {
      const cellToSplit = pickCellToSubdivide(maxDepth, seed);
      if (cellToSplit) {
        const newCells = subdivideCell(cellToSplit, currentTime, seed);
        // Remove the old cell and add new ones
        cells = cells.filter(c => c.id !== cellToSplit.id);
        cells.push(...newCells);
      }
      lastSubdivisionTime = currentTime;
    }

    // Update cell heights with animation
    const growthDuration = 800; // ms to grow to target height
    for (const cell of cells) {
      const age = currentTime - cell.birthTime;
      const progress = Math.min(1, age / growthDuration);
      const easedProgress = easeOutCubic(progress);
      cell.currentHeight = cell.targetHeight * easedProgress * heightMultiplier;
    }

    // Clear and draw
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);

    // Calculate scale and center
    const canvasSize = Math.min(canvas2d.width, canvas2d.height);
    const scale = canvasSize / (gridSize * 2.5); // Leave some margin
    const centerX = canvas2d.width / 2;
    const centerY = canvas2d.height / 2 + canvasSize * 0.15; // Shift down a bit

    // Sort and draw cells
    const sortedCells = sortCellsForDrawing(cells);
    for (const cell of sortedCells) {
      drawBlock(ctx, cell, centerX, centerY, scale, palette);
    }

    // Copy to p5 canvas
    const p5Canvas = (p as any).canvas as HTMLCanvasElement;
    const p5Ctx = p5Canvas.getContext('2d');
    if (p5Ctx) {
      p5Ctx.drawImage(canvas2d, 0, 0);
    }
  },

  renderFinal: (p: p5) => {
    if (!ctx || !canvas2d) {
      canvas2d = document.createElement('canvas');
      canvas2d.width = 800;
      canvas2d.height = 800;
      ctx = canvas2d.getContext('2d');
    }
    if (!ctx || !canvas2d) return;

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 42) as number);
    const maxDepth = Math.floor((controls.maxDepth ?? 5) as number);
    const heightMultiplier = (controls.heightMultiplier ?? 1) as number;
    const paletteIndex = Math.floor((controls.colorPalette ?? 0) as number);
    const palette = palettes[paletteIndex] || palettes[0];

    // Generate a fully subdivided city
    resetCells(0, seed);

    // Run multiple subdivision passes to fill the city
    for (let i = 0; i < 50; i++) {
      const cellToSplit = pickCellToSubdivide(maxDepth, seed);
      if (cellToSplit) {
        const newCells = subdivideCell(cellToSplit, i * 1000, seed);
        cells = cells.filter(c => c.id !== cellToSplit.id);
        cells.push(...newCells);
      }
    }

    // Set all heights to target
    for (const cell of cells) {
      cell.currentHeight = cell.targetHeight * heightMultiplier;
    }

    // Draw
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);

    const canvasSize = Math.min(canvas2d.width, canvas2d.height);
    const scale = canvasSize / (gridSize * 2.5);
    const centerX = canvas2d.width / 2;
    const centerY = canvas2d.height / 2 + canvasSize * 0.15;

    const sortedCells = sortCellsForDrawing(cells);
    for (const cell of sortedCells) {
      drawBlock(ctx, cell, centerX, centerY, scale, palette);
    }

    // Copy to p5 canvas
    const p5Canvas = (p as any).canvas as HTMLCanvasElement;
    const p5Ctx = p5Canvas.getContext('2d');
    if (p5Ctx) {
      p5Ctx.drawImage(canvas2d, 0, 0);
    }
  },
};

// Claude's Choice — settings that showcase the urban metaphor
export function getClaudesChoice(): Partial<ControlState> {
  return {
    subdivisionSpeed: 1.2,
    maxDepth: 6,
    heightMultiplier: 1.1,
    colorPalette: 0, // Terracotta
    seed: 137,
  };
}

export { controlConfigs, defaultControls };
export default config;
