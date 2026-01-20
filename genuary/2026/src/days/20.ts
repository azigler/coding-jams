/**
 * Day 20: TRACE
 *
 * "One line." — Jos Vromans
 *
 * A creature that can barely see. It senses something—warmth? the cursor?—
 * but imperfectly. It overshoots. Corrects. Hesitates. Persists.
 *
 * The line is what it left behind.
 *
 * This isn't flow fields or mathematical curves. It's behavior.
 * The line emerges from trying, not from formulas.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';
import { createCanvas } from '../utils/canvas';

// ============================================================================
// THE SEEKER
// ============================================================================

interface Seeker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  path: Array<{ x: number; y: number }>;
  age: number;
}

interface Attractor {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function createSeeker(x: number, y: number): Seeker {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    path: [{ x, y }],
    age: 0,
  };
}

function createWanderingAttractor(canvasSize: number): Attractor {
  return {
    x: canvasSize / 2 + (Math.random() - 0.5) * canvasSize * 0.5,
    y: canvasSize / 2 + (Math.random() - 0.5) * canvasSize * 0.5,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  };
}

function updateAttractor(
  attractor: Attractor,
  canvasSize: number,
  wanderSpeed: number
): void {
  // Add some randomness to velocity
  attractor.vx += (Math.random() - 0.5) * 0.3;
  attractor.vy += (Math.random() - 0.5) * 0.3;

  // Dampen
  const damping = 0.98;
  attractor.vx *= damping;
  attractor.vy *= damping;

  // Limit speed
  const speed = Math.sqrt(attractor.vx ** 2 + attractor.vy ** 2);
  const maxSpeed = wanderSpeed * 3;
  if (speed > maxSpeed) {
    attractor.vx = (attractor.vx / speed) * maxSpeed;
    attractor.vy = (attractor.vy / speed) * maxSpeed;
  }

  // Move
  attractor.x += attractor.vx;
  attractor.y += attractor.vy;

  // Soft boundary - steer back toward center
  const margin = canvasSize * 0.2;
  const center = canvasSize / 2;
  if (attractor.x < margin) attractor.vx += 0.1;
  if (attractor.x > canvasSize - margin) attractor.vx -= 0.1;
  if (attractor.y < margin) attractor.vy += 0.1;
  if (attractor.y > canvasSize - margin) attractor.vy -= 0.1;

  // Gentle pull toward center
  attractor.vx += (center - attractor.x) * 0.0005;
  attractor.vy += (center - attractor.y) * 0.0005;
}

function updateSeeker(
  seeker: Seeker,
  targetX: number,
  targetY: number,
  controls: ControlState,
  p: p5
): void {
  const sensingAccuracy = controls.sensing ?? 0.5;
  const responsiveness = controls.responsiveness ?? 0.3;
  const speed = controls.speed ?? 1;

  // The seeker "senses" the target, but with noise
  // Lower accuracy = more noise in perception
  const noiseAmount = (1 - sensingAccuracy) * 150;
  const perceivedX = targetX + (p.noise(seeker.age * 0.02, 0) - 0.5) * noiseAmount;
  const perceivedY = targetY + (p.noise(seeker.age * 0.02, 100) - 0.5) * noiseAmount;

  // Direction to perceived target
  const dx = perceivedX - seeker.x;
  const dy = perceivedY - seeker.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1) {
    // Normalize direction
    const dirX = dx / dist;
    const dirY = dy / dist;

    // Desired velocity (toward perceived target)
    const desiredSpeed = Math.min(dist * 0.05, 2) * speed;
    const desiredVx = dirX * desiredSpeed;
    const desiredVy = dirY * desiredSpeed;

    // Steering force (difference between desired and current)
    // Responsiveness affects how quickly we can change direction
    const steerX = (desiredVx - seeker.vx) * responsiveness * 0.1;
    const steerY = (desiredVy - seeker.vy) * responsiveness * 0.1;

    // Apply steering
    seeker.vx += steerX;
    seeker.vy += steerY;
  }

  // Add micro-tremor (the creature is alive, uncertain)
  seeker.vx += (p.noise(seeker.age * 0.1, 200) - 0.5) * 0.1;
  seeker.vy += (p.noise(seeker.age * 0.1, 300) - 0.5) * 0.1;

  // Damping (friction/air resistance)
  seeker.vx *= 0.95;
  seeker.vy *= 0.95;

  // Move
  seeker.x += seeker.vx;
  seeker.y += seeker.vy;

  // Soft boundary - steer back toward canvas when near edges
  const canvasSize = 800;
  const margin = 50;
  if (seeker.x < margin) seeker.vx += 0.2;
  if (seeker.x > canvasSize - margin) seeker.vx -= 0.2;
  if (seeker.y < margin) seeker.vy += 0.2;
  if (seeker.y > canvasSize - margin) seeker.vy -= 0.2;

  // Hard boundary - clamp to canvas
  seeker.x = Math.max(0, Math.min(canvasSize, seeker.x));
  seeker.y = Math.max(0, Math.min(canvasSize, seeker.y));

  // Add to path (only if moved enough)
  const lastPoint = seeker.path[seeker.path.length - 1];
  const movedDist = Math.sqrt(
    (seeker.x - lastPoint.x) ** 2 + (seeker.y - lastPoint.y) ** 2
  );
  if (movedDist > 1) {
    seeker.path.push({ x: seeker.x, y: seeker.y });
  }

  seeker.age++;
}

// ============================================================================
// DRAWING
// ============================================================================

function drawPath(
  p: p5,
  path: Array<{ x: number; y: number }>,
  lineWeight: number,
  lineColor: [number, number, number],
  fadeOld: boolean
): void {
  if (path.length < 2) return;

  p.noFill();
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);

  if (fadeOld) {
    // Draw with fading older segments
    for (let i = 1; i < path.length; i++) {
      const age = (path.length - i) / path.length;
      const alpha = Math.max(0.1, 1 - age * 0.7);
      p.stroke(lineColor[0], lineColor[1], lineColor[2], alpha * 255);
      p.strokeWeight(lineWeight * (0.5 + alpha * 0.5));
      p.line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
    }
  } else {
    // Draw as one continuous line
    p.stroke(lineColor[0], lineColor[1], lineColor[2]);
    p.strokeWeight(lineWeight);
    p.beginShape();
    for (const point of path) {
      p.vertex(point.x, point.y);
    }
    p.endShape();
  }
}

function drawAttractor(
  p: p5,
  attractor: Attractor,
  visible: boolean
): void {
  if (!visible) return;

  // Draw as a faint glow
  p.noStroke();
  for (let r = 30; r > 0; r -= 5) {
    const alpha = (1 - r / 30) * 30;
    p.fill(255, 200, 150, alpha);
    p.ellipse(attractor.x, attractor.y, r * 2, r * 2);
  }
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

interface Palette {
  background: [number, number, number];
  line: [number, number, number];
  name: string;
}

const PALETTES: Palette[] = [
  { background: [250, 248, 245], line: [40, 40, 50], name: 'Ink' },
  { background: [35, 35, 45], line: [240, 235, 220], name: 'Chalk' },
  { background: [245, 242, 235], line: [180, 80, 60], name: 'Rust' },
  { background: [30, 40, 50], line: [100, 180, 220], name: 'Ice' },
  { background: [248, 245, 240], line: [60, 120, 80], name: 'Moss' },
];

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  attractorType: 0,
  sensing: 0.4,
  responsiveness: 0.35,
  speed: 1.2,
  lineWeight: 1.5,
  palette: 0,
  showAttractor: 0,
  fadeTrail: 0,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  attractorType: {
    label: 'Follow',
    min: 0,
    max: 2,
    defaultValue: 0,
    step: 1,
    format: (v: number) => ['Wanderer', 'Cursor', 'Center'][Math.round(v)] || 'Wanderer',
  },
  sensing: {
    label: 'Sensing',
    min: 0.1,
    max: 0.9,
    defaultValue: 0.4,
    step: 0.05,
    format: (v: number) => v < 0.3 ? 'Blind' : v < 0.6 ? 'Blurry' : 'Clear',
  },
  responsiveness: {
    label: 'Response',
    min: 0.1,
    max: 0.8,
    defaultValue: 0.35,
    step: 0.05,
    format: (v: number) => v < 0.3 ? 'Sluggish' : v < 0.5 ? 'Cautious' : 'Quick',
  },
  speed: {
    label: 'Speed',
    min: 0.3,
    max: 2.5,
    defaultValue: 1.2,
    step: 0.1,
  },
  lineWeight: {
    label: 'Line Weight',
    min: 0.5,
    max: 4,
    defaultValue: 1.5,
    step: 0.25,
  },
  palette: {
    label: 'Palette',
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1,
    format: (v: number) => PALETTES[Math.round(v)]?.name || 'Ink',
  },
  showAttractor: {
    label: 'Show Target',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
    format: (v: number) => v > 0.5 ? 'Yes' : 'No',
  },
  fadeTrail: {
    label: 'Fade Trail',
    min: 0,
    max: 1,
    defaultValue: 0,
    step: 1,
    format: (v: number) => v > 0.5 ? 'Yes' : 'No',
  },
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const CANVAS_SIZE = 800;

const config: DayConfig = {
  day: 20,
  prompt: 'One line.',
  creditName: 'Jos Vromans',
  creditUrl: 'https://www.josvromans.art/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-20',
  },

  setup: (p: p5) => {
    createCanvas(p, CANVAS_SIZE, CANVAS_SIZE);

    // Seed noise for consistent behavior
    p.noiseSeed(42);

    // Initialize seeker at center
    const seeker = createSeeker(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    (p as any)._seeker = seeker;

    // Initialize wandering attractor
    const attractor = createWanderingAttractor(CANVAS_SIZE);
    (p as any)._attractor = attractor;

    // Track last palette for resets
    (p as any)._lastPalette = -1;

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    const paletteIndex = Math.round(controls.palette ?? 0);
    const palette = PALETTES[paletteIndex] || PALETTES[0];
    const attractorType = Math.round(controls.attractorType ?? 0);
    const showAttractor = (controls.showAttractor ?? 0) > 0.5;
    const fadeTrail = (controls.fadeTrail ?? 0) > 0.5;
    const lineWeight = controls.lineWeight ?? 1.5;

    let seeker: Seeker = (p as any)._seeker;
    let attractor: Attractor = (p as any)._attractor;

    // Reset if palette changed (fresh start for new look)
    if (paletteIndex !== (p as any)._lastPalette) {
      seeker = createSeeker(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      attractor = createWanderingAttractor(CANVAS_SIZE);
      (p as any)._seeker = seeker;
      (p as any)._attractor = attractor;
      (p as any)._lastPalette = paletteIndex;
    }

    // Determine target position
    let targetX: number;
    let targetY: number;

    switch (attractorType) {
      case 1: // Cursor
        targetX = p.mouseX || CANVAS_SIZE / 2;
        targetY = p.mouseY || CANVAS_SIZE / 2;
        break;
      case 2: // Center
        targetX = CANVAS_SIZE / 2;
        targetY = CANVAS_SIZE / 2;
        break;
      default: // Wanderer
        updateAttractor(attractor, CANVAS_SIZE, controls.speed ?? 1);
        targetX = attractor.x;
        targetY = attractor.y;
        break;
    }

    // Update seeker
    updateSeeker(seeker, targetX, targetY, controls, p);

    // Limit path length to prevent memory issues
    const maxPathLength = 8000;
    if (seeker.path.length > maxPathLength) {
      seeker.path = seeker.path.slice(-maxPathLength);
    }

    // Draw
    p.background(palette.background[0], palette.background[1], palette.background[2]);

    // Draw the path (the trace)
    drawPath(p, seeker.path, lineWeight, palette.line, fadeTrail);

    // Optionally show attractor
    if (attractorType === 0) {
      drawAttractor(p, attractor, showAttractor);
    }
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const paletteIndex = Math.round(controls.palette ?? 0);
    const palette = PALETTES[paletteIndex] || PALETTES[0];
    const lineWeight = controls.lineWeight ?? 1.5;

    p.background(palette.background[0], palette.background[1], palette.background[2]);

    // Generate a complete trace
    p.noiseSeed(42);
    const seeker = createSeeker(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    const attractor = createWanderingAttractor(CANVAS_SIZE);

    // Run simulation for a while
    for (let i = 0; i < 3000; i++) {
      updateAttractor(attractor, CANVAS_SIZE, controls.speed ?? 1);
      updateSeeker(seeker, attractor.x, attractor.y, controls, p);
    }

    // Draw the accumulated path
    drawPath(p, seeker.path, lineWeight, palette.line, false);
  },

  // Reset on click
  mousePressed: (p: p5) => {
    const seeker = createSeeker(p.mouseX, p.mouseY);
    const attractor = createWanderingAttractor(CANVAS_SIZE);
    (p as any)._seeker = seeker;
    (p as any)._attractor = attractor;
  },
};

export function getClaudesChoice(): Partial<ControlState> {
  return {
    attractorType: 0,
    sensing: 0.35,
    responsiveness: 0.3,
    speed: 1.0,
    lineWeight: 1.2,
    palette: 0,
    showAttractor: 0,
    fadeTrail: 0,
  };
}

export { controlConfigs, defaultControls };
export default config;
