/**
 * Day 29: TANK
 *
 * "Genetic evolution and mutation." — Monokai
 *
 * Three tanks. Three environments. Three diverging populations.
 *
 * The left tank has predators. Watch the creatures get faster.
 * The middle tank has sparse food. Watch them get efficient.
 * The right tank has obstacles. Watch them learn to navigate.
 *
 * Each specimen's genome is visible—a ring of colored segments encoding
 * speed, size, sensing, metabolism. Watch the colors shift across generations.
 * Watch lineages end. Watch mutations that shouldn't work somehow survive.
 *
 * After Karl Sims' Evolved Virtual Creatures. After Scott Draves' Electric Sheep.
 * The fitness function isn't survival—it's spectacle.
 *
 * Medium: p5.js
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface Genome {
  speed: number;       // 0-1: movement speed
  size: number;        // 0-1: body size
  sensing: number;     // 0-1: detection range
  metabolism: number;  // 0-1: energy efficiency
  aggression: number;  // 0-1: behavior toward others
}

interface Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  genome: Genome;
  age: number;
  generation: number;
  id: number;
  birthTime: number;
  deathTime: number | null;
}

interface Food {
  x: number;
  y: number;
  value: number;
}

interface Predator {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: number | null;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TankType = 'predator' | 'scarcity' | 'obstacle';

interface Tank {
  type: TankType;
  x: number;
  y: number;
  width: number;
  height: number;
  creatures: Creature[];
  deadCreatures: Creature[];
  food: Food[];
  predators: Predator[];
  obstacles: Obstacle[];
  generation: number;
  births: number;
  deaths: number;
  nextCreatureId: number;
}

interface TankState {
  tanks: Tank[];
  time: number;
  lastFoodSpawn: number;
  random: () => number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GENE_COLORS: { [key in keyof Genome]: [number, number, number] } = {
  speed: [0, 85, 85],       // Red
  size: [210, 85, 85],      // Blue
  sensing: [120, 85, 85],   // Green
  metabolism: [50, 85, 85], // Yellow
  aggression: [280, 85, 85],// Purple
};

const TANK_LABELS: { [key in TankType]: string } = {
  predator: 'PREDATORS',
  scarcity: 'SCARCITY',
  obstacle: 'OBSTACLES',
};

const MAX_CREATURES_PER_TANK = 25;
const MIN_CREATURES_PER_TANK = 5;
const INITIAL_CREATURES = 12;
const FOOD_SPAWN_INTERVAL = 60; // frames
const REPRODUCTION_ENERGY_THRESHOLD = 1.5;
const DEATH_ENERGY_THRESHOLD = 0;
const MAX_DEAD_TO_SHOW = 8;

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
// GENOME FUNCTIONS
// ============================================================================

function createRandomGenome(random: () => number): Genome {
  return {
    speed: 0.3 + random() * 0.4,
    size: 0.3 + random() * 0.4,
    sensing: 0.3 + random() * 0.4,
    metabolism: 0.3 + random() * 0.4,
    aggression: 0.3 + random() * 0.4,
  };
}

function mutateGenome(genome: Genome, mutationRate: number, random: () => number): Genome {
  const mutate = (val: number): number => {
    if (random() < mutationRate) {
      const delta = (random() - 0.5) * 0.3;
      return Math.max(0.05, Math.min(0.95, val + delta));
    }
    return val;
  };

  return {
    speed: mutate(genome.speed),
    size: mutate(genome.size),
    sensing: mutate(genome.sensing),
    metabolism: mutate(genome.metabolism),
    aggression: mutate(genome.aggression),
  };
}

function getCreatureRadius(genome: Genome): number {
  return 6 + genome.size * 10;
}

function getCreatureSpeed(genome: Genome, tankType: TankType): number {
  const base = 0.8 + genome.speed * 2.5;
  // In predator tank, speed matters more
  if (tankType === 'predator') return base * 1.2;
  return base;
}

function getCreatureSenseRange(genome: Genome): number {
  return 30 + genome.sensing * 80;
}

function getEnergyConsumption(genome: Genome): number {
  // Larger creatures use more energy, efficient metabolism helps
  return (0.005 + genome.size * 0.015) * (1.2 - genome.metabolism * 0.4);
}

// ============================================================================
// CREATURE FUNCTIONS
// ============================================================================

function createCreature(
  x: number,
  y: number,
  genome: Genome,
  generation: number,
  id: number,
  time: number,
  random: () => number
): Creature {
  const angle = random() * Math.PI * 2;
  return {
    x,
    y,
    vx: Math.cos(angle) * 0.5,
    vy: Math.sin(angle) * 0.5,
    energy: 1.0,
    genome,
    age: 0,
    generation,
    id,
    birthTime: time,
    deathTime: null,
  };
}

function updateCreature(
  creature: Creature,
  tank: Tank,
  controls: ControlState,
  random: () => number
): void {
  const speed = getCreatureSpeed(creature.genome, tank.type);
  const senseRange = getCreatureSenseRange(creature.genome);
  const consumption = getEnergyConsumption(creature.genome);
  const simSpeed = (controls.simulationSpeed ?? 1) as number;

  // Find nearest food
  let nearestFood: Food | null = null;
  let nearestFoodDist = Infinity;
  for (const food of tank.food) {
    const dx = food.x - creature.x;
    const dy = food.y - creature.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestFoodDist && dist < senseRange) {
      nearestFoodDist = dist;
      nearestFood = food;
    }
  }

  // If predator tank, also avoid predators
  if (tank.type === 'predator') {
    for (const pred of tank.predators) {
      const dx = pred.x - creature.x;
      const dy = pred.y - creature.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < senseRange * 0.8) {
        // Flee from predator
        const fleeAngle = Math.atan2(-dy, -dx);
        creature.vx += Math.cos(fleeAngle) * speed * 0.3;
        creature.vy += Math.sin(fleeAngle) * speed * 0.3;
      }
    }
  }

  // Seek food if found
  if (nearestFood) {
    const dx = nearestFood.x - creature.x;
    const dy = nearestFood.y - creature.y;
    const angle = Math.atan2(dy, dx);
    creature.vx += Math.cos(angle) * speed * 0.2;
    creature.vy += Math.sin(angle) * speed * 0.2;
  } else {
    // Random wandering
    creature.vx += (random() - 0.5) * 0.3;
    creature.vy += (random() - 0.5) * 0.3;
  }

  // Limit speed
  const currentSpeed = Math.sqrt(creature.vx * creature.vx + creature.vy * creature.vy);
  if (currentSpeed > speed) {
    creature.vx = (creature.vx / currentSpeed) * speed;
    creature.vy = (creature.vy / currentSpeed) * speed;
  }

  // Move
  creature.x += creature.vx * simSpeed;
  creature.y += creature.vy * simSpeed;

  // Obstacle avoidance (for obstacle tank)
  if (tank.type === 'obstacle') {
    for (const obs of tank.obstacles) {
      const padding = getCreatureRadius(creature.genome) + 2;
      if (
        creature.x > obs.x - padding &&
        creature.x < obs.x + obs.width + padding &&
        creature.y > obs.y - padding &&
        creature.y < obs.y + obs.height + padding
      ) {
        // Push out of obstacle
        const centerX = obs.x + obs.width / 2;
        const centerY = obs.y + obs.height / 2;
        const dx = creature.x - centerX;
        const dy = creature.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        creature.x += (dx / dist) * 3;
        creature.y += (dy / dist) * 3;
        creature.vx *= -0.5;
        creature.vy *= -0.5;
        // Getting stuck costs energy
        creature.energy -= 0.02;
      }
    }
  }

  // Boundary bounce
  const radius = getCreatureRadius(creature.genome);
  const margin = 5;
  if (creature.x < tank.x + margin + radius) {
    creature.x = tank.x + margin + radius;
    creature.vx *= -0.8;
  }
  if (creature.x > tank.x + tank.width - margin - radius) {
    creature.x = tank.x + tank.width - margin - radius;
    creature.vx *= -0.8;
  }
  if (creature.y < tank.y + margin + radius) {
    creature.y = tank.y + margin + radius;
    creature.vy *= -0.8;
  }
  if (creature.y > tank.y + tank.height - margin - radius) {
    creature.y = tank.y + tank.height - margin - radius;
    creature.vy *= -0.8;
  }

  // Energy consumption
  creature.energy -= consumption * simSpeed;
  creature.age += simSpeed;
}

// ============================================================================
// TANK FUNCTIONS
// ============================================================================

function createTank(
  type: TankType,
  x: number,
  y: number,
  width: number,
  height: number,
  random: () => number,
  time: number
): Tank {
  const tank: Tank = {
    type,
    x,
    y,
    width,
    height,
    creatures: [],
    deadCreatures: [],
    food: [],
    predators: [],
    obstacles: [],
    generation: 1,
    births: 0,
    deaths: 0,
    nextCreatureId: 1,
  };

  // Create initial population
  for (let i = 0; i < INITIAL_CREATURES; i++) {
    const cx = x + width * 0.2 + random() * width * 0.6;
    const cy = y + height * 0.2 + random() * height * 0.6;
    const genome = createRandomGenome(random);

    // Pre-bias genomes based on tank type
    if (type === 'predator') {
      genome.speed = 0.4 + random() * 0.5; // Faster initial population
    } else if (type === 'scarcity') {
      genome.metabolism = 0.4 + random() * 0.5; // More efficient
    } else if (type === 'obstacle') {
      genome.sensing = 0.4 + random() * 0.5; // Better sensing
    }

    const creature = createCreature(cx, cy, genome, 1, tank.nextCreatureId++, time, random);
    tank.creatures.push(creature);
  }

  // Create initial food
  const foodCount = type === 'scarcity' ? 3 : 8;
  for (let i = 0; i < foodCount; i++) {
    tank.food.push({
      x: x + 20 + random() * (width - 40),
      y: y + 20 + random() * (height - 40),
      value: 0.3 + random() * 0.2,
    });
  }

  // Create predators for predator tank
  if (type === 'predator') {
    for (let i = 0; i < 2; i++) {
      tank.predators.push({
        x: x + random() * width,
        y: y + random() * height,
        vx: (random() - 0.5) * 2,
        vy: (random() - 0.5) * 2,
        targetId: null,
      });
    }
  }

  // Create obstacles for obstacle tank
  if (type === 'obstacle') {
    const numObs = 4 + Math.floor(random() * 3);
    for (let i = 0; i < numObs; i++) {
      const obsW = 15 + random() * 40;
      const obsH = 15 + random() * 40;
      tank.obstacles.push({
        x: x + 30 + random() * (width - 60 - obsW),
        y: y + 30 + random() * (height - 60 - obsH),
        width: obsW,
        height: obsH,
      });
    }
  }

  return tank;
}

function updateTank(
  tank: Tank,
  time: number,
  controls: ControlState,
  random: () => number
): void {
  const mutationRate = (controls.mutationRate ?? 0.3) as number;
  const simSpeed = (controls.simulationSpeed ?? 1) as number;

  // Update creatures
  for (const creature of tank.creatures) {
    updateCreature(creature, tank, controls, random);
  }

  // Update predators (for predator tank)
  for (const pred of tank.predators) {
    // Find nearest creature to chase
    let nearest: Creature | null = null;
    let nearestDist = Infinity;
    for (const c of tank.creatures) {
      const dx = c.x - pred.x;
      const dy = c.y - pred.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = c;
      }
    }

    if (nearest) {
      const dx = nearest.x - pred.x;
      const dy = nearest.y - pred.y;
      const angle = Math.atan2(dy, dx);
      pred.vx += Math.cos(angle) * 0.15;
      pred.vy += Math.sin(angle) * 0.15;
    }

    // Limit predator speed
    const pSpeed = Math.sqrt(pred.vx * pred.vx + pred.vy * pred.vy);
    const maxPredSpeed = 2.5;
    if (pSpeed > maxPredSpeed) {
      pred.vx = (pred.vx / pSpeed) * maxPredSpeed;
      pred.vy = (pred.vy / pSpeed) * maxPredSpeed;
    }

    pred.x += pred.vx * simSpeed;
    pred.y += pred.vy * simSpeed;

    // Bounce off walls
    if (pred.x < tank.x + 10 || pred.x > tank.x + tank.width - 10) pred.vx *= -1;
    if (pred.y < tank.y + 10 || pred.y > tank.y + tank.height - 10) pred.vy *= -1;
    pred.x = Math.max(tank.x + 5, Math.min(tank.x + tank.width - 5, pred.x));
    pred.y = Math.max(tank.y + 5, Math.min(tank.y + tank.height - 5, pred.y));
  }

  // Check for food consumption
  for (let i = tank.food.length - 1; i >= 0; i--) {
    const food = tank.food[i];
    for (const creature of tank.creatures) {
      const dx = food.x - creature.x;
      const dy = food.y - creature.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const eatRange = getCreatureRadius(creature.genome) + 5;
      if (dist < eatRange) {
        creature.energy += food.value;
        tank.food.splice(i, 1);
        break;
      }
    }
  }

  // Check for predator kills
  if (tank.type === 'predator') {
    for (const pred of tank.predators) {
      for (const creature of tank.creatures) {
        const dx = pred.x - creature.x;
        const dy = pred.y - creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const killRange = getCreatureRadius(creature.genome) + 8;
        if (dist < killRange) {
          creature.energy = -1; // Mark for death
        }
      }
    }
  }

  // Handle death and reproduction
  const toRemove: number[] = [];
  const toAdd: Creature[] = [];

  for (let i = 0; i < tank.creatures.length; i++) {
    const creature = tank.creatures[i];

    // Death check
    if (creature.energy <= DEATH_ENERGY_THRESHOLD) {
      creature.deathTime = time;
      tank.deadCreatures.push(creature);
      if (tank.deadCreatures.length > MAX_DEAD_TO_SHOW) {
        tank.deadCreatures.shift();
      }
      toRemove.push(i);
      tank.deaths++;
      continue;
    }

    // Reproduction check
    if (
      creature.energy > REPRODUCTION_ENERGY_THRESHOLD &&
      tank.creatures.length + toAdd.length < MAX_CREATURES_PER_TANK
    ) {
      creature.energy -= 0.8; // Cost of reproduction
      const childGenome = mutateGenome(creature.genome, mutationRate, random);
      const offsetAngle = random() * Math.PI * 2;
      const offsetDist = getCreatureRadius(creature.genome) + 10;
      const child = createCreature(
        creature.x + Math.cos(offsetAngle) * offsetDist,
        creature.y + Math.sin(offsetAngle) * offsetDist,
        childGenome,
        creature.generation + 1,
        tank.nextCreatureId++,
        time,
        random
      );
      child.energy = 0.7;
      toAdd.push(child);
      tank.births++;
      if (child.generation > tank.generation) {
        tank.generation = child.generation;
      }
    }
  }

  // Apply removals (in reverse order)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    tank.creatures.splice(toRemove[i], 1);
  }

  // Apply additions
  for (const child of toAdd) {
    tank.creatures.push(child);
  }

  // Emergency repopulation if too few creatures
  if (tank.creatures.length < MIN_CREATURES_PER_TANK) {
    const cx = tank.x + tank.width * 0.3 + random() * tank.width * 0.4;
    const cy = tank.y + tank.height * 0.3 + random() * tank.height * 0.4;
    const genome = createRandomGenome(random);
    const creature = createCreature(cx, cy, genome, 1, tank.nextCreatureId++, time, random);
    tank.creatures.push(creature);
  }

  // Spawn food periodically
  const foodMax = tank.type === 'scarcity' ? 4 : 10;
  if (tank.food.length < foodMax && random() < 0.02 * simSpeed) {
    tank.food.push({
      x: tank.x + 20 + random() * (tank.width - 40),
      y: tank.y + 20 + random() * (tank.height - 40),
      value: 0.25 + random() * 0.15,
    });
  }
}

// ============================================================================
// RENDERING
// ============================================================================

function drawGenomeRing(p: p5, creature: Creature, radius: number): void {
  const genome = creature.genome;
  const genes: (keyof Genome)[] = ['speed', 'size', 'sensing', 'metabolism', 'aggression'];
  const arcSize = (Math.PI * 2) / genes.length;

  p.push();
  p.noFill();
  p.strokeWeight(2.5);

  for (let i = 0; i < genes.length; i++) {
    const gene = genes[i];
    const value = genome[gene];
    const color = GENE_COLORS[gene];
    // Saturation based on gene strength
    p.stroke(color[0], 50 + value * 50, 80);
    const startAngle = i * arcSize - Math.PI / 2;
    const endAngle = startAngle + arcSize - 0.05;
    p.arc(0, 0, radius * 2 + 6, radius * 2 + 6, startAngle, endAngle);
  }

  p.pop();
}

function drawCreature(p: p5, creature: Creature, time: number, showGenome: boolean): void {
  const radius = getCreatureRadius(creature.genome);
  const age = time - creature.birthTime;
  const fadeIn = Math.min(1, age / 30);

  p.push();
  p.translate(creature.x, creature.y);

  // Genome ring (if enabled)
  if (showGenome) {
    p.push();
    p.colorMode(p.HSB, 360, 100, 100, 100);
    drawGenomeRing(p, creature, radius);
    p.pop();
  }

  // Body
  p.colorMode(p.HSB, 360, 100, 100, 100);
  const hue = (creature.genome.speed * 60 + creature.genome.aggression * 60) % 360;
  const sat = 40 + creature.genome.sensing * 30;
  const bright = 70 + creature.energy * 20;
  p.fill(hue, sat, bright, fadeIn * 90);
  p.noStroke();
  p.circle(0, 0, radius * 2);

  // Energy indicator (inner glow)
  const energyHue = creature.energy > 0.5 ? 120 : (creature.energy > 0.25 ? 60 : 0);
  p.fill(energyHue, 60, 90, fadeIn * 50);
  p.circle(0, 0, radius * 0.6);

  // Direction indicator
  const angle = Math.atan2(creature.vy, creature.vx);
  p.fill(0, 0, 100, fadeIn * 80);
  p.push();
  p.rotate(angle);
  p.translate(radius * 0.4, 0);
  p.circle(0, 0, 3);
  p.pop();

  p.pop();
}

function drawDeadCreature(p: p5, creature: Creature, time: number): void {
  if (creature.deathTime === null) return;

  const timeSinceDeath = time - creature.deathTime;
  const fadeOut = Math.max(0, 1 - timeSinceDeath / 120);
  if (fadeOut <= 0) return;

  const radius = getCreatureRadius(creature.genome);

  p.push();
  p.translate(creature.x, creature.y);
  p.colorMode(p.HSB, 360, 100, 100, 100);

  // Ghost of the genome ring
  p.noFill();
  p.strokeWeight(1);
  p.stroke(0, 0, 50, fadeOut * 30);
  p.circle(0, 0, radius * 2 + 6);

  // Faded body
  p.fill(0, 0, 40, fadeOut * 40);
  p.noStroke();
  p.circle(0, 0, radius * 1.5);

  p.pop();
}

function drawFood(p: p5, food: Food): void {
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(90, 70, 80, 90);
  p.noStroke();
  p.circle(food.x, food.y, 6 + food.value * 6);
  p.pop();
}

function drawPredator(p: p5, pred: Predator, time: number): void {
  p.push();
  p.translate(pred.x, pred.y);

  // Pulsing red predator
  const pulse = 0.8 + Math.sin(time * 0.1) * 0.2;
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(0, 80, 70 * pulse, 90);
  p.noStroke();

  // Triangle shape pointing in movement direction
  const angle = Math.atan2(pred.vy, pred.vx);
  p.rotate(angle);
  p.triangle(12, 0, -8, -7, -8, 7);

  p.pop();
}

function drawObstacle(p: p5, obs: Obstacle): void {
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(30, 20, 45, 90);
  p.stroke(30, 30, 35, 60);
  p.strokeWeight(1);
  p.rect(obs.x, obs.y, obs.width, obs.height, 3);
  p.pop();
}

function drawTank(p: p5, tank: Tank, time: number, showGenome: boolean): void {
  // Tank background
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);

  // Different background tint per tank type
  let bgHue = 200;
  if (tank.type === 'predator') bgHue = 350;
  else if (tank.type === 'scarcity') bgHue = 50;
  else if (tank.type === 'obstacle') bgHue = 150;

  p.fill(bgHue, 10, 15, 95);
  p.noStroke();
  p.rect(tank.x, tank.y, tank.width, tank.height, 6);

  // Tank border
  p.noFill();
  p.stroke(bgHue, 15, 30, 80);
  p.strokeWeight(2);
  p.rect(tank.x, tank.y, tank.width, tank.height, 6);
  p.pop();

  // Draw obstacles
  for (const obs of tank.obstacles) {
    drawObstacle(p, obs);
  }

  // Draw dead creatures (ghosts)
  for (const dead of tank.deadCreatures) {
    drawDeadCreature(p, dead, time);
  }

  // Draw food
  for (const food of tank.food) {
    drawFood(p, food);
  }

  // Draw predators
  for (const pred of tank.predators) {
    drawPredator(p, pred, time);
  }

  // Draw creatures
  for (const creature of tank.creatures) {
    drawCreature(p, creature, time, showGenome);
  }

  // Tank label
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(0, 0, 70);
  p.noStroke();
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(11);
  p.textFont('monospace');
  p.text(TANK_LABELS[tank.type], tank.x + tank.width / 2, tank.y + 6);
  p.pop();

  // Stats
  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.fill(0, 0, 55);
  p.noStroke();
  p.textAlign(p.CENTER, p.BOTTOM);
  p.textSize(9);
  p.textFont('monospace');
  p.text(
    `Pop: ${tank.creatures.length} | Gen: ${tank.generation}`,
    tank.x + tank.width / 2,
    tank.y + tank.height - 5
  );
  p.pop();
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  simulationSpeed: 1,
  mutationRate: 0.35,
  showGenomes: 1,
  seed: 137,
};

const controlConfigs: Record<string, ControlConfig> = {
  simulationSpeed: {
    label: 'Speed',
    min: 0.25,
    max: 3,
    defaultValue: 1,
    step: 0.25,
    format: (v: number) => `${v.toFixed(2)}x`,
  },
  mutationRate: {
    label: 'Mutation Rate',
    min: 0.1,
    max: 0.8,
    defaultValue: 0.35,
    step: 0.05,
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
  showGenomes: {
    label: 'Show Genomes',
    min: 0,
    max: 1,
    defaultValue: 1,
    step: 1,
    format: (v: number) => (v >= 0.5 ? 'ON' : 'OFF'),
  },
  seed: {
    label: 'Seed',
    min: 1,
    max: 999,
    defaultValue: 137,
    step: 1,
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'interactive' as const,
  viewingDistance: 1.5,
  dimensions: { width: 2.4, height: 1.2 },
  animated: true,
  suggestedZone: 'Evolution Lab',
  canBecomeArchitecture: true,
  placard: `Three populations. Three selection pressures. Watch them diverge. The tank with predators bred speed. The tank with scarce food bred efficiency. The tank with obstacles bred navigation. Each creature's genome is visible as a colored ring—watch the colors shift across generations. Most mutations fail. Some don't.`,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let lastSeed = -1;

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 29,
  prompt: 'Genetic evolution and mutation.',
  creditName: 'Monokai',
  creditUrl: 'https://monokai.com/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-29',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const seed = Math.floor((controls.seed ?? 137) as number);
    const random = createSeededRandom(seed);
    lastSeed = seed;

    // Create three tanks arranged horizontally
    const tankWidth = 240;
    const tankHeight = 520;
    const tankGap = 20;
    const totalWidth = tankWidth * 3 + tankGap * 2;
    const startX = (p.width - totalWidth) / 2;
    const startY = (p.height - tankHeight) / 2 + 20;

    const state: TankState = {
      tanks: [
        createTank('predator', startX, startY, tankWidth, tankHeight, random, 0),
        createTank('scarcity', startX + tankWidth + tankGap, startY, tankWidth, tankHeight, random, 0),
        createTank('obstacle', startX + (tankWidth + tankGap) * 2, startY, tankWidth, tankHeight, random, 0),
      ],
      time: 0,
      lastFoodSpawn: 0,
      random,
    };

    (p as any)._tankState = state;
    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Check for seed change
    const seed = Math.floor((controls.seed ?? 137) as number);
    if (seed !== lastSeed) {
      // Reinitialize
      const random = createSeededRandom(seed);
      lastSeed = seed;

      const tankWidth = 240;
      const tankHeight = 520;
      const tankGap = 20;
      const totalWidth = tankWidth * 3 + tankGap * 2;
      const startX = (p.width - totalWidth) / 2;
      const startY = (p.height - tankHeight) / 2 + 20;

      (p as any)._tankState = {
        tanks: [
          createTank('predator', startX, startY, tankWidth, tankHeight, random, 0),
          createTank('scarcity', startX + tankWidth + tankGap, startY, tankWidth, tankHeight, random, 0),
          createTank('obstacle', startX + (tankWidth + tankGap) * 2, startY, tankWidth, tankHeight, random, 0),
        ],
        time: 0,
        lastFoodSpawn: 0,
        random,
      };
    }

    let state: TankState = (p as any)._tankState;
    if (!state) {
      // Safety fallback
      config.setup?.(p);
      state = (p as any)._tankState;
    }

    // Update
    state.time++;
    for (const tank of state.tanks) {
      updateTank(tank, state.time, controls, state.random);
    }

    // Draw background
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(220, 8, 12);

    // Draw title
    p.fill(0, 0, 75);
    p.noStroke();
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(16);
    p.textFont('monospace');
    p.text('TANK', p.width / 2, 18);

    p.textSize(10);
    p.fill(0, 0, 50);
    p.text('Genetic Evolution in Parallel Environments', p.width / 2, 38);

    // Draw tanks
    const showGenome = ((controls.showGenomes ?? 1) as number) >= 0.5;
    for (const tank of state.tanks) {
      drawTank(p, tank, state.time, showGenome);
    }

    // Draw genome legend
    drawLegend(p);
  },

  renderFinal: (p: p5) => {
    // For static capture, just draw current state
    config.draw?.(p);
  },
};

function drawLegend(p: p5): void {
  const legendX = 30;
  const legendY = p.height - 80;
  const boxSize = 10;
  const spacing = 14;

  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(9);
  p.textFont('monospace');

  const genes: (keyof Genome)[] = ['speed', 'size', 'sensing', 'metabolism', 'aggression'];
  const labels = ['Speed', 'Size', 'Sensing', 'Metabolism', 'Aggression'];

  for (let i = 0; i < genes.length; i++) {
    const color = GENE_COLORS[genes[i]];
    const x = legendX + (i % 3) * 95;
    const y = legendY + Math.floor(i / 3) * 18;

    p.fill(color[0], color[1], color[2]);
    p.noStroke();
    p.rect(x, y - boxSize / 2, boxSize, boxSize, 2);

    p.fill(0, 0, 60);
    p.text(labels[i], x + boxSize + 4, y);
  }

  p.pop();
}

// Claude's Choice — settings for maximum evolutionary drama
export function getClaudesChoice(): Partial<ControlState> {
  return {
    simulationSpeed: 1.5,
    mutationRate: 0.4,
    showGenomes: 1,
    seed: 42,
  };
}

export { controlConfigs, defaultControls };
export default config;
