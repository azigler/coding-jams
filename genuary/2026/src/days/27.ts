/**
 * Day 27: SEEKING
 *
 * "Lifeform. A shape or structure that behaves as if it's alive or growing." — Manuel Larino
 *
 * A 3D mycelium network growing through space, seeking invisible nutrient sources.
 * Each filament tip senses chemical gradients, turns toward resources, forks when
 * abundant, and withers when trapped in dead ends.
 *
 * Distributed intelligence—ten thousand small decisions.
 *
 * After Physarum polycephalum, the slime mold that solved the Tokyo rail system.
 *
 * Medium: Three.js (WebGL 3D)
 */

import * as THREE from 'three';
import type { DayConfig, ThreeContext, ControlState } from '../types';
import type { ControlConfig } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface GrowthTip {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  energy: number;
  age: number;
  thickness: number;
  parentIndex: number; // Index of parent segment for thickening
  alive: boolean;
}

interface Segment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness: number;
  tipIndex: number; // Which tip created this
  age: number;
  flowCount: number; // How many times nutrients flowed through (for reinforcement)
}

interface NutrientSource {
  position: THREE.Vector3;
  strength: number;
  radius: number;
}

interface MyceliumContext extends ThreeContext {
  tips: GrowthTip[];
  segments: Segment[];
  nutrientSources: NutrientSource[];
  tubeGeometry: THREE.InstancedMesh | null;
  tipGeometry: THREE.InstancedMesh | null;
  sourceGeometry: THREE.InstancedMesh | null;
  time: number;
  lastGrowthTime: number;
  seed: number;
  random: () => number;
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
// VECTOR UTILITIES
// ============================================================================

function randomDirection(random: () => number): THREE.Vector3 {
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(2 * random() - 1);
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  ).normalize();
}

function clampToVolume(pos: THREE.Vector3, bounds: number): void {
  pos.x = Math.max(-bounds, Math.min(bounds, pos.x));
  pos.y = Math.max(-bounds, Math.min(bounds, pos.y));
  pos.z = Math.max(-bounds, Math.min(bounds, pos.z));
}

// ============================================================================
// NUTRIENT GRADIENT
// ============================================================================

function computeGradient(
  position: THREE.Vector3,
  sources: NutrientSource[],
  gradientStrength: number
): THREE.Vector3 {
  const gradient = new THREE.Vector3(0, 0, 0);

  for (const source of sources) {
    const toSource = new THREE.Vector3().subVectors(source.position, position);
    const distance = toSource.length();

    if (distance < 0.01) continue;

    // Inverse square falloff with source strength
    const influence = (source.strength * source.radius) / (distance * distance + 0.5);
    toSource.normalize().multiplyScalar(influence * gradientStrength);
    gradient.add(toSource);
  }

  return gradient;
}

// ============================================================================
// GROWTH SIMULATION
// ============================================================================

function initializeNetwork(
  ctx: MyceliumContext,
  numSources: number,
  bounds: number
): void {
  ctx.tips = [];
  ctx.segments = [];
  ctx.nutrientSources = [];

  // Create nutrient sources
  for (let i = 0; i < numSources; i++) {
    ctx.nutrientSources.push({
      position: new THREE.Vector3(
        (ctx.random() - 0.5) * bounds * 1.8,
        (ctx.random() - 0.5) * bounds * 1.8,
        (ctx.random() - 0.5) * bounds * 1.8
      ),
      strength: 0.5 + ctx.random() * 0.5,
      radius: 1 + ctx.random() * 2,
    });
  }

  // Create initial growth tips at center
  const initialTips = 3 + Math.floor(ctx.random() * 3);
  for (let i = 0; i < initialTips; i++) {
    ctx.tips.push({
      position: new THREE.Vector3(
        (ctx.random() - 0.5) * 0.5,
        (ctx.random() - 0.5) * 0.5,
        (ctx.random() - 0.5) * 0.5
      ),
      direction: randomDirection(ctx.random),
      energy: 1.0,
      age: 0,
      thickness: 0.08,
      parentIndex: -1,
      alive: true,
    });
  }
}

