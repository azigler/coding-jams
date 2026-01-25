/**
 * Day 25: ORGANIC GEOMETRY
 *
 * "Forms that look or act organic but are constructed entirely from geometric shapes." — Manuel Larino
 *
 * A creature made of circles, triangles, and rectangles. It drifts, responds to your presence,
 * changes shape slightly. The organic quality isn't in the shapes—they're pure geometry.
 * It's in how they move, how they connect, how they respond.
 *
 * After Kandinsky, who combined geometric abstraction with biomorphic forms.
 *
 * Medium: p5.js WEBGL
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface Shape {
  type: 'circle' | 'triangle' | 'rect';
  size: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  color: [number, number, number, number]; // HSBA
  baseSize: number;
  breathPhase: number;
}

interface Creature {
  shapes: Shape[];
  targetX: number;
  targetY: number;
  targetZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  personality: 'shy' | 'curious' | 'neutral';
  baseX: number;
  baseY: number;
  baseZ: number;
}

// ============================================================================
// CREATURE GENERATION
// ============================================================================

function createShape(
  type: 'circle' | 'triangle' | 'rect',
  size: number,
  x: number,
  y: number,
  z: number,
  color: [number, number, number, number],
  random: () => number
): Shape {
  return {
    type,
    size,
    x,
    y,
    z,
    rotation: random() * Math.PI * 2,
    color,
    baseSize: size,
    breathPhase: random() * Math.PI * 2,
  };
}

function createCreature(
  centerX: number,
  centerY: number,
  centerZ: number,
  complexity: number,
  colorPalette: number,
  random: () => number,
  isWebGL: boolean = true
): Creature {
  const shapes: Shape[] = [];
  const numShapes = Math.floor(5 + complexity * 15); // 5-20 shapes

  // Core body shapes (larger)
  const coreCount = Math.max(2, Math.floor(numShapes * 0.3));
  for (let i = 0; i < coreCount; i++) {
    const angle = (i / coreCount) * Math.PI * 2;
    const radius = 20 + random() * 30;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const z = centerZ + (random() - 0.5) * 20;

    const size = 30 + random() * 40;
    const color = getColorForPalette(colorPalette, random);
    const type = random() < 0.5 ? 'circle' : random() < 0.7 ? 'rect' : 'triangle';
    shapes.push(createShape(type, size, x, y, z, color, random));
  }

  // Limb shapes (medium, connected to core)
  const limbCount = Math.floor(numShapes * 0.4);
  for (let i = 0; i < limbCount; i++) {
    const coreIdx = Math.floor(random() * coreCount);
    const core = shapes[coreIdx];
    const angle = random() * Math.PI * 2;
    const distance = core.size * 0.6 + random() * 40;
    const x = core.x + Math.cos(angle) * distance;
    const y = core.y + Math.sin(angle) * distance;
    const z = core.z + (random() - 0.5) * 15;

    const size = 15 + random() * 25;
    const color = getColorForPalette(colorPalette, random);
    const type = random() < 0.6 ? 'circle' : random() < 0.8 ? 'triangle' : 'rect';
    shapes.push(createShape(type, size, x, y, z, color, random));
  }

  // Detail shapes (small, scattered)
  const detailCount = numShapes - coreCount - limbCount;
  for (let i = 0; i < detailCount; i++) {
    const baseIdx = Math.floor(random() * (coreCount + limbCount));
    const base = shapes[baseIdx];
    const angle = random() * Math.PI * 2;
    const distance = base.size * 0.4 + random() * 30;
    const x = base.x + Math.cos(angle) * distance;
    const y = base.y + Math.sin(angle) * distance;
    const z = base.z + (random() - 0.5) * 10;

    const size = 5 + random() * 15;
    const color = getColorForPalette(colorPalette, random);
    const type = random() < 0.5 ? 'circle' : random() < 0.7 ? 'triangle' : 'rect';
    shapes.push(createShape(type, size, x, y, z, color, random));
  }

  const personality = random() < 0.33 ? 'shy' : random() < 0.66 ? 'curious' : 'neutral';

  return {
    shapes,
    targetX: centerX,
    targetY: centerY,
    targetZ: centerZ,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,
    personality,
    baseX: centerX,
    baseY: centerY,
    baseZ: centerZ,
  };
}

function getColorForPalette(palette: number, random: () => number): [number, number, number, number] {
  // 0: Warm, 1: Cool, 2: Earth, 3: Pastel, 4: Vibrant
  switch (Math.floor(palette)) {
    case 0: // Warm
      return [20 + random() * 40, 60 + random() * 30, 70 + random() * 20, 80 + random() * 20];
    case 1: // Cool
      return [180 + random() * 60, 50 + random() * 30, 70 + random() * 20, 80 + random() * 20];
    case 2: // Earth
      return [30 + random() * 40, 40 + random() * 30, 50 + random() * 30, 80 + random() * 20];
    case 3: // Pastel
      return [random() * 360, 30 + random() * 20, 85 + random() * 10, 70 + random() * 20];
    case 4: // Vibrant
      return [random() * 360, 70 + random() * 30, 80 + random() * 20, 90 + random() * 10];
    default:
      return [random() * 360, 50 + random() * 30, 70 + random() * 20, 80 + random() * 20];
  }
}

// ============================================================================
// MOVEMENT & RESPONSE
// ============================================================================

function updateCreature(
  creature: Creature,
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  responsiveness: number,
  speed: number,
  deltaTime: number,
  isWebGL: boolean = true
): void {
  // Convert mouse coordinates to WEBGL centered coordinates
  const mouseXCentered = mouseX - width / 2;
  const mouseYCentered = mouseY - height / 2;
  
  // Calculate distance to cursor
  const dx = mouseXCentered - creature.targetX;
  const dy = mouseYCentered - creature.targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(width * width + height * height);

  // Response behavior based on personality
  let responseX = 0;
  let responseY = 0;
  const responseStrength = responsiveness * 0.5;

  if (distance < maxDistance * 0.3) {
    // Close to cursor
    if (creature.personality === 'shy') {
      // Move away
      responseX = -dx * responseStrength;
      responseY = -dy * responseStrength;
    } else if (creature.personality === 'curious') {
      // Move toward
      responseX = dx * responseStrength;
      responseY = dy * responseStrength;
    }
  }

  // Drift (random walk)
  const driftStrength = speed * 0.3;
  creature.velocityX += (Math.random() - 0.5) * driftStrength * deltaTime;
  creature.velocityY += (Math.random() - 0.5) * driftStrength * deltaTime;
  creature.velocityZ += (Math.random() - 0.5) * driftStrength * deltaTime * 0.5;

  // Apply response
  creature.velocityX += responseX * deltaTime;
  creature.velocityY += responseY * deltaTime;

  // Damping
  creature.velocityX *= 0.95;
  creature.velocityY *= 0.95;
  creature.velocityZ *= 0.95;

  // Update target position
  creature.targetX += creature.velocityX * deltaTime * 60;
  creature.targetY += creature.velocityY * deltaTime * 60;
  creature.targetZ += creature.velocityZ * deltaTime * 60;

    // Soft boundaries (gentle push back toward center)
    // In WEBGL, center is at (0, 0)
    const boundaryStrength = 0.0001;
    creature.velocityX += (0 - creature.targetX) * boundaryStrength;
    creature.velocityY += (0 - creature.targetY) * boundaryStrength;
    creature.velocityZ += (0 - creature.targetZ) * boundaryStrength;

  // Update shape positions relative to creature center
  const offsetX = creature.targetX - creature.baseX;
  const offsetY = creature.targetY - creature.baseY;
  const offsetZ = creature.targetZ - creature.baseZ;

  for (const shape of creature.shapes) {
    shape.x = creature.baseX + (shape.x - creature.baseX) + offsetX;
    shape.y = creature.baseY + (shape.y - creature.baseY) + offsetY;
    shape.z = creature.baseZ + (shape.z - creature.baseZ) + offsetZ;
  }

  creature.baseX = creature.targetX;
  creature.baseY = creature.targetY;
  creature.baseZ = creature.targetZ;
}

// ============================================================================
// RENDERING
// ============================================================================

function drawShape(p: p5, shape: Shape, time: number, showConnections: boolean): void {
  p.push();

  p.translate(shape.x, shape.y, shape.z);
  p.rotateZ(shape.rotation + time * 0.1);

  // Breathing effect (subtle)
  const breath = Math.sin(time * 0.5 + shape.breathPhase) * 0.05 + 1;
  const size = shape.baseSize * breath;

  // Set color
  p.fill(shape.color[0], shape.color[1], shape.color[2], shape.color[3]);
  p.noStroke();

  // Draw shape
  switch (shape.type) {
    case 'circle':
      p.sphere(size * 0.5);
      break;
    case 'triangle':
      p.beginShape();
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        p.vertex(Math.cos(angle) * size, Math.sin(angle) * size, 0);
      }
      p.endShape(p.CLOSE);
      break;
    case 'rect':
      p.box(size * 0.8, size * 0.8, size * 0.3);
      break;
  }

  p.pop();
}

function drawCreature(
  p: p5,
  creature: Creature,
  time: number,
  showConnections: boolean
): void {
  // Draw connections (subtle lines between related shapes)
  if (showConnections) {
    p.stroke(0, 0, 50, 20);
    p.strokeWeight(1);
    for (let i = 0; i < creature.shapes.length; i++) {
      for (let j = i + 1; j < creature.shapes.length; j++) {
        const s1 = creature.shapes[i];
        const s2 = creature.shapes[j];
        const dist = Math.sqrt(
          (s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2 + (s1.z - s2.z) ** 2
        );
        if (dist < 80) {
          p.line(s1.x, s1.y, s1.z, s2.x, s2.y, s2.z);
        }
      }
    }
  }

  // Draw shapes
  for (const shape of creature.shapes) {
    drawShape(p, shape, time, showConnections);
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  creatureCount: 1,
  complexity: 0.5,
  responsiveness: 1,
  movementSpeed: 0.5,
  colorPalette: 0,
  showConnections: 0,
  seed: 42,
};

const controlConfigs: Record<string, ControlConfig> = {
  creatureCount: {
    label: 'Creature Count',
    min: 1,
    max: 3,
    defaultValue: 1,
    step: 1,
    format: (v: number) => `${Math.floor(v)}`,
  },
  complexity: {
    label: 'Complexity',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.05,
    format: (v: number) => {
      if (v < 0.3) return 'Simple';
      if (v < 0.7) return 'Medium';
      return 'Complex';
    },
  },
  responsiveness: {
    label: 'Responsiveness',
    min: 0,
    max: 2,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.5) return 'Calm';
      if (v < 1.5) return 'Normal';
      return 'Reactive';
    },
  },
  movementSpeed: {
    label: 'Movement Speed',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.05,
    format: (v: number) => {
      if (v < 0.3) return 'Slow';
      if (v < 0.7) return 'Normal';
      return 'Fast';
    },
  },
  colorPalette: {
    label: 'Color Palette',
    min: 0,
    max: 4.99,
    defaultValue: 0,
    step: 1,
    format: (v: number) => {
      const palettes = ['Warm', 'Cool', 'Earth', 'Pastel', 'Vibrant'];
      return palettes[Math.floor(v)] || 'Warm';
    },
  },
  showConnections: {
    label: 'Show Connections',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
    format: (v: number) => (v >= 0.5 ? 'ON' : 'OFF'),
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
  displayType: 'sculpture' as const,
  viewingDistance: 2,
  dimensions: { width: 0.8, height: 0.8, depth: 0.3 },
  animated: true,
  suggestedZone: 'Transparency Chamber',
  canBecomeArchitecture: true,
  placard: `A creature made entirely of circles, triangles, and rectangles. It drifts, responds to your presence, changes shape slightly. The organic quality isn't in the shapes—they're pure geometry. It's in how they move, how they connect, how they respond. Life emerges from structure. After Kandinsky, who combined geometric abstraction with biomorphic forms, proving they're the same language.`,
};

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
// STATE MANAGEMENT
// ============================================================================

let lastTime = 0;
let creatures: Creature[] = [];
let lastControlHash = '';

function getControlHash(controls: ControlState): string {
  return `${controls.creatureCount}-${controls.complexity}-${controls.seed}`;
}

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 25,
  prompt: 'Organic Geometry. Forms that look or act organic but are constructed entirely from geometric shapes.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  recording: {
    enabled: true,
    duration: 10,
    filename: 'genuary-2026-day-25',
  },

  setup: (p: p5) => {
    p.createCanvas(800, 800, p.WEBGL);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 42) as number);
    const random = createSeededRandom(seed);

    const width = p.width;
    const height = p.height;
    const creatureCount = Math.floor((controls.creatureCount ?? 1) as number);
    const complexity = (controls.complexity ?? 0.5) as number;
    const colorPalette = (controls.colorPalette ?? 0) as number;

    creatures = [];
    for (let i = 0; i < creatureCount; i++) {
      // In WEBGL, origin is at center, so convert screen coords to centered coords
      const screenX = width * 0.3 + (width * 0.4 * (i + 1)) / (creatureCount + 1);
      const screenY = height * 0.5;
      const centerX = screenX - width / 2;
      const centerY = screenY - height / 2;
      const centerZ = (random() - 0.5) * 100;
      creatures.push(createCreature(centerX, centerY, centerZ, complexity, colorPalette, random, true));
    }

    lastControlHash = getControlHash(controls);
    lastTime = p.millis() / 1000;
    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check if controls changed that require regeneration
    const newHash = getControlHash(controls);
    if (newHash !== lastControlHash) {
      const seed = Math.floor((controls.seed ?? 42) as number);
      const random = createSeededRandom(seed);

      const width = p.width;
      const height = p.height;
      const creatureCount = Math.floor((controls.creatureCount ?? 1) as number);
      const complexity = (controls.complexity ?? 0.5) as number;
      const colorPalette = (controls.colorPalette ?? 0) as number;

      creatures = [];
      for (let i = 0; i < creatureCount; i++) {
        const centerX = width * 0.3 + (width * 0.4 * (i + 1)) / (creatureCount + 1);
        const centerY = height * 0.5;
        const centerZ = (random() - 0.5) * 100;
        creatures.push(createCreature(centerX, centerY, centerZ, complexity, colorPalette, random));
      }

      lastControlHash = newHash;
    }

    // Calculate delta time
    const currentTime = p.millis() / 1000;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update creatures
    const responsiveness = (controls.responsiveness ?? 1) as number;
    const speed = (controls.movementSpeed ?? 0.5) as number;
    const showConnections = ((controls.showConnections ?? 0) as number) >= 0.5;

    for (const creature of creatures) {
      updateCreature(creature, p.mouseX, p.mouseY, p.width, p.height, responsiveness, speed, deltaTime, true);
    }

    // Draw
    p.background(40, 8, 96); // Warm cream

    // In WEBGL mode, origin is at center, camera is already set up
    // Just adjust lighting
    p.ambientLight(60, 10, 80);
    p.directionalLight(60, 10, 60, 0.5, 0.5, 1);

    // Draw creatures
    for (const creature of creatures) {
      drawCreature(p, creature, currentTime, showConnections);
    }
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 42) as number);
    const random = createSeededRandom(seed);

      const width = p.width;
      const height = p.height;
      const creatureCount = Math.floor((controls.creatureCount ?? 1) as number);
      const complexity = (controls.complexity ?? 0.5) as number;
      const colorPalette = (controls.colorPalette ?? 0) as number;

      const finalCreatures: Creature[] = [];
      for (let i = 0; i < creatureCount; i++) {
        const screenX = width * 0.3 + (width * 0.4 * (i + 1)) / (creatureCount + 1);
        const screenY = height * 0.5;
        const centerX = screenX - width / 2;
        const centerY = screenY - height / 2;
        const centerZ = (random() - 0.5) * 100;
        finalCreatures.push(createCreature(centerX, centerY, centerZ, complexity, colorPalette, random, true));
      }

      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.background(40, 8, 96);

      p.ambientLight(60, 10, 80);
      p.directionalLight(60, 10, 60, 0.5, 0.5, 1);

    for (const creature of finalCreatures) {
      drawCreature(p, creature, 0, false);
    }
  },
};

// Claude's Choice — settings for maximum organic feeling
export function getClaudesChoice(): Partial<ControlState> {
  return {
    creatureCount: 1,
    complexity: 0.6,
    responsiveness: 1.2,
    movementSpeed: 0.4,
    colorPalette: 0, // Warm
    showConnections: 0,
    seed: 137,
  };
}

export { controlConfigs, defaultControls };
export default config;
