/**
 * Timeline
 *
 * Visual timeline of museum visits and activities.
 * See your journey through time.
 */

// ============================================================================
// Types
// ============================================================================

export interface TimelineEvent {
  timestamp: number;
  type: 'visit' | 'favorite' | 'screenshot' | 'achievement' | 'session_start' | 'session_end';
  dayNumber?: number;
  details?: string;
}

export interface TimelineSystem {
  container: HTMLElement;
  events: TimelineEvent[];
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-timeline';
const MAX_EVENTS = 500;

// ============================================================================
// Timeline System Creation
// ============================================================================

/**
 * Create the timeline system
 */
export function createTimelineSystem(container: HTMLElement): TimelineSystem {
  const system: TimelineSystem = {
    container,
    events: loadEvents(),
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeTimelinePanel(system);
    },
  };

  // Record session start
  addTimelineEvent(system, { type: 'session_start' });

  return system;
}

/**
 * Add event to timeline
 */
export function addTimelineEvent(
  system: TimelineSystem,
  event: Omit<TimelineEvent, 'timestamp'>
): void {
  const fullEvent: TimelineEvent = {
    ...event,
    timestamp: Date.now(),
  };

  system.events.push(fullEvent);

  // Trim if too long
  if (system.events.length > MAX_EVENTS) {
    system.events = system.events.slice(-MAX_EVENTS);
  }

  saveEvents(system.events);
}

/**
 * Record exhibit visit
 */
export function recordTimelineVisit(system: TimelineSystem, dayNumber: number): void {
  addTimelineEvent(system, { type: 'visit', dayNumber });
}

/**
 * Record favorite toggle
 */
export function recordTimelineFavorite(system: TimelineSystem, dayNumber: number): void {
  addTimelineEvent(system, { type: 'favorite', dayNumber });
}

/**
 * Record screenshot
 */
export function recordTimelineScreenshot(system: TimelineSystem, dayNumber: number): void {
  addTimelineEvent(system, { type: 'screenshot', dayNumber });
}

/**
 * Record achievement
 */
export function recordTimelineAchievement(system: TimelineSystem, achievement: string): void {
  addTimelineEvent(system, { type: 'achievement', details: achievement });
}

/**
 * Open timeline panel
 */
