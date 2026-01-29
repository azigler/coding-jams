/**
 * Night Mode
 *
 * Toggle between day and night museum lighting,
 * creating a different atmospheric experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface NightModeSystem {
  container: HTMLElement;
  isNightMode: boolean;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Night Mode System Creation
// ============================================================================

/**
 * Create the night mode system
 */
export function createNightModeSystem(container: HTMLElement): NightModeSystem {
  const saved = loadNightMode();

  const system: NightModeSystem = {
    container,
    isNightMode: saved,
    indicator: null,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator
  createIndicator(system);

  // Apply initial state
  if (system.isNightMode) {
    applyNightMode(system);
  }

  return system;
}

/**
 * Create the mode indicator
 */
function createIndicator(system: NightModeSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'nightmode-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(100, 100, 150, 0.2);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #a0a0b0;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  indicator.innerHTML = getIndicatorContent(system.isNightMode);
  indicator.title = 'Click to toggle or press Shift+D';

  indicator.onclick = () => toggleNightMode(system);

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 100, 150, 0.5)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 100, 150, 0.2)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Get indicator content based on mode
 */
function getIndicatorContent(isNight: boolean): string {
  if (isNight) {
    return '<span style="font-size: 14px;">🌙</span> Night';
  }
  return '<span style="font-size: 14px;">☀️</span> Day';
}

/**
 * Toggle night mode
 */
export function toggleNightMode(system: NightModeSystem): void {
  system.isNightMode = !system.isNightMode;
  saveNightMode(system.isNightMode);

  if (system.isNightMode) {
    applyNightMode(system);
  } else {
    applyDayMode(system);
  }

  // Update indicator
  if (system.indicator) {
    system.indicator.innerHTML = getIndicatorContent(system.isNightMode);
  }
}

/**
 * Apply night mode styling
 */
function applyNightMode(system: NightModeSystem): void {
  // Add night mode overlay filter
  const canvas = system.container.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = 'brightness(0.7) saturate(0.8) contrast(1.1)';
  }

  // Add starfield effect
  addStarfield(system);

  // Dim UI elements
  document.querySelectorAll('#museum-location, #minimap-canvas, #discovery-badge').forEach(el => {
    (el as HTMLElement).style.opacity = '0.7';
  });
}

/**
 * Apply day mode styling
 */
function applyDayMode(system: NightModeSystem): void {
  // Remove filter
  const canvas = system.container.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = '';
  }

  // Remove starfield
  removeStarfield();

  // Restore UI elements
  document.querySelectorAll('#museum-location, #minimap-canvas, #discovery-badge').forEach(el => {
    (el as HTMLElement).style.opacity = '';
  });
}

/**
 * Add starfield effect
 */
function addStarfield(system: NightModeSystem): void {
  if (document.getElementById('night-starfield')) return;

  const starfield = document.createElement('div');
  starfield.id = 'night-starfield';
  starfield.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  `;

  // Create stars
  const starCount = 50;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    const size = 1 + Math.random() * 2;
    const x = Math.random() * 100;
    const y = Math.random() * 40; // Only in upper portion
    const delay = Math.random() * 3;
    const duration = 2 + Math.random() * 3;

    star.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: white;
      border-radius: 50%;
      opacity: 0.6;
      animation: star-twinkle ${duration}s ease-in-out ${delay}s infinite;
    `;

    starfield.appendChild(star);
  }

  // Add animation
  if (!document.getElementById('starfield-style')) {
    const style = document.createElement('style');
    style.id = 'starfield-style';
    style.textContent = `
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }

  system.container.appendChild(starfield);
}

/**
 * Remove starfield effect
 */
function removeStarfield(): void {
  const starfield = document.getElementById('night-starfield');
  if (starfield) {
    starfield.remove();
  }
}

/**
 * Get current mode
 */
export function isNightModeEnabled(system: NightModeSystem): boolean {
  return system.isNightMode;
}

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY = 'genuary-museum-nightmode';

function loadNightMode(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
}

function saveNightMode(isNight: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(isNight));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeNightModeSystem(system: NightModeSystem): void {
  removeStarfield();
  system.cleanup();
}
