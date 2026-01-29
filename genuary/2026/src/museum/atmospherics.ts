/**
 * Atmospherics
 *
 * Ambient particle effects and weather overlays
 * for enhanced museum ambiance.
 */

// ============================================================================
// Types
// ============================================================================

export type AtmosphericPreset = 'none' | 'dust' | 'sparkles' | 'snow' | 'rain' | 'fireflies' | 'fog' | 'bubbles';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface AtmosphericsSystem {
  container: HTMLElement;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  particles: Particle[];
  currentPreset: AtmosphericPreset;
  isRunning: boolean;
  animationId: number | null;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Preset Configurations
// ============================================================================

const PRESET_CONFIGS: Record<AtmosphericPreset, {
  name: string;
  icon: string;
  count: number;
  color: string;
  sizeRange: [number, number];
  speedRange: [number, number];
  lifeRange: [number, number];
  direction: 'down' | 'up' | 'random' | 'drift';
}> = {
  none: { name: 'None', icon: '⭕', count: 0, color: '#fff', sizeRange: [0, 0], speedRange: [0, 0], lifeRange: [0, 0], direction: 'down' },
  dust: { name: 'Floating Dust', icon: '✨', count: 50, color: '#c4a060', sizeRange: [1, 3], speedRange: [0.1, 0.3], lifeRange: [200, 400], direction: 'drift' },
  sparkles: { name: 'Sparkles', icon: '⭐', count: 30, color: '#fff', sizeRange: [1, 4], speedRange: [0.2, 0.5], lifeRange: [50, 150], direction: 'random' },
  snow: { name: 'Snow', icon: '❄️', count: 80, color: '#fff', sizeRange: [2, 5], speedRange: [0.5, 1.5], lifeRange: [300, 500], direction: 'down' },
  rain: { name: 'Rain', icon: '🌧️', count: 100, color: '#64a0ff', sizeRange: [1, 2], speedRange: [3, 6], lifeRange: [50, 100], direction: 'down' },
  fireflies: { name: 'Fireflies', icon: '🔆', count: 25, color: '#ffff64', sizeRange: [2, 4], speedRange: [0.2, 0.5], lifeRange: [150, 300], direction: 'random' },
  fog: { name: 'Fog', icon: '🌫️', count: 15, color: '#ffffff', sizeRange: [50, 150], speedRange: [0.1, 0.2], lifeRange: [400, 600], direction: 'drift' },
  bubbles: { name: 'Bubbles', icon: '🫧', count: 20, color: '#a0c0ff', sizeRange: [5, 15], speedRange: [0.3, 0.8], lifeRange: [200, 400], direction: 'up' },
};

const PRESET_ORDER: AtmosphericPreset[] = ['none', 'dust', 'sparkles', 'snow', 'rain', 'fireflies', 'fog', 'bubbles'];

// ============================================================================
// Atmospherics System Creation
// ============================================================================

/**
 * Create the atmospherics system
 */
export function createAtmosphericsSystem(container: HTMLElement): AtmosphericsSystem {
  const system: AtmosphericsSystem = {
    container,
    canvas: null,
    ctx: null,
    particles: [],
    currentPreset: 'none',
    isRunning: false,
    animationId: null,
    indicator: null,
    cleanup: () => {
      stopAtmospherics(system);
      hideAtmosphericIndicator(system);
    },
  };

  return system;
}

/**
 * Set atmospheric preset
 */
export function setAtmosphericPreset(system: AtmosphericsSystem, preset: AtmosphericPreset): void {
  system.currentPreset = preset;
  system.particles = [];

  if (preset === 'none') {
    stopAtmospherics(system);
    hideAtmosphericIndicator(system);
  } else {
    startAtmospherics(system);
    showAtmosphericIndicator(system);
  }
}

/**
 * Cycle to next preset
 */
export function cycleAtmosphericPreset(system: AtmosphericsSystem): AtmosphericPreset {
  const currentIndex = PRESET_ORDER.indexOf(system.currentPreset);
  const nextIndex = (currentIndex + 1) % PRESET_ORDER.length;
  const nextPreset = PRESET_ORDER[nextIndex];
  setAtmosphericPreset(system, nextPreset);
  return nextPreset;
}

/**
 * Start atmospheric effects
 */
function startAtmospherics(system: AtmosphericsSystem): void {
  if (system.isRunning) return;

  // Create canvas if needed
  if (!system.canvas) {
    const canvas = document.createElement('canvas');
    canvas.id = 'atmospherics-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100;
    `;
    system.container.appendChild(canvas);
    system.canvas = canvas;
    system.ctx = canvas.getContext('2d');
  }

  // Set canvas size
  system.canvas.width = window.innerWidth;
  system.canvas.height = window.innerHeight;

  system.isRunning = true;
  animateAtmospherics(system);

  // Handle resize
  window.addEventListener('resize', () => {
    if (system.canvas) {
      system.canvas.width = window.innerWidth;
      system.canvas.height = window.innerHeight;
    }
  });
}

/**
 * Stop atmospheric effects
 */
function stopAtmospherics(system: AtmosphericsSystem): void {
  system.isRunning = false;
  if (system.animationId !== null) {
    cancelAnimationFrame(system.animationId);
    system.animationId = null;
  }

  if (system.canvas) {
    system.canvas.remove();
    system.canvas = null;
    system.ctx = null;
  }
}

/**
 * Animation loop
 */
function animateAtmospherics(system: AtmosphericsSystem): void {
  if (!system.isRunning || !system.ctx || !system.canvas) return;

  const config = PRESET_CONFIGS[system.currentPreset];
  const ctx = system.ctx;
  const width = system.canvas.width;
  const height = system.canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Spawn new particles
  while (system.particles.length < config.count) {
    system.particles.push(createParticle(config, width, height));
  }

  // Update and draw particles
  for (let i = system.particles.length - 1; i >= 0; i--) {
    const p = system.particles[i];

    // Update position
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    // Calculate opacity based on life
    const lifeRatio = p.life / p.maxLife;
    const fadeIn = Math.min(1, (p.maxLife - p.life) / 20);
    const fadeOut = Math.min(1, p.life / 20);
    p.opacity = fadeIn * fadeOut * 0.6;

    // Remove dead particles
    if (p.life <= 0 || p.y > height + 50 || p.y < -50 || p.x < -50 || p.x > width + 50) {
      system.particles.splice(i, 1);
      continue;
    }

    // Draw particle
    drawParticle(ctx, p, config, system.currentPreset);
  }

  system.animationId = requestAnimationFrame(() => animateAtmospherics(system));
}

/**
 * Create a new particle
 */
function createParticle(
  config: typeof PRESET_CONFIGS[AtmosphericPreset],
  width: number,
  height: number
): Particle {
  const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
  const speed = config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0]);
  const life = config.lifeRange[0] + Math.random() * (config.lifeRange[1] - config.lifeRange[0]);

  let vx = 0;
  let vy = 0;
  let x = Math.random() * width;
  let y = -10;

  switch (config.direction) {
    case 'down':
      vy = speed;
      vx = (Math.random() - 0.5) * 0.5;
      y = -10;
      break;
    case 'up':
      vy = -speed;
      vx = (Math.random() - 0.5) * 0.5;
      y = height + 10;
      break;
    case 'random':
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
      y = Math.random() * height;
      break;
    case 'drift':
      vx = (Math.random() - 0.5) * speed;
      vy = (Math.random() - 0.5) * speed * 0.5;
      y = Math.random() * height;
      break;
  }

  return {
    x,
    y,
    vx,
    vy,
    size,
    opacity: 0,
    life,
    maxLife: life,
  };
}

/**
 * Draw a single particle
 */
function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  config: typeof PRESET_CONFIGS[AtmosphericPreset],
  preset: AtmosphericPreset
): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  switch (preset) {
    case 'rain':
      // Draw as line
      ctx.strokeStyle = config.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
      ctx.stroke();
      break;

    case 'fog':
      // Draw as radial gradient blob
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'fireflies':
      // Draw with glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      const pulsate = 0.5 + Math.sin(p.life * 0.1) * 0.5;
      glow.addColorStop(0, `rgba(255, 255, 100, ${p.opacity * pulsate})`);
      glow.addColorStop(0.5, `rgba(255, 255, 100, ${p.opacity * pulsate * 0.3})`);
      glow.addColorStop(1, 'rgba(255, 255, 100, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'bubbles':
      // Draw bubble with highlight
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'sparkles':
      // Draw star shape
      ctx.fillStyle = config.color;
      drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.5);
      break;

    default:
      // Default circle
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw a star shape
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, points: number, outer: number, inner: number): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Show atmospheric indicator
 */
function showAtmosphericIndicator(system: AtmosphericsSystem): void {
  hideAtmosphericIndicator(system);

  const config = PRESET_CONFIGS[system.currentPreset];

  const indicator = document.createElement('div');
  indicator.id = 'atmospheric-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(150, 100, 255, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #e0e0e0;
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  indicator.innerHTML = `
    <span style="font-size: 16px;">${config.icon}</span>
    <span>${config.name}</span>
  `;

  system.container.appendChild(indicator);
  system.indicator = indicator;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (system.indicator === indicator) {
      hideAtmosphericIndicator(system);
    }
  }, 3000);
}

/**
 * Hide atmospheric indicator
 */
function hideAtmosphericIndicator(system: AtmosphericsSystem): void {
  if (!system.indicator) return;

  system.indicator.remove();
  system.indicator = null;
}

/**
 * Get current preset
 */
export function getCurrentAtmosphericPreset(system: AtmosphericsSystem): AtmosphericPreset {
  return system.currentPreset;
}

/**
 * Get all presets
 */
export function getAtmosphericPresets(): { id: AtmosphericPreset; name: string; icon: string }[] {
  return PRESET_ORDER.map(id => ({
    id,
    name: PRESET_CONFIGS[id].name,
    icon: PRESET_CONFIGS[id].icon,
  }));
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeAtmosphericsSystem(system: AtmosphericsSystem): void {
  system.cleanup();
}
