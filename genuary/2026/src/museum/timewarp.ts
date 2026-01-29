/**
 * Time Warp
 *
 * Control the speed of animations in the museum.
 * Slow down to appreciate details or speed up for dynamic views.
 */

// ============================================================================
// Types
// ============================================================================

export interface TimeWarpSystem {
  container: HTMLElement;
  speed: number;
  indicator: HTMLElement | null;
  isVisible: boolean;
  cleanup: () => void;
}

// ============================================================================
// Speed Presets
// ============================================================================

const SPEED_PRESETS = [
  { value: 0.25, label: '¼×', icon: '🐢' },
  { value: 0.5, label: '½×', icon: '🐌' },
  { value: 1.0, label: '1×', icon: '⏱️' },
  { value: 2.0, label: '2×', icon: '🐇' },
  { value: 4.0, label: '4×', icon: '⚡' },
];

// ============================================================================
// Time Warp System Creation
// ============================================================================

/**
 * Create the time warp system
 */
export function createTimeWarpSystem(container: HTMLElement): TimeWarpSystem {
  const system: TimeWarpSystem = {
    container,
    speed: 1.0,
    indicator: null,
    isVisible: false,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  return system;
}

/**
 * Set time warp speed
 */
export function setTimeWarpSpeed(system: TimeWarpSystem, speed: number): void {
  system.speed = Math.max(0.1, Math.min(10, speed));

  if (system.speed !== 1.0) {
    showIndicator(system);
  } else {
    hideIndicator(system);
  }
}

/**
 * Get current time warp speed
 */
export function getTimeWarpSpeed(system: TimeWarpSystem): number {
  return system.speed;
}

/**
 * Cycle to next speed preset
 */
export function cycleTimeWarp(system: TimeWarpSystem): number {
  const currentIndex = SPEED_PRESETS.findIndex(p => p.value === system.speed);
  const nextIndex = (currentIndex + 1) % SPEED_PRESETS.length;
  setTimeWarpSpeed(system, SPEED_PRESETS[nextIndex].value);
  return system.speed;
}

/**
 * Reset to normal speed
 */
export function resetTimeWarp(system: TimeWarpSystem): void {
  setTimeWarpSpeed(system, 1.0);
}

/**
 * Show speed indicator
 */
function showIndicator(system: TimeWarpSystem): void {
  if (system.indicator) {
    updateIndicator(system);
    return;
  }

  const indicator = document.createElement('div');
  indicator.id = 'timewarp-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(255, 200, 50, 0.3);
    border-radius: 20px;
    padding: 8px 15px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #ffc832;
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s;
  `;

  indicator.onclick = () => {
    cycleTimeWarp(system);
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(255, 200, 50, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(255, 200, 50, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
  updateIndicator(system);
}

/**
 * Update indicator content
 */
function updateIndicator(system: TimeWarpSystem): void {
  if (!system.indicator) return;

  const preset = SPEED_PRESETS.find(p => p.value === system.speed);
  const icon = preset?.icon || '⏱️';
  const label = preset?.label || `${system.speed}×`;

  system.indicator.innerHTML = `
    <span style="font-size: 16px;">${icon}</span>
    <span>Time: ${label}</span>
  `;
  system.indicator.title = 'Click to change speed (T key)';
}

/**
 * Hide indicator
 */
function hideIndicator(system: TimeWarpSystem): void {
  if (!system.indicator) return;

  system.indicator.style.opacity = '0';
  const indicator = system.indicator;

  setTimeout(() => {
    indicator.remove();
    if (system.indicator === indicator) {
      system.indicator = null;
    }
  }, 300);
}

/**
 * Show time warp selector panel
 */
export function showTimeWarpSelector(system: TimeWarpSystem): void {
  // Remove existing
  const existing = document.getElementById('timewarp-panel');
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'timewarp-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 20px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 50, 0.3);
    border-radius: 12px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  panel.innerHTML = `
    <div style="font-size: 12px; font-weight: bold; color: white; margin-bottom: 12px;">
      ⏱️ Time Warp
    </div>
    <div style="display: flex; gap: 8px;">
      ${SPEED_PRESETS.map(preset => `
        <button class="timewarp-preset" data-speed="${preset.value}" style="
          background: ${preset.value === system.speed ? 'rgba(255, 200, 50, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
          border: 1px solid ${preset.value === system.speed ? 'rgba(255, 200, 50, 0.5)' : 'transparent'};
          border-radius: 8px;
          padding: 10px 12px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        ">
          <span style="font-size: 16px;">${preset.icon}</span>
          <span>${preset.label}</span>
        </button>
      `).join('')}
    </div>
    <div style="
      margin-top: 10px;
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Press T to cycle · Shift+T for panel
    </div>
  `;

  system.container.appendChild(panel);

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up preset buttons
  const buttons = panel.querySelectorAll('.timewarp-preset');
  buttons.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const speed = parseFloat((btn as HTMLElement).dataset.speed || '1');
      setTimeWarpSpeed(system, speed);
      panel.remove();
    };

    (btn as HTMLElement).onmouseover = () => {
      const isActive = parseFloat((btn as HTMLElement).dataset.speed || '1') === system.speed;
      if (!isActive) {
        (btn as HTMLElement).style.background = 'rgba(255, 200, 50, 0.15)';
      }
    };
    (btn as HTMLElement).onmouseout = () => {
      const isActive = parseFloat((btn as HTMLElement).dataset.speed || '1') === system.speed;
      if (!isActive) {
        (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      }
    };
  });

  // Close on click outside
  const clickHandler = (e: MouseEvent) => {
    if (!panel.contains(e.target as Node)) {
      panel.remove();
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTimeWarpSystem(system: TimeWarpSystem): void {
  system.cleanup();
}
