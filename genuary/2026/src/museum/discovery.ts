/**
 * Exhibit Discovery Tracker
 *
 * Tracks which exhibits the user has viewed and shows progress.
 */

// ============================================================================
// Types
// ============================================================================

export interface DiscoveryTracker {
  container: HTMLElement;
  badge: HTMLElement;
  viewedDays: Set<number>;
  totalDays: number;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const TOTAL_DAYS = 31;
const STORAGE_KEY = 'genuary-museum-discovered';

// ============================================================================
// Discovery Tracker Creation
// ============================================================================

/**
 * Create the discovery tracker badge
 */
export function createDiscoveryTracker(container: HTMLElement): DiscoveryTracker {
  // Load saved discoveries
  const viewedDays = loadDiscoveries();

  // Create badge
  const badge = document.createElement('div');
  badge.id = 'discovery-badge';
  badge.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #b0b0c0;
    padding: 8px 12px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    z-index: 100;
    cursor: pointer;
    transition: all 0.2s;
  `;
  badge.title = 'Exhibits discovered';

  container.appendChild(badge);

  const tracker: DiscoveryTracker = {
    container,
    badge,
    viewedDays,
    totalDays: TOTAL_DAYS,
    cleanup: () => badge.remove(),
  };

  // Update display
  updateDiscoveryBadge(tracker);

  // Show tooltip on hover
  badge.addEventListener('mouseenter', () => {
    badge.style.background = 'rgba(74, 158, 255, 0.3)';
    badge.style.color = '#4a9eff';
  });

  badge.addEventListener('mouseleave', () => {
    badge.style.background = 'rgba(0, 0, 0, 0.6)';
    badge.style.color = '#b0b0c0';
  });

  // Show details on click
  badge.addEventListener('click', () => {
    showDiscoveryDetails(tracker);
  });

  return tracker;
}

/**
 * Update the badge display
 */
function updateDiscoveryBadge(tracker: DiscoveryTracker): void {
  const count = tracker.viewedDays.size;
  const percent = Math.round((count / tracker.totalDays) * 100);

  // Choose icon based on progress
  let icon = '🔍';
  if (percent >= 100) icon = '🏆';
  else if (percent >= 75) icon = '⭐';
  else if (percent >= 50) icon = '🎨';
  else if (percent >= 25) icon = '👁️';

  tracker.badge.innerHTML = `${icon} ${count}/${tracker.totalDays}`;
}

/**
 * Show discovery details popup
 */
function showDiscoveryDetails(tracker: DiscoveryTracker): void {
  // Remove existing popup
  const existing = document.getElementById('discovery-popup');
  if (existing) {
    existing.remove();
    return;
  }

  const popup = document.createElement('div');
  popup.id = 'discovery-popup';
  popup.style.cssText = `
    position: absolute;
    bottom: 45px;
    right: 10px;
    width: 220px;
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #b0b0c0;
    z-index: 100;
  `;

  const count = tracker.viewedDays.size;
  const percent = Math.round((count / tracker.totalDays) * 100);

  // Create day grid
  let daysHtml = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 10px;">';
  for (let day = 1; day <= tracker.totalDays; day++) {
    const viewed = tracker.viewedDays.has(day);
    const style = viewed
      ? 'background: rgba(74, 158, 255, 0.5); color: white;'
      : 'background: rgba(60, 60, 70, 0.5); color: #666;';
    daysHtml += `<div style="
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 10px;
      ${style}
    ">${day}</div>`;
  }
  daysHtml += '</div>';

  popup.innerHTML = `
    <div style="font-weight: bold; color: white; margin-bottom: 8px;">
      Discovery Progress
    </div>
    <div style="margin-bottom: 8px;">
      <div style="
        height: 6px;
        background: rgba(60, 60, 70, 0.5);
        border-radius: 3px;
        overflow: hidden;
      ">
        <div style="
          width: ${percent}%;
          height: 100%;
          background: linear-gradient(90deg, #4a9eff, #a855f7);
          border-radius: 3px;
        "></div>
      </div>
    </div>
    <div style="font-size: 11px; color: #888;">
      ${count} of ${tracker.totalDays} exhibits viewed (${percent}%)
    </div>
    ${daysHtml}
  `;

  tracker.container.appendChild(popup);

  // Close on outside click
  const closeHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !tracker.badge.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

// ============================================================================
// Discovery Tracking
// ============================================================================

/**
 * Mark a day as discovered
 */
export function markDayDiscovered(tracker: DiscoveryTracker, dayNumber: number): void {
  if (dayNumber < 1 || dayNumber > tracker.totalDays) return;
  if (tracker.viewedDays.has(dayNumber)) return;

  tracker.viewedDays.add(dayNumber);
  saveDiscoveries(tracker.viewedDays);
  updateDiscoveryBadge(tracker);

  // Check for completion
  if (tracker.viewedDays.size === tracker.totalDays) {
    showCompletionMessage(tracker.container);
  }
}

/**
 * Show completion celebration
 */
function showCompletionMessage(container: HTMLElement): void {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 30, 0.95);
    border: 2px solid rgba(168, 85, 247, 0.5);
    border-radius: 16px;
    padding: 30px 40px;
    font-family: system-ui, sans-serif;
    color: white;
    text-align: center;
    z-index: 1001;
    animation: celebrationPop 0.5s ease-out;
  `;

  message.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
      Congratulations!
    </div>
    <div style="color: #b0b0c0;">
      You've discovered all 31 Genuary exhibits!
    </div>
    <button style="
      margin-top: 20px;
      padding: 10px 30px;
      background: linear-gradient(90deg, #4a9eff, #a855f7);
      border: none;
      border-radius: 20px;
      color: white;
      font-size: 14px;
      cursor: pointer;
    " onclick="this.parentElement.remove()">
      Amazing!
    </button>
    <style>
      @keyframes celebrationPop {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    </style>
  `;

  container.appendChild(message);
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load discovered days from localStorage
 */
function loadDiscoveries(): Set<number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch {
    // localStorage may not be available
  }
  return new Set();
}

/**
 * Save discovered days to localStorage
 */
function saveDiscoveries(days: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...days]));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose discovery tracker
 */
export function disposeDiscoveryTracker(tracker: DiscoveryTracker): void {
  tracker.cleanup();
}
