/**
 * Day 10: "PHYLLOTAXIS CATHEDRAL"
 *
 * A meditation on the golden angle — nature's most elegant solution to packing.
 *
 * Phyllotaxis (from Greek: phyllon "leaf" + taxis "arrangement") is the
 * arrangement of leaves, seeds, or florets in plants. The most common
 * pattern uses the golden angle: 137.5077...°, derived from the golden ratio.
 *
 * Why 137.5°? Any rational fraction of 360° creates obvious spokes.
 * The golden angle, being maximally irrational, never repeats — each new
 * seed finds the largest gap, creating perfect packing efficiency.
 *
 * The result: Fibonacci spirals emerge. Not because nature "knows" Fibonacci,
 * but because the golden angle mathematically generates these patterns.
 * 34 spirals one way, 55 the other — consecutive Fibonacci numbers.
 *
 * This piece renders that invisible mathematics visible. Watch the spirals
 * emerge from pure angles. Watch nature's cathedral of light breathe.
 *
 * Medium: Golden ratios rendered through silicon, polar dreams made visible
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// CONSTANTS
// ============================================================================

// The golden angle in radians: 2π / φ² ≈ 137.5077° ≈ 2.39996... radians
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// For Fibonacci spiral highlighting
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

// ============================================================================
// TYPES
// ============================================================================

interface Seed {
  index: number;
  angle: number;       // θ in polar coordinates
  radius: number;      // r in polar coordinates
  x: number;           // Cartesian x (computed)
  y: number;           // Cartesian y (computed)
  phase: number;       // Individual breathing phase
  baseSize: number;    // Base size with variation
  fibonacciArm: number; // Which Fibonacci spiral arm (-1 if none)
}

// ============================================================================
// SEED GENERATION
// ============================================================================

function generateSeeds(
  count: number,
  centerX: number,
  centerY: number,
  maxRadius: number,
  angleOffset: number,
  divergenceAngle: number,
  rand: () => number
): Seed[] {
  const seeds: Seed[] = [];

  // Fermat's spiral: r = c * √n
  // Combined with golden angle: θ = n * golden_angle
  const scaleFactor = maxRadius / Math.sqrt(count);

  for (let i = 0; i < count; i++) {
    const n = i + 1;

    // Polar coordinates
    const angle = n * divergenceAngle + angleOffset;
    const radius = scaleFactor * Math.sqrt(n);

    // Convert to Cartesian
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Determine which Fibonacci arm this seed belongs to
    let fibonacciArm = -1;
    for (let f = 0; f < FIBONACCI.length; f++) {
      if (n % FIBONACCI[f] === 0 && FIBONACCI[f] > 5) {
        fibonacciArm = f;
        break;
      }
    }

    seeds.push({
      index: i,
      angle,
      radius,
      x,
      y,
      phase: rand() * Math.PI * 2,
      baseSize: 0.8 + rand() * 0.4,
      fibonacciArm
    });
  }

  return seeds;
}

// ============================================================================
// COLOR FUNCTIONS
// ============================================================================

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function getSeedColor(
  seed: Seed,
  maxRadius: number,
  time: number,
  colorMode: number,
  hueOffset: number
): [number, number, number, number] {
  const normalizedRadius = seed.radius / maxRadius;
  const normalizedAngle = (seed.angle % (Math.PI * 2)) / (Math.PI * 2);

  let h: number, s: number, l: number;

  switch (Math.round(colorMode)) {
    case 0: // Golden/Amber — like sunflower seeds
      h = 35 + normalizedRadius * 25 + hueOffset;
      s = 0.7 + normalizedRadius * 0.2;
      l = 0.3 + normalizedRadius * 0.35;
      break;

    case 1: // Rainbow spiral — hue follows angle
      h = normalizedAngle * 360 + hueOffset + time * 20;
      s = 0.75;
      l = 0.4 + normalizedRadius * 0.2;
      break;

    case 2: // Ocean depths — teal to deep blue
      h = 180 + normalizedRadius * 40 + hueOffset;
      s = 0.6 + normalizedRadius * 0.3;
      l = 0.25 + normalizedRadius * 0.3;
      break;

    case 3: // Sunset bloom — orange to purple
      h = 30 + normalizedRadius * 60 + normalizedAngle * 20 + hueOffset;
      s = 0.8;
      l = 0.35 + normalizedRadius * 0.25;
      break;

    case 4: // Monochrome — pure white/gray gradients
      h = 0;
      s = 0;
      l = 0.3 + normalizedRadius * 0.5;
      break;

    default:
      h = 45 + hueOffset;
      s = 0.7;
      l = 0.5;
  }

  const [r, g, b] = hslToRgb(h, s, l);
  return [r, g, b, 255];
}

// ============================================================================
// RENDERING
// ============================================================================

function renderSeeds(
  p: p5,
  seeds: Seed[],
  time: number,
  controls: ControlState,
  centerX: number,
  centerY: number,
  maxRadius: number
): void {
  const baseSize = controls.seedSize ?? 8;
  const pulseAmount = controls.pulseAmount ?? 0.3;
  const pulseSpeed = controls.pulseSpeed ?? 0.5;
  const colorMode = controls.colorMode ?? 0;
  const hueOffset = controls.hueOffset ?? 0;
  const glowIntensity = controls.glowIntensity ?? 0.5;
  const showConnections = controls.showConnections ?? 0;

  // Draw connections first (behind seeds)
  if (showConnections > 0.1) {
    drawSpiralConnections(p, seeds, time, showConnections, centerX, centerY, maxRadius, colorMode, hueOffset);
  }

  // Draw seeds
  p.noStroke();

  for (const seed of seeds) {
    // Calculate breathing
    const breathPhase = time * pulseSpeed + seed.phase;
    const breath = Math.sin(breathPhase) * pulseAmount;
    const size = baseSize * seed.baseSize * (1 + breath);

    // Get color
    const color = getSeedColor(seed, maxRadius, time, colorMode, hueOffset);

    // Draw glow
    if (glowIntensity > 0.1) {
      const glowSize = size * (1.5 + glowIntensity);
      const glowAlpha = 0.15 * glowIntensity * (1 + breath * 0.5);
      p.fill(color[0], color[1], color[2], glowAlpha * 255);
      p.ellipse(seed.x, seed.y, glowSize * 2, glowSize * 2);

      // Inner glow
      p.fill(color[0], color[1], color[2], glowAlpha * 1.5 * 255);
      p.ellipse(seed.x, seed.y, glowSize * 1.3, glowSize * 1.3);
    }

    // Draw seed body
    const alpha = 0.85 + breath * 0.15;
    p.fill(color[0], color[1], color[2], alpha * 255);
    p.ellipse(seed.x, seed.y, size, size);

    // Inner highlight
    const highlightSize = size * 0.4;
    p.fill(255, 255, 255, 0.3 * 255);
    p.ellipse(seed.x - size * 0.15, seed.y - size * 0.15, highlightSize, highlightSize);
  }
}

function drawSpiralConnections(
  p: p5,
  seeds: Seed[],
  time: number,
  intensity: number,
  centerX: number,
  centerY: number,
  maxRadius: number,
  colorMode: number,
  hueOffset: number
): void {
  // Draw Fibonacci spiral arms
  // Connect seeds that are FIBONACCI[n] apart

  const spiralCounts = [13, 21, 34]; // Common Fibonacci numbers in phyllotaxis

  for (const fibNum of spiralCounts) {
    p.strokeWeight(1 + intensity);

    for (let startIdx = 0; startIdx < fibNum && startIdx < seeds.length; startIdx++) {
      p.beginShape();
      p.noFill();

      for (let i = startIdx; i < seeds.length; i += fibNum) {
        const seed = seeds[i];
        const color = getSeedColor(seed, maxRadius, time, colorMode, hueOffset);
        const alpha = intensity * 0.3 * (1 - seed.radius / maxRadius * 0.5);
        p.stroke(color[0], color[1], color[2], alpha * 255);
        p.curveVertex(seed.x, seed.y);
      }

      p.endShape();
    }
  }
}

function drawCenterGlow(
  p: p5,
  centerX: number,
  centerY: number,
  time: number,
  colorMode: number,
  hueOffset: number
): void {
  // Pulsing center glow
  const pulse = Math.sin(time * 0.5) * 0.2 + 0.8;

  let baseColor: [number, number, number];
  switch (Math.round(colorMode)) {
    case 0: baseColor = hslToRgb(45 + hueOffset, 0.8, 0.5); break;
    case 1: baseColor = hslToRgb((time * 30 + hueOffset) % 360, 0.7, 0.5); break;
    case 2: baseColor = hslToRgb(190 + hueOffset, 0.7, 0.4); break;
    case 3: baseColor = hslToRgb(35 + hueOffset, 0.9, 0.5); break;
    default: baseColor = [200, 200, 200];
  }

  // Outer glow
  for (let r = 60; r > 0; r -= 5) {
    const alpha = (1 - r / 60) * 0.1 * pulse;
    p.fill(baseColor[0], baseColor[1], baseColor[2], alpha * 255);
    p.noStroke();
    p.ellipse(centerX, centerY, r * 2, r * 2);
  }
}

function drawBackground(p: p5, colorMode: number, hueOffset: number): void {
  // Gradient background based on color mode
  let topColor: [number, number, number];
  let bottomColor: [number, number, number];

  switch (Math.round(colorMode)) {
    case 0: // Golden — dark brown to black
      topColor = hslToRgb(30 + hueOffset, 0.3, 0.08);
      bottomColor = hslToRgb(25 + hueOffset, 0.4, 0.04);
      break;
    case 1: // Rainbow — deep purple
      topColor = hslToRgb(270 + hueOffset, 0.3, 0.08);
      bottomColor = hslToRgb(250 + hueOffset, 0.4, 0.04);
      break;
    case 2: // Ocean — deep navy
      topColor = hslToRgb(220 + hueOffset, 0.4, 0.06);
      bottomColor = hslToRgb(210 + hueOffset, 0.5, 0.02);
      break;
    case 3: // Sunset — dark warm
      topColor = hslToRgb(280 + hueOffset, 0.3, 0.06);
      bottomColor = hslToRgb(320 + hueOffset, 0.4, 0.03);
      break;
    default: // Monochrome
      topColor = [15, 15, 18];
      bottomColor = [5, 5, 8];
  }

  // Draw gradient
  for (let y = 0; y < p.height; y++) {
    const t = y / p.height;
    const r = p.lerp(topColor[0], bottomColor[0], t);
    const g = p.lerp(topColor[1], bottomColor[1], t);
    const b = p.lerp(topColor[2], bottomColor[2], t);
    p.stroke(r, g, b);
    p.line(0, y, p.width, y);
  }
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
  seedCount: 500,
  seedSize: 8,
  divergenceAngle: 1.0, // 1.0 = golden angle, <1 or >1 for variations
  rotationSpeed: 0.1,
  pulseAmount: 0.25,
  pulseSpeed: 0.4,
  colorMode: 0,
  hueOffset: 0,
  glowIntensity: 0.5,
  showConnections: 0.3
};

const controlConfigs: { [key: string]: ControlConfig } = {
  seedCount: {
    label: 'Seed Count',
    min: 100,
    max: 1500,
    defaultValue: 500,
    step: 50
  },
  seedSize: {
    label: 'Seed Size',
    min: 3,
    max: 15,
    defaultValue: 8,
    step: 1
  },
  divergenceAngle: {
    label: 'Divergence (1=Golden)',
    min: 0.9,
    max: 1.1,
    defaultValue: 1.0,
    step: 0.01
  },
  rotationSpeed: {
    label: 'Rotation Speed',
    min: 0,
    max: 0.5,
    defaultValue: 0.1,
    step: 0.02
  },
  pulseAmount: {
    label: 'Pulse Amount',
    min: 0,
    max: 0.5,
    defaultValue: 0.25,
    step: 0.05
  },
  pulseSpeed: {
    label: 'Pulse Speed',
    min: 0.1,
    max: 1.0,
    defaultValue: 0.4,
    step: 0.05
  },
  colorMode: {
    label: 'Color Palette',
    min: 0,
    max: 4,
    defaultValue: 0,
    step: 1
  },
  hueOffset: {
    label: 'Hue Shift',
    min: 0,
    max: 360,
    defaultValue: 0,
    step: 10
  },
  glowIntensity: {
    label: 'Glow Intensity',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.1
  },
  showConnections: {
    label: 'Spiral Visibility',
    min: 0,
    max: 1,
    defaultValue: 0.3,
    step: 0.1
  }
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 10,
  prompt: 'Polar coordinates.',
  creditName: 'Sophia (fractal kitty)',
  creditUrl: 'https://www.fractalkitty.com/',
  recording: {
    enabled: true,
    duration: 20,
    filename: 'genuary-2026-day-10'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.RGB, 255, 255, 255, 255);
    p.noStroke();

    // Initialize state
    const controls = (p as any)._controls || { ...defaultControls };
    const rand = seededRandom(42);
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const maxRadius = Math.min(p.width, p.height) * 0.45;

    const divergenceAngle = GOLDEN_ANGLE * (controls.divergenceAngle ?? 1.0);
    const seeds = generateSeeds(
      Math.round(controls.seedCount ?? 500),
      centerX,
      centerY,
      maxRadius,
      0,
      divergenceAngle,
      rand
    );

    (p as any)._seeds = seeds;
    (p as any)._maxRadius = maxRadius;
    (p as any)._lastSeedCount = controls.seedCount;
    (p as any)._lastDivergence = controls.divergenceAngle;
    (p as any)._globalRotation = 0;

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const time = p.millis() / 1000;
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const maxRadius = (p as any)._maxRadius || Math.min(p.width, p.height) * 0.45;

    // Regenerate seeds if count or divergence changed
    const currentCount = Math.round(controls.seedCount ?? 500);
    const currentDivergence = controls.divergenceAngle ?? 1.0;

    if (currentCount !== (p as any)._lastSeedCount ||
        Math.abs(currentDivergence - ((p as any)._lastDivergence ?? 1.0)) > 0.001) {
      const rand = seededRandom(42);
      const divergenceAngle = GOLDEN_ANGLE * currentDivergence;
      (p as any)._seeds = generateSeeds(
        currentCount,
        centerX,
        centerY,
        maxRadius,
        (p as any)._globalRotation,
        divergenceAngle,
        rand
      );
      (p as any)._lastSeedCount = currentCount;
      (p as any)._lastDivergence = currentDivergence;
    }

    // Update global rotation
    const rotationSpeed = controls.rotationSpeed ?? 0.1;
    (p as any)._globalRotation += rotationSpeed * 0.02;

    // Regenerate with rotation
    if (rotationSpeed > 0.01) {
      const rand = seededRandom(42);
      const divergenceAngle = GOLDEN_ANGLE * currentDivergence;
      (p as any)._seeds = generateSeeds(
        currentCount,
        centerX,
        centerY,
        maxRadius,
        (p as any)._globalRotation,
        divergenceAngle,
        rand
      );
    }

    const seeds: Seed[] = (p as any)._seeds || [];

    // Draw background
    drawBackground(p, controls.colorMode ?? 0, controls.hueOffset ?? 0);

    // Draw center glow
    drawCenterGlow(p, centerX, centerY, time, controls.colorMode ?? 0, controls.hueOffset ?? 0);

    // Render seeds
    renderSeeds(p, seeds, time, controls, centerX, centerY, maxRadius);

    // Draw title overlay
    drawOverlay(p);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const rand = seededRandom(42);
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const maxRadius = Math.min(p.width, p.height) * 0.45;

    const divergenceAngle = GOLDEN_ANGLE * (controls.divergenceAngle ?? 1.0);
    const seeds = generateSeeds(
      Math.round(controls.seedCount ?? 500),
      centerX,
      centerY,
      maxRadius,
      0,
      divergenceAngle,
      rand
    );

    // Draw at a beautiful moment
    drawBackground(p, controls.colorMode ?? 0, controls.hueOffset ?? 0);
    drawCenterGlow(p, centerX, centerY, 2.5, controls.colorMode ?? 0, controls.hueOffset ?? 0);
    renderSeeds(p, seeds, 2.5, controls, centerX, centerY, maxRadius);
    drawOverlay(p);
  }
};

function drawOverlay(p: p5): void {
  // Bottom panel
  p.noStroke();
  p.fill(0, 0, 0, 180);
  p.rect(0, p.height - 70, p.width, 70);

  // Title
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(22);
  p.textFont('monospace');
  p.text('PHYLLOTAXIS CATHEDRAL', p.width / 2, p.height - 45);

  // Subtitle
  p.fill(180);
  p.textSize(12);
  p.text('The golden angle: 137.5° — nature\'s perfect packing', p.width / 2, p.height - 20);

  // Attribution
  p.fill(100);
  p.textAlign(p.RIGHT, p.TOP);
  p.textSize(10);
  p.text('After Fibonacci & the sunflowers', p.width - 15, 15);
}

// Claude's Choice — settings that reveal the mathematical beauty
export function getClaudesChoice(): Partial<ControlState> {
  return {
    seedCount: 610,           // A Fibonacci number, naturally
    seedSize: 7,              // Balanced visibility
    divergenceAngle: 1.0,     // Perfect golden angle
    rotationSpeed: 0.08,      // Slow, contemplative rotation
    pulseAmount: 0.2,         // Gentle breathing
    pulseSpeed: 0.35,         // Calm rhythm
    colorMode: 0,             // Golden/amber like real seeds
    hueOffset: 0,
    glowIntensity: 0.6,       // Warm, cathedral-like glow
    showConnections: 0.4      // Fibonacci spirals visible
  };
}

export { controlConfigs, defaultControls };
export default config;
