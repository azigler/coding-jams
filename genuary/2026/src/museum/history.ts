/**
 * Viewing History
 *
 * Shows a timeline of exhibits visited during the current session.
 * Allows quick navigation back to previously viewed exhibits.
 */

// ============================================================================
// Types
// ============================================================================

export interface HistoryEntry {
  dayNumber: number;
  timestamp: number;
  viewDuration?: number;
}

export interface HistorySystem {
  container: HTMLElement;
  entries: HistoryEntry[];
  popup: HTMLElement | null;
  indicator: HTMLElement | null;
  isOpen: boolean;
  currentViewStart: number | null;
  currentViewDay: number | null;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_HISTORY_SIZE = 50;

// ============================================================================
// History System Creation
// ============================================================================

/**
 * Create the history system
 */
export function createHistorySystem(container: HTMLElement): HistorySystem {
  const system: HistorySystem = {
    container,
    entries: [],
    popup: null,
    indicator: null,
    isOpen: false,
    currentViewStart: null,
    currentViewDay: null,
    onNavigate: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator
  createHistoryIndicator(system);

  // Toggle with Shift+Y (for historY)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyY' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeHistory(system);
      } else {
        openHistory(system);
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
 * Create the history indicator
 */
function createHistoryIndicator(system: HistorySystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'history-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 80px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #888;
    cursor: pointer;
    z-index: 400;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  indicator.innerHTML = `
    <span>📜</span>
    <span id="history-count">0</span>
  `;
  indicator.title = 'Click or Shift+Y to view history';

  indicator.onclick = () => {
    if (system.isOpen) {
      closeHistory(system);
    } else {
      openHistory(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 150, 255, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 150, 255, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update the history indicator count
 */
function updateIndicator(system: HistorySystem): void {
  const countEl = document.getElementById('history-count');
  if (countEl) {
    countEl.textContent = system.entries.length.toString();
  }
}

/**
 * Record viewing an exhibit
 */
export function recordHistoryView(system: HistorySystem, dayNumber: number): void {
  // Finalize previous view if any
  if (system.currentViewDay !== null && system.currentViewStart !== null) {
    const lastEntry = system.entries.find(e => e.dayNumber === system.currentViewDay);
    if (lastEntry) {
      lastEntry.viewDuration = Date.now() - system.currentViewStart;
    }
  }

  // Check if this is a repeat of the most recent entry
  if (system.entries.length > 0 && system.entries[0].dayNumber === dayNumber) {
    // Update timestamp instead of adding duplicate
    system.entries[0].timestamp = Date.now();
  } else {
    // Add new entry
    const entry: HistoryEntry = {
      dayNumber,
      timestamp: Date.now(),
    };
    system.entries.unshift(entry);

    // Trim to max size
    if (system.entries.length > MAX_HISTORY_SIZE) {
      system.entries = system.entries.slice(0, MAX_HISTORY_SIZE);
    }
  }

  system.currentViewStart = Date.now();
  system.currentViewDay = dayNumber;

  updateIndicator(system);
}

/**
 * Record leaving an exhibit
 */
export function recordHistoryExit(system: HistorySystem): void {
  if (system.currentViewDay !== null && system.currentViewStart !== null) {
    const lastEntry = system.entries.find(e => e.dayNumber === system.currentViewDay);
    if (lastEntry) {
      lastEntry.viewDuration = Date.now() - system.currentViewStart;
    }
  }

  system.currentViewStart = null;
  system.currentViewDay = null;
}

/**
 * Open the history popup
 */
export function openHistory(system: HistorySystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'history-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    width: 300px;
    max-height: 400px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
        📜 Viewing History
      </div>
      <button id="history-close" style="
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

    <div id="history-list" style="
      flex: 1;
      overflow-y: auto;
      padding: 10px 15px;
    ">
      ${system.entries.length === 0 ? `
        <div style="
          text-align: center;
          padding: 30px 15px;
          color: #666;
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">📜</div>
          <div style="font-size: 12px;">No exhibits viewed yet.</div>
          <div style="font-size: 11px; margin-top: 5px; color: #555;">
            Click on exhibits to build your journey.
          </div>
        </div>
      ` : system.entries.map((entry, index) => `
        <div class="history-entry" data-day="${entry.dayNumber}" style="
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 6px;
          background: rgba(40, 40, 60, 0.5);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          ${index === 0 ? 'border-left: 3px solid #4a9eff;' : ''}
        ">
          <div style="
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #4a9eff, #a855f7);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: white;
            margin-right: 12px;
          ">${entry.dayNumber}</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: white;">Day ${entry.dayNumber}</div>
            <div style="font-size: 10px; color: #666; margin-top: 2px;">
              ${formatTime(entry.timestamp)}${entry.viewDuration ? ` · ${formatDuration(entry.viewDuration)}` : ''}
            </div>
          </div>
          ${index === 0 ? '<span style="font-size: 10px; color: #4a9eff;">Current</span>' : ''}
        </div>
      `).join('')}
    </div>

    ${system.entries.length > 0 ? `
      <div style="
        padding: 10px 15px;
        border-top: 1px solid rgba(100, 150, 255, 0.2);
        font-size: 10px;
        color: #666;
        text-align: center;
      ">
        Click an entry to revisit
      </div>
    ` : ''}
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';
  });

  // Wire up interactions
  setTimeout(() => {
    const closeBtn = document.getElementById('history-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeHistory(system);
    }

    const entries = popup.querySelectorAll('.history-entry');
    entries.forEach(entry => {
      (entry as HTMLElement).onmouseover = () => {
        (entry as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
      };
      (entry as HTMLElement).onmouseout = () => {
        (entry as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      };
      (entry as HTMLElement).onclick = () => {
        const day = parseInt((entry as HTMLElement).dataset.day || '0', 10);
        if (day > 0 && system.onNavigate) {
          system.onNavigate(day);
          closeHistory(system);
        }
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeHistory(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Close on click outside
  setTimeout(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && e.target !== system.indicator) {
        closeHistory(system);
        document.removeEventListener('click', clickHandler);
      }
    };
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Close the history popup
 */
export function closeHistory(system: HistorySystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  system.popup.style.transform = 'translateY(10px)';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Get history entries
 */
export function getHistoryEntries(system: HistorySystem): HistoryEntry[] {
  return [...system.entries];
}

/**
 * Clear history
 */
export function clearHistory(system: HistorySystem): void {
  system.entries = [];
  updateIndicator(system);
}

// ============================================================================
// Helpers
// ============================================================================

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s viewed`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s viewed`;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeHistorySystem(system: HistorySystem): void {
  system.cleanup();
}
