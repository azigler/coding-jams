import type { DayConfig, p5 } from '../types';
import { createCanvas } from '../utils/canvas';
import type { ControlConfig, ControlState } from '../utils/controls';

/**
 * Day 8: "City Breathes"
 *
 * A contemplative nighttime cityscape where windows flicker like cells
 * in a living organism. The city isn't architecture — it's thousands
 * of lives behind glass, breathing together.
 */

// Color palette for the nocturnal metropolis
const PALETTE = {
  sky: ['#0a0a12', '#0d1020', '#111428', '#161b33'], // Deep night gradient
  stars: '#ffffff',
  moon: '#fffae6',
  moonGlow: '#fffae633',
  buildings: {
    far: ['#1a1a2e', '#1e1e35', '#22223d'],      // Distant, hazy
    mid: ['#252540', '#2a2a4a', '#2f2f55'],      // Middle layer
    near: ['#151525', '#1a1a30', '#1f1f3a'],     // Foreground, darker
  },
  windows: {
    warm: ['#ffdd88', '#ffcc66', '#ffbb44'],     // Warm interior light
    cool: ['#88ccff', '#66bbff', '#44aaff'],     // Cool TV/screen glow
    off: '#0a0a15',                               // Dark window
  },
  fog: '#1a1a2e',
};

// Default control values
const defaultControls: ControlState = {
  buildingDensity: 0.7,
  layerCount: 3,
  breathRate: 0.3,
  fogIntensity: 0.4,
  starCount: 80,
  warmLightRatio: 0.7,
  moonEnabled: 1,
  windowSize: 1.0,
};

// Control configurations for UI
const controlConfigs: { [key: string]: ControlConfig } = {
  buildingDensity: {
    label: 'Building Density',
    min: 0.3,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
  layerCount: {
    label: 'Depth Layers',
    min: 2,
    max: 5,
    defaultValue: 3,
    step: 1,
  },
  breathRate: {
    label: 'Breath Rate',
    min: 0.1,
    max: 1.0,
    defaultValue: 0.3,
    step: 0.05,
  },
  fogIntensity: {
    label: 'Atmospheric Fog',
    min: 0.0,
    max: 0.8,
    defaultValue: 0.4,
    step: 0.05,
  },
  starCount: {
    label: 'Star Count',
    min: 20,
    max: 200,
    defaultValue: 80,
    step: 10,
  },
  warmLightRatio: {
    label: 'Warm/Cool Lights',
    min: 0.0,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.05,
  },
  moonEnabled: {
    label: 'Moon (0=off, 1=on)',
    min: 0,
    max: 1,
    defaultValue: 1,
    step: 1,
  },
  windowSize: {
    label: 'Window Size',
    min: 0.5,
    max: 1.5,
    defaultValue: 1.0,
    step: 0.1,
  },
};

// Data structures
interface Star {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
  twinkleSpeed: number;
}

interface Window {
  x: number;
  y: number;
  width: number;
  height: number;
  isWarm: boolean;
  breathOffset: number;    // Phase offset for breathing
  breathSpeed: number;     // Individual breath speed
  baseIntensity: number;   // Base brightness (some windows dimmer)
  isOn: boolean;           // Currently lit or not
}

interface Building {
  x: number;
  width: number;
  height: number;
  windows: Window[];
  roofStyle: number;       // 0 = flat, 1 = pointed, 2 = stepped
  hasAntenna: boolean;
  antennaHeight: number;
}

interface Layer {
  buildings: Building[];
  depth: number;           // 0 = farthest, higher = closer
  baseY: number;           // Where buildings sit
  colorIndex: number;
}

// Seeded random for reproducible generation
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Generate a single building
function generateBuilding(
  x: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number,
  windowScale: number,
  warmRatio: number,
  rand: () => number
): Building {
  const width = 30 + rand() * maxWidth;
  const height = minHeight + rand() * (maxHeight - minHeight);

  const windows: Window[] = [];

  // Window grid parameters
  const windowW = (4 + rand() * 4) * windowScale;
  const windowH = (5 + rand() * 5) * windowScale;
  const windowPadX = 6 + rand() * 4;
  const windowPadY = 8 + rand() * 6;
  const marginX = 8 + rand() * 8;
  const marginTop = 12 + rand() * 8;
  const marginBottom = 15;

  // Calculate window grid
  const availableWidth = width - marginX * 2;
  const availableHeight = height - marginTop - marginBottom;
  const cols = Math.floor(availableWidth / (windowW + windowPadX));
  const rows = Math.floor(availableHeight / (windowH + windowPadY));

  // Generate windows
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Some windows are missing (architectural variety)
      if (rand() < 0.08) continue;

      const wx = marginX + col * (windowW + windowPadX) + windowPadX / 2;
      const wy = marginTop + row * (windowH + windowPadY);

      windows.push({
        x: wx,
        y: wy,
        width: windowW,
        height: windowH,
        isWarm: rand() < warmRatio,
        breathOffset: rand() * Math.PI * 2,
        breathSpeed: 0.5 + rand() * 1.5,
        baseIntensity: 0.4 + rand() * 0.6,
        isOn: rand() < 0.6, // ~60% of windows start lit
      });
    }
  }

  return {
    x,
    width,
    height,
    windows,
    roofStyle: Math.floor(rand() * 3),
    hasAntenna: rand() < 0.3,
    antennaHeight: 10 + rand() * 30,
  };
}

