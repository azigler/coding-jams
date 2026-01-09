import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

/**
 * Day 8: "City Breathes"
 *
 * A nocturnal cityscape where buildings are dark silhouettes
 * and the only light comes from thousands of windows,
 * each pulsing with its own rhythm of life.
 */

// Default control values
const defaultControls: ControlState = {
  buildingCount: 25,
  maxHeight: 0.85,
  windowDensity: 0.6,
  litRatio: 0.5,
  breathSpeed: 0.4,
  glowIntensity: 0.7,
  starDensity: 150,
  warmthBias: 0.7,
};

// Control configurations for UI
const controlConfigs: { [key: string]: ControlConfig } = {
  buildingCount: {
    label: 'Building Count',
    min: 10,
    max: 50,
    defaultValue: 25,
    step: 1,
  },
  maxHeight: {
    label: 'Max Height',
    min: 0.4,
    max: 0.95,
    defaultValue: 0.85,
    step: 0.05,
  },
  windowDensity: {
    label: 'Window Density',
    min: 0.3,
    max: 0.9,
    defaultValue: 0.6,
    step: 0.05,
  },
  litRatio: {
    label: 'Lights On Ratio',
    min: 0.2,
    max: 0.8,
    defaultValue: 0.5,
    step: 0.05,
  },
  breathSpeed: {
    label: 'Breath Speed',
    min: 0.1,
    max: 1.0,
    defaultValue: 0.4,
    step: 0.05,
  },
  glowIntensity: {
    label: 'Glow Intensity',
    min: 0.3,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
  starDensity: {
    label: 'Star Count',
    min: 50,
    max: 300,
    defaultValue: 150,
    step: 10,
  },
  warmthBias: {
    label: 'Warm/Cool Bias',
    min: 0.0,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
};

// Seeded random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Data structures
interface WindowLight {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  baseAlpha: number;
  isWarm: boolean;
  isLit: boolean;
}

interface Building {
  x: number;
  width: number;
  height: number;
  windows: WindowLight[];
  layer: number;
}

interface Star {
  x: number;
  y: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

// Generate city
function generateCity(
  width: number,
  height: number,
  controls: ControlState,
  rand: () => number
): { buildings: Building[]; stars: Star[] } {
  const buildings: Building[] = [];
  const buildingCount = Math.round(controls.buildingCount);
  const maxH = height * controls.maxHeight;
  const minH = height * 0.15;

  // Generate buildings in 3 layers for depth
  for (let layer = 0; layer < 3; layer++) {
    const layerBuildings = Math.round(buildingCount * (layer === 0 ? 0.3 : layer === 1 ? 0.4 : 0.3));
    const layerMaxH = maxH * (1 - layer * 0.2);
    const layerMinH = minH * (1 + layer * 0.3);

    for (let i = 0; i < layerBuildings; i++) {
      const bWidth = 30 + rand() * 80;
      const bHeight = layerMinH + rand() * (layerMaxH - layerMinH);
      const x = rand() * (width + 100) - 50;

      // Generate windows
      const windows: WindowLight[] = [];
      const windowW = 4 + rand() * 4;
      const windowH = 6 + rand() * 4;
      const padX = windowW * 1.5;
      const padY = windowH * 1.8;
      const marginX = 8;
      const marginTop = 15;

      const cols = Math.floor((bWidth - marginX * 2) / (windowW + padX));
      const rows = Math.floor((bHeight - marginTop - 20) / (windowH + padY));

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (rand() > controls.windowDensity) continue;

          const wx = marginX + col * (windowW + padX) + padX / 2;
          const wy = marginTop + row * (windowH + padY);

          windows.push({
            x: wx,
            y: wy,
            w: windowW,
            h: windowH,
            phase: rand() * Math.PI * 2,
            speed: 0.3 + rand() * 0.7,
            baseAlpha: 0.5 + rand() * 0.5,
            isWarm: rand() < controls.warmthBias,
            isLit: rand() < controls.litRatio,
          });
        }
      }

      buildings.push({ x, width: bWidth, height: bHeight, windows, layer });
    }
  }

  // Sort by layer (back to front) then by x for overlap
  buildings.sort((a, b) => a.layer - b.layer || a.x - b.x);

  // Generate stars
  const stars: Star[] = [];
  const starCount = Math.round(controls.starDensity);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height * 0.6,
      brightness: 0.3 + rand() * 0.7,
      twinklePhase: rand() * Math.PI * 2,
      twinkleSpeed: 0.5 + rand() * 2,
    });
  }

  return { buildings, stars };
}