function growNetwork(
  ctx: MyceliumContext,
  controls: ControlState,
  deltaTime: number
): void {
  const growthSpeed = (controls.growthSpeed as number) || 1;
  const forkProbability = (controls.forkProbability as number) || 0.02;
  const gradientStrength = (controls.gradientStrength as number) || 0.5;
  const bounds = 5;
  const stepSize = 0.08 * growthSpeed;

  const newTips: GrowthTip[] = [];

  for (const tip of ctx.tips) {
    if (!tip.alive) continue;

    // Age and energy decay
    tip.age += deltaTime;
    tip.energy -= 0.002 * deltaTime * 60; // Energy decays over time

    // Check if depleted
    if (tip.energy <= 0) {
      tip.alive = false;
      continue;
    }

    // Compute gradient toward nutrients
    const gradient = computeGradient(tip.position, ctx.nutrientSources, gradientStrength);

    // Add some randomness for organic feel
    const randomWander = randomDirection(ctx.random).multiplyScalar(0.2);

    // Blend direction toward gradient
    const newDirection = new THREE.Vector3()
      .addVectors(tip.direction.clone().multiplyScalar(0.7), gradient.clone().multiplyScalar(0.3))
      .add(randomWander)
      .normalize();

    tip.direction.copy(newDirection);

    // Move tip
    const oldPos = tip.position.clone();
    tip.position.add(tip.direction.clone().multiplyScalar(stepSize));

    // Clamp to bounds
    clampToVolume(tip.position, bounds);

    // Check if hit boundary (reduce energy if stuck)
    const hitBoundary =
      Math.abs(tip.position.x) >= bounds - 0.01 ||
      Math.abs(tip.position.y) >= bounds - 0.01 ||
      Math.abs(tip.position.z) >= bounds - 0.01;

    if (hitBoundary) {
      tip.energy -= 0.05;
      // Reflect direction away from boundary
      if (Math.abs(tip.position.x) >= bounds - 0.01) tip.direction.x *= -1;
      if (Math.abs(tip.position.y) >= bounds - 0.01) tip.direction.y *= -1;
      if (Math.abs(tip.position.z) >= bounds - 0.01) tip.direction.z *= -1;
    }

    // Check proximity to nutrients (gain energy)
    for (const source of ctx.nutrientSources) {
      const dist = tip.position.distanceTo(source.position);
      if (dist < source.radius * 2) {
        tip.energy = Math.min(1.5, tip.energy + 0.02 * source.strength);
      }
    }

    // Create segment
    const segmentIndex = ctx.segments.length;
    ctx.segments.push({
      start: oldPos,
      end: tip.position.clone(),
      thickness: tip.thickness,
      tipIndex: ctx.tips.indexOf(tip),
      age: 0,
      flowCount: 1,
    });

    // Possibly fork if energy is high
    if (tip.energy > 0.7 && ctx.random() < forkProbability && ctx.tips.length < 500) {
      // Create a new tip branching off
      const forkAngle = (ctx.random() - 0.5) * Math.PI * 0.5;
      const axis = new THREE.Vector3(ctx.random() - 0.5, ctx.random() - 0.5, ctx.random() - 0.5).normalize();
      const forkDir = tip.direction.clone().applyAxisAngle(axis, forkAngle).normalize();

      newTips.push({
        position: tip.position.clone(),
        direction: forkDir,
        energy: tip.energy * 0.6, // Share energy
        age: 0,
        thickness: tip.thickness * 0.8, // Thinner branch
        parentIndex: segmentIndex,
        alive: true,
      });

      tip.energy *= 0.6; // Reduce parent energy too
    }

    // Thicken successful paths (reinforcement)
    if (tip.parentIndex >= 0 && tip.parentIndex < ctx.segments.length) {
      const parentSeg = ctx.segments[tip.parentIndex];
      parentSeg.flowCount += 1;
      parentSeg.thickness = Math.min(0.15, parentSeg.thickness * 1.001);
    }

    tip.parentIndex = segmentIndex;
  }

  // Add new forked tips
  ctx.tips.push(...newTips);

  // Age segments
  for (const seg of ctx.segments) {
    seg.age += deltaTime;
  }
}

