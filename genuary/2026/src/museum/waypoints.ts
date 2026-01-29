/**
 * Waypoints
 *
 * Quick teleport points for faster museum navigation.
 * Pre-defined and custom locations.
 */

// ============================================================================
// Types
// ============================================================================

export interface Waypoint {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isCustom: boolean;
}

export interface WaypointsSystem {
  container: HTMLElement;
  waypoints: Waypoint[];
  customWaypoints: Waypoint[];
  panel: HTMLElement | null;
  isOpen: boolean;
  onTeleport: ((waypoint: Waypoint) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-waypoints';

// Pre-defined waypoints
const DEFAULT_WAYPOINTS: Waypoint[] = [
  {
    id: 'entrance',
    name: 'Entrance',
    icon: '🚪',
    position: { x: 0, y: 1.7, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    isCustom: false,
  },
  {
    id: 'main_gallery',
    name: 'Main Gallery',
    icon: '🏛️',
    position: { x: 0, y: 1.7, z: -32 },
    rotation: { x: 0, y: 0, z: 0 },
    isCustom: false,
  },
  {
    id: 'east_wing',
    name: 'East Wing',
    icon: '🔵',
    position: { x: 15, y: 1.7, z: -32 },
    rotation: { x: 0, y: -1.57, z: 0 },
    isCustom: false,
  },
  {
    id: 'west_wing',
    name: 'West Wing',
    icon: '🟣',
    position: { x: -15, y: 1.7, z: -32 },
    rotation: { x: 0, y: 1.57, z: 0 },
    isCustom: false,
  },
  {
    id: 'north_wing',
    name: 'North Wing',
    icon: '🟢',
    position: { x: 0, y: 1.7, z: -55 },
    rotation: { x: 0, y: 0, z: 0 },
    isCustom: false,
  },
  {
    id: 'center_view',
    name: 'Scenic Center',
    icon: '📷',
    position: { x: 0, y: 3, z: -20 },
    rotation: { x: -0.2, y: 0, z: 0 },
    isCustom: false,
  },
];

// ============================================================================
// Waypoints System Creation
// ============================================================================

/**
 * Create the waypoints system
 */
export function createWaypointsSystem(container: HTMLElement): WaypointsSystem {
  const savedCustom = loadCustomWaypoints();

  const system: WaypointsSystem = {
    container,
    waypoints: [...DEFAULT_WAYPOINTS],
    customWaypoints: savedCustom,
    panel: null,
    isOpen: false,
    onTeleport: null,
    cleanup: () => {
      closeWaypoints(system);
    },
  };

  return system;
}

/**
 * Add custom waypoint
 */
export function addCustomWaypoint(
  system: WaypointsSystem,
  name: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number }
): Waypoint {
  const waypoint: Waypoint = {
    id: `custom_${Date.now()}`,
    name,
    icon: '📍',
    position,
    rotation,
    isCustom: true,
  };

  system.customWaypoints.push(waypoint);
  saveCustomWaypoints(system.customWaypoints);

  return waypoint;
}

/**
 * Remove custom waypoint
 */
export function removeCustomWaypoint(system: WaypointsSystem, id: string): boolean {
  const index = system.customWaypoints.findIndex(w => w.id === id);
  if (index === -1) return false;

  system.customWaypoints.splice(index, 1);
  saveCustomWaypoints(system.customWaypoints);

  return true;
}

/**
 * Get all waypoints (default + custom)
 */
export function getAllWaypoints(system: WaypointsSystem): Waypoint[] {
  return [...system.waypoints, ...system.customWaypoints];
}

/**
 * Open waypoints panel
 */
export function openWaypoints(system: WaypointsSystem): void {
  closeWaypoints(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'waypoints-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    max-height: 450px;
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

  const allWaypoints = getAllWaypoints(system);

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
          🗺️ Waypoints
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Quick teleport locations
        </div>
      </div>
      <button id="waypoints-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 10px;">
      <!-- Default waypoints -->
      <div style="font-size: 11px; color: #888; margin-bottom: 8px; padding: 0 5px;">
        Museum Locations
      </div>
      ${system.waypoints.map(wp => `
        <button class="waypoint-btn" data-id="${wp.id}" style="
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          background: rgba(100, 150, 255, 0.1);
          border: 1px solid transparent;
          border-radius: 8px;
          color: white;
          font-size: 12px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.2s;
          text-align: left;
        ">
          <span style="font-size: 20px;">${wp.icon}</span>
          <span>${wp.name}</span>
        </button>
      `).join('')}

      ${system.customWaypoints.length > 0 ? `
        <div style="font-size: 11px; color: #888; margin: 15px 0 8px; padding: 0 5px;">
          Custom Waypoints
        </div>
        ${system.customWaypoints.map(wp => `
          <div class="custom-waypoint" data-id="${wp.id}" style="
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            background: rgba(150, 100, 255, 0.1);
            border: 1px solid transparent;
            border-radius: 8px;
            margin-bottom: 6px;
          ">
            <button class="waypoint-btn" data-id="${wp.id}" style="
              flex: 1;
              display: flex;
              align-items: center;
              gap: 10px;
              background: none;
              border: none;
              color: white;
              font-size: 12px;
              cursor: pointer;
              text-align: left;
              padding: 0;
            ">
              <span style="font-size: 20px;">${wp.icon}</span>
              <span>${wp.name}</span>
            </button>
            <button class="waypoint-delete" data-id="${wp.id}" style="
              background: rgba(255, 100, 100, 0.2);
              border: none;
              border-radius: 4px;
              width: 24px;
              height: 24px;
              color: #ff6b6b;
              font-size: 14px;
              cursor: pointer;
            ">×</button>
          </div>
        `).join('')}
      ` : ''}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(100, 150, 255, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Press Ctrl+P to save current position as waypoint
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#waypoints-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeWaypoints(system);

  // Wire up waypoint buttons
  const waypointBtns = panel.querySelectorAll('.waypoint-btn');
  waypointBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const id = (btn as HTMLElement).dataset.id;
      const waypoint = allWaypoints.find(w => w.id === id);
      if (waypoint && system.onTeleport) {
        system.onTeleport(waypoint);
        closeWaypoints(system);
      }
    };

    // Parent might be the custom-waypoint div
    const parent = (btn as HTMLElement).parentElement;
    if (parent && !parent.classList.contains('custom-waypoint')) {
      (btn as HTMLElement).onmouseover = () => {
        (btn as HTMLElement).style.background = 'rgba(100, 150, 255, 0.2)';
        (btn as HTMLElement).style.borderColor = 'rgba(100, 150, 255, 0.3)';
      };
      (btn as HTMLElement).onmouseout = () => {
        (btn as HTMLElement).style.background = 'rgba(100, 150, 255, 0.1)';
        (btn as HTMLElement).style.borderColor = 'transparent';
      };
    }
  });

  // Wire up delete buttons
  const deleteBtns = panel.querySelectorAll('.waypoint-delete');
  deleteBtns.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id || '';
      removeCustomWaypoint(system, id);
      // Refresh panel
      closeWaypoints(system);
      openWaypoints(system);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeWaypoints(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close waypoints panel
 */
function closeWaypoints(system: WaypointsSystem): void {
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
 * Toggle waypoints panel
 */
export function toggleWaypoints(system: WaypointsSystem): void {
  if (system.isOpen) {
    closeWaypoints(system);
  } else {
    openWaypoints(system);
  }
}

/**
 * Teleport to waypoint by ID
 */
export function teleportToWaypoint(system: WaypointsSystem, id: string): boolean {
  const allWaypoints = getAllWaypoints(system);
  const waypoint = allWaypoints.find(w => w.id === id);

  if (!waypoint) return false;

  if (system.onTeleport) {
    system.onTeleport(waypoint);
  }

  return true;
}

// ============================================================================
// Persistence
// ============================================================================

function loadCustomWaypoints(): Waypoint[] {
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

function saveCustomWaypoints(waypoints: Waypoint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeWaypointsSystem(system: WaypointsSystem): void {
  system.cleanup();
}
