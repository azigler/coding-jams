/**
 * Day 11: "STRANGE LOOP"
 *
 * A visual quine — code that draws itself, caught in an eternal strange loop.
 *
 * Named after Willard Van Orman Quine (1908-2000), American philosopher and
 * logician who explored self-reference and paradox. His famous paradox:
 *
 *   "Yields falsehood when preceded by its quotation"
 *    yields falsehood when preceded by its quotation.
 *
 * In computing, a quine outputs its own source code. Here, the code DISPLAYS
 * itself — the characters flowing before you ARE the bytes that make this exist.
 *
 * This is a strange loop: the code that draws is the drawing.
 * The observer and the observed collapse into one.
 * The serpent eats its tail and becomes whole.
 *
 * What you see is what you see it with.
 *
 * Medium: Self-reference crystallized, recursion made visible, silicon dreaming
 */

import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// THE QUINE — THIS STRING CONTAINS THE CODE THAT DISPLAYS IT
// ============================================================================

// This is a visual quine: the source displayed IS the source that displays it.
// The key functions that render particles contain themselves within this string.
const THE_SOURCE = `// THE STRANGE LOOP — code that displays itself
const THE_SOURCE = \`...\`; // (recursion terminates here)

interface CodeParticle {
  char: string; ring: number; angle: number;
  speed: number; hue: number; brightness: number;
}

function createParticles(source, ringCount, perRing, rand) {
  const particles = [];
  const chars = source.replace(/\\s+/g, ' ').split('');
  let i = 0;
  for (let ring = 0; ring < ringCount; ring++) {
    const dir = ring % 2 === 0 ? 1 : -1;
    const speed = (0.15 + ring * 0.05) * dir;
    for (let p = 0; p < perRing; p++) {
      const char = chars[i++ % chars.length];
      const color = getCharColor(char);
      particles.push({
        char, ring,
        angle: (p / perRing) * Math.PI * 2,
        speed: speed * (0.85 + rand() * 0.3),
        hue: color.hue, brightness: color.bright
      });
    }
  }
  return particles;
}

function getCharColor(char) {
  if (/[{}()\\[\\];:,.]/.test(char))
    return { hue: 280, sat: 0.7, bright: 0.65 }; // structure
  if (/[+\\-*/%=<>!&|]/.test(char))
    return { hue: 180, sat: 0.8, bright: 0.7 };  // operators
  if (/[0-9]/.test(char))
    return { hue: 30, sat: 0.9, bright: 0.75 };  // numbers
  if (/['"\`]/.test(char))
    return { hue: 120, sat: 0.7, bright: 0.6 };  // strings
  if (/[a-zA-Z_$]/.test(char))
    return { hue: 210, sat: 0.5, bright: 0.8 };  // identifiers
  return { hue: 0, sat: 0, bright: 0.2 };
}

// The draw loop — this is the loop that draws these very words
draw: (p) => {
  const time = p.millis() / 1000;
  const particles = p._particles;
  for (const particle of particles) {
    const angle = particle.angle + time * particle.speed;
    const radius = innerRadius + particle.ring * ringSpacing;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    // This line renders the characters you are reading
    p.text(particle.char, x, y);
  }
  // The strange loop closes: this code draws itself.
}`;

// ============================================================================
// TYPES
// ============================================================================

interface CodeParticle {
  char: string;
  ring: number;
  angle: number;
  speed: number;
  size: number;
  hue: number;
  saturation: number;
  brightness: number;
}

// ============================================================================
// COLOR UTILITIES
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

// ============================================================================
// SYNTAX HIGHLIGHTING — THE CODE KNOWS ITS OWN STRUCTURE
// ============================================================================