// ============================================================================
// RENDERING
// ============================================================================

const MAX_SEGMENTS = 10000;
const MAX_TIPS = 500;
const MAX_SOURCES = 20;

function createTubeInstance(): THREE.InstancedMesh {
  // Use a cylinder for each segment
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1);
  geometry.rotateX(Math.PI / 2); // Point along Z axis

  const material = new THREE.MeshStandardMaterial({
    color: 0xf5e6d3, // Warm cream/bone
    roughness: 0.7,
    metalness: 0.1,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_SEGMENTS);
  mesh.count = 0;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createTipInstance(): THREE.InstancedMesh {
  const geometry = new THREE.SphereGeometry(1, 8, 8);

  const material = new THREE.MeshStandardMaterial({
    color: 0xfff8e7, // Slightly glowing cream
    emissive: 0xffcc88,
    emissiveIntensity: 0.5,
    roughness: 0.5,
    metalness: 0,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_TIPS);
  mesh.count = 0;

  return mesh;
}

function createSourceInstance(): THREE.InstancedMesh {
  const geometry = new THREE.SphereGeometry(1, 16, 16);

  const material = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.15,
    roughness: 1,
    metalness: 0,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_SOURCES);
  mesh.count = 0;

  return mesh;
}

function updateInstancedMeshes(ctx: MyceliumContext, controls: ControlState): void {
  const tipGlow = (controls.tipGlow as number) || 0.5;

  // Update tube instances
  if (ctx.tubeGeometry) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const up = new THREE.Vector3(0, 0, 1);

    let count = 0;
    for (let i = 0; i < Math.min(ctx.segments.length, MAX_SEGMENTS); i++) {
      const seg = ctx.segments[i];

      // Position at midpoint
      position.copy(seg.start).add(seg.end).multiplyScalar(0.5);

      // Direction and length
      const dir = new THREE.Vector3().subVectors(seg.end, seg.start);
      const length = dir.length();
      if (length < 0.001) continue;

      dir.normalize();

      // Quaternion to rotate cylinder to point along segment
      quaternion.setFromUnitVectors(up, dir);

      // Scale: thickness for radius, length for height
      const fadeThickness = seg.thickness * Math.min(1, Math.pow(seg.flowCount, 0.1));
      scale.set(fadeThickness, fadeThickness, length);

      matrix.compose(position, quaternion, scale);
      ctx.tubeGeometry.setMatrixAt(count, matrix);
      count++;
    }

    ctx.tubeGeometry.count = count;
    ctx.tubeGeometry.instanceMatrix.needsUpdate = true;
  }

  // Update tip instances
  if (ctx.tipGeometry) {
    const matrix = new THREE.Matrix4();

    let count = 0;
    for (let i = 0; i < Math.min(ctx.tips.length, MAX_TIPS); i++) {
      const tip = ctx.tips[i];
      if (!tip.alive) continue;

      const size = tip.thickness * 1.5 * (0.8 + tip.energy * 0.4);
      matrix.makeScale(size, size, size);
      matrix.setPosition(tip.position);

      ctx.tipGeometry.setMatrixAt(count, matrix);
      count++;
    }

    ctx.tipGeometry.count = count;
    ctx.tipGeometry.instanceMatrix.needsUpdate = true;

    // Update emissive intensity based on control
    const tipMat = ctx.tipGeometry.material as THREE.MeshStandardMaterial;
    tipMat.emissiveIntensity = tipGlow;
  }

  // Update source instances
  if (ctx.sourceGeometry) {
    const matrix = new THREE.Matrix4();

    let count = 0;
    for (let i = 0; i < Math.min(ctx.nutrientSources.length, MAX_SOURCES); i++) {
      const source = ctx.nutrientSources[i];
      const size = source.radius;

      matrix.makeScale(size, size, size);
      matrix.setPosition(source.position);

      ctx.sourceGeometry.setMatrixAt(count, matrix);
      count++;
    }

    ctx.sourceGeometry.count = count;
    ctx.sourceGeometry.instanceMatrix.needsUpdate = true;
  }
}

