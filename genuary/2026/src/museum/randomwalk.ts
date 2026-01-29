/**
 * Random Walk
 *
 * Jump to a random exhibit for serendipitous discovery.
 */

// ============================================================================
// Types
// ============================================================================

export interface RandomWalkSystem {
  container: HTMLElement;
  indicator: HTMLElement | null;
  onRandomSelect: ((dayNumber: number) => void) | null;
  lastRandom: number;
  cleanup: () => void;
}

// ============================================================================
// Random Walk System Creation
// ============================================================================

/**
 * Create the random walk system
 */
export function createRandomWalkSystem(container: HTMLElement): RandomWalkSystem {
  const system: RandomWalkSystem = {
    container,
    indicator: null,
    onRandomSelect: null,
    lastRandom: 0,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator button
  createIndicator(system);

  return system;
}

/**
 * Create the random indicator button
 */
function createIndicator(system: RandomWalkSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'randomwalk-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(255, 200, 100, 0.3);
    border-radius: 25px;
    padding: 10px 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #ffc864;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  indicator.innerHTML = `
    <span style="font-size: 16px;">🎲</span>
    <span>Surprise Me!</span>
  `;
  indicator.title = 'Jump to a random exhibit (R key)';

  indicator.onclick = () => selectRandom(system);

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(255, 200, 100, 0.6)';
    indicator.style.transform = 'translateX(-50%) scale(1.05)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(255, 200, 100, 0.3)';
    indicator.style.transform = 'translateX(-50%) scale(1)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Select a random exhibit
 */
export function selectRandom(system: RandomWalkSystem): void {
  let dayNumber: number;

  // Avoid repeating the same day twice
  do {
    dayNumber = Math.floor(Math.random() * 31) + 1;
  } while (dayNumber === system.lastRandom);

  system.lastRandom = dayNumber;

  // Animate the indicator
  if (system.indicator) {
    system.indicator.style.transform = 'translateX(-50%) scale(1.2)';
    setTimeout(() => {
      if (system.indicator) {
        system.indicator.style.transform = 'translateX(-50%) scale(1)';
      }
    }, 200);
  }

  // Notify callback
  if (system.onRandomSelect) {
    system.onRandomSelect(dayNumber);
  }
}

/**
 * Get a random day number (weighted toward unvisited if provided)
 */
export function getWeightedRandom(visitedDays: Set<number>): number {
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const unvisited = allDays.filter(d => !visitedDays.has(d));

  // 70% chance to pick unvisited if available
  if (unvisited.length > 0 && Math.random() < 0.7) {
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  return allDays[Math.floor(Math.random() * allDays.length)];
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeRandomWalkSystem(system: RandomWalkSystem): void {
  system.cleanup();
}