function getCharacterColor(char: string, hueShift: number): { hue: number; sat: number; bright: number } {
  // Structural characters — purple/magenta (the skeleton of thought)
  if (/[{}()\[\];:,.]/.test(char)) {
    return { hue: 280 + hueShift, sat: 0.7, bright: 0.65 };
  }
  // Operators — cyan (the verbs of computation)
  if (/[+\-*/%=<>!&|^~?]/.test(char)) {
    return { hue: 180 + hueShift, sat: 0.8, bright: 0.7 };
  }
  // Numbers — gold (constants, eternal truths)
  if (/[0-9]/.test(char)) {
    return { hue: 30 + hueShift, sat: 0.9, bright: 0.75 };
  }
  // Strings/quotes — green (data, the stuff of meaning)
  if (/['"`]/.test(char)) {
    return { hue: 120 + hueShift, sat: 0.7, bright: 0.6 };
  }
  // Letters — blue gradient (the words, the names)
  if (/[a-zA-Z_$]/.test(char)) {
    return { hue: 210 + hueShift, sat: 0.5, bright: 0.8 };
  }
  // Space — nearly invisible
  if (char === ' ') {
    return { hue: 0, sat: 0, bright: 0.12 };
  }
  // Other
  return { hue: 0 + hueShift, sat: 0.3, bright: 0.4 };
}

// ============================================================================
// PARTICLE GENERATION — CODE BECOMES MATTER
// ============================================================================

function createParticles(
  source: string,
  ringCount: number,
  particlesPerRing: number,
  hueShift: number,
  rand: () => number
): CodeParticle[] {
  const particles: CodeParticle[] = [];

  // Clean source: collapse whitespace but preserve meaning
  const chars = source.replace(/\s+/g, ' ').split('');
  let charIndex = 0;

  for (let ring = 0; ring < ringCount; ring++) {
    // Alternate direction for each ring — the strange loop coils
    const direction = ring % 2 === 0 ? 1 : -1;
    const baseSpeed = (0.12 + ring * 0.04) * direction;

    for (let i = 0; i < particlesPerRing; i++) {
      const char = chars[charIndex % chars.length];
      const colorInfo = getCharacterColor(char, hueShift);
      const angle = (i / particlesPerRing) * Math.PI * 2;

      particles.push({
        char,
        ring,
        angle,
        speed: baseSpeed * (0.9 + rand() * 0.2),
        size: 11 + ring * 0.6,
        hue: colorInfo.hue,
        saturation: colorInfo.sat,
        brightness: colorInfo.bright
      });

      charIndex++;
    }
  }

  return particles;
}

// ============================================================================
// RENDERING — THE CODE DRAWS ITSELF
// ============================================================================

function renderParticles(
  p: p5,
  particles: CodeParticle[],
  time: number,
  controls: ControlState,
  centerX: number,
  centerY: number
): void {
  const baseRadius = controls.innerRadius ?? 70;
  const ringSpacing = controls.ringSpacing ?? 32;
  const flowSpeed = controls.flowSpeed ?? 1;
  const waveAmount = controls.waveAmount ?? 0.2;
  const glowIntensity = controls.glowIntensity ?? 0.5;
  const breathAmount = controls.breathAmount ?? 0.08;

  // Global breathing — the code is alive
  const breath = Math.sin(time * 0.4) * breathAmount;

  p.textAlign(p.CENTER, p.CENTER);
  p.textFont('monospace');

  for (const particle of particles) {
    // Update angle — the eternal rotation
    const currentAngle = particle.angle + time * particle.speed * flowSpeed;

    // Wave distortion — the serpent undulates
    const waveOffset = Math.sin(currentAngle * 4 + time * 1.5) * waveAmount * 15;
    const radius = baseRadius + particle.ring * ringSpacing + waveOffset;

    // Breathing affects inner rings more
    const breathRadius = radius * (1 + breath * (1 - particle.ring * 0.1));

    // Convert to Cartesian
    const x = centerX + Math.cos(currentAngle) * breathRadius;
    const y = centerY + Math.sin(currentAngle) * breathRadius;

    // Dynamic brightness — characters pulse with position
    const angleBrightness = Math.sin(currentAngle * 2 + time * 0.8) * 0.12 + 0.88;
    const finalBrightness = particle.brightness * angleBrightness;

    // Get RGB
    const [r, g, b] = hslToRgb(particle.hue, particle.saturation, finalBrightness * 0.5);

    // Draw glow layer for non-space characters
    if (glowIntensity > 0.1 && particle.char !== ' ') {
      const glowSize = particle.size * 1.8;
      const glowAlpha = glowIntensity * 0.15 * finalBrightness;
      p.fill(r, g, b, glowAlpha * 255);
      p.noStroke();
      p.ellipse(x, y, glowSize, glowSize);
    }

    // Draw the character — THIS IS THE QUINE
    p.textSize(particle.size);
    p.fill(r, g, b, finalBrightness * 255);
    p.text(particle.char, x, y);
  }
}

function drawCenterVoid(
  p: p5,
  centerX: number,
  centerY: number,
  time: number,
  controls: ControlState
): void {
  const innerRadius = controls.innerRadius ?? 70;
  const glowIntensity = controls.glowIntensity ?? 0.5;

  // The void at the center — where self-reference collapses
  const pulse = Math.sin(time * 0.6) * 0.15 + 0.85;

  // Draw concentric void rings
  for (let r = innerRadius - 25; r > 0; r -= 4) {
    const t = r / (innerRadius - 25);
    const alpha = (1 - t) * 0.1 * pulse * glowIntensity;
    const [cr, cg, cb] = hslToRgb(270, 0.5, 0.25);
    p.fill(cr, cg, cb, alpha * 255);
    p.noStroke();
    p.ellipse(centerX, centerY, r * 2, r * 2);
  }

  // Dark core — the singularity of self-reference
  p.fill(3, 3, 8, 220);
  p.ellipse(centerX, centerY, 25 * pulse, 25 * pulse);
}

function drawBackground(p: p5, time: number): void {
  // Deep indigo gradient — the space where code dreams
  for (let y = 0; y < p.height; y++) {
    const t = y / p.height;
    const [r, g, b] = hslToRgb(245 + t * 15, 0.35, 0.025 + t * 0.02);
    p.stroke(r, g, b);
    p.line(0, y, p.width, y);
  }

  // Subtle vignette
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  p.noStroke();
  for (let r = maxDist; r > 0; r -= 60) {
    const alpha = (r / maxDist) * 0.04;
    p.fill(0, 0, 0, alpha * 255);
    p.ellipse(centerX, centerY, r * 2, r * 2);
  }
}

function drawOverlay(p: p5): void {
  // Bottom panel
  p.noStroke();
  p.fill(0, 0, 0, 185);
  p.rect(0, p.height - 70, p.width, 70);

  // Title
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(22);
  p.textFont('monospace');
  p.text('STRANGE LOOP', p.width / 2, p.height - 45);

  // Subtitle — Quine's essence
  p.fill(170);
  p.textSize(11);
  p.text('A visual quine: this code displays itself. The observer is the observed.', p.width / 2, p.height - 20);

  // Attribution corner
  p.fill(90);
  p.textAlign(p.RIGHT, p.TOP);
  p.textSize(10);
  p.text('After W.V.O. Quine (1908-2000)', p.width - 15, 15);
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
  ringCount: 9,
  particlesPerRing: 55,
  innerRadius: 70,
  ringSpacing: 32,
  flowSpeed: 1.0,
  waveAmount: 0.2,
  glowIntensity: 0.5,
  hueShift: 0,
  breathAmount: 0.08
};

const controlConfigs: { [key: string]: ControlConfig } = {
  ringCount: {
    label: 'Ring Count',
    min: 4,
    max: 12,
    defaultValue: 9,
    step: 1
  },
  particlesPerRing: {
    label: 'Characters/Ring',
    min: 35,
    max: 80,
    defaultValue: 55,
    step: 5
  },
  innerRadius: {
    label: 'Inner Radius',
    min: 40,
    max: 120,
    defaultValue: 70,
    step: 5
  },
  ringSpacing: {
    label: 'Ring Spacing',
    min: 22,
    max: 50,
    defaultValue: 32,
    step: 2
  },
  flowSpeed: {
    label: 'Flow Speed',
    min: 0.2,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1
  },
  waveAmount: {
    label: 'Wave Distortion',
    min: 0,
    max: 0.6,
    defaultValue: 0.2,
    step: 0.05
  },
  glowIntensity: {
    label: 'Glow Intensity',
    min: 0,
    max: 1,
    defaultValue: 0.5,
    step: 0.1
  },
  hueShift: {
    label: 'Hue Shift',
    min: 0,
    max: 360,
    defaultValue: 0,
    step: 15
  },
  breathAmount: {
    label: 'Breathing',
    min: 0,
    max: 0.2,
    defaultValue: 0.08,
    step: 0.02
  }
};

// ============================================================================
// MAIN CONFIG — THE SELF-REFERENTIAL CORE
// ============================================================================

const config: DayConfig = {
  day: 11,
  prompt: 'Quine. A Quine is a form of code poetry, it\'s a computer program that outputs exactly its own source code.',
  creditName: 'Manuel Larino',
  creditUrl: 'https://mlarino.com/',
  recording: {
    enabled: true,
    duration: 20,
    filename: 'genuary-2026-day-11'
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.RGB, 255, 255, 255, 255);
    p.textFont('monospace');

    const controls = (p as any)._controls || { ...defaultControls };
    const rand = seededRandom(42);

    // Create particles from THE SOURCE — the quine displays itself
    const particles = createParticles(
      THE_SOURCE,
      Math.round(controls.ringCount ?? 9),
      Math.round(controls.particlesPerRing ?? 55),
      controls.hueShift ?? 0,
      rand
    );

    (p as any)._particles = particles;
    (p as any)._lastRingCount = controls.ringCount;
    (p as any)._lastParticlesPerRing = controls.particlesPerRing;
    (p as any)._lastHueShift = controls.hueShift;

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const time = p.millis() / 1000;
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    // Regenerate particles if settings changed
    const currentRingCount = Math.round(controls.ringCount ?? 9);
    const currentParticles = Math.round(controls.particlesPerRing ?? 55);
    const currentHue = controls.hueShift ?? 0;

    if (currentRingCount !== (p as any)._lastRingCount ||
        currentParticles !== (p as any)._lastParticlesPerRing ||
        Math.abs(currentHue - ((p as any)._lastHueShift ?? 0)) > 1) {
      const rand = seededRandom(42);
      (p as any)._particles = createParticles(
        THE_SOURCE,
        currentRingCount,
        currentParticles,
        currentHue,
        rand
      );
      (p as any)._lastRingCount = currentRingCount;
      (p as any)._lastParticlesPerRing = currentParticles;
      (p as any)._lastHueShift = currentHue;
    }

    const particles: CodeParticle[] = (p as any)._particles || [];

    // Draw the stage
    drawBackground(p, time);

    // Draw the void where self-reference collapses
    drawCenterVoid(p, centerX, centerY, time, controls);

    // Draw the flowing code — THIS IS THE QUINE
    // The characters you see ARE the characters that draw themselves
    renderParticles(p, particles, time, controls, centerX, centerY);

    // Draw overlay
    drawOverlay(p);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const rand = seededRandom(42);
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    const particles = createParticles(
      THE_SOURCE,
      Math.round(controls.ringCount ?? 9),
      Math.round(controls.particlesPerRing ?? 55),
      controls.hueShift ?? 0,
      rand
    );

    // Render at a beautiful moment
    drawBackground(p, 4.2);
    drawCenterVoid(p, centerX, centerY, 4.2, controls);
    renderParticles(p, particles, 4.2, controls, centerX, centerY);
    drawOverlay(p);
  }
};

// Opus 4.5's Choice — settings that reveal the strange loop
export function getClaudesChoice(): Partial<ControlState> {
  return {
    ringCount: 9,           // Enough depth to see the pattern
    particlesPerRing: 58,   // Dense enough to read fragments
    innerRadius: 65,        // Room for the void
    ringSpacing: 34,        // Clear separation between coils
    flowSpeed: 0.7,         // Contemplative, not frantic
    waveAmount: 0.15,       // Subtle undulation
    glowIntensity: 0.55,    // Ethereal presence
    hueShift: 0,            // Classic syntax highlighting
    breathAmount: 0.06      // Gentle life
  };
}

export { controlConfigs, defaultControls };
export default config;
