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
  sharedViews: number; // Number of times shared a view
  distanceWalked: number; // Approximate distance in meters
  lastVisit: string; // ISO date of last visit
}

export interface StatsTracker {
  stats: MuseumStats;
  sessionStart: number;
  lastPosition: { x: number; z: number } | null;
  sessionExhibitsViewed: number; // Exhibits viewed this session (for speed run tracking)
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
    sharedViews: 0,
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
    sessionExhibitsViewed: 0,
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
 * Check if this is a returning visitor and get welcome message
 */
export function getWelcomeMessage(tracker: StatsTracker): string | null {
  const stats = tracker.stats;

  // First visit - no welcome back message
  if (stats.sessionCount <= 1) {
    return null;
  }

  // Calculate time since last visit
  const lastVisit = new Date(stats.lastVisit);
  const now = new Date();
  const hoursSince = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 1) {
    return null; // Too soon to welcome back
  }

  // Craft a welcome message
  const timeAgo = formatTimeAgo(hoursSince);
  return `Welcome back! Last visit: ${timeAgo}. Total time: ${formatTime(stats.totalTimeSpent)}`;
}

/**
 * Format hours ago as human-readable string
 */
function formatTimeAgo(hours: number): string {
  if (hours < 24) {
    const h = Math.round(hours);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  } else if (hours < 168) { // 7 days
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    const weeks = Math.round(hours / 168);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
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
  tracker.sessionExhibitsViewed++;
}

/**
 * Check if speed run achievement criteria met (10 exhibits in under 2 minutes)
 */
export function checkSpeedRun(tracker: StatsTracker): boolean {
  const elapsedMs = performance.now() - tracker.sessionStart;
  const twoMinutesMs = 2 * 60 * 1000;
  return tracker.sessionExhibitsViewed >= 10 && elapsedMs < twoMinutesMs;
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
 * Record a shared view
 */
export function recordSharedView(tracker: StatsTracker): void {
  tracker.stats.sharedViews++;
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

/**
 * Show stats popup
 */
export function showStatsPopup(tracker: StatsTracker, container: HTMLElement): void {
  // Remove existing popup
  const existing = document.getElementById('stats-popup');
  if (existing) {
    existing.remove();
    return;
  }

  // Update time spent before showing
  const now = performance.now();
  const sessionTime = (now - tracker.sessionStart) / 1000;
  const totalTime = tracker.stats.totalTimeSpent + sessionTime;

  const popup = document.createElement('div');
  popup.id = 'stats-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    padding: 25px;
    font-family: system-ui, sans-serif;
    color: white;
    z-index: 300;
    min-width: 280px;
    animation: stats-fade-in 0.2s ease-out;
  `;

  const stats = tracker.stats;

  popup.innerHTML = `
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: center;">
      Museum Statistics
    </div>
    <div style="display: grid; gap: 12px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Total Visits</span>
        <span style="font-weight: bold;">${stats.sessionCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Time in Museum</span>
        <span style="font-weight: bold;">${formatTime(totalTime)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Exhibits Viewed</span>
        <span style="font-weight: bold;">${stats.exhibitsViewed}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Distance Walked</span>
        <span style="font-weight: bold;">${Math.round(stats.distanceWalked)}m</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Favorites Added</span>
        <span style="font-weight: bold;">${stats.favoritesAdded}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Screenshots</span>
        <span style="font-weight: bold;">${stats.screenshotsTaken}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <span style="color: #888;">Tours Taken</span>
        <span style="font-weight: bold;">${stats.toursTaken}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #888;">Links Shared</span>
        <span style="font-weight: bold;">${stats.sharedViews}</span>
      </div>
    </div>
    <div style="color: #666; font-size: 11px; text-align: center; margin-top: 15px;">
      Press I or click outside to close
    </div>
    <style>
      @keyframes stats-fade-in {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    </style>
  `;

  container.appendChild(popup);

  // Close on outside click
  const closeHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);

  // Close on I key
  const keyHandler = (e: KeyboardEvent) => {
    if (e.code === 'KeyI' || e.code === 'Escape') {
      popup.remove();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);
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
