/**
 * Museum Compass
 *
 * Shows the player's facing direction with a visual compass indicator.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Compass {
  element: HTMLElement;
  needle: HTMLElement;
  directions: HTMLElement;
  camera: THREE.Camera | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DIRECTIONS = [
  { angle: 0, label: 'N', full: 'North Wing' },
  { angle: 45, label: 'NE', full: '' },
  { angle: 90, label: 'E', full: 'East Wing' },
  { angle: 135, label: 'SE', full: '' },
  { angle: 180, label: 'S', full: 'South Wing' },
  { angle: 225, label: 'SW', full: '' },
  { angle: 270, label: 'W', full: 'West Wing' },
  { angle: 315, label: 'NW', full: '' },
];

// ============================================================================
// Compass Creation
// ============================================================================

/**
 * Create the compass indicator
 */
export function createCompass(container: HTMLElement): Compass {
  const element = document.createElement('div');
  element.id = 'museum-compass';
  element.style.cssText = `
    position: absolute;
    top: 80px;
    right: 10px;
    width: 70px;
    height: 70px;
    background: rgba(20, 20, 30, 0.7);
    border-radius: 50%;
    border: 2px solid rgba(100, 150, 255, 0.3);
    z-index: 100;
    pointer-events: none;
  `;

  // Direction labels ring
  const directions = document.createElement('div');
  directions.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `;

  // Add direction markers
  DIRECTIONS.forEach(dir => {
    const marker = document.createElement('div');
    const isPrimary = ['N', 'E', 'S', 'W'].includes(dir.label);
    marker.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      font-family: system-ui, sans-serif;
      font-size: ${isPrimary ? '10px' : '7px'};
      font-weight: ${isPrimary ? 'bold' : 'normal'};
      color: ${dir.label === 'N' ? '#ff6b6b' : isPrimary ? '#e0e0e0' : '#666'};
      transform-origin: center center;
      transform: translate(-50%, -50%) rotate(${dir.angle}deg) translateY(-27px) rotate(-${dir.angle}deg);
    `;
    marker.textContent = dir.label;
    directions.appendChild(marker);
  });

  element.appendChild(directions);

  // Compass needle (always points to camera direction)
  const needle = document.createElement('div');
  needle.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 28px;
    transform: translate(-50%, -100%);
    transform-origin: center bottom;
  `;
  needle.innerHTML = `
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 20px solid #4a9eff;
      margin-left: -4px;
    "></div>
    <div style="
      width: 4px;
      height: 8px;
      background: #4a9eff;
    "></div>
  `;
  element.appendChild(needle);

  // Center dot
  const center = document.createElement('div');
  center.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: rgba(74, 158, 255, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  `;
  element.appendChild(center);

  container.appendChild(element);

  const compass: Compass = {
    element,
    needle,
    directions,
    camera: null,
    cleanup: () => {
      element.remove();
    },
  };

  return compass;
}

/**
 * Update compass to match camera direction
 */
export function updateCompass(compass: Compass, camera: THREE.Camera): void {
  compass.camera = camera;

  // Get camera's forward direction
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  // Calculate angle from north (positive Z is north)
  const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);

  // Rotate the direction labels (so N is always at the top when facing north)
  compass.directions.style.transform = `rotate(${-angle}deg)`;

  // Keep direction labels upright
  const markers = compass.directions.children;
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i] as HTMLElement;
    const dir = DIRECTIONS[i];
    marker.style.transform = `translate(-50%, -50%) rotate(${dir.angle}deg) translateY(-27px) rotate(${-dir.angle + angle}deg)`;
  }
}

/**
 * Get the current direction name
 */
export function getCurrentDirection(compass: Compass): string {
  if (!compass.camera) return '';

  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(compass.camera.quaternion);
  const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);

  // Normalize to 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  // Find closest direction
  let closest = DIRECTIONS[0];
  let minDiff = 360;

  for (const dir of DIRECTIONS) {
    let diff = Math.abs(normalizedAngle - dir.angle);
    if (diff > 180) diff = 360 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closest = dir;
    }
  }

  return closest.full || closest.label;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose compass
 */
export function disposeCompass(compass: Compass): void {
  compass.cleanup();
}
