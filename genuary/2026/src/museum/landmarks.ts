/**
 * Landmark Markers
 *
 * Floating labels that show notable locations in the museum.
 * Helps with orientation and discovery.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Landmark {
  id: string;
  name: string;
  position: THREE.Vector3;
  icon: string;
  description?: string;
}

export interface LandmarkMarker {
  landmark: Landmark;
  element: HTMLElement;
}

export interface LandmarkSystem {
  container: HTMLElement;
  markers: LandmarkMarker[];
  enabled: boolean;
  cleanup: () => void;
}

// ============================================================================
// Landmark Data
// ============================================================================

const LANDMARKS: Landmark[] = [
  {
    id: 'entrance',
    name: 'Gallery Entrance',
    position: new THREE.Vector3(0, 2.5, -28),
    icon: '🚪',
    description: 'Start your journey here',
  },
  {
    id: 'north-wing',
    name: 'North Wing',
    position: new THREE.Vector3(0, 2.5, -70),
    icon: '🧭',
    description: 'Days 1-8',
  },
  {
    id: 'south-wing',
    name: 'South Wing',
    position: new THREE.Vector3(0, 2.5, 10),
    icon: '☀️',
    description: 'Days 9-16',
  },
  {
    id: 'east-wing',
    name: 'East Wing',
    position: new THREE.Vector3(40, 2.5, -30),
    icon: '🌅',
    description: 'Days 17-24',
  },
  {
    id: 'west-wing',
    name: 'West Wing',
    position: new THREE.Vector3(-40, 2.5, -30),
    icon: '🌇',
    description: 'Days 25-31',
  },
  {
    id: 'center',
    name: 'Gallery Center',
    position: new THREE.Vector3(0, 2.5, -35),
    icon: '⭐',
    description: 'Main exhibit hall',
  },
];

// ============================================================================
// Landmark System Creation
// ============================================================================

/**
 * Create the landmark system
 */
export function createLandmarkSystem(container: HTMLElement): LandmarkSystem {
  const system: LandmarkSystem = {
    container,
    markers: [],
    enabled: true,
    cleanup: () => {
      system.markers.forEach(marker => {
        marker.element.remove();
      });
      system.markers = [];
    },
  };

  // Create markers for each landmark
  LANDMARKS.forEach(landmark => {
    const element = createMarkerElement(landmark);
    container.appendChild(element);
    system.markers.push({ landmark, element });
  });

  // Toggle with Shift+L
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyL' && event.shiftKey) {
      event.preventDefault();
      toggleLandmarks(system);
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
 * Create a marker element
 */
function createMarkerElement(landmark: Landmark): HTMLElement {
  const marker = document.createElement('div');
  marker.className = 'landmark-marker';
  marker.dataset.landmarkId = landmark.id;
  marker.style.cssText = `
    position: fixed;
    display: none;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    transform: translate(-50%, -100%);
    z-index: 500;
    transition: opacity 0.3s;
  `;

  marker.innerHTML = `
    <div style="
      background: rgba(20, 20, 30, 0.85);
      border: 1px solid rgba(74, 158, 255, 0.4);
      border-radius: 8px;
      padding: 8px 12px;
      font-family: system-ui, sans-serif;
      white-space: nowrap;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: white;
      ">
        <span style="font-size: 14px;">${landmark.icon}</span>
        <span>${landmark.name}</span>
      </div>
      ${landmark.description ? `
        <div style="
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        ">${landmark.description}</div>
      ` : ''}
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(20, 20, 30, 0.85);
    "></div>
  `;

  return marker;
}

/**
 * Update marker positions based on camera
 */
export function updateLandmarks(
  system: LandmarkSystem,
  camera: THREE.Camera,
  containerWidth: number,
  containerHeight: number
): void {
  if (!system.enabled) {
    system.markers.forEach(({ element }) => {
      element.style.display = 'none';
    });
    return;
  }

  const frustum = new THREE.Frustum();
  const projMatrix = new THREE.Matrix4();
  projMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projMatrix);

  system.markers.forEach(({ landmark, element }) => {
    // Check if landmark is in view
    if (!frustum.containsPoint(landmark.position)) {
      element.style.display = 'none';
      return;
    }

    // Check distance
    const distance = camera.position.distanceTo(landmark.position);
    if (distance > 60 || distance < 3) {
      element.style.display = 'none';
      return;
    }

    // Project to screen
    const screenPos = landmark.position.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * containerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * containerHeight;

    // Check if on screen
    if (x < 0 || x > containerWidth || y < 0 || y > containerHeight) {
      element.style.display = 'none';
      return;
    }

    // Fade based on distance
    const opacity = Math.min(1, Math.max(0.3, 1 - (distance - 10) / 50));

    element.style.display = 'flex';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.opacity = `${opacity}`;

    // Scale based on distance
    const scale = Math.min(1, Math.max(0.6, 1 - (distance - 10) / 80));
    element.style.transform = `translate(-50%, -100%) scale(${scale})`;
  });
}

/**
 * Toggle landmark visibility
 */
export function toggleLandmarks(system: LandmarkSystem): void {
  system.enabled = !system.enabled;

  if (!system.enabled) {
    system.markers.forEach(({ element }) => {
      element.style.display = 'none';
    });
  }
}

/**
 * Get landmark by id
 */
export function getLandmark(id: string): Landmark | undefined {
  return LANDMARKS.find(l => l.id === id);
}

/**
 * Get all landmarks
 */
export function getAllLandmarks(): Landmark[] {
  return LANDMARKS;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeLandmarkSystem(system: LandmarkSystem): void {
  system.cleanup();
}
