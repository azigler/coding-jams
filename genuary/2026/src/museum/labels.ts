/**
 * Exhibit Labels
 *
 * Shows floating labels above exhibits with day numbers
 * and prompt titles, helping with navigation.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface ExhibitLabel {
  dayNumber: number;
  element: HTMLElement;
  position: THREE.Vector3;
}

export interface LabelsSystem {
  container: HTMLElement;
  labels: ExhibitLabel[];
  isVisible: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const PROMPT_TITLES: Record<number, string> = {
  1: 'Vertical',
  2: 'Layers',
  3: 'Exactly 42',
  4: 'Black on Black',
  5: 'Isometric',
  6: 'Make a Landscape',
  7: 'Use OP',
  8: 'Chaotic System',
  9: 'The Wrong Palette',
  10: 'You Can Only Move',
  11: 'Impossible Objects',
  12: 'Subdivision',
  13: 'Triangle',
  14: 'Pure CSS',
  15: 'Sine Wave',
  16: 'Generative Music',
  17: '3D',
  18: 'Wind',
  19: 'Pixelated',
  20: 'Typography',
  21: 'Connected',
  22: 'Infinite Zoom',
  23: 'More Isn\'t More',
  24: 'Less Isn\'t Less',
  25: 'One Color',
  26: 'Symmetry',
  27: 'Organic Growth',
  28: 'Skeuomorphism',
  29: 'Grid',
  30: 'Abstract Emotion',
  31: 'Reflection',
};

// ============================================================================
// Labels System Creation
// ============================================================================

/**
 * Create the labels system
 */
export function createLabelsSystem(container: HTMLElement): LabelsSystem {
  const system: LabelsSystem = {
    container,
    labels: [],
    isVisible: false,
    cleanup: () => {
      hideLabels(system);
    },
  };

  return system;
}

/**
 * Register exhibits for labeling
 */
export function registerExhibitsForLabels(
  system: LabelsSystem,
  exhibits: THREE.Mesh[]
): void {
  // Clean up existing labels
  hideLabels(system);

  exhibits.forEach(exhibit => {
    const dayNumber = exhibit.userData.dayNumber;
    if (typeof dayNumber !== 'number' || dayNumber < 1) return;

    const position = new THREE.Vector3();
    exhibit.getWorldPosition(position);
    position.y += 1.5; // Above the exhibit

    const element = createLabelElement(dayNumber);
    system.labels.push({
      dayNumber,
      element,
      position,
    });
  });
}

/**
 * Create a label DOM element
 */
function createLabelElement(dayNumber: number): HTMLElement {
  const element = document.createElement('div');
  element.className = 'exhibit-label';
  element.dataset.day = String(dayNumber);
  element.style.cssText = `
    position: fixed;
    pointer-events: none;
    transform: translate(-50%, -100%);
    text-align: center;
    font-family: system-ui, sans-serif;
    z-index: 300;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  const title = PROMPT_TITLES[dayNumber] || `Day ${dayNumber}`;

  element.innerHTML = `
    <div style="
      background: rgba(10, 10, 20, 0.9);
      border: 1px solid rgba(100, 150, 255, 0.4);
      border-radius: 8px;
      padding: 6px 12px;
      white-space: nowrap;
    ">
      <div style="
        font-size: 16px;
        font-weight: bold;
        color: #4a9eff;
        margin-bottom: 2px;
      ">${dayNumber}</div>
      <div style="
        font-size: 10px;
        color: #888;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${title}</div>
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(100, 150, 255, 0.4);
      margin: 0 auto;
    "></div>
  `;

  return element;
}

/**
 * Show labels
 */
export function showLabels(system: LabelsSystem): void {
  if (system.isVisible) return;

  system.isVisible = true;

  system.labels.forEach(label => {
    system.container.appendChild(label.element);
    requestAnimationFrame(() => {
      label.element.style.opacity = '1';
    });
  });
}

/**
 * Hide labels
 */
export function hideLabels(system: LabelsSystem): void {
  if (!system.isVisible) return;

  system.isVisible = false;

  system.labels.forEach(label => {
    label.element.style.opacity = '0';
    setTimeout(() => {
      if (label.element.parentNode) {
        label.element.remove();
      }
    }, 300);
  });
}

/**
 * Toggle labels visibility
 */
export function toggleLabels(system: LabelsSystem): void {
  if (system.isVisible) {
    hideLabels(system);
  } else {
    showLabels(system);
  }
}

/**
 * Update label positions based on camera
 */
export function updateLabels(
  system: LabelsSystem,
  camera: THREE.PerspectiveCamera,
  viewportWidth: number,
  viewportHeight: number
): void {
  if (!system.isVisible) return;

  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  system.labels.forEach(label => {
    // Check if in view
    if (!frustum.containsPoint(label.position)) {
      label.element.style.display = 'none';
      return;
    }

    // Calculate distance for scale
    const distance = camera.position.distanceTo(label.position);
    if (distance > 25) {
      label.element.style.display = 'none';
      return;
    }

    label.element.style.display = 'block';

    // Project to screen space
    const screenPos = label.position.clone().project(camera);

    const x = (screenPos.x * 0.5 + 0.5) * viewportWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * viewportHeight;

    label.element.style.left = `${x}px`;
    label.element.style.top = `${y}px`;

    // Scale based on distance
    const scale = Math.max(0.5, Math.min(1, 10 / distance));
    label.element.style.transform = `translate(-50%, -100%) scale(${scale})`;

    // Fade based on distance
    const opacity = Math.max(0.3, 1 - (distance / 25));
    label.element.style.opacity = String(opacity);
  });
}

/**
 * Get prompt title for a day
 */
export function getPromptTitle(dayNumber: number): string {
  return PROMPT_TITLES[dayNumber] || `Day ${dayNumber}`;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeLabelsSystem(system: LabelsSystem): void {
  system.cleanup();
  system.labels = [];
}