export function openTimelinePanel(system: TimelineSystem): void {
  closeTimelinePanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'timeline-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    max-height: 600px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
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

  // Group events by day
  const groupedEvents = groupEventsByDay(system.events);
  const dayKeys = Object.keys(groupedEvents).sort().reverse();

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          📅 Your Timeline
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${system.events.length} events recorded
        </div>
      </div>
      <button id="timeline-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${dayKeys.length === 0 ? `
        <div style="text-align: center; color: #666; padding: 30px;">
          No events yet. Start exploring!
        </div>
      ` : dayKeys.map(dayKey => {
        const events = groupedEvents[dayKey];
        const date = new Date(dayKey);
        const isToday = isDateToday(date);
        const dateLabel = isToday ? 'Today' : formatDate(date);

        return `
          <div style="margin-bottom: 20px;">
            <div style="
              font-size: 12px;
              color: #64a0ff;
              font-weight: bold;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span>${isToday ? '🔵' : '⚪'}</span>
              ${dateLabel}
            </div>
            <div style="
              border-left: 2px solid rgba(100, 150, 255, 0.3);
              padding-left: 15px;
              margin-left: 6px;
            ">
              ${events.map(event => renderTimelineEvent(event)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(100, 150, 255, 0.1);
      display: flex;
      gap: 10px;
    ">
      <button id="timeline-clear" style="
        flex: 1;
        padding: 10px;
        background: rgba(255, 100, 100, 0.2);
        border: 1px solid rgba(255, 100, 100, 0.3);
        border-radius: 8px;
        color: #ff8080;
        font-size: 11px;
        cursor: pointer;
      ">Clear History</button>
      <button id="timeline-export" style="
        flex: 1;
        padding: 10px;
        background: rgba(100, 150, 255, 0.2);
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 8px;
        color: #64a0ff;
        font-size: 11px;
        cursor: pointer;
      ">Export JSON</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#timeline-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeTimelinePanel(system);

  // Wire up clear
  const clearBtn = panel.querySelector('#timeline-clear') as HTMLButtonElement;
  clearBtn.onclick = () => {
    if (confirm('Clear all timeline history?')) {
      system.events = [];
      saveEvents(system.events);
      closeTimelinePanel(system);
      openTimelinePanel(system);
    }
  };

  // Wire up export
  const exportBtn = panel.querySelector('#timeline-export') as HTMLButtonElement;
  exportBtn.onclick = () => exportTimeline(system);

  // Wire up visit links
  const visitLinks = panel.querySelectorAll('.timeline-visit-link');
  visitLinks.forEach(link => {
    (link as HTMLElement).onclick = () => {
      const dayNumber = parseInt((link as HTMLElement).dataset.day || '0', 10);
      if (dayNumber && system.onNavigate) {
        closeTimelinePanel(system);
        system.onNavigate(dayNumber);
      }
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTimelinePanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Render a single timeline event
 */
function renderTimelineEvent(event: TimelineEvent): string {
  const time = formatTime(new Date(event.timestamp));
  let icon = '•';
  let label = '';
  let linkAttr = '';

  switch (event.type) {
    case 'visit':
      icon = '👁️';
      label = `Visited Day ${event.dayNumber}`;
      linkAttr = `class="timeline-visit-link" data-day="${event.dayNumber}" style="cursor: pointer; text-decoration: underline;"`;
      break;
    case 'favorite':
      icon = '❤️';
      label = `Favorited Day ${event.dayNumber}`;
      linkAttr = `class="timeline-visit-link" data-day="${event.dayNumber}" style="cursor: pointer; text-decoration: underline;"`;
      break;
    case 'screenshot':
      icon = '📸';
      label = `Screenshot of Day ${event.dayNumber}`;
      break;
    case 'achievement':
      icon = '🏆';
      label = `Achievement: ${event.details}`;
      break;
    case 'session_start':
      icon = '🚪';
      label = 'Entered museum';
      break;
    case 'session_end':
      icon = '👋';
      label = 'Left museum';
      break;
  }

  return `
    <div style="
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
      position: relative;
    ">
      <div style="
        position: absolute;
        left: -21px;
        width: 10px;
        height: 10px;
        background: rgba(100, 150, 255, 0.5);
        border-radius: 50%;
        top: 4px;
      "></div>
      <span style="font-size: 14px;">${icon}</span>
      <div>
        <div style="font-size: 12px; color: #e0e0e0;" ${linkAttr}>${label}</div>
        <div style="font-size: 10px; color: #666;">${time}</div>
      </div>
    </div>
  `;
}

/**
 * Close timeline panel
 */
function closeTimelinePanel(system: TimelineSystem): void {
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
 * Toggle timeline panel
 */
export function toggleTimelinePanel(system: TimelineSystem): void {
  if (system.isOpen) {
    closeTimelinePanel(system);
  } else {
    openTimelinePanel(system);
  }
}

/**
 * Export timeline as JSON
 */
function exportTimeline(system: TimelineSystem): void {
  const data = {
    exported: new Date().toISOString(),
    events: system.events,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `museum-timeline-${formatDateForFile(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get timeline stats
 */
export function getTimelineStats(system: TimelineSystem): {
  totalVisits: number;
  totalFavorites: number;
  totalScreenshots: number;
  totalAchievements: number;
  firstEvent: Date | null;
  lastEvent: Date | null;
} {
  const visits = system.events.filter(e => e.type === 'visit').length;
  const favorites = system.events.filter(e => e.type === 'favorite').length;
  const screenshots = system.events.filter(e => e.type === 'screenshot').length;
  const achievements = system.events.filter(e => e.type === 'achievement').length;

  return {
    totalVisits: visits,
    totalFavorites: favorites,
    totalScreenshots: screenshots,
    totalAchievements: achievements,
    firstEvent: system.events.length > 0 ? new Date(system.events[0].timestamp) : null,
    lastEvent: system.events.length > 0 ? new Date(system.events[system.events.length - 1].timestamp) : null,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function groupEventsByDay(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  const groups: Record<string, TimelineEvent[]> = {};

  events.forEach(event => {
    const date = new Date(event.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
  });

  // Sort events within each day (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  });

  return groups;
}

function isDateToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateForFile(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

// ============================================================================
// Persistence
// ============================================================================

function loadEvents(): TimelineEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveEvents(events: TimelineEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTimelineSystem(system: TimelineSystem): void {
  // Record session end
  addTimelineEvent(system, { type: 'session_end' });
  system.cleanup();
}