const config: DayConfig = {
  day: 8,
  prompt: 'A City. Create a generative metropolis.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  recording: {
    enabled: true,
    duration: 20,
    filename: 'genuary-2026-day-08',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);
    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.noStroke();

    // Pre-render sky gradient to a buffer (expensive, do once)
    const skyBuffer = p.createGraphics(p.width, p.height);
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const r = p.lerp(5, 15, t);
      const g = p.lerp(5, 18, t);
      const b = p.lerp(15, 35, t);
      skyBuffer.stroke(r, g, b);
      skyBuffer.line(0, y, p.width, y);
    }
    (p as any)._skyBuffer = skyBuffer;

    // Initialize city immediately
    const controls = (p as any)._controls || { ...defaultControls };
    const rand = seededRandom(42);
    const city = generateCity(p.width, p.height, controls, rand);
    (p as any)._buildings = city.buildings;
    (p as any)._stars = city.stars;
    (p as any)._lastGenConfig = `${controls.buildingCount}-${controls.maxHeight}-${controls.windowDensity}-${controls.litRatio}-${controls.warmthBias}-${controls.starDensity}`;
    (p as any)._regenerateTimeout = null;
    
    // Start animation loop
    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const time = p.millis() / 1000;

    // Check if controls changed - regenerate asynchronously to avoid blocking
    const genConfigSig = `${controls.buildingCount}-${controls.maxHeight}-${controls.windowDensity}-${controls.litRatio}-${controls.warmthBias}-${controls.starDensity}`;

    if ((p as any)._lastGenConfig !== genConfigSig) {
      // Clear any pending regeneration
      if ((p as any)._regenerateTimeout) {
        clearTimeout((p as any)._regenerateTimeout);
      }
      
      // Schedule regeneration after a short delay (debounce)
      (p as any)._regenerateTimeout = setTimeout(() => {
        const rand = seededRandom(42);
        const city = generateCity(p.width, p.height, controls, rand);
        (p as any)._buildings = city.buildings;
        (p as any)._stars = city.stars;
        (p as any)._lastGenConfig = genConfigSig;
        (p as any)._regenerateTimeout = null;
        // Trigger a redraw after regeneration
        if (p.isLooping()) {
          p.redraw();
        }
      }, 150); // 150ms debounce
    }

    const buildings: Building[] = (p as any)._buildings || [];
    const stars: Star[] = (p as any)._stars || [];

    // === DRAW SKY (from cached buffer) ===
    const skyBuffer = (p as any)._skyBuffer;
    if (skyBuffer) {
      p.image(skyBuffer, 0, 0);
    } else {
      p.background(10, 10, 20);
    }

    // === DRAW STARS ===
    for (const star of stars) {
      const twinkle = (Math.sin(time * star.twinkleSpeed + star.twinklePhase) + 1) / 2;
      const alpha = star.brightness * (0.4 + twinkle * 0.6);
      p.fill(255, 255, 255, alpha);
      p.ellipse(star.x, star.y, 1.5, 1.5);

      // Subtle glow for brighter stars
      if (star.brightness > 0.7) {
        p.fill(255, 255, 255, alpha * 0.2);
        p.ellipse(star.x, star.y, 4, 4);
      }
    }

    // === DRAW MOON ===
    const moonX = p.width * 0.85;
    const moonY = p.height * 0.12;
    const moonR = 25;

    // Moon glow
    for (let r = moonR * 4; r > moonR; r -= 3) {
      const alpha = p.map(r, moonR, moonR * 4, 0.15, 0);
      p.fill(255, 250, 240, alpha);
      p.ellipse(moonX, moonY, r * 2, r * 2);
    }
    // Moon body
    p.fill(255, 252, 245);
    p.ellipse(moonX, moonY, moonR * 2, moonR * 2);

    // === DRAW BUILDINGS ===
    const glowIntensity = controls.glowIntensity;
    const breathSpeed = controls.breathSpeed;

    for (const building of buildings) {
      const bx = building.x;
      const by = p.height - building.height;

      // Building darkness based on layer (further = slightly lighter for atmosphere)
      const layerBrightness = 8 + building.layer * 4;
      p.fill(layerBrightness, layerBrightness, layerBrightness + 5);
      p.rect(bx, by, building.width, building.height);

      // Draw windows
      for (const win of building.windows) {
        const wx = bx + win.x;
        const wy = by + win.y;

        // Breathing effect
        const breath = Math.sin(time * breathSpeed * win.speed + win.phase);
        const breathAlpha = 0.7 + breath * 0.3;

        // Occasionally toggle lights
        const toggleWave = Math.sin(time * 0.05 * win.speed + win.phase * 3);
        const shouldBeLit = win.isLit ? toggleWave > -0.9 : toggleWave > 0.95;

        if (shouldBeLit) {
          const alpha = win.baseAlpha * breathAlpha * glowIntensity;

          // Window glow (larger, softer)
          if (glowIntensity > 0.3) {
            const glowSize = 3 + glowIntensity * 4;
            if (win.isWarm) {
              p.fill(255, 200, 100, alpha * 0.15);
            } else {
              p.fill(150, 200, 255, alpha * 0.15);
            }
            p.rect(wx - glowSize, wy - glowSize, win.w + glowSize * 2, win.h + glowSize * 2);

            // Inner glow
            if (win.isWarm) {
              p.fill(255, 220, 150, alpha * 0.25);
            } else {
              p.fill(180, 220, 255, alpha * 0.25);
            }
            p.rect(wx - 1.5, wy - 1.5, win.w + 3, win.h + 3);
          }

          // Window itself
          if (win.isWarm) {
            p.fill(255, 230, 170, alpha);
          } else {
            p.fill(200, 230, 255, alpha);
          }
          p.rect(wx, wy, win.w, win.h);
        } else {
          // Dark window - barely visible
          p.fill(15, 15, 20, 0.5);
          p.rect(wx, wy, win.w, win.h);
        }
      }
    }

    // === GROUND ===
    p.fill(5, 5, 8);
    p.rect(0, p.height - 15, p.width, 15);
  },

  renderFinal: (p: p5) => {
    // Trigger a draw at a nice moment
    (p as any)._controls = (p as any)._controls || { ...defaultControls };
    config.draw!(p);
  },
};

// Claude's Choice - moody, atmospheric settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    buildingCount: 30,
    maxHeight: 0.88,
    windowDensity: 0.55,
    litRatio: 0.45,
    breathSpeed: 0.3,
    glowIntensity: 0.8,
    starDensity: 180,
    warmthBias: 0.65,
  };
}

export { controlConfigs, defaultControls };
export default config;
