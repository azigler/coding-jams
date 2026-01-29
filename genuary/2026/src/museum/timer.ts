/**
 * Exhibition Timer
 *
 * Tracks time spent viewing each exhibit and provides
 * insights about viewing patterns.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExhibitTime {
  dayNumber: number;
  totalTime: number; // milliseconds
  viewCount: number;
  lastViewed: number;
}

export interface TimerInsight {
  type: 'longest' | 'most-visited' | 'quick-view' | 'thorough';
  message: string;
  dayNumber?: number;
}

export interface TimerSystem {
  container: HTMLElement;
  exhibitTimes: Map<number, ExhibitTime>;
  currentExhibit: number | null;
  viewStartTime: number;
  indicator: HTMLElement | null;
  popup: HTMLElement | null;
  isPopupOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-timer';

// ============================================================================
// Timer System Creation
// ============================================================================

/**
 * Create the exhibition timer system
 */
export function createTimerSystem(container: HTMLElement): TimerSystem {
  const saved = loadTimerData();

  const system: TimerSystem = {
    container,
    exhibitTimes: saved || new Map(),
    currentExhibit: null,
    viewStartTime: 0,
    indicator: null,
    popup: null,
    isPopupOpen: false,
    cleanup: () => {
      // Save any active viewing
      if (system.currentExhibit !== null) {
        endViewing(system);
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Create time indicator
  createTimerIndicator(system);

  // Toggle insights popup with Shift+T
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      if (system.isPopupOpen) {
        closeInsightsPopup(system);
      } else {
        openInsightsPopup(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return system;
}

/**
 * Create the timer indicator (shows while viewing)
 */
function createTimerIndicator(system: TimerSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'timer-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.2);
    border-radius: 15px;
    padding: 5px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #888;
    z-index: 400;
    display: none;
    gap: 6px;
    align-items: center;
  `;
  indicator.innerHTML = `
    <span style="color: #4a9eff;">⏱</span>
    <span id="timer-display">0:00</span>
  `;

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Start timing for an exhibit
 */
export function startViewing(system: TimerSystem, dayNumber: number): void {
  // End previous viewing if any
  if (system.currentExhibit !== null) {
    endViewing(system);
  }

  system.currentExhibit = dayNumber;
  system.viewStartTime = Date.now();

  // Show indicator
  if (system.indicator) {
    system.indicator.style.display = 'flex';
    updateTimerDisplay(system);
  }

  // Update display every second
  const interval = setInterval(() => {
    if (system.currentExhibit === dayNumber) {
      updateTimerDisplay(system);
    } else {
      clearInterval(interval);
    }
  }, 1000);

  // Store interval for cleanup
  if (system.indicator) {
    (system.indicator as unknown as Record<string, unknown>).interval = interval;
  }
}

/**
 * Update the timer display
 */
function updateTimerDisplay(system: TimerSystem): void {
  if (!system.indicator || system.currentExhibit === null) return;

  const elapsed = Math.floor((Date.now() - system.viewStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const display = document.getElementById('timer-display');
  if (display) {
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * End timing for current exhibit
 */
export function endViewing(system: TimerSystem): void {
  if (system.currentExhibit === null) return;

  const elapsed = Date.now() - system.viewStartTime;
  const dayNumber = system.currentExhibit;

  // Update exhibit time data
  const existing = system.exhibitTimes.get(dayNumber);
  if (existing) {
    existing.totalTime += elapsed;
    existing.viewCount += 1;
    existing.lastViewed = Date.now();
  } else {
    system.exhibitTimes.set(dayNumber, {
      dayNumber,
      totalTime: elapsed,
      viewCount: 1,
      lastViewed: Date.now(),
    });
  }

  // Save to storage
  saveTimerData(system);

  // Clear interval
  if (system.indicator) {
    const interval = (system.indicator as unknown as Record<string, unknown>).interval as number | undefined;
    if (interval) clearInterval(interval);
  }

  // Hide indicator
  if (system.indicator) {
    system.indicator.style.display = 'none';
  }

  system.currentExhibit = null;
  system.viewStartTime = 0;
}

/**
 * Get time spent on a specific exhibit
 */
export function getExhibitTime(system: TimerSystem, dayNumber: number): ExhibitTime | undefined {
  return system.exhibitTimes.get(dayNumber);
}

/**
 * Get total time spent in museum
 */
export function getTotalTime(system: TimerSystem): number {
  let total = 0;
  system.exhibitTimes.forEach(t => {
    total += t.totalTime;
  });
  return total;
}

/**
 * Generate viewing insights
 */
export function getInsights(system: TimerSystem): TimerInsight[] {
  const insights: TimerInsight[] = [];
  const times = Array.from(system.exhibitTimes.values());

  if (times.length === 0) return insights;

  // Longest viewed exhibit
  const longest = times.reduce((max, t) => t.totalTime > max.totalTime ? t : max);
  if (longest.totalTime > 30000) { // More than 30 seconds
    insights.push({
      type: 'longest',
      message: `Most time spent: Day ${longest.dayNumber} (${formatTime(longest.totalTime)})`,
      dayNumber: longest.dayNumber,
    });
  }

  // Most revisited
  const mostVisited = times.reduce((max, t) => t.viewCount > max.viewCount ? t : max);
  if (mostVisited.viewCount > 1) {
    insights.push({
      type: 'most-visited',
      message: `Most revisited: Day ${mostVisited.dayNumber} (${mostVisited.viewCount} times)`,
      dayNumber: mostVisited.dayNumber,
    });
  }

  // Average viewing time
  const avgTime = times.reduce((sum, t) => sum + t.totalTime, 0) / times.length;
  if (avgTime > 60000) { // More than 1 minute average
    insights.push({
      type: 'thorough',
      message: `Thorough viewer: ${formatTime(avgTime)} average per exhibit`,
    });
  } else if (avgTime < 10000) { // Less than 10 seconds average
    insights.push({
      type: 'quick-view',
      message: `Speed explorer: ${formatTime(avgTime)} average per exhibit`,
    });
  }

  return insights;
}

/**
 * Format milliseconds to readable time
 */
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Open the insights popup
 */
export function openInsightsPopup(system: TimerSystem): void {
  if (system.popup) return;

  system.isPopupOpen = true;

  const times = Array.from(system.exhibitTimes.values())
    .sort((a, b) => b.totalTime - a.totalTime);
  const insights = getInsights(system);
  const totalTime = getTotalTime(system);

  const popup = document.createElement('div');
  popup.id = 'timer-popup';
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 340px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        ⏱ Viewing Time
      </div>
      <button id="timer-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px; max-height: 400px; overflow-y: auto;">
      <!-- Total time -->
      <div style="
        text-align: center;
        padding: 15px;
        background: rgba(74, 158, 255, 0.1);
        border-radius: 8px;
        margin-bottom: 15px;
      ">
        <div style="font-size: 24px; color: #4a9eff; font-weight: bold;">
          ${formatTime(totalTime)}
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Total viewing time
        </div>
      </div>

      <!-- Insights -->
      ${insights.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase;">
            Insights
          </div>
          ${insights.map(insight => `
            <div style="
              padding: 8px 10px;
              background: rgba(40, 40, 60, 0.5);
              border-radius: 6px;
              margin-bottom: 6px;
              font-size: 12px;
            ">
              ${insight.message}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Time per exhibit -->
      <div>
        <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase;">
          Time per Exhibit
        </div>
        ${times.slice(0, 10).map(t => `
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid rgba(100, 150, 255, 0.1);
            font-size: 12px;
          ">
            <span>Day ${t.dayNumber}</span>
            <span style="color: #4a9eff;">${formatTime(t.totalTime)}</span>
          </div>
        `).join('')}
        ${times.length > 10 ? `
          <div style="text-align: center; padding: 8px; color: #888; font-size: 11px;">
            +${times.length - 10} more exhibits
          </div>
        ` : ''}
        ${times.length === 0 ? `
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            No exhibits viewed yet
          </div>
        ` : ''}
      </div>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('timer-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeInsightsPopup(system);
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeInsightsPopup(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the insights popup
 */
export function closeInsightsPopup(system: TimerSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isPopupOpen = false;
}

// ============================================================================
// Persistence
// ============================================================================

function loadTimerData(): Map<number, ExhibitTime> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as ExhibitTime[];
      return new Map(data.map(t => [t.dayNumber, t]));
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveTimerData(system: TimerSystem): void {
  try {
    const data = Array.from(system.exhibitTimes.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTimerSystem(system: TimerSystem): void {
  system.cleanup();
}
