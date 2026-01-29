/**
 * Floor Plan Viewer
 *
 * Shows a bird's-eye view of the museum layout
 * with exhibit locations and visited status.
 */

// ============================================================================
// Types
// ============================================================================

export interface FloorPlanSystem {
  container: HTMLElement;
  panel: HTMLElement | null;
  canvas: HTMLCanvasElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

interface ExhibitMarker {
  dayNumber: number;
  x: number; // Normalized 0-1
  y: number;
  wing: string;
}

// ============================================================================
// Constants
// ============================================================================

// Museum layout: normalized coordinates for each exhibit
const EXHIBIT_POSITIONS: ExhibitMarker[] = [
  // Main Gallery (center)
  { dayNumber: 1, x: 0.35, y: 0.45, wing: 'main' },
  { dayNumber: 2, x: 0.45, y: 0.45, wing: 'main' },
  { dayNumber: 3, x: 0.55, y: 0.45, wing: 'main' },
  { dayNumber: 4, x: 0.65, y: 0.45, wing: 'main' },
  { dayNumber: 5, x: 0.35, y: 0.55, wing: 'main' },
  { dayNumber: 6, x: 0.45, y: 0.55, wing: 'main' },
  { dayNumber: 7, x: 0.55, y: 0.55, wing: 'main' },
  { dayNumber: 8, x: 0.65, y: 0.55, wing: 'main' },

  // West Wing
  { dayNumber: 9, x: 0.15, y: 0.35, wing: 'west' },
  { dayNumber: 10, x: 0.15, y: 0.45, wing: 'west' },
  { dayNumber: 11, x: 0.15, y: 0.55, wing: 'west' },
  { dayNumber: 12, x: 0.15, y: 0.65, wing: 'west' },
  { dayNumber: 13, x: 0.25, y: 0.35, wing: 'west' },
  { dayNumber: 14, x: 0.25, y: 0.45, wing: 'west' },
  { dayNumber: 15, x: 0.25, y: 0.55, wing: 'west' },

  // East Wing
  { dayNumber: 16, x: 0.75, y: 0.35, wing: 'east' },
  { dayNumber: 17, x: 0.75, y: 0.45, wing: 'east' },
  { dayNumber: 18, x: 0.75, y: 0.55, wing: 'east' },
  { dayNumber: 19, x: 0.75, y: 0.65, wing: 'east' },
  { dayNumber: 20, x: 0.85, y: 0.35, wing: 'east' },
  { dayNumber: 21, x: 0.85, y: 0.45, wing: 'east' },
  { dayNumber: 22, x: 0.85, y: 0.55, wing: 'east' },

  // North Wing
  { dayNumber: 23, x: 0.35, y: 0.15, wing: 'north' },
  { dayNumber: 24, x: 0.45, y: 0.15, wing: 'north' },
  { dayNumber: 25, x: 0.55, y: 0.15, wing: 'north' },
  { dayNumber: 26, x: 0.65, y: 0.15, wing: 'north' },
  { dayNumber: 27, x: 0.35, y: 0.25, wing: 'north' },
  { dayNumber: 28, x: 0.45, y: 0.25, wing: 'north' },
  { dayNumber: 29, x: 0.55, y: 0.25, wing: 'north' },
  { dayNumber: 30, x: 0.65, y: 0.25, wing: 'north' },
  { dayNumber: 31, x: 0.50, y: 0.08, wing: 'north' },
];

const WING_COLORS: Record<string, string> = {
  main: '#4a9eff',
  west: '#f59e0b',
  east: '#10b981',
  north: '#a855f7',
};

// ============================================================================
// Floor Plan System Creation
// ============================================================================

/**
 * Create the floor plan system
 */
export function createFloorPlanSystem(container: HTMLElement): FloorPlanSystem {
  const system: FloorPlanSystem = {
    container,
    panel: null,
    canvas: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeFloorPlan(system);
    },
  };

  return system;
}

/**
 * Show the floor plan
 */
