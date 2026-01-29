/**
 * Museum Statistics Tracker
 *
 * Tracks and persists museum usage statistics for fun insights.
 */

// ============================================================================
// Types
// ============================================================================

export interface MuseumStats {
  totalTimeSpent: number; // Total seconds in museum
  sessionCount: number; // Number of visits
  exhibitsViewed: number; // Total exhibit views (including repeats)
  favoritesAdded: number; // Total times added to favorites
  toursTaken: number; // Number of tours started
  screenshotsTaken: number; // Number of screenshots
  distanceWalked: number; // Approximate distance in meters
  lastVisit: string; // ISO date of last visit
}

export interface StatsTracker {
  stats: MuseumStats;
  sessionStart: number;
  lastPosition: { x: number; z: number } | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-stats';
const SAVE_INTERVAL = 30000; // Save every 30 seconds

// ============================================================================
// Default Stats
// ============================================================================

function createDefaultStats(): MuseumStats {
  return {
    totalTimeSpent: 0,
    sessionCount: 0,
    exhibitsViewed: 0,
    favoritesAdded: 0,
    toursTaken: 0,
    screenshotsTaken: 0,
    distanceWalked: 0,
    lastVisit: new Date().toISOString(),
  };
}

// ============================================================================
// Stats Tracker Creation
// ============================================================================

/**
 * Create the stats tracker
 */
export function createStatsTracker(): StatsTracker {
  const stats = loadStats();

  // Increment session count
  stats.sessionCount++;
  stats.lastVisit = new Date().toISOString();

  const tracker: StatsTracker = {
    stats,
    sessionStart: performance.now(),
    lastPosition: null,
    cleanup: () => {},
  };

  // Save periodically
  const saveInterval = setInterval(() => {
    updateTimeSpent(tracker);
    saveStats(tracker.stats);
  }, SAVE_INTERVAL);

  // Save on unload
  const unloadHandler = () => {
    updateTimeSpent(tracker);
    saveStats(tracker.stats);
  };
  window.addEventListener('beforeunload', unloadHandler);

  tracker.cleanup = () => {
    clearInterval(saveInterval);
    window.removeEventListener('beforeunload', unloadHandler);
    updateTimeSpent(tracker);
    saveStats(tracker.stats);
  };

  console.log(`Museum stats: ${stats.sessionCount} visits, ${formatTime(stats.totalTimeSpent)} total time`);

  return tracker;
}

/**
 * Update time spent in current session
 */
function updateTimeSpent(tracker: StatsTracker): void {
  const now = performance.now();
  const sessionTime = (now - tracker.sessionStart) / 1000;
  tracker.sessionStart = now;
  tracker.stats.totalTimeSpent += sessionTime;
}

// ============================================================================
// Stat Recording Functions
// ============================================================================

/**
 * Record an exhibit view
 */
export function recordExhibitView(tracker: StatsTracker): void {
  tracker.stats.exhibitsViewed++;
}

/**
 * Record a favorite added
 */
export function recordFavoriteAdded(tracker: StatsTracker): void {
  tracker.stats.favoritesAdded++;
}

/**
 * Record a tour started
 */
export function recordTourStarted(tracker: StatsTracker): void {
  tracker.stats.toursTaken++;
}

/**
 * Record a screenshot taken
 */
export function recordScreenshot(tracker: StatsTracker): void {
  tracker.stats.screenshotsTaken++;
}

/**
 * Record movement distance
 */
export function recordMovement(tracker: StatsTracker, x: number, z: number): void {
  if (tracker.lastPosition) {
    const dx = x - tracker.lastPosition.x;
    const dz = z - tracker.lastPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < 2) { // Ignore teleports
      tracker.stats.distanceWalked += distance;
    }
  }
  tracker.lastPosition = { x, z };
}

// ============================================================================
// Stats Display
// ============================================================================

/**
 * Get formatted stats for display
 */
export function getFormattedStats(tracker: StatsTracker): string {
  const stats = tracker.stats;
  return [
    `Visits: ${stats.sessionCount}`,
    `Time: ${formatTime(stats.totalTimeSpent)}`,
    `Viewed: ${stats.exhibitsViewed}`,
    `Walked: ${Math.round(stats.distanceWalked)}m`,
    `Photos: ${stats.screenshotsTaken}`,
    `Tours: ${stats.toursTaken}`,
  ].join(' | ');
}

/**
 * Format seconds as human-readable time
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load stats from localStorage
 */
function loadStats(): MuseumStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...createDefaultStats(), ...JSON.parse(saved) };
    }
  } catch {
    // localStorage may not be available
  }
  return createDefaultStats();
}

/**
 * Save stats to localStorage
 */
function saveStats(stats: MuseumStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose stats tracker
 */
export function disposeStatsTracker(tracker: StatsTracker): void {
  tracker.cleanup();
}