// ============================================================================
// THREE.JS SETUP
// ============================================================================

function threeSetup(container: HTMLElement, controls: ControlState): MyceliumContext {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14); // Deep blue-black

  // Subtle fog for depth
  scene.fog = new THREE.Fog(0x0a0a14, 8, 20);

  // Camera - orbital view
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(8, 6, 8);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(800, 800);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Style canvas
  const canvas = renderer.domElement;
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.camera.near = 1;
  mainLight.shadow.camera.far = 30;
  mainLight.shadow.camera.left = -10;
  mainLight.shadow.camera.right = 10;
  mainLight.shadow.camera.top = 10;
  mainLight.shadow.camera.bottom = -10;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-5, 2, -5);
  scene.add(fillLight);

  // Create instanced meshes
  const tubeGeometry = createTubeInstance();
  scene.add(tubeGeometry);

  const tipGeometry = createTipInstance();
  scene.add(tipGeometry);

  const sourceGeometry = createSourceInstance();
  scene.add(sourceGeometry);

  // Initialize context
  const seed = Math.floor((controls.seed as number) || 42);
  const random = createSeededRandom(seed);

  const ctx: MyceliumContext = {
    renderer,
    scene,
    camera,
    canvas,
    tips: [],
    segments: [],
    nutrientSources: [],
    tubeGeometry,
    tipGeometry,
    sourceGeometry,
    time: 0,
    lastGrowthTime: 0,
    seed,
    random,
  };

  // Initialize network
  const numSources = Math.floor((controls.numSources as number) || 5);
  initializeNetwork(ctx, numSources, 5);

  return ctx;
}

// ============================================================================
// UPDATE LOOP
// ============================================================================

let lastSeed = -1;
let lastNumSources = -1;

function threeUpdate(baseCtx: ThreeContext, controls: ControlState, deltaTime: number): void {
  const ctx = baseCtx as MyceliumContext;
  ctx.time += deltaTime;

  const seed = Math.floor((controls.seed as number) || 42);
  const numSources = Math.floor((controls.numSources as number) || 5);

  // Reset if seed or sources changed
  if (seed !== lastSeed || numSources !== lastNumSources) {
    ctx.seed = seed;
    ctx.random = createSeededRandom(seed);
    initializeNetwork(ctx, numSources, 5);
    lastSeed = seed;
    lastNumSources = numSources;
  }

  // Grow network
  const growthSpeed = (controls.growthSpeed as number) || 1;
  const growthInterval = 0.016 / growthSpeed; // ~60 FPS worth of growth

  if (ctx.time - ctx.lastGrowthTime > growthInterval) {
    growNetwork(ctx, controls, deltaTime);
    ctx.lastGrowthTime = ctx.time;
  }

  // Update instanced meshes
  updateInstancedMeshes(ctx, controls);

  // Rotate camera slowly
  const cameraOrbit = (controls.cameraOrbit as number) || 0.1;
  const angle = ctx.time * cameraOrbit;
  const radius = 12;
  ctx.camera.position.x = Math.cos(angle) * radius;
  ctx.camera.position.z = Math.sin(angle) * radius;
  ctx.camera.position.y = 5 + Math.sin(ctx.time * 0.1) * 2;
  ctx.camera.lookAt(0, 0, 0);
}

// ============================================================================
// CLEANUP
// ============================================================================

