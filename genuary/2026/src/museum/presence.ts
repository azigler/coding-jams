/**
 * Virtual Presence
 *
 * Simulates other visitors in the museum to create
 * a sense of shared experience and community.
 */

// ============================================================================
// Types
// ============================================================================

export interface VirtualVisitor {
  id: string;
  name: string;
  emoji: string;
  currentDay: number;
  activity: 'viewing' | 'walking' | 'photographing' | 'idle';
  lastSeen: number;
}

export interface PresenceSystem {
  container: HTMLElement;
  visitors: VirtualVisitor[];
  indicator: HTMLElement | null;
  popup: HTMLElement | null;
  isPopupOpen: boolean;
  updateInterval: number | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const VISITOR_NAMES = [
  'ArtEnthusiast', 'PixelPioneer', 'CodeCreative', 'GenArtFan',
  'DigitalDreamer', 'AlgoArtist', 'VisualVoyager', 'PatternSeeker',
  'ColorCoder', 'AbstractThinker', 'FlowFieldFan', 'RecursiveRita',
  'FractalFred', 'NoiseNinja', 'ShaderSam', 'p5ProPablo',
];

const VISITOR_EMOJIS = ['🎨', '✨', '🔮', '🌟', '💫', '🦋', '🌸', '🍃', '🔥', '💜'];

const ACTIVITIES = ['viewing', 'walking', 'photographing', 'idle'] as const;

const MIN_VISITORS = 2;
const MAX_VISITORS = 8;

// ============================================================================
// Presence System Creation
// ============================================================================

/**
 * Create the presence system
 */
export function createPresenceSystem(container: HTMLElement): PresenceSystem {
  const system: PresenceSystem = {
    container,
    visitors: [],
    indicator: null,
    popup: null,
    isPopupOpen: false,
    updateInterval: null,
    cleanup: () => {
      if (system.updateInterval) {
        clearInterval(system.updateInterval);
        system.updateInterval = null;
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      closePresencePopup(system);
    },
  };

  // Initialize with some visitors
  initializeVisitors(system);

  // Create indicator
  createPresenceIndicator(system);

  // Start periodic updates
  system.updateInterval = setInterval(() => {
    updateVisitors(system);
    updateIndicator(system);
  }, 5000) as unknown as number;

  return system;
}

/**
 * Initialize virtual visitors
 */
function initializeVisitors(system: PresenceSystem): void {
  const count = MIN_VISITORS + Math.floor(Math.random() * (MAX_VISITORS - MIN_VISITORS));

  for (let i = 0; i < count; i++) {
    system.visitors.push(createRandomVisitor());
  }
}

/**
 * Create a random visitor
 */
function createRandomVisitor(): VirtualVisitor {
  return {
    id: `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: VISITOR_NAMES[Math.floor(Math.random() * VISITOR_NAMES.length)],
    emoji: VISITOR_EMOJIS[Math.floor(Math.random() * VISITOR_EMOJIS.length)],
    currentDay: Math.floor(Math.random() * 31) + 1,
    activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
    lastSeen: Date.now() - Math.floor(Math.random() * 300000), // Random time in last 5 min
  };
}

/**
 * Update visitors periodically
 */
function updateVisitors(system: PresenceSystem): void {
  // Randomly update activities and positions
  system.visitors.forEach(visitor => {
    if (Math.random() > 0.7) {
      visitor.activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    }
    if (Math.random() > 0.8) {
      visitor.currentDay = Math.floor(Math.random() * 31) + 1;
    }
    visitor.lastSeen = Date.now() - Math.floor(Math.random() * 60000);
  });

  // Randomly add/remove visitors
  if (Math.random() > 0.9 && system.visitors.length < MAX_VISITORS) {
    system.visitors.push(createRandomVisitor());
  }
  if (Math.random() > 0.95 && system.visitors.length > MIN_VISITORS) {
    system.visitors.pop();
  }
}

/**
 * Create the presence indicator
 */
function createPresenceIndicator(system: PresenceSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'presence-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 140px;
    right: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(100, 200, 150, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #a0d0b0;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  updateIndicatorContent(system, indicator);

  indicator.onclick = () => togglePresencePopup(system);

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 200, 150, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 200, 150, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update indicator content
 */
function updateIndicatorContent(system: PresenceSystem, indicator: HTMLElement): void {
  const count = system.visitors.length;
  indicator.innerHTML = `
    <span style="font-size: 12px;">👥</span>
    <span>${count} ${count === 1 ? 'visitor' : 'visitors'} here</span>
  `;
}

/**
 * Update indicator
 */
function updateIndicator(system: PresenceSystem): void {
  if (system.indicator) {
    updateIndicatorContent(system, system.indicator);
  }
}

/**
 * Toggle presence popup
 */
export function togglePresencePopup(system: PresenceSystem): void {
  if (system.isPopupOpen) {
    closePresencePopup(system);
  } else {
    openPresencePopup(system);
  }
}

/**
 * Open presence popup
 */
function openPresencePopup(system: PresenceSystem): void {
  if (system.popup) return;

  system.isPopupOpen = true;

  const popup = document.createElement('div');
  popup.id = 'presence-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 180px;
    right: 20px;
    width: 250px;
    max-height: 300px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 200, 150, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 12px 15px;
      border-bottom: 1px solid rgba(100, 200, 150, 0.2);
      font-size: 13px;
      font-weight: bold;
      color: white;
    ">
      Visitors in Museum
    </div>
    <div style="
      padding: 10px 15px;
      max-height: 220px;
      overflow-y: auto;
    ">
      ${system.visitors.map(visitor => `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(100, 200, 150, 0.1);
        ">
          <span style="font-size: 18px;">${visitor.emoji}</span>
          <div style="flex: 1;">
            <div style="font-size: 12px; color: white;">${visitor.name}</div>
            <div style="font-size: 10px; color: #888;">
              ${getActivityText(visitor)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="
      padding: 8px 15px;
      font-size: 10px;
      color: #666;
      text-align: center;
      border-top: 1px solid rgba(100, 200, 150, 0.1);
    ">
      Click outside to close
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Close on click outside
  const clickHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && e.target !== system.indicator) {
      closePresencePopup(system);
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Get activity description text
 */
function getActivityText(visitor: VirtualVisitor): string {
  switch (visitor.activity) {
    case 'viewing':
      return `Viewing Day ${visitor.currentDay}`;
    case 'walking':
      return 'Exploring the gallery';
    case 'photographing':
      return `Taking photos at Day ${visitor.currentDay}`;
    case 'idle':
      return 'In the lobby';
    default:
      return 'In the museum';
  }
}

/**
 * Close presence popup
 */
function closePresencePopup(system: PresenceSystem): void {
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

/**
 * Get current visitor count
 */
export function getVisitorCount(system: PresenceSystem): number {
  return system.visitors.length;
}

/**
 * Get visitors viewing a specific day
 */
export function getVisitorsAtDay(system: PresenceSystem, dayNumber: number): VirtualVisitor[] {
  return system.visitors.filter(v => v.currentDay === dayNumber && v.activity === 'viewing');
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePresenceSystem(system: PresenceSystem): void {
  system.cleanup();
}
