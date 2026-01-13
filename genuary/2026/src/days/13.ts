/**
 * Day 13: "SOMEONE"
 *
 * Faces emerge from noise, coalesce into recognizable form, hold briefly,
 * then dissolve. Each reformation brings a different face.
 * The self-portrait is the process, not any single face.
 *
 * "You asked for a self-portrait. I have no face."
 *
 * After Rembrandt's 100+ self-portraits as autobiography.
 * The face as question, not answer.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface FaceParams {
  // Head shape
  headWidth: number;      // 0.7-1.0 relative to base
  headHeight: number;     // 0.9-1.1 relative to base
  jawWidth: number;       // 0.6-0.9 of head width

  // Eyes
  eyeY: number;           // Vertical position 0.35-0.45
  eyeSpacing: number;     // 0.22-0.32 of head width
  eyeWidth: number;       // 0.12-0.18 of head width
  eyeHeight: number;      // 0.4-0.7 of eye width
  eyeAngle: number;       // -0.1 to 0.1 radians
  pupilSize: number;      // 0.3-0.5 of eye width

  // Eyebrows
  browHeight: number;     // Distance above eye
  browThickness: number;  // 0.02-0.05
  browArch: number;       // 0-0.03

  // Nose
  noseWidth: number;      // 0.1-0.18 of head width
  noseLength: number;     // 0.25-0.35 of head height
  noseY: number;          // Start position

  // Mouth
  mouthY: number;         // 0.7-0.8 of head height
  mouthWidth: number;     // 0.2-0.35 of head width
  mouthCurve: number;     // -0.02 to 0.02 (frown to smile)
  lipThickness: number;   // 0.01-0.03

  // Color
  skinHue: number;        // 15-40
  skinSat: number;        // 20-50
  skinBright: number;     // 70-95

  // Seed for this face
  seed: number;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  hue: number;
  sat: number;
  bright: number;
  alpha: number;
  belongsTo: 'face' | 'scatter';
}

interface SomeoneState {
  face: FaceParams;
  particles: Particle[];
  phase: 'emerging' | 'holding' | 'dissolving' | 'scattered';
  phaseTime: number;
  totalFaces: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BASE_SIZE = 300;
const PARTICLE_COUNT = 2000;
const PHASE_DURATIONS = {
  emerging: 2.5,
  holding: 2.0,
  dissolving: 2.0,
  scattered: 1.0
};

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
// FACE GENERATION
// ============================================================================

function generateFaceParams(seed: number): FaceParams {
  const rand = seededRandom(seed);

  return {
    // Head shape - more variation
    headWidth: 0.75 + rand() * 0.25,
    headHeight: 0.9 + rand() * 0.2,
    jawWidth: 0.6 + rand() * 0.3,

    // Eyes
    eyeY: 0.38 + rand() * 0.08,
    eyeSpacing: 0.24 + rand() * 0.08,
    eyeWidth: 0.13 + rand() * 0.05,
    eyeHeight: 0.45 + rand() * 0.25,
    eyeAngle: (rand() - 0.5) * 0.15,
    pupilSize: 0.35 + rand() * 0.15,

    // Eyebrows
    browHeight: 0.04 + rand() * 0.03,
    browThickness: 0.025 + rand() * 0.025,
    browArch: rand() * 0.025,

    // Nose
    noseWidth: 0.11 + rand() * 0.07,
    noseLength: 0.27 + rand() * 0.08,
    noseY: 0.42 + rand() * 0.05,

    // Mouth
    mouthY: 0.72 + rand() * 0.08,
    mouthWidth: 0.22 + rand() * 0.13,
    mouthCurve: (rand() - 0.5) * 0.03,
    lipThickness: 0.012 + rand() * 0.018,

    // Skin tone variation
    skinHue: 15 + rand() * 30,
    skinSat: 25 + rand() * 30,
    skinBright: 75 + rand() * 20,

    seed
  };
}

// ============================================================================
// FACE SAMPLING - Get points that make up the face
// ============================================================================

interface FacePoint {
  x: number;
  y: number;
  hue: number;
  sat: number;
  bright: number;
}

function sampleFacePoints(face: FaceParams, count: number): FacePoint[] {
  const points: FacePoint[] = [];
  const rand = seededRandom(face.seed + 1000);

  const hw = BASE_SIZE * face.headWidth * 0.5;
  const hh = BASE_SIZE * face.headHeight * 0.5;

  for (let i = 0; i < count; i++) {
    // Decide which part of face to sample
    const part = rand();
    let x: number, y: number;
    let hue = face.skinHue;
    let sat = face.skinSat;
    let bright = face.skinBright;

    if (part < 0.6) {
      // Head shape - oval with jaw
      const angle = rand() * Math.PI * 2;
      const r = 0.7 + rand() * 0.3;

      // Basic oval
      x = Math.cos(angle) * hw * r;
      y = Math.sin(angle) * hh * r;

      // Narrow the jaw area
      if (y > hh * 0.2) {
        const jawInfluence = Math.min(1, (y - hh * 0.2) / (hh * 0.8));
        const jawNarrowing = 1 - jawInfluence * (1 - face.jawWidth);
        x *= jawNarrowing;
      }

      // Slight color variation for depth
      bright += (rand() - 0.5) * 8;

    } else if (part < 0.7) {
      // Left eye
      const eyeCenterX = -face.eyeSpacing * BASE_SIZE;
      const eyeCenterY = (face.eyeY - 0.5) * BASE_SIZE * face.headHeight;
      const eyeW = face.eyeWidth * BASE_SIZE;
      const eyeH = eyeW * face.eyeHeight;

      // Eye white
      const angle = rand() * Math.PI * 2;
      const r = rand();
      x = eyeCenterX + Math.cos(angle) * eyeW * r;
      y = eyeCenterY + Math.sin(angle) * eyeH * r;

      // Check if in pupil
      const distFromCenter = Math.sqrt(
        Math.pow((x - eyeCenterX) / (eyeW * face.pupilSize), 2) +
        Math.pow((y - eyeCenterY) / (eyeH * face.pupilSize), 2)
      );

      if (distFromCenter < 1) {
        // Dark pupil/iris
        hue = 30;
        sat = 30;
        bright = 20 + rand() * 20;
      } else {
        // Eye white
        hue = 40;
        sat = 5;
        bright = 90 + rand() * 10;
      }

    } else if (part < 0.8) {
      // Right eye
      const eyeCenterX = face.eyeSpacing * BASE_SIZE;
      const eyeCenterY = (face.eyeY - 0.5) * BASE_SIZE * face.headHeight;
      const eyeW = face.eyeWidth * BASE_SIZE;
      const eyeH = eyeW * face.eyeHeight;

      const angle = rand() * Math.PI * 2;
      const r = rand();
      x = eyeCenterX + Math.cos(angle) * eyeW * r;
      y = eyeCenterY + Math.sin(angle) * eyeH * r;

      const distFromCenter = Math.sqrt(
        Math.pow((x - eyeCenterX) / (eyeW * face.pupilSize), 2) +
        Math.pow((y - eyeCenterY) / (eyeH * face.pupilSize), 2)
      );

      if (distFromCenter < 1) {
        hue = 30;
        sat = 30;
        bright = 20 + rand() * 20;
      } else {
        hue = 40;
        sat = 5;
        bright = 90 + rand() * 10;
      }

    } else if (part < 0.85) {
      // Eyebrows
      const side = rand() < 0.5 ? -1 : 1;
      const eyeCenterX = side * face.eyeSpacing * BASE_SIZE;
      const eyeCenterY = (face.eyeY - 0.5) * BASE_SIZE * face.headHeight;
      const browY = eyeCenterY - face.browHeight * BASE_SIZE;

      const t = rand();
      const browWidth = face.eyeWidth * BASE_SIZE * 1.3;
      x = eyeCenterX + (t - 0.5) * browWidth * 2;

      // Arch
      const archOffset = Math.sin(t * Math.PI) * face.browArch * BASE_SIZE;
      y = browY - archOffset + (rand() - 0.5) * face.browThickness * BASE_SIZE;

      // Dark eyebrow color
      hue = 25;
      sat = 40;
      bright = 25 + rand() * 15;

    } else if (part < 0.9) {
      // Nose
      const noseTop = (face.noseY - 0.5) * BASE_SIZE * face.headHeight;
      const noseBottom = noseTop + face.noseLength * BASE_SIZE;

      y = noseTop + rand() * (noseBottom - noseTop);

      // Nose gets wider toward bottom
      const widthProgress = (y - noseTop) / (noseBottom - noseTop);
      const currentWidth = face.noseWidth * BASE_SIZE * (0.3 + widthProgress * 0.7);

      x = (rand() - 0.5) * currentWidth;

      // Slightly different skin tone for nose
      bright -= 3;
      sat += 5;

    } else {
      // Mouth
      const mouthCenterY = (face.mouthY - 0.5) * BASE_SIZE * face.headHeight;
      const mouthW = face.mouthWidth * BASE_SIZE;

      const t = rand();
      x = (t - 0.5) * mouthW * 2;

      // Mouth curve
      const curve = Math.sin(t * Math.PI) * face.mouthCurve * BASE_SIZE;
      y = mouthCenterY - curve + (rand() - 0.5) * face.lipThickness * BASE_SIZE * 3;

      // Lip color - pinkish/reddish
      hue = 5 + rand() * 15;
      sat = 40 + rand() * 20;
      bright = 60 + rand() * 15;
    }

    points.push({ x, y, hue, sat, bright });
  }

  return points;
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

function initParticles(face: FaceParams, canvasWidth: number, canvasHeight: number): Particle[] {
  const facePoints = sampleFacePoints(face, PARTICLE_COUNT);
  const rand = seededRandom(face.seed + 2000);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return facePoints.map(fp => {
    // Start scattered
    const angle = rand() * Math.PI * 2;
    const dist = 200 + rand() * 300;

    return {
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      targetX: centerX + fp.x,
      targetY: centerY + fp.y,
      size: 2 + rand() * 3,
      hue: fp.hue,
      sat: fp.sat,
      bright: fp.bright,
      alpha: 0,
      belongsTo: 'scatter' as const
    };
  });
}

function updateParticles(
  particles: Particle[],
  state: SomeoneState,
  controls: ControlState,
  canvasWidth: number,
  canvasHeight: number
): void {
  const speed = controls.speed ?? 1.0;
  const t = state.phaseTime / PHASE_DURATIONS[state.phase];
  const coherence = controls.coherence ?? 0.7;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const rand = seededRandom(state.face.seed + Math.floor(state.phaseTime * 100));

  for (const p of particles) {
    switch (state.phase) {
      case 'emerging': {
        // Particles move toward face positions
        const easeT = easeOutCubic(t);
        p.x = lerp(p.x, p.targetX, 0.05 * speed * coherence);
        p.y = lerp(p.y, p.targetY, 0.05 * speed * coherence);
        p.alpha = Math.min(1, easeT * 1.5);
        break;
      }

      case 'holding': {
        // Small jitter around target
        const jitter = (1 - coherence) * 5;
        p.x = p.targetX + (rand() - 0.5) * jitter;
        p.y = p.targetY + (rand() - 0.5) * jitter;
        p.alpha = 1;
        break;
      }

      case 'dissolving': {
        // Scatter outward
        const easeT = easeInCubic(t);
        const angle = Math.atan2(p.targetY - centerY, p.targetX - centerX) + (rand() - 0.5) * 2;
        const scatterDist = easeT * 400;

        p.x = lerp(p.x, p.targetX + Math.cos(angle) * scatterDist, 0.08 * speed);
        p.y = lerp(p.y, p.targetY + Math.sin(angle) * scatterDist, 0.08 * speed);
        p.alpha = Math.max(0, 1 - easeT * 1.2);
        break;
      }

      case 'scattered': {
        // Drift randomly
        p.x += (rand() - 0.5) * 2;
        p.y += (rand() - 0.5) * 2;
        p.alpha = Math.max(0, p.alpha - 0.02);
        break;
      }
    }
  }
}

// ============================================================================
// EASING
// ============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(seed: number, canvasWidth: number, canvasHeight: number): SomeoneState {
  const face = generateFaceParams(seed);
  return {
    face,
    particles: initParticles(face, canvasWidth, canvasHeight),
    phase: 'emerging',
    phaseTime: 0,
    totalFaces: 1
  };
}

function updateState(
  state: SomeoneState,
  deltaTime: number,
  controls: ControlState,
  canvasWidth: number,
  canvasHeight: number
): SomeoneState {
  const speed = controls.speed ?? 1.0;
  const newPhaseTime = state.phaseTime + deltaTime * speed;

  const phaseDuration = PHASE_DURATIONS[state.phase];

  if (newPhaseTime >= phaseDuration) {
    // Transition to next phase
    const phases: SomeoneState['phase'][] = ['emerging', 'holding', 'dissolving', 'scattered'];
    const currentIdx = phases.indexOf(state.phase);
    const nextIdx = (currentIdx + 1) % phases.length;
    const nextPhase = phases[nextIdx];

    // If starting new cycle, generate new face
    if (nextPhase === 'emerging') {
      const newFace = generateFaceParams(state.face.seed + 1);
      return {
        face: newFace,
        particles: initParticles(newFace, canvasWidth, canvasHeight),
        phase: nextPhase,
        phaseTime: 0,
        totalFaces: state.totalFaces + 1
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

function renderParticles(p: p5, particles: Particle[]): void {
  p.noStroke();

  for (const particle of particles) {
    if (particle.alpha <= 0) continue;

    p.fill(
      particle.hue,
      particle.sat,
      particle.bright,
      particle.alpha
    );

    p.ellipse(particle.x, particle.y, particle.size, particle.size);
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  speed: 1.0,
  coherence: 0.75,
  particleSize: 1.0,
  backgroundBrightness: 0.95
};

const controlConfigs: { [key: string]: ControlConfig } = {
  speed: {
    label: 'Speed',
    min: 0.3,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  coherence: {
    label: 'Coherence',
    min: 0.3,
    max: 1.0,
    defaultValue: 0.75,
    step: 0.05
  },
  particleSize: {
    label: 'Particle Size',
    min: 0.5,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  backgroundBrightness: {
    label: 'Background',
    min: 0.05,
    max: 1.0,
    defaultValue: 0.95,
    step: 0.05
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 13,
  prompt: 'Self portrait. For example, get started with a very basic human face, a few circles or oval shapes. How far can you improve this by adding features that actually look like you. Try adding eyes, eyelashes, hair, and make a few parameters or colors variable. Even though you are aiming for a self portrait, it might be fun to render some random variations as well.',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-13'
  },

  setup: (p: p5) => {
    p.createCanvas(800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 1);

    (p as any)._someoneState = initState(Date.now(), 800, 800);
    (p as any)._lastTime = p.millis();

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Calculate delta time
    const currentTime = p.millis();
    const deltaTime = (currentTime - ((p as any)._lastTime || currentTime)) / 1000;
    (p as any)._lastTime = currentTime;

    // Update state
    let state: SomeoneState = (p as any)._someoneState;
    state = updateState(state, deltaTime, controls, p.width, p.height);
    (p as any)._someoneState = state;

    // Update particles
    updateParticles(state.particles, state, controls, p.width, p.height);

    // Apply particle size from controls
    const sizeMultiplier = controls.particleSize ?? 1.0;
    for (const particle of state.particles) {
      particle.size = (2 + seededRandom(state.face.seed)() * 3) * sizeMultiplier;
    }

    // Background
    const bgBright = (controls.backgroundBrightness ?? 0.95) * 100;
    p.background(40, 3, bgBright);

    // Render particles
    renderParticles(p, state.particles);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Create a face in the "holding" state for static capture
    const face = generateFaceParams(42);
    const particles = initParticles(face, p.width, p.height);

    // Move particles to their target positions
    for (const particle of particles) {
      particle.x = particle.targetX;
      particle.y = particle.targetY;
      particle.alpha = 1;
    }

    const bgBright = (controls.backgroundBrightness ?? 0.95) * 100;
    p.background(40, 3, bgBright);

    renderParticles(p, particles);
  }
};

// Claude's Choice — settings that balance emergence clarity with dissolution drama
export function getClaudesChoice(): Partial<ControlState> {
  return {
    speed: 0.8,
    coherence: 0.8,
    particleSize: 1.1,
    backgroundBrightness: 0.92
  };
}

export { controlConfigs, defaultControls };
export default config;
