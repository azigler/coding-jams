/**
 * Visit Streaks
 *
 * Track consecutive daily visits to encourage
 * regular engagement with the museum.
 */

// ============================================================================
// Types
// ============================================================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  totalVisits: number;
  visitDates: string[];
}

export interface StreaksSystem {
  container: HTMLElement;
  data: StreakData;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-streaks';

// ============================================================================
// Streaks System Creation
// ============================================================================

/**
 * Create the streaks system
 */
export function createStreaksSystem(container: HTMLElement): StreaksSystem {
  const saved = loadStreakData();

  const system: StreaksSystem = {
    container,
    data: saved,
    indicator: null,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Update streak for today's visit
  updateStreak(system);

  // Create indicator if streak > 1
  if (system.data.currentStreak > 0) {
    createIndicator(system);
  }

  return system;
}

/**
 * Update streak based on today's visit
 */
function updateStreak(system: StreaksSystem): void {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Already visited today
  if (system.data.lastVisitDate === today) {
    return;
  }

  // Check if this continues a streak
  if (system.data.lastVisitDate === yesterday) {
    // Continue streak
    system.data.currentStreak++;
  } else if (system.data.lastVisitDate !== today) {
    // Start new streak
    system.data.currentStreak = 1;
  }

  // Update longest
  if (system.data.currentStreak > system.data.longestStreak) {
    system.data.longestStreak = system.data.currentStreak;
  }

  // Update visit data
  system.data.lastVisitDate = today;
  system.data.totalVisits++;

  // Track visit dates (last 30)
  if (!system.data.visitDates.includes(today)) {
    system.data.visitDates.push(today);
    if (system.data.visitDates.length > 30) {
      system.data.visitDates.shift();
    }
  }

  saveStreakData(system.data);
}

/**
 * Create streak indicator
 */
function createIndicator(system: StreaksSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'streak-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 60px;
    left: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(255, 200, 100, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #ffc864;
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 6px;
    animation: streak-pulse 2s ease-in-out infinite;
  `;

  const fireEmoji = system.data.currentStreak >= 7 ? '🔥🔥' :
                    system.data.currentStreak >= 3 ? '🔥' : '✨';

  indicator.innerHTML = `
    <span style="font-size: 14px;">${fireEmoji}</span>
    <span>${system.data.currentStreak} day streak!</span>
  `;

  // Add animation
  if (!document.getElementById('streak-animation')) {
    const style = document.createElement('style');
    style.id = 'streak-animation';
    style.textContent = `
      @keyframes streak-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  system.container.appendChild(indicator);
  system.indicator = indicator;

  // Show celebration for milestones
  if (system.data.currentStreak === 7) {
    showStreakCelebration(system, 'Week streak! 🎉');
  } else if (system.data.currentStreak === 30) {
    showStreakCelebration(system, 'Month streak! 🏆');
  }
}

/**
 * Show streak celebration
 */
function showStreakCelebration(system: StreaksSystem, message: string): void {
  const celebration = document.createElement('div');
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 200, 100, 0.9);
    color: #1a1a2e;
    padding: 20px 40px;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    animation: celebration-pop 2s ease-out forwards;
  `;
  celebration.textContent = message;

  // Add animation
  if (!document.getElementById('celebration-animation')) {
    const style = document.createElement('style');
    style.id = 'celebration-animation';
    style.textContent = `
      @keyframes celebration-pop {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        40% { transform: translate(-50%, -50%) scale(1); }
        80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  system.container.appendChild(celebration);
  setTimeout(() => celebration.remove(), 2000);
}

/**
 * Get streak data
 */
export function getStreakData(system: StreaksSystem): StreakData {
  return { ...system.data };
}

/**
 * Check if visited today
 */
export function visitedToday(system: StreaksSystem): boolean {
  return system.data.lastVisitDate === new Date().toDateString();
}

// ============================================================================
// Persistence
// ============================================================================

function loadStreakData(): StreakData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: '',
    totalVisits: 0,
    visitDates: [],
  };
}

function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeStreaksSystem(system: StreaksSystem): void {
  system.cleanup();
}