function threeCleanup(baseCtx: ThreeContext): void {
  const ctx = baseCtx as MyceliumContext;

  // Dispose instanced meshes
  if (ctx.tubeGeometry) {
    ctx.tubeGeometry.geometry.dispose();
    (ctx.tubeGeometry.material as THREE.Material).dispose();
  }
  if (ctx.tipGeometry) {
    ctx.tipGeometry.geometry.dispose();
    (ctx.tipGeometry.material as THREE.Material).dispose();
  }
  if (ctx.sourceGeometry) {
    ctx.sourceGeometry.geometry.dispose();
    (ctx.sourceGeometry.material as THREE.Material).dispose();
  }

  // Reset state
  lastSeed = -1;
  lastNumSources = -1;
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  growthSpeed: 1,
  forkProbability: 0.02,
  gradientStrength: 0.5,
  numSources: 5,
  tipGlow: 0.5,
  cameraOrbit: 0.1,
  seed: 42,
};

const controlConfigs: Record<string, ControlConfig> = {
  growthSpeed: {
    label: 'Growth Speed',
    min: 0.2,
    max: 3,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.5) return 'Slow';
      if (v < 1.5) return 'Normal';
      if (v < 2.5) return 'Fast';
      return 'Rapid';
    },
  },
  forkProbability: {
    label: 'Fork Rate',
    min: 0.005,
    max: 0.1,
    defaultValue: 0.02,
    step: 0.005,
    format: (v: number) => {
      if (v < 0.015) return 'Sparse';
      if (v < 0.03) return 'Normal';
      if (v < 0.06) return 'Dense';
      return 'Very Dense';
    },
  },
  gradientStrength: {
    label: 'Gradient Strength',
    min: 0.1,
    max: 1.5,
    defaultValue: 0.5,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.3) return 'Weak';
      if (v < 0.7) return 'Moderate';
      if (v < 1.1) return 'Strong';
      return 'Very Strong';
    },
  },
  numSources: {
    label: 'Nutrient Sources',
    min: 2,
    max: 12,
    defaultValue: 5,
    step: 1,
    format: (v: number) => `${Math.floor(v)} sources`,
  },
  tipGlow: {
    label: 'Tip Glow',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.1,
    format: (v: number) => {
      if (v < 0.2) return 'Dim';
      if (v < 0.5) return 'Soft';
      if (v < 0.8) return 'Bright';
      return 'Intense';
    },
  },
  cameraOrbit: {
    label: 'Camera Orbit',
    min: 0,
    max: 0.3,
    defaultValue: 0.1,
    step: 0.02,
    format: (v: number) => {
      if (v < 0.02) return 'Still';
      if (v < 0.1) return 'Slow';
      if (v < 0.2) return 'Moderate';
      return 'Fast';
    },
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
  viewingDistance: 1.5,
  dimensions: { width: 2, height: 3, depth: 0.3 },
  animated: true,
  suggestedZone: 'Transparency Chamber',
  canBecomeArchitecture: true,
  placard: `Watch it find its way. Ten thousand filaments sensing gradients, turning toward invisible resources, forking when conditions favor growth. No mind directs this network—only local rules, chemical traces, and the accumulated history of what worked. After Physarum polycephalum, the slime mold that solved the Tokyo rail system. The growth tips glow because they're still deciding.`,
};

// ============================================================================
// CONFIG
// ============================================================================

const config: DayConfig = {
  day: 27,
  prompt: 'Lifeform. A shape or structure that behaves as if it\'s alive or growing.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  mode: 'three',
  threeSetup,
  threeUpdate,
  threeCleanup,
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-27',
  },
};

// Claude's Choice — settings that showcase the network intelligence
export function getClaudesChoice(): Partial<ControlState> {
  return {
    growthSpeed: 1.2,
    forkProbability: 0.025,
    gradientStrength: 0.6,
    numSources: 6,
    tipGlow: 0.6,
    cameraOrbit: 0.08,
    seed: 137,
  };
}

export { controlConfigs, defaultControls };
export default config;
