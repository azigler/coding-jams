/**
 * Suggested Next
 *
 * Helps guide users to unvisited exhibits they might enjoy.
 * Shows a subtle prompt pointing toward nearby unvisited pieces.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface SuggestedNext {
  container: HTMLElement;
  indicator: HTMLElement | null;
  enabled: boolean;
  lastSuggestion: number | null;
  exhibitMeshes: THREE.Mesh[];
  cleanup: () => void;
}

// ============================================================================
// Suggested Next Creation
// ============================================================================

/**
 * Create the suggested next system
 */
export function createSuggestedNext(container: HTMLElement): SuggestedNext {
  const system: SuggestedNext = {
    container,
    indicator: null,
    enabled: true,
    lastSuggestion: null,
    exhibitMeshes: [],
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create the indicator element
  const indicator = document.createElement('div');
  indicator.id = 'suggested-next';
  indicator.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(74, 158, 255, 0.3);
    border-radius: 20px;
    padding: 10px 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #e0e0e0;
    z-index: 700;
    display: none;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: opacity 0.3s, transform 0.3s;
  `;

  indicator.innerHTML = `
    <span id="suggested-arrow" style="
      font-size: 16px;
      transition: transform 0.3s;
    "></span>
    <span id="suggested-text"></span>
  `;

  indicator.onmouseenter = () => {
    indicator.style.transform = 'translateX(-50%) scale(1.05)';
  };
  indicator.onmouseleave = () => {
    indicator.style.transform = 'translateX(-50%) scale(1)';
  };

  container.appendChild(indicator);
  system.indicator = indicator;

  // Toggle with N key (Next suggestion)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyN' && !event.ctrlKey && !event.metaKey) {
      toggleSuggestedNext(system);
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
 * Register exhibit meshes for suggestions
 */
export function registerExhibitsForSuggestion(system: SuggestedNext, meshes: THREE.Mesh[]): void {
  system.exhibitMeshes = meshes;
}

/**
 * Update suggestions based on camera position
 */
export function updateSuggestedNext(
  system: SuggestedNext,
  cameraPosition: THREE.Vector3,
  cameraDirection: THREE.Vector3,
  visitedDays: Set<number>
): void {
  if (!system.enabled || !system.indicator) return;

  // Find nearby unvisited exhibits
  const unvisited = system.exhibitMeshes
    .filter(mesh => {
      const dayNumber = mesh.userData.dayNumber;
      return dayNumber && !visitedDays.has(dayNumber);
    })
    .map(mesh => {
      const meshPos = new THREE.Vector3();
      mesh.getWorldPosition(meshPos);
      const distance = cameraPosition.distanceTo(meshPos);
      return { mesh, distance };
    })
    .filter(({ distance }) => distance > 3 && distance < 30) // Not too close, not too far
    .sort((a, b) => a.distance - b.distance);

  if (unvisited.length === 0) {
    system.indicator.style.display = 'none';
    return;
  }

  // Pick the nearest unvisited exhibit
  const suggestion = unvisited[0];
  const dayNumber = suggestion.mesh.userData.dayNumber;

  // Don't spam the same suggestion
  if (dayNumber === system.lastSuggestion) {
    // Only update direction
    updateArrow(system, cameraPosition, cameraDirection, suggestion.mesh);
    return;
  }

  system.lastSuggestion = dayNumber;

  // Update indicator
  const textEl = system.indicator.querySelector('#suggested-text');
  if (textEl) {
    textEl.textContent = `Day ${dayNumber} nearby`;
  }

  updateArrow(system, cameraPosition, cameraDirection, suggestion.mesh);
  system.indicator.style.display = 'flex';
}

/**
 * Update the directional arrow
 */
function updateArrow(
  system: SuggestedNext,
  cameraPosition: THREE.Vector3,
  cameraDirection: THREE.Vector3,
  targetMesh: THREE.Mesh
): void {
  if (!system.indicator) return;

  const arrowEl = system.indicator.querySelector('#suggested-arrow') as HTMLElement;
  if (!arrowEl) return;

  // Calculate direction to target
  const meshPos = new THREE.Vector3();
  targetMesh.getWorldPosition(meshPos);

  const toTarget = new THREE.Vector3()
    .subVectors(meshPos, cameraPosition)
    .normalize();

  // Calculate horizontal angle
  const cameraForward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
  const targetForward = new THREE.Vector3(toTarget.x, 0, toTarget.z).normalize();

  // Cross product to determine left/right
  const cross = new THREE.Vector3().crossVectors(cameraForward, targetForward);
  const dot = cameraForward.dot(targetForward);

  // Determine arrow direction
  let arrow = '';
  const angle = Math.atan2(cross.y, dot);

  if (Math.abs(angle) < Math.PI / 4) {
    arrow = '↑'; // Forward
  } else if (angle > 0 && angle < 3 * Math.PI / 4) {
    arrow = '←'; // Left
  } else if (angle < 0 && angle > -3 * Math.PI / 4) {
    arrow = '→'; // Right
  } else {
    arrow = '↓'; // Behind
  }

  arrowEl.textContent = arrow;
}

/**
 * Toggle suggested next on/off
 */
export function toggleSuggestedNext(system: SuggestedNext): void {
  system.enabled = !system.enabled;

  if (!system.enabled && system.indicator) {
    system.indicator.style.display = 'none';
  }
}

/**
 * Hide the suggestion (e.g., when user navigates to it)
 */
export function hideSuggestion(system: SuggestedNext): void {
  if (system.indicator) {
    system.indicator.style.display = 'none';
  }
  system.lastSuggestion = null;
}

/**
 * Get the currently suggested day
 */
export function getSuggestedDay(system: SuggestedNext): number | null {
  return system.lastSuggestion;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSuggestedNext(system: SuggestedNext): void {
  system.cleanup();
}
