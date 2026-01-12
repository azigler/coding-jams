/**
 * Day 12: "FAULT"
 *
 * A single white cube under tension. It fractures along grid lines,
 * drifts apart to reveal darkness in the gaps, then heals.
 * The cycle repeats with different fracture patterns.
 *
 * This piece explores structural integrity and the catharsis of breaking.
 * The constraint "boxes only" becomes generative—one box becomes many,
 * many become one.
 *
 * Medium: p5.js WEBGL — true 3D boxes with depth and shadow
 *
 * After Kazimir Malevich's Black Square and Josef Albers' nested squares.
 * The box as revelation, not decoration.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface Fragment {
  // Grid position (which cell in the subdivision)
  gridX: number;
  gridY: number;
  gridZ: number;
  // Size of this fragment
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  // Center position relative to whole cube
  centerX: number;
  centerY: number;
  centerZ: number;
  // Drift direction (normalized)
  driftX: number;
  driftY: number;
  driftZ: number;
  // Random rotation axis
  rotAxisX: number;
  rotAxisY: number;
  rotAxisZ: number;
  // Color variation
  brightness: number;
}

interface FaultState {
  fragments: Fragment[];
  phase: 'holding' | 'breaking' | 'drifting' | 'healing';
  phaseTime: number;
  cycleCount: number;
  subdivisions: number;
  seed: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CUBE_SIZE = 280;
const PHASE_DURATIONS = {
  holding: 2.0,    // Tension builds
  breaking: 0.3,   // The crack moment
  drifting: 3.0,   // Float apart
  healing: 2.5     // Come back together
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function easeInBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
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
// FRACTURE GENERATION
// ============================================================================

function generateFragments(subdivisions: number, seed: number): Fragment[] {
  const fragments: Fragment[] = [];
  const rand = seededRandom(seed);

  // Calculate cell size
  const cellSize = CUBE_SIZE / subdivisions;

  for (let gx = 0; gx < subdivisions; gx++) {
    for (let gy = 0; gy < subdivisions; gy++) {
      for (let gz = 0; gz < subdivisions; gz++) {
        // Calculate center position relative to cube center
        const centerX = (gx + 0.5) * cellSize - CUBE_SIZE / 2;
        const centerY = (gy + 0.5) * cellSize - CUBE_SIZE / 2;
        const centerZ = (gz + 0.5) * cellSize - CUBE_SIZE / 2;

        // Drift direction: away from center with some randomness
        const distFromCenter = Math.sqrt(centerX * centerX + centerY * centerY + centerZ * centerZ);
        const baseDir = distFromCenter > 0.01 ? {
          x: centerX / distFromCenter,
          y: centerY / distFromCenter,
          z: centerZ / distFromCenter
        } : { x: rand() - 0.5, y: rand() - 0.5, z: rand() - 0.5 };

        // Add randomness to drift direction
        const randX = (rand() - 0.5) * 0.5;
        const randY = (rand() - 0.5) * 0.5;
        const randZ = (rand() - 0.5) * 0.5;

        const driftX = baseDir.x + randX;
        const driftY = baseDir.y + randY;
        const driftZ = baseDir.z + randZ;
        const driftLen = Math.sqrt(driftX * driftX + driftY * driftY + driftZ * driftZ);

        // Random rotation axis
        const rotX = rand() - 0.5;
        const rotY = rand() - 0.5;
        const rotZ = rand() - 0.5;
        const rotLen = Math.sqrt(rotX * rotX + rotY * rotY + rotZ * rotZ);

        fragments.push({
          gridX: gx,
          gridY: gy,
          gridZ: gz,
          sizeX: cellSize * 0.98, // Tiny gap for visual separation
          sizeY: cellSize * 0.98,
          sizeZ: cellSize * 0.98,
          centerX,
          centerY,
          centerZ,
          driftX: driftLen > 0 ? driftX / driftLen : 0,
          driftY: driftLen > 0 ? driftY / driftLen : 0,
          driftZ: driftLen > 0 ? driftZ / driftLen : 0,
          rotAxisX: rotLen > 0 ? rotX / rotLen : 1,
          rotAxisY: rotLen > 0 ? rotY / rotLen : 0,
          rotAxisZ: rotLen > 0 ? rotZ / rotLen : 0,
          brightness: 0.95 + rand() * 0.05
        });
      }
    }
  }

  return fragments;
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(subdivisions: number, seed: number): FaultState {
  return {
    fragments: generateFragments(subdivisions, seed),
    phase: 'holding',
    phaseTime: 0,
    cycleCount: 0,
    subdivisions,
    seed
  };
}

function updateState(state: FaultState, deltaTime: number, controls: ControlState): FaultState {
  const speed = controls.cycleSpeed ?? 1.0;
  const newPhaseTime = state.phaseTime + deltaTime * speed;

  const phaseDuration = PHASE_DURATIONS[state.phase];

  if (newPhaseTime >= phaseDuration) {
    // Transition to next phase
    const phases: FaultState['phase'][] = ['holding', 'breaking', 'drifting', 'healing'];
    const currentIdx = phases.indexOf(state.phase);
    const nextIdx = (currentIdx + 1) % phases.length;
    const nextPhase = phases[nextIdx];

    // If completing a full cycle, regenerate with new pattern
    if (nextPhase === 'holding') {
      const newSeed = state.seed + 1;
      const subdivisions = Math.round(controls.subdivisions ?? 3);
      return {
        fragments: generateFragments(subdivisions, newSeed),
        phase: nextPhase,
        phaseTime: 0,
        cycleCount: state.cycleCount + 1,
        subdivisions,
        seed: newSeed
      };
    }

    return {
      ...state,
      phase: nextPhase,
      phaseTime: 0
    };
  }

  return {
    ...state,
    phaseTime: newPhaseTime
  };
}

// ============================================================================
// RENDERING
// ============================================================================

function getFragmentTransform(
  fragment: Fragment,
  state: FaultState,
  controls: ControlState
): { offsetX: number; offsetY: number; offsetZ: number; rotation: number; scale: number } {
  const driftDistance = controls.driftDistance ?? 150;
  const rotationAmount = controls.rotationAmount ?? 0.5;

  const t = state.phaseTime / PHASE_DURATIONS[state.phase];

  switch (state.phase) {
    case 'holding': {
      // Subtle vibration building tension
      const tension = easeInBack(t);
      const vibration = Math.sin(t * 60) * tension * 2;
      return {
        offsetX: vibration * fragment.driftX,
        offsetY: vibration * fragment.driftY,
        offsetZ: vibration * fragment.driftZ,
        rotation: 0,
        scale: 1
      };
    }

    case 'breaking': {
      // Explosive separation
      const explosion = easeOutExpo(t);
      const dist = explosion * driftDistance * 0.3;
      return {
        offsetX: dist * fragment.driftX,
        offsetY: dist * fragment.driftY,
        offsetZ: dist * fragment.driftZ,
        rotation: explosion * rotationAmount * 0.3,
        scale: 1
      };
    }

    case 'drifting': {
      // Gentle float in space
      const drift = easeInOutCubic(t);
      const baseOffset = driftDistance * 0.3;
      const additionalDrift = drift * driftDistance * 0.7;
      const totalDist = baseOffset + additionalDrift;

      // Add gentle oscillation
      const oscillation = Math.sin(t * Math.PI * 2) * 10;

      return {
        offsetX: totalDist * fragment.driftX + oscillation * fragment.rotAxisX,
        offsetY: totalDist * fragment.driftY + oscillation * fragment.rotAxisY,
        offsetZ: totalDist * fragment.driftZ + oscillation * fragment.rotAxisZ,
        rotation: (0.3 + drift * 0.7) * rotationAmount,
        scale: 1
      };
    }

    case 'healing': {
      // Return to wholeness
      const heal = easeOutElastic(t);
      const remainingDist = driftDistance * (1 - heal);

      return {
        offsetX: remainingDist * fragment.driftX,
        offsetY: remainingDist * fragment.driftY,
        offsetZ: remainingDist * fragment.driftZ,
        rotation: rotationAmount * (1 - heal),
        scale: 1
      };
    }

    default:
      return { offsetX: 0, offsetY: 0, offsetZ: 0, rotation: 0, scale: 1 };
  }
}

function renderFragment(
  p: p5,
  fragment: Fragment,
  state: FaultState,
  controls: ControlState
): void {
  const transform = getFragmentTransform(fragment, state, controls);

  p.push();

  // Position
  p.translate(
    fragment.centerX + transform.offsetX,
    fragment.centerY + transform.offsetY,
    fragment.centerZ + transform.offsetZ
  );

  // Rotation around fragment's random axis
  if (transform.rotation !== 0) {
    p.rotate(transform.rotation, [fragment.rotAxisX, fragment.rotAxisY, fragment.rotAxisZ] as unknown as p5.Vector);
  }

  // Scale
  p.scale(transform.scale);

  // Color: warm white with slight variation
  const warmth = controls.warmth ?? 0.5;
  const r = 245 + fragment.brightness * 10;
  const g = 240 + fragment.brightness * 8 - warmth * 5;
  const b = 235 + fragment.brightness * 5 - warmth * 15;

  p.fill(r, g, b);
  p.noStroke();

  // Draw the box
  p.box(fragment.sizeX, fragment.sizeY, fragment.sizeZ);

  p.pop();
}

function renderScene(p: p5, state: FaultState, controls: ControlState): void {
  // Camera rotation for visual interest
  const cameraAngle = controls.cameraRotation ?? 0.3;
  const time = p.millis() / 1000;
  const camX = Math.sin(time * 0.1) * cameraAngle;
  const camY = Math.cos(time * 0.08) * cameraAngle * 0.5;

  p.rotateX(camY - 0.3);
  p.rotateY(camX + Math.PI / 6);

  // Render all fragments
  for (const fragment of state.fragments) {
    renderFragment(p, fragment, state, controls);
  }
}

function drawOverlay(p: p5, state: FaultState): void {
  // Switch to 2D for overlay
  p.push();
  p.resetMatrix();

  // Use ortho for 2D overlay
  p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -1, 1);

  // Bottom panel
  p.noStroke();
  p.fill(20, 20, 25, 220);
  p.translate(-p.width / 2, p.height / 2 - 65, 0);
  p.plane(p.width, 65);

  p.pop();

  // Draw text using 2D context workaround
  // p5 WEBGL text is limited, so we keep the title simple
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  subdivisions: 3,
  driftDistance: 180,
  rotationAmount: 0.6,
  cycleSpeed: 1.0,
  cameraRotation: 0.3,
  warmth: 0.5
};

const controlConfigs: { [key: string]: ControlConfig } = {
  subdivisions: {
    label: 'Subdivisions',
    min: 2,
    max: 5,
    defaultValue: 3,
    step: 1
  },
  driftDistance: {
    label: 'Drift Distance',
    min: 50,
    max: 300,
    defaultValue: 180,
    step: 10
  },
  rotationAmount: {
    label: 'Rotation Amount',
    min: 0,
    max: 1.5,
    defaultValue: 0.6,
    step: 0.1
  },
  cycleSpeed: {
    label: 'Cycle Speed',
    min: 0.3,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  cameraRotation: {
    label: 'Camera Motion',
    min: 0,
    max: 0.8,
    defaultValue: 0.3,
    step: 0.1
  },
  warmth: {
    label: 'Color Warmth',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.1
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 12,
  prompt: 'Boxes only.',
  creditName: 'Stranger in the Q',
  creditUrl: 'https://strangerintheq.art/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-12'
  },

  setup: (p: p5) => {
    p.createCanvas(800, 800, p.WEBGL);
    p.colorMode(p.RGB, 255);

    const controls = (p as any)._controls || { ...defaultControls };
    const subdivisions = Math.round(controls.subdivisions ?? 3);

    (p as any)._faultState = initState(subdivisions, 42);
    (p as any)._lastTime = p.millis();
    (p as any)._lastSubdivisions = subdivisions;

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Calculate delta time
    const currentTime = p.millis();
    const deltaTime = (currentTime - ((p as any)._lastTime || currentTime)) / 1000;
    (p as any)._lastTime = currentTime;

    // Check if subdivisions changed
    const currentSubdivisions = Math.round(controls.subdivisions ?? 3);
    if (currentSubdivisions !== (p as any)._lastSubdivisions) {
      const state = (p as any)._faultState as FaultState;
      (p as any)._faultState = initState(currentSubdivisions, state.seed);
      (p as any)._lastSubdivisions = currentSubdivisions;
    }

    // Update state
    let state: FaultState = (p as any)._faultState;
    state = updateState(state, deltaTime, controls);
    (p as any)._faultState = state;

    // Background: warm off-white to dark gradient based on phase
    const bgDarkness = state.phase === 'drifting' ? 0.3 : 0;
    const bgR = p.lerp(250, 20, bgDarkness);
    const bgG = p.lerp(248, 18, bgDarkness);
    const bgB = p.lerp(245, 22, bgDarkness);
    p.background(bgR, bgG, bgB);

    // Lighting
    p.ambientLight(120, 115, 110);
    p.directionalLight(255, 250, 245, 0.5, 0.5, -1);
    p.directionalLight(80, 85, 100, -0.5, -0.3, -0.5);

    // Render the scene
    renderScene(p, state, controls);

    // Draw title overlay (2D)
    drawTitle(p, state);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const state = initState(Math.round(controls.subdivisions ?? 3), 42);

    // Render at the dramatic "just fractured" moment
    const midBreakState: FaultState = {
      ...state,
      phase: 'drifting',
      phaseTime: 0.5
    };

    p.background(245, 243, 240);
    p.ambientLight(120, 115, 110);
    p.directionalLight(255, 250, 245, 0.5, 0.5, -1);
    p.directionalLight(80, 85, 100, -0.5, -0.3, -0.5);

    renderScene(p, midBreakState, controls);
    drawTitle(p, midBreakState);
  }
};

function drawTitle(p: p5, state: FaultState): void {
  // Create a 2D overlay using a separate graphics buffer approach
  // For WEBGL, we'll use camera reset for pseudo-2D
  p.push();
  p.resetMatrix();
  p.camera(0, 0, (p.height / 2) / Math.tan(Math.PI / 6), 0, 0, 0, 0, 1, 0);

  // Draw a dark panel at bottom
  p.noStroke();
  p.fill(20, 20, 25, 220);
  p.translate(0, p.height / 2 - 35, 0);
  p.plane(p.width, 70);

  // Note: Text in WEBGL requires textFont with a font that supports it
  // For simplicity, we rely on the harness overlay or accept minimal text

  p.pop();
}

// Claude's Choice — settings that create the most dramatic fault cycle
export function getClaudesChoice(): Partial<ControlState> {
  return {
    subdivisions: 3,
    driftDistance: 200,
    rotationAmount: 0.7,
    cycleSpeed: 0.8,
    cameraRotation: 0.35,
    warmth: 0.6
  };
}

export { controlConfigs, defaultControls };
export default config;