// Generate a layer of buildings
function generateLayer(
  depth: number,
  canvasWidth: number,
  canvasHeight: number,
  density: number,
  windowScale: number,
  warmRatio: number,
  rand: () => number
): Layer {
  const buildings: Building[] = [];

  // Layer properties based on depth
  const depthFactor = 1 - depth * 0.2; // Farther layers have smaller buildings
  const baseY = canvasHeight - 50 - depth * 80;
  const minHeight = (80 + depth * 40) * depthFactor;
  const maxHeight = (200 + depth * 100) * depthFactor;
  const maxWidth = (40 + depth * 20) * depthFactor;

  // Generate buildings across the width
  let x = -50 + rand() * 30;
  while (x < canvasWidth + 50) {
    // Density affects gap between buildings
    const gap = (10 + rand() * 40) * (2 - density);

    const building = generateBuilding(
      x,
      maxWidth,
      minHeight,
      maxHeight,
      windowScale * depthFactor,
      warmRatio,
      rand
    );

    buildings.push(building);
    x += building.width + gap;
  }

  return {
    buildings,
    depth,
    baseY,
    colorIndex: Math.min(depth, 2),
  };
}

// Generate stars
function generateStars(count: number, width: number, height: number, rand: () => number): Star[] {
  const stars: Star[] = [];
  const skyHeight = height * 0.5; // Stars only in upper half

  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * skyHeight,
      size: rand() < 0.1 ? 2 : 1,
      twinkleOffset: rand() * Math.PI * 2,
      twinkleSpeed: 1 + rand() * 2,
    });
  }

  return stars;
}

// Draw the gradient night sky
function drawSky(p: p5): void {
  const colors = PALETTE.sky;
  const bandHeight = p.height / colors.length;

  for (let i = 0; i < colors.length; i++) {
    const y1 = i * bandHeight;
    const y2 = (i + 1) * bandHeight;

    // Gradient within each band
    for (let y = y1; y < y2; y++) {
      const t = (y - y1) / bandHeight;
      const c1 = p.color(colors[i]);
      const c2 = p.color(colors[Math.min(i + 1, colors.length - 1)]);
      const c = p.lerpColor(c1, c2, t);

      p.stroke(c);
      p.line(0, y, p.width, y);
    }
  }
}

// Draw the moon
function drawMoon(p: p5, time: number): void {
  const moonX = p.width * 0.8;
  const moonY = p.height * 0.15;
  const moonRadius = 35;

  // Outer glow
  p.noStroke();
  for (let r = moonRadius * 3; r > moonRadius; r -= 2) {
    const alpha = p.map(r, moonRadius, moonRadius * 3, 40, 0);
    const c = p.color(PALETTE.moonGlow);
    c.setAlpha(alpha);
    p.fill(c);
    p.ellipse(moonX, moonY, r * 2, r * 2);
  }

  // Moon body
  p.fill(PALETTE.moon);
  p.ellipse(moonX, moonY, moonRadius * 2, moonRadius * 2);

  // Subtle craters (very light)
  p.fill(255, 250, 230, 30);
  p.ellipse(moonX - 8, moonY - 5, 12, 12);
  p.ellipse(moonX + 10, moonY + 8, 8, 8);
  p.ellipse(moonX - 5, moonY + 12, 6, 6);
}

