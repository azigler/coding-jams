/**
 * Visitor Counter
 *
 * Simulates other visitors in the museum for a more lively feel.
 * Shows realtime "visitor" count and popular exhibits.
 */

// ============================================================================
// Types
// ============================================================================

export interface VisitorSystem {
  container: HTMLElement;
  currentVisitors: number;
  peakVisitors: number;
  totalVisits: number;
  popularDays: Map<number, number>;
  indicator: HTMLElement | null;
  updateInterval: number | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const BASE_VISITORS = 12;
const VISITOR_VARIANCE = 8;
const UPDATE_INTERVAL = 30000; // 30 seconds

// ============================================================================
// Visitor System Creation
// ============================================================================

/**
 * Create the visitor counter system
 */
export function createVisitorSystem(container: HTMLElement): VisitorSystem {
  const system: VisitorSystem = {
    container,
    currentVisitors: calculateVisitors(),
    peakVisitors: 0,
    totalVisits: getSimulatedTotalVisits(),
    popularDays: generatePopularDays(),
    indicator: null,
    updateInterval: null,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      if (system.updateInterval) {
        clearInterval(system.updateInterval);
        system.updateInterval = null;
      }
    },
  };

  // Update peak
  system.peakVisitors = system.currentVisitors;

  // Create indicator
  createVisitorIndicator(system);

  // Start update loop
  system.updateInterval = window.setInterval(() => {
    updateVisitorCount(system);
  }, UPDATE_INTERVAL);

  return system;
}

/**
 * Calculate simulated visitor count based on time of day
 */
function calculateVisitors(): number {
  const hour = new Date().getHours();

  // Higher traffic during evening hours
  let multiplier = 1;
  if (hour >= 19 && hour <= 23) {
    multiplier = 1.5; // Evening peak
  } else if (hour >= 12 && hour <= 14) {
    multiplier = 1.3; // Lunch peak
  } else if (hour >= 0 && hour <= 6) {
    multiplier = 0.5; // Late night
  }

  const base = Math.floor(BASE_VISITORS * multiplier);
  const variance = Math.floor(Math.random() * VISITOR_VARIANCE * 2) - VISITOR_VARIANCE;

  return Math.max(1, base + variance);
}

/**
 * Get simulated total visits (based on days since Jan 1, 2026)
 */
function getSimulatedTotalVisits(): number {
  const startDate = new Date('2026-01-01');
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / 86400000);

  // Simulate ~500-800 visits per day on average
  const avgPerDay = 650 + Math.sin(daysSinceStart * 0.2) * 150;
  return Math.floor(daysSinceStart * avgPerDay);
}

/**
 * Generate simulated popular days
 */
function generatePopularDays(): Map<number, number> {
  const popular = new Map<number, number>();

  // Generate view counts for each day
  for (let day = 1; day <= 31; day++) {
    // Some days are more popular
    let views = Math.floor(Math.random() * 1000) + 500;

    // Bump early days (more time to accumulate views)
    if (day <= 10) {
      views *= 1.5;
    }

    // Random "viral" days
    if (Math.random() < 0.1) {
      views *= 2;
    }

    popular.set(day, Math.floor(views));
  }

  return popular;
}

/**
 * Create the visitor indicator
 */
function createVisitorIndicator(system: VisitorSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'visitors-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 140px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #4ade80;
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: default;
  `;

  updateIndicatorContent(system, indicator);

  indicator.title = `${system.totalVisits.toLocaleString()} total visits`;

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update the indicator content
 */
function updateIndicatorContent(system: VisitorSystem, indicator: HTMLElement): void {
  indicator.innerHTML = `
    <span style="
      width: 6px;
      height: 6px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    "></span>
    <span>${system.currentVisitors} viewing</span>
  `;

  // Add pulse animation if not present
  if (!document.getElementById('visitors-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'visitors-pulse-style';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Update the visitor count
 */
function updateVisitorCount(system: VisitorSystem): void {
  // Small random change
  const change = Math.floor(Math.random() * 5) - 2;
  system.currentVisitors = Math.max(1, system.currentVisitors + change);

  // Update peak
  if (system.currentVisitors > system.peakVisitors) {
    system.peakVisitors = system.currentVisitors;
  }

  // Update indicator
  if (system.indicator) {
    updateIndicatorContent(system, system.indicator);
  }
}

/**
 * Get current visitor count
 */
export function getCurrentVisitors(system: VisitorSystem): number {
  return system.currentVisitors;
}

/**
 * Get peak visitor count
 */
export function getPeakVisitors(system: VisitorSystem): number {
  return system.peakVisitors;
}

/**
 * Get total visits
 */
export function getTotalVisits(system: VisitorSystem): number {
  return system.totalVisits;
}

/**
 * Get view count for a specific day
 */
export function getDayViews(system: VisitorSystem, dayNumber: number): number {
  return system.popularDays.get(dayNumber) || 0;
}

/**
 * Get most popular days
 */
export function getMostPopularDays(system: VisitorSystem, count: number = 5): Array<{ day: number; views: number }> {
  const sorted = Array.from(system.popularDays.entries())
    .map(([day, views]) => ({ day, views }))
    .sort((a, b) => b.views - a.views);

  return sorted.slice(0, count);
}

/**
 * Simulate a new visitor viewing a day
 */
export function recordDayView(system: VisitorSystem, dayNumber: number): void {
  const current = system.popularDays.get(dayNumber) || 0;
  system.popularDays.set(dayNumber, current + 1);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeVisitorSystem(system: VisitorSystem): void {
  system.cleanup();
}
