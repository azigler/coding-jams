/**
 * Weather Effects System
 *
 * Simulates atmospheric conditions in the museum like
 * dust motes, light rays, and subtle fog for ambiance.
 */

// ============================================================================
// Types
// ============================================================================

export type WeatherMode = 'clear' | 'dusty' | 'rays' | 'foggy' | 'auto';

export interface WeatherSystem {
  container: HTMLElement;
  mode: WeatherMode;
  effectLayer: HTMLElement | null;
  dustParticles: HTMLElement[];
  rayElements: HTMLElement[];
  fogElement: HTMLElement | null;
  animationFrame: number | null;
  cleanup: () => void;
}

// ============================================================================
// Weather System Creation
// ============================================================================

/**
 * Create the weather effects system
 */
export function createWeatherSystem(container: HTMLElement): WeatherSystem {
  const system: WeatherSystem = {
    container,
    mode: 'auto',
    effectLayer: null,
    dustParticles: [],
    rayElements: [],
    fogElement: null,
    animationFrame: null,
    cleanup: () => {
      clearWeatherEffects(system);
      if (system.animationFrame) {
        cancelAnimationFrame(system.animationFrame);
        system.animationFrame = null;
      }
    },
  };

  // Create effect layer
  const layer = document.createElement('div');
  layer.id = 'weather-layer';
  layer.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  `;
  container.appendChild(layer);
  system.effectLayer = layer;

  // Toggle with Shift+W
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyW' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      cycleWeatherMode(system);
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
    if (system.effectLayer) {
      system.effectLayer.remove();
      system.effectLayer = null;
    }
  };

  // Start with auto mode
  applyAutoWeather(system);

  return system;
}

/**
 * Apply weather based on time of day
 */
function applyAutoWeather(system: WeatherSystem): void {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    // Morning - light rays
    applyRays(system);
  } else if (hour >= 10 && hour < 16) {
    // Daytime - dusty
    applyDust(system);
  } else if (hour >= 16 && hour < 20) {
    // Evening - clear with subtle fog
    applyFog(system, 0.15);
  } else {
    // Night - foggy
    applyFog(system, 0.25);
  }
}

/**
 * Cycle through weather modes
 */
export function cycleWeatherMode(system: WeatherSystem): void {
  const modes: WeatherMode[] = ['clear', 'dusty', 'rays', 'foggy', 'auto'];
  const currentIndex = modes.indexOf(system.mode);
  const nextIndex = (currentIndex + 1) % modes.length;
  setWeatherMode(system, modes[nextIndex]);
}

/**
 * Set a specific weather mode
 */
export function setWeatherMode(system: WeatherSystem, mode: WeatherMode): void {
  clearWeatherEffects(system);
  system.mode = mode;

  switch (mode) {
    case 'clear':
      // No effects
      break;
    case 'dusty':
      applyDust(system);
      break;
    case 'rays':
      applyRays(system);
      break;
    case 'foggy':
      applyFog(system, 0.3);
      break;
    case 'auto':
      applyAutoWeather(system);
      break;
  }

  // Show notification
  const modeNames: Record<WeatherMode, string> = {
    clear: 'Clear',
    dusty: 'Dust Motes',
    rays: 'Light Rays',
    foggy: 'Foggy',
    auto: 'Auto',
  };
  showWeatherNotification(system, `Atmosphere: ${modeNames[mode]}`);
}

/**
 * Clear all weather effects
 */
function clearWeatherEffects(system: WeatherSystem): void {
  // Remove dust particles
  system.dustParticles.forEach(p => p.remove());
  system.dustParticles = [];

  // Remove rays
  system.rayElements.forEach(r => r.remove());
  system.rayElements = [];

  // Remove fog
  if (system.fogElement) {
    system.fogElement.remove();
    system.fogElement = null;
  }

  // Cancel animation
  if (system.animationFrame) {
    cancelAnimationFrame(system.animationFrame);
    system.animationFrame = null;
  }
}

/**
 * Apply dust mote effect
 */
function applyDust(system: WeatherSystem): void {
  if (!system.effectLayer) return;

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const dust = document.createElement('div');
    dust.className = 'dust-particle';

    const size = 2 + Math.random() * 4;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = 10 + Math.random() * 20;
    const delay = Math.random() * duration;
    const opacity = 0.2 + Math.random() * 0.3;

    dust.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(255,248,220,${opacity}) 0%, transparent 70%);
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      animation: dust-float ${duration}s ease-in-out ${delay}s infinite;
    `;

    system.effectLayer.appendChild(dust);
    system.dustParticles.push(dust);
  }

  // Add animation keyframes if not present
  if (!document.getElementById('dust-keyframes')) {
    const style = document.createElement('style');
    style.id = 'dust-keyframes';
    style.textContent = `
      @keyframes dust-float {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.5;
        }
        25% {
          transform: translate(30px, -20px) scale(1.1);
          opacity: 0.8;
        }
        50% {
          transform: translate(-10px, -40px) scale(0.9);
          opacity: 0.6;
        }
        75% {
          transform: translate(20px, -10px) scale(1.05);
          opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Apply light ray effect
 */
function applyRays(system: WeatherSystem): void {
  if (!system.effectLayer) return;

  const rayCount = 5;

  for (let i = 0; i < rayCount; i++) {
    const ray = document.createElement('div');
    ray.className = 'light-ray';

    const width = 80 + Math.random() * 150;
    const angle = -20 + Math.random() * 40;
    const leftPos = 10 + (i * 20) + Math.random() * 10;
    const opacity = 0.03 + Math.random() * 0.05;
    const duration = 8 + Math.random() * 4;

    ray.style.cssText = `
      position: absolute;
      width: ${width}px;
      height: 120%;
      background: linear-gradient(
        180deg,
        rgba(255, 248, 220, ${opacity * 2}) 0%,
        rgba(255, 248, 220, ${opacity}) 30%,
        rgba(255, 248, 220, ${opacity * 0.5}) 70%,
        transparent 100%
      );
      left: ${leftPos}%;
      top: -10%;
      transform: rotate(${angle}deg);
      transform-origin: top center;
      animation: ray-shimmer ${duration}s ease-in-out infinite;
    `;

    system.effectLayer.appendChild(ray);
    system.rayElements.push(ray);
  }

  // Add animation keyframes if not present
  if (!document.getElementById('ray-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ray-keyframes';
    style.textContent = `
      @keyframes ray-shimmer {
        0%, 100% {
          opacity: 0.7;
          transform: rotate(var(--angle, 0deg)) scaleX(1);
        }
        50% {
          opacity: 1;
          transform: rotate(var(--angle, 0deg)) scaleX(1.1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Apply fog effect
 */
function applyFog(system: WeatherSystem, intensity: number): void {
  if (!system.effectLayer) return;

  const fog = document.createElement('div');
  fog.id = 'weather-fog';
  fog.style.cssText = `
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 100% 100% at center,
      transparent 0%,
      rgba(30, 30, 50, ${intensity * 0.3}) 50%,
      rgba(15, 15, 25, ${intensity}) 100%
    );
    animation: fog-drift 30s ease-in-out infinite;
  `;

  system.effectLayer.appendChild(fog);
  system.fogElement = fog;

  // Add animation keyframes if not present
  if (!document.getElementById('fog-keyframes')) {
    const style = document.createElement('style');
    style.id = 'fog-keyframes';
    style.textContent = `
      @keyframes fog-drift {
        0%, 100% {
          transform: scale(1) translate(0, 0);
          opacity: 0.8;
        }
        25% {
          transform: scale(1.02) translate(1%, -1%);
          opacity: 0.9;
        }
        50% {
          transform: scale(0.98) translate(-1%, 1%);
          opacity: 1;
        }
        75% {
          transform: scale(1.01) translate(0.5%, -0.5%);
          opacity: 0.85;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Show weather notification
 */
function showWeatherNotification(system: WeatherSystem, message: string): void {
  const existing = document.getElementById('weather-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'weather-notification';
  notification.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    background: rgba(15, 15, 25, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 8px;
    padding: 8px 14px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #a0a0b0;
    z-index: 700;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s;
  `;
  notification.textContent = message;

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

/**
 * Get current weather mode
 */
export function getWeatherMode(system: WeatherSystem): WeatherMode {
  return system.mode;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeWeatherSystem(system: WeatherSystem): void {
  system.cleanup();
}