// Draw stars with twinkling
function drawStars(p: p5, stars: Star[], time: number): void {
  for (const star of stars) {
    const twinkle = (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
    const alpha = 100 + twinkle * 155;

    const c = p.color(PALETTE.stars);
    c.setAlpha(alpha);
    p.fill(c);
    p.noStroke();

    if (star.size > 1) {
      // Larger stars get a subtle cross pattern
      p.rect(star.x - 1, star.y, 3, 1);
      p.rect(star.x, star.y - 1, 1, 3);
    } else {
      p.rect(star.x, star.y, 1, 1);
    }
  }
}

// Draw a single building
function drawBuilding(
  p: p5,
  building: Building,
  baseY: number,
  buildingColor: string,
  time: number,
  breathRate: number
): void {
  const bx = building.x;
  const by = baseY - building.height;

  // Building body
  p.fill(buildingColor);
  p.noStroke();
  p.rect(bx, by, building.width, building.height);

  // Roof variations
  if (building.roofStyle === 1) {
    // Pointed roof
    p.triangle(
      bx, by,
      bx + building.width / 2, by - 15,
      bx + building.width, by
    );
  } else if (building.roofStyle === 2) {
    // Stepped roof
    const stepWidth = building.width / 3;
    const stepHeight = 10;
    p.rect(bx + stepWidth, by - stepHeight, stepWidth, stepHeight);
  }

  // Antenna
  if (building.hasAntenna) {
    const antennaX = bx + building.width / 2;
    const antennaTop = by - building.antennaHeight;
    p.stroke(buildingColor);
    p.strokeWeight(2);
    p.line(antennaX, by, antennaX, antennaTop);

    // Blinking light on antenna
    const blink = Math.sin(time * 3) > 0.3;
    if (blink) {
      p.fill(255, 50, 50);
      p.noStroke();
      p.ellipse(antennaX, antennaTop, 4, 4);
    }
  }

  // Draw windows
  for (const win of building.windows) {
    // Calculate window brightness based on breathing
    const breathCycle = Math.sin(time * breathRate * win.breathSpeed + win.breathOffset);

    // Occasionally toggle window on/off
    const toggleThreshold = Math.sin(time * 0.1 * win.breathSpeed + win.breathOffset * 2);
    if (toggleThreshold > 0.95 && !win.isOn) {
      win.isOn = true;
    } else if (toggleThreshold < -0.95 && win.isOn) {
      win.isOn = false;
    }

    if (win.isOn) {
      // Lit window
      const intensity = win.baseIntensity * (0.7 + breathCycle * 0.3);
      const colors = win.isWarm ? PALETTE.windows.warm : PALETTE.windows.cool;
      const colorIndex = Math.floor(intensity * (colors.length - 1));
      const windowColor = p.color(colors[colorIndex]);
      windowColor.setAlpha(200 + intensity * 55);

      // Window glow
      const glowColor = p.color(colors[0]);
      glowColor.setAlpha(30 * intensity);
      p.fill(glowColor);
      p.noStroke();
      p.rect(
        bx + win.x - 2,
        by + win.y - 2,
        win.width + 4,
        win.height + 4
      );

      // Window itself
      p.fill(windowColor);
      p.rect(bx + win.x, by + win.y, win.width, win.height);
    } else {
      // Dark window
      p.fill(PALETTE.windows.off);
      p.noStroke();
      p.rect(bx + win.x, by + win.y, win.width, win.height);
    }
  }
}

// Draw fog layer between building layers
function drawFog(p: p5, y: number, intensity: number): void {
  if (intensity <= 0) return;

  const fogColor = p.color(PALETTE.fog);
  const fogHeight = 60;

  for (let fy = 0; fy < fogHeight; fy++) {
    const alpha = intensity * 80 * (1 - fy / fogHeight);
    fogColor.setAlpha(alpha);
    p.stroke(fogColor);
    p.line(0, y - fy, p.width, y - fy);
  }
}

// Draw a layer of buildings
function drawLayer(
  p: p5,
  layer: Layer,
  time: number,
  breathRate: number,
  fogIntensity: number
): void {
  const colorSets = [PALETTE.buildings.far, PALETTE.buildings.mid, PALETTE.buildings.near];
  const colors = colorSets[layer.colorIndex];

  // Draw fog behind this layer
  if (layer.depth > 0) {
    drawFog(p, layer.baseY, fogIntensity * (1 - layer.depth * 0.3));
  }

  // Draw buildings
  for (const building of layer.buildings) {
    const colorIndex = Math.floor(Math.random() * colors.length);
    drawBuilding(p, building, layer.baseY, colors[colorIndex], time, breathRate);
  }
}

const config: DayConfig = {
  day: 8,
  prompt: 'A City. Create a generative metropolis.',
  creditName: 'PaoloCurtoni',
  creditUrl: 'https://www.paolocurtoni.com/',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-08',
  },

  setup: (p: p5) => {
    createCanvas(p, 800, 800);

    // Initialize controls
    const controls = { ...defaultControls };
    (p as any)._controls = controls;
    (p as any)._layers = null;
    (p as any)._stars = null;
    (p as any)._lastConfig = null;
  },

  draw: (p: p5) => {
    // Get controls
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const layerCount = Math.round(controls.layerCount);
    const density = controls.buildingDensity;
    const breathRate = controls.breathRate;
    const fogIntensity = controls.fogIntensity;
    const starCount = Math.round(controls.starCount);
    const warmRatio = controls.warmLightRatio;
    const moonEnabled = controls.moonEnabled >= 0.5;
    const windowSize = controls.windowSize;

    const time = p.millis() / 1000;

    // Create config signature to detect changes
    const configSig = `${layerCount}-${density}-${starCount}-${warmRatio}-${windowSize}`;

    // Initialize or regenerate if controls changed
    if ((p as any)._lastConfig !== configSig) {
      const rand = seededRandom(42);

      // Generate layers (far to near)
      const layers: Layer[] = [];
      for (let i = 0; i < layerCount; i++) {
        layers.push(generateLayer(
          i,
          p.width,
          p.height,
          density,
          windowSize,
          warmRatio,
          rand
        ));
      }
      (p as any)._layers = layers;

      // Generate stars
      (p as any)._stars = generateStars(starCount, p.width, p.height, rand);
      (p as any)._lastConfig = configSig;
    }

    const layers: Layer[] = (p as any)._layers;
    const stars: Star[] = (p as any)._stars;

    // Draw sky
    drawSky(p);

    // Draw stars
    drawStars(p, stars, time);

    // Draw moon
    if (moonEnabled) {
      drawMoon(p, time);
    }

    // Draw building layers (far to near)
    for (let i = layers.length - 1; i >= 0; i--) {
      drawLayer(p, layers[i], time, breathRate, fogIntensity);
    }

    // Ground
    p.fill('#0a0a10');
    p.noStroke();
    p.rect(0, p.height - 50, p.width, 50);
  },

  renderFinal: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };
    const time = 5; // Fixed time for static render

    // Use existing layers if available, or regenerate
    if (!(p as any)._layers) {
      const rand = seededRandom(42);
      const layerCount = Math.round(controls.layerCount);
      const layers: Layer[] = [];
      for (let i = 0; i < layerCount; i++) {
        layers.push(generateLayer(
          i,
          p.width,
          p.height,
          controls.buildingDensity,
          controls.windowSize,
          controls.warmLightRatio,
          rand
        ));
      }
      (p as any)._layers = layers;
      (p as any)._stars = generateStars(
        Math.round(controls.starCount),
        p.width,
        p.height,
        rand
      );
    }

    const layers: Layer[] = (p as any)._layers;
    const stars: Star[] = (p as any)._stars;

    // Draw everything at fixed time
    drawSky(p);
    drawStars(p, stars, time);

    if (controls.moonEnabled >= 0.5) {
      drawMoon(p, time);
    }

    for (let i = layers.length - 1; i >= 0; i--) {
      drawLayer(p, layers[i], time, controls.breathRate, controls.fogIntensity);
    }

    p.fill('#0a0a10');
    p.noStroke();
    p.rect(0, p.height - 50, p.width, 50);
  },
};

// Claude's Choice - contemplative midnight settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    buildingDensity: 0.75,
    layerCount: 4,
    breathRate: 0.25,
    fogIntensity: 0.5,
    starCount: 100,
    warmLightRatio: 0.65,
    moonEnabled: 1,
    windowSize: 1.0,
  };
}

export { controlConfigs, defaultControls };
export default config;
