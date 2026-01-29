/**
 * Visit Log
 *
 * Detailed log of the visitor's museum session,
 * tracking every action and discovery.
 */

// ============================================================================
// Types
// ============================================================================

export interface LogEntry {
  timestamp: number;
  type: 'arrival' | 'exhibit' | 'favorite' | 'screenshot' | 'achievement' | 'milestone';
  message: string;
  dayNumber?: number;
}

export interface VisitLogSystem {
  container: HTMLElement;
  entries: LogEntry[];
  panel: HTMLElement | null;
  isOpen: boolean;
  sessionStart: number;
  cleanup: () => void;
}

// ============================================================================
// Visit Log System Creation
// ============================================================================

/**
 * Create the visit log system
 */
export function createVisitLogSystem(container: HTMLElement): VisitLogSystem {
  const system: VisitLogSystem = {
    container,
    entries: [],
    panel: null,
    isOpen: false,
    sessionStart: Date.now(),
    cleanup: () => {
      closeVisitLog(system);
    },
  };

  // Add arrival entry
  addLogEntry(system, 'arrival', 'Entered the museum');

  return system;
}

/**
 * Add a log entry
 */
export function addLogEntry(
  system: VisitLogSystem,
  type: LogEntry['type'],
  message: string,
  dayNumber?: number
): void {
  system.entries.push({
    timestamp: Date.now(),
    type,
    message,
    dayNumber,
  });
}

/**
 * Log exhibit view
 */
export function logExhibitView(system: VisitLogSystem, dayNumber: number): void {
  addLogEntry(system, 'exhibit', `Viewed Day ${dayNumber}`, dayNumber);
}

/**
 * Log favorite added
 */
export function logFavorite(system: VisitLogSystem, dayNumber: number): void {
  addLogEntry(system, 'favorite', `Added Day ${dayNumber} to favorites`, dayNumber);
}

/**
 * Log screenshot taken
 */
export function logScreenshot(system: VisitLogSystem, dayNumber?: number): void {
  const msg = dayNumber
    ? `Captured screenshot of Day ${dayNumber}`
    : 'Captured screenshot';
  addLogEntry(system, 'screenshot', msg, dayNumber);
}

/**
 * Log achievement unlocked
 */
export function logAchievement(system: VisitLogSystem, name: string): void {
  addLogEntry(system, 'achievement', `Unlocked: ${name}`);
}

/**
 * Log milestone
 */
export function logMilestone(system: VisitLogSystem, message: string): void {
  addLogEntry(system, 'milestone', message);
}

/**
 * Show the visit log panel
 */
export function showVisitLog(system: VisitLogSystem): void {
  closeVisitLog(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'visitlog-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(150, 100, 200, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const sessionDuration = Math.floor((Date.now() - system.sessionStart) / 1000 / 60);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(150, 100, 200, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          Visit Log
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Session: ${sessionDuration} min · ${system.entries.length} events
        </div>
      </div>
      <button id="visitlog-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="
      flex: 1;
      overflow-y: auto;
      padding: 10px 20px;
    ">
      ${system.entries.slice().reverse().map(entry => `
        <div style="
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(150, 100, 200, 0.1);
        ">
          <div style="font-size: 16px;">${getEntryIcon(entry.type)}</div>
          <div style="flex: 1;">
            <div style="font-size: 12px; color: white;">${entry.message}</div>
            <div style="font-size: 10px; color: #666; margin-top: 2px;">
              ${formatTime(entry.timestamp - system.sessionStart)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="
      padding: 12px 20px;
      border-top: 1px solid rgba(150, 100, 200, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Press Escape to close
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#visitlog-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeVisitLog(system);

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeVisitLog(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Get icon for entry type
 */
function getEntryIcon(type: LogEntry['type']): string {
  switch (type) {
    case 'arrival': return '🚪';
    case 'exhibit': return '🖼️';
    case 'favorite': return '❤️';
    case 'screenshot': return '📸';
    case 'achievement': return '🏆';
    case 'milestone': return '⭐';
    default: return '📝';
  }
}

/**
 * Format time since session start
 */
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `+${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Close the visit log
 */
export function closeVisitLog(system: VisitLogSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Toggle visit log
 */
export function toggleVisitLog(system: VisitLogSystem): void {
  if (system.isOpen) {
    closeVisitLog(system);
  } else {
    showVisitLog(system);
  }
}

/**
 * Get entry count
 */
export function getLogEntryCount(system: VisitLogSystem): number {
  return system.entries.length;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeVisitLogSystem(system: VisitLogSystem): void {
  system.cleanup();
}
