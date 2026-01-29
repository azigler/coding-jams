/**
 * Memory Lane
 *
 * Revisit memorable moments from past museum visits.
 * Captures screenshots automatically at key moments.
 */

// ============================================================================
// Types
// ============================================================================

export interface Memory {
  id: string;
  timestamp: number;
  dayNumber: number;
  type: 'first_view' | 'favorite' | 'long_viewing' | 'screenshot';
  caption: string;
  thumbnail?: string;
}

export interface MemoryLaneSystem {
  container: HTMLElement;
  memories: Memory[];
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-memories';
const MAX_MEMORIES = 50;

// ============================================================================
// Memory Lane System Creation
// ============================================================================

/**
 * Create the memory lane system
 */
export function createMemoryLaneSystem(container: HTMLElement): MemoryLaneSystem {
  const saved = loadMemories();

  const system: MemoryLaneSystem = {
    container,
    memories: saved,
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeMemoryLane(system);
    },
  };

  return system;
}

/**
 * Record a memory
 */
export function recordMemory(
  system: MemoryLaneSystem,
  dayNumber: number,
  type: Memory['type'],
  caption: string,
  thumbnail?: string
): void {
  // Don't record duplicate memories for same day/type
  const exists = system.memories.some(
    m => m.dayNumber === dayNumber && m.type === type
  );
  if (exists && type !== 'screenshot') return;

  const memory: Memory = {
    id: generateId(),
    timestamp: Date.now(),
    dayNumber,
    type,
    caption,
    thumbnail,
  };

  system.memories.unshift(memory);

  // Limit memories
  if (system.memories.length > MAX_MEMORIES) {
    system.memories = system.memories.slice(0, MAX_MEMORIES);
  }

  saveMemories(system.memories);
}

/**
 * Record first view of an exhibit
 */
export function recordFirstView(system: MemoryLaneSystem, dayNumber: number): void {
  recordMemory(system, dayNumber, 'first_view', `First discovered Day ${dayNumber}`);
}

/**
 * Record adding to favorites
 */
export function recordFavoriteMemory(system: MemoryLaneSystem, dayNumber: number): void {
  recordMemory(system, dayNumber, 'favorite', `Added Day ${dayNumber} to favorites ❤️`);
}

/**
 * Record long viewing session
 */
export function recordLongViewing(system: MemoryLaneSystem, dayNumber: number, minutes: number): void {
  recordMemory(system, dayNumber, 'long_viewing', `Spent ${minutes} minutes with Day ${dayNumber}`);
}

/**
 * Record screenshot taken
 */
export function recordScreenshotMemory(system: MemoryLaneSystem, dayNumber: number): void {
  recordMemory(system, dayNumber, 'screenshot', `Captured Day ${dayNumber} 📸`);
}

/**
 * Open memory lane panel
 */
export function openMemoryLane(system: MemoryLaneSystem): void {
  closeMemoryLane(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'memory-lane-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 150, 0.3);
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

  const groupedByDate = groupMemoriesByDate(system.memories);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 200, 150, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          📷 Memory Lane
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${system.memories.length} memories
        </div>
      </div>
      <button id="memory-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${system.memories.length === 0 ? `
        <div style="
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-size: 12px;
        ">
          <div style="font-size: 40px; margin-bottom: 15px;">📷</div>
          Your memories will appear here as you explore.<br>
          Discover exhibits, take screenshots, and add favorites!
        </div>
      ` : Object.entries(groupedByDate).map(([date, memories]) => `
        <div style="margin-bottom: 20px;">
          <div style="
            font-size: 11px;
            color: #888;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 200, 150, 0.1);
          ">${date}</div>
          ${memories.map(memory => `
            <div class="memory-item" data-day="${memory.dayNumber}" style="
              display: flex;
              gap: 12px;
              padding: 10px;
              background: rgba(255, 200, 150, 0.08);
              border-radius: 8px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <div style="font-size: 20px;">${getMemoryIcon(memory.type)}</div>
              <div style="flex: 1;">
                <div style="font-size: 12px; color: white;">${memory.caption}</div>
                <div style="font-size: 10px; color: #666; margin-top: 4px;">
                  ${formatTime(memory.timestamp)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#memory-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeMemoryLane(system);

  // Wire up memory clicks
  const items = panel.querySelectorAll('.memory-item');
  items.forEach(item => {
    (item as HTMLElement).onclick = () => {
      const dayNumber = parseInt((item as HTMLElement).dataset.day || '0');
      if (dayNumber > 0 && system.onNavigate) {
        system.onNavigate(dayNumber);
        closeMemoryLane(system);
      }
    };

    (item as HTMLElement).onmouseover = () => {
      (item as HTMLElement).style.background = 'rgba(255, 200, 150, 0.15)';
    };
    (item as HTMLElement).onmouseout = () => {
      (item as HTMLElement).style.background = 'rgba(255, 200, 150, 0.08)';
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMemoryLane(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close memory lane
 */
function closeMemoryLane(system: MemoryLaneSystem): void {
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
 * Toggle memory lane
 */
export function toggleMemoryLane(system: MemoryLaneSystem): void {
  if (system.isOpen) {
    closeMemoryLane(system);
  } else {
    openMemoryLane(system);
  }
}

/**
 * Get memory icon by type
 */
function getMemoryIcon(type: Memory['type']): string {
  switch (type) {
    case 'first_view': return '✨';
    case 'favorite': return '❤️';
    case 'long_viewing': return '⏱️';
    case 'screenshot': return '📸';
    default: return '📝';
  }
}

/**
 * Group memories by date
 */
function groupMemoriesByDate(memories: Memory[]): Record<string, Memory[]> {
  const groups: Record<string, Memory[]> = {};

  memories.forEach(memory => {
    const date = new Date(memory.timestamp);
    const key = formatDate(date);

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(memory);
  });

  return groups;
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format time
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ============================================================================
// Persistence
// ============================================================================

function loadMemories(): Memory[] {
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

function saveMemories(memories: Memory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeMemoryLaneSystem(system: MemoryLaneSystem): void {
  system.cleanup();
}
