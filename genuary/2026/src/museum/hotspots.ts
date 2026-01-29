/**
 * Hot Spots Indicator
 *
 * Shows which exhibits are trending/popular based on
 * view counts and recent activity.
 */

// ============================================================================
// Types
// ============================================================================

export interface HotSpot {
  dayNumber: number;
  score: number;
  trend: 'rising' | 'stable' | 'cooling';
}

export interface HotSpotsSystem {
  container: HTMLElement;
  hotSpots: HotSpot[];
  indicator: HTMLElement | null;
  isExpanded: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-hotspots';

// ============================================================================
// Hot Spots System Creation
// ============================================================================

/**
 * Create the hot spots system
 */
export function createHotSpotsSystem(container: HTMLElement): HotSpotsSystem {
  const saved = loadHotSpots();

  const system: HotSpotsSystem = {
    container,
    hotSpots: saved || generateInitialHotSpots(),
    indicator: null,
    isExpanded: false,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator
  createHotSpotsIndicator(system);

  return system;
}

/**
 * Generate initial hot spots based on day number patterns
 */
function generateInitialHotSpots(): HotSpot[] {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Generate realistic-looking hot spots
  const hotSpots: HotSpot[] = [];

  // Today's day is always hot
  if (dayOfMonth <= 31) {
    hotSpots.push({
      dayNumber: dayOfMonth,
      score: 95 + Math.floor(Math.random() * 5),
      trend: 'rising',
    });
  }

  // Previous days are also popular
  if (dayOfMonth > 1) {
    hotSpots.push({
      dayNumber: dayOfMonth - 1,
      score: 80 + Math.floor(Math.random() * 15),
      trend: 'stable',
    });
  }

  // A random earlier day is trending
  const randomDay = 1 + Math.floor(Math.random() * Math.min(dayOfMonth - 1, 15));
  if (randomDay > 0 && !hotSpots.some(h => h.dayNumber === randomDay)) {
    hotSpots.push({
      dayNumber: randomDay,
      score: 70 + Math.floor(Math.random() * 20),
      trend: Math.random() > 0.5 ? 'rising' : 'stable',
    });
  }

  // Day 1 is always popular
  if (!hotSpots.some(h => h.dayNumber === 1)) {
    hotSpots.push({
      dayNumber: 1,
      score: 65 + Math.floor(Math.random() * 20),
      trend: 'stable',
    });
  }

  // Day 7 and 14 tend to be popular
  [7, 14, 21].forEach(day => {
    if (day <= dayOfMonth && !hotSpots.some(h => h.dayNumber === day) && Math.random() > 0.5) {
      hotSpots.push({
        dayNumber: day,
        score: 50 + Math.floor(Math.random() * 30),
        trend: Math.random() > 0.7 ? 'cooling' : 'stable',
      });
    }
  });

  return hotSpots.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Create the hot spots indicator
 */
function createHotSpotsIndicator(system: HotSpotsSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'hotspots-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(255, 100, 100, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #e0e0e0;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    max-width: 180px;
  `;

  updateHotSpotsIndicator(system, indicator);

  indicator.onclick = () => {
    system.isExpanded = !system.isExpanded;
    updateHotSpotsIndicator(system, indicator);
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update the indicator content
 */
function updateHotSpotsIndicator(system: HotSpotsSystem, indicator: HTMLElement): void {
  if (system.isExpanded) {
    indicator.style.maxWidth = '200px';
    indicator.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255, 100, 100, 0.2);
      ">
        <span style="color: #ff6b6b;">🔥 Trending</span>
        <span style="color: #666; font-size: 10px;">Click to close</span>
      </div>
      ${system.hotSpots.slice(0, 5).map(spot => {
        const trendIcon = spot.trend === 'rising' ? '📈' : spot.trend === 'cooling' ? '📉' : '➖';
        return `
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid rgba(100, 100, 150, 0.1);
          ">
            <span>Day ${spot.dayNumber}</span>
            <span style="color: ${spot.trend === 'rising' ? '#4ade80' : spot.trend === 'cooling' ? '#888' : '#ffb649'};">
              ${trendIcon} ${spot.score}
            </span>
          </div>
        `;
      }).join('')}
    `;
  } else {
    indicator.style.maxWidth = '100px';
    const topSpot = system.hotSpots[0];
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #ff6b6b;">🔥</span>
        <span>Day ${topSpot?.dayNumber || '?'}</span>
      </div>
    `;
  }
}

/**
 * Record a view and update hot spots
 */
export function recordHotSpotView(system: HotSpotsSystem, dayNumber: number): void {
  // Find or create hot spot
  let spot = system.hotSpots.find(h => h.dayNumber === dayNumber);

  if (spot) {
    // Increase score
    spot.score = Math.min(100, spot.score + 2);
    spot.trend = 'rising';
  } else {
    // Add new hot spot
    spot = {
      dayNumber,
      score: 50,
      trend: 'rising',
    };
    system.hotSpots.push(spot);
  }

  // Decay other scores slightly
  system.hotSpots.forEach(h => {
    if (h.dayNumber !== dayNumber) {
      h.score = Math.max(0, h.score - 0.5);
      if (h.score < 40) {
        h.trend = 'cooling';
      }
    }
  });

  // Sort and trim
  system.hotSpots.sort((a, b) => b.score - a.score);
  system.hotSpots = system.hotSpots.slice(0, 10);

  // Update display
  if (system.indicator) {
    updateHotSpotsIndicator(system, system.indicator);
  }

  // Save
  saveHotSpots(system);
}

/**
 * Get current hot spots
 */
export function getHotSpots(system: HotSpotsSystem): HotSpot[] {
  return [...system.hotSpots];
}

/**
 * Check if a day is trending
 */
export function isTrending(system: HotSpotsSystem, dayNumber: number): boolean {
  const spot = system.hotSpots.find(h => h.dayNumber === dayNumber);
  return spot !== undefined && spot.score >= 50;
}

// ============================================================================
// Persistence
// ============================================================================

function loadHotSpots(): HotSpot[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveHotSpots(system: HotSpotsSystem): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system.hotSpots));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeHotSpotsSystem(system: HotSpotsSystem): void {
  system.cleanup();
}