export function showFloorPlan(
  system: FloorPlanSystem,
  visitedDays: Set<number>,
  currentDay: number,
  cameraX: number,
  cameraZ: number
): void {
  closeFloorPlan(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'floorplan-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 450px;
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
          Museum Floor Plan
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${visitedDays.size}/31 exhibits discovered
        </div>
      </div>
      <button id="floorplan-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; padding: 15px; position: relative;">
      <canvas id="floorplan-canvas" width="470" height="310" style="
        width: 100%;
        height: 100%;
        cursor: pointer;
      "></canvas>
    </div>

    <!-- Legend -->
    <div style="
      padding: 12px 20px;
      border-top: 1px solid rgba(100, 150, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="display: flex; gap: 15px; font-size: 10px;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="width: 10px; height: 10px; background: #4a9eff; border-radius: 50%;"></div>
          <span>Main</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="width: 10px; height: 10px; background: #f59e0b; border-radius: 50%;"></div>
          <span>West</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></div>
          <span>East</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="width: 10px; height: 10px; background: #a855f7; border-radius: 50%;"></div>
          <span>North</span>
        </div>
      </div>
      <div style="font-size: 10px; color: #666;">
        Click to visit · Press O to close
      </div>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Get canvas and draw
  const canvas = panel.querySelector('#floorplan-canvas') as HTMLCanvasElement;
  system.canvas = canvas;
  drawFloorPlan(canvas, visitedDays, currentDay, cameraX, cameraZ);

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close button
  const closeBtn = panel.querySelector('#floorplan-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeFloorPlan(system);

  // Wire up canvas click for navigation
  canvas.onclick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Find clicked exhibit
    const clickRadius = 0.04;
    const exhibit = EXHIBIT_POSITIONS.find(e => {
      const dx = e.x - x;
      const dy = e.y - y;
      return Math.sqrt(dx * dx + dy * dy) < clickRadius;
    });

    if (exhibit && system.onNavigate) {
      closeFloorPlan(system);
      system.onNavigate(exhibit.dayNumber);
    }
  };

  // Hover effect
  canvas.onmousemove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const clickRadius = 0.04;
    const exhibit = EXHIBIT_POSITIONS.find(e => {
      const dx = e.x - x;
      const dy = e.y - y;
      return Math.sqrt(dx * dx + dy * dy) < clickRadius;
    });

    canvas.style.cursor = exhibit ? 'pointer' : 'default';
    canvas.title = exhibit ? `Day ${exhibit.dayNumber}` : '';
  };
}

/**
 * Draw the floor plan on canvas
 */
function drawFloorPlan(
  canvas: HTMLCanvasElement,
  visitedDays: Set<number>,
  currentDay: number,
  cameraX: number,
  cameraZ: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, width, height);

  // Draw museum outline
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
  ctx.lineWidth = 2;

  // Main gallery area
  ctx.strokeRect(width * 0.3, height * 0.35, width * 0.4, height * 0.3);

  // West wing
  ctx.strokeRect(width * 0.1, height * 0.3, width * 0.2, height * 0.4);

  // East wing
  ctx.strokeRect(width * 0.7, height * 0.3, width * 0.2, height * 0.4);

  // North wing
  ctx.strokeRect(width * 0.3, height * 0.05, width * 0.4, height * 0.3);

  // Entrance
  ctx.strokeRect(width * 0.4, height * 0.75, width * 0.2, height * 0.15);

  // Draw corridors (connections)
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
  ctx.lineWidth = 1;

  // West corridor
  ctx.beginPath();
  ctx.moveTo(width * 0.3, height * 0.5);
  ctx.lineTo(width * 0.2, height * 0.5);
  ctx.stroke();

  // East corridor
  ctx.beginPath();
  ctx.moveTo(width * 0.7, height * 0.5);
  ctx.lineTo(width * 0.8, height * 0.5);
  ctx.stroke();

  // North corridor
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.35);
  ctx.lineTo(width * 0.5, height * 0.3);
  ctx.stroke();

  // Entrance corridor
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.65);
  ctx.lineTo(width * 0.5, height * 0.75);
  ctx.stroke();

  // Draw wing labels
  ctx.font = '10px system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.textAlign = 'center';

  ctx.fillText('MAIN', width * 0.5, height * 0.42);
  ctx.fillText('WEST', width * 0.2, height * 0.32);
  ctx.fillText('EAST', width * 0.8, height * 0.32);
  ctx.fillText('NORTH', width * 0.5, height * 0.12);
  ctx.fillText('ENTRANCE', width * 0.5, height * 0.88);

  // Draw exhibit markers
  EXHIBIT_POSITIONS.forEach(exhibit => {
    const x = exhibit.x * width;
    const y = exhibit.y * height;
    const isVisited = visitedDays.has(exhibit.dayNumber);
    const isCurrent = exhibit.dayNumber === currentDay;

    // Marker circle
    ctx.beginPath();
    ctx.arc(x, y, isCurrent ? 12 : 8, 0, Math.PI * 2);

    if (isCurrent) {
      // Current exhibit - pulsing glow
      ctx.fillStyle = WING_COLORS[exhibit.wing];
      ctx.shadowColor = WING_COLORS[exhibit.wing];
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (isVisited) {
      // Visited - filled
      ctx.fillStyle = WING_COLORS[exhibit.wing];
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Unvisited - hollow
      ctx.strokeStyle = WING_COLORS[exhibit.wing];
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Day number
    ctx.font = isCurrent ? 'bold 9px system-ui' : '8px system-ui';
    ctx.fillStyle = isCurrent ? 'white' : (isVisited ? 'white' : 'rgba(255,255,255,0.4)');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(exhibit.dayNumber), x, y);
  });

  // Draw camera position indicator
  // Convert camera world coords to floor plan coords
  // Museum center is at (0, -32) in world space
  const camNormX = 0.5 + (cameraX / 60); // Approximate scaling
  const camNormY = 0.5 + ((cameraZ + 32) / 80);

  // Clamp to valid range
  const camX = Math.max(0.1, Math.min(0.9, camNormX)) * width;
  const camY = Math.max(0.1, Math.min(0.9, camNormY)) * height;

  // Draw "You are here" marker
  ctx.beginPath();
  ctx.moveTo(camX, camY - 8);
  ctx.lineTo(camX - 6, camY + 6);
  ctx.lineTo(camX + 6, camY + 6);
  ctx.closePath();
  ctx.fillStyle = '#ff6b6b';
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Close the floor plan
 */
export function closeFloorPlan(system: FloorPlanSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
      system.canvas = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Toggle floor plan
 */
export function toggleFloorPlan(
  system: FloorPlanSystem,
  visitedDays: Set<number>,
  currentDay: number,
  cameraX: number,
  cameraZ: number
): void {
  if (system.isOpen) {
    closeFloorPlan(system);
  } else {
    showFloorPlan(system, visitedDays, currentDay, cameraX, cameraZ);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeFloorPlanSystem(system: FloorPlanSystem): void {
  system.cleanup();
}
