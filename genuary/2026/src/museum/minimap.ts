/**
 * Museum Minimap
 *
 * A small overview map showing the museum layout and player position.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Minimap {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  container: HTMLElement;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAP_SIZE = 120;
const MAP_SCALE = 2; // pixels per meter
const PLAYER_SIZE = 6;

// Museum layout constants (matching navigation.ts)
const GALLERY_Z = -32;
const GALLERY_RADIUS = 12;
const WALL_DIST = GALLERY_RADIUS * Math.cos(Math.PI / 8);
const WING_LENGTH = 18;
const WING_WIDTH = 6;

// ============================================================================
// Minimap Creation
// ============================================================================

/**
 * Create the minimap overlay
 */
export function createMinimap(container: HTMLElement): Minimap {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  canvas.style.cssText = `
    position: absolute;
    top: 50px;
    right: 10px;
    width: ${MAP_SIZE}px;
    height: ${MAP_SIZE}px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: none;
    z-index: 100;
  `;

  const ctx = canvas.getContext('2d')!;
  container.appendChild(canvas);

  // Draw static map background
  drawMapBackground(ctx);

  return {
    canvas,
    ctx,
    container,
    cleanup: () => canvas.remove(),
  };
}

/**
 * Draw the static map background (museum layout)
 */
function drawMapBackground(ctx: CanvasRenderingContext2D): void {
  const cx = MAP_SIZE / 2;
  const cy = MAP_SIZE / 2;

  // Clear
  ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

  ctx.strokeStyle = 'rgba(80, 90, 120, 0.6)';
  ctx.fillStyle = 'rgba(40, 45, 60, 0.8)';
  ctx.lineWidth = 1;

  // Helper to convert world coords to map coords
  const toMap = (x: number, z: number): [number, number] => {
    // Center the map on the gallery
    const mapX = cx + (x * MAP_SCALE);
    const mapY = cy + ((z - GALLERY_Z) * MAP_SCALE);
    return [mapX, mapY];
  };

  // Draw entrance hallway
  const entranceWidth = 4 * MAP_SCALE;
  const entranceLength = 20 * MAP_SCALE;
  const [ex, ey] = toMap(0, -10);
  ctx.fillRect(ex - entranceWidth / 2, ey - entranceLength / 2, entranceWidth, entranceLength);
  ctx.strokeRect(ex - entranceWidth / 2, ey - entranceLength / 2, entranceWidth, entranceLength);

  // Draw gallery (circle)
  const [gx, gy] = toMap(0, GALLERY_Z);
  ctx.beginPath();
  ctx.arc(gx, gy, GALLERY_RADIUS * MAP_SCALE, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw wings
  const wingW = WING_WIDTH * MAP_SCALE;
  const wingL = WING_LENGTH * MAP_SCALE;

  // North wing
  const [nx, ny] = toMap(0, GALLERY_Z - WALL_DIST - WING_LENGTH / 2);
  ctx.fillRect(nx - wingW / 2, ny - wingL / 2, wingW, wingL);
  ctx.strokeRect(nx - wingW / 2, ny - wingL / 2, wingW, wingL);

  // West wing
  const [wx, wy] = toMap(-WALL_DIST - WING_LENGTH / 2, GALLERY_Z);
  ctx.fillRect(wx - wingL / 2, wy - wingW / 2, wingL, wingW);
  ctx.strokeRect(wx - wingL / 2, wy - wingW / 2, wingL, wingW);

  // East wing
  const [eastX, eastY] = toMap(WALL_DIST + WING_LENGTH / 2, GALLERY_Z);
  ctx.fillRect(eastX - wingL / 2, eastY - wingW / 2, wingL, wingW);
  ctx.strokeRect(eastX - wingL / 2, eastY - wingW / 2, wingL, wingW);

  // South wing (angled) - simplified as rectangle
  const [sx, sy] = toMap(WALL_DIST * 0.7, GALLERY_Z + WALL_DIST * 0.7);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(Math.PI * 0.25);
  ctx.fillRect(-wingW / 2, -wingL / 2, wingW, wingL);
  ctx.strokeRect(-wingW / 2, -wingL / 2, wingW, wingL);
  ctx.restore();

  // Draw labels
  ctx.fillStyle = 'rgba(150, 160, 180, 0.7)';
  ctx.font = '8px system-ui, sans-serif';
  ctx.textAlign = 'center';

  ctx.fillText('N', ...toMap(0, GALLERY_Z - WALL_DIST - WING_LENGTH));
  ctx.fillText('W', ...toMap(-WALL_DIST - WING_LENGTH, GALLERY_Z));
  ctx.fillText('E', ...toMap(WALL_DIST + WING_LENGTH, GALLERY_Z));
  ctx.fillText('S', ...toMap(WALL_DIST * 1.2, GALLERY_Z + WALL_DIST * 1.2));
}

// ============================================================================
// Minimap Update
// ============================================================================

/**
 * Update the minimap with player position
 */
export function updateMinimap(minimap: Minimap, camera: THREE.PerspectiveCamera): void {
  const { ctx, canvas } = minimap;
  const cx = MAP_SIZE / 2;
  const cy = MAP_SIZE / 2;

  // Redraw background
  drawMapBackground(ctx);

  // Convert camera position to map coords
  const playerX = cx + (camera.position.x * MAP_SCALE);
  const playerY = cy + ((camera.position.z - GALLERY_Z) * MAP_SCALE);

  // Get camera direction
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  const angle = Math.atan2(direction.x, -direction.z);

  // Draw player indicator
  ctx.save();
  ctx.translate(playerX, playerY);
  ctx.rotate(angle);

  // Player triangle (pointing in direction of movement)
  ctx.fillStyle = '#4a9eff';
  ctx.beginPath();
  ctx.moveTo(0, -PLAYER_SIZE);
  ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
  ctx.lineTo(PLAYER_SIZE / 2, PLAYER_SIZE / 2);
  ctx.closePath();
  ctx.fill();

  // Glow effect
  ctx.shadowColor = '#4a9eff';
  ctx.shadowBlur = 8;
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// Minimap Cleanup
// ============================================================================

/**
 * Dispose minimap
 */
export function disposeMinimap(minimap: Minimap): void {
  minimap.cleanup();
}
