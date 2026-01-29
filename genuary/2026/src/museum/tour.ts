/**
 * Guided Tour System
 *
 * Provides an automatic tour through the museum, visiting
 * each exhibit in order with smooth camera movements.
 */

import * as THREE from 'three';
import type { Navigation } from './navigation';
import type { InteractionSystem } from './interaction';

// ============================================================================
// Types
// ============================================================================

export interface TourSystem {
  navigation: Navigation;
  interaction: InteractionSystem;
  isActive: boolean;
  currentStop: number;
  tourStops: TourStop[];
  transitionProgress: number;
  waitTime: number;
  onTourEnd?: () => void;
}

interface TourStop {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  duration: number; // How long to stay at this stop (seconds)
  name: string;
}

// ============================================================================
// Constants
// ============================================================================

const TRANSITION_SPEED = 0.5; // Speed of camera movement between stops
const DEFAULT_STOP_DURATION = 4; // Default time at each stop

// ============================================================================
// Tour Stops
// ============================================================================

/**
 * Create the tour route
 */
function createTourStops(): TourStop[] {
  return [
    // 1. Entrance - Welcome
    {
      position: new THREE.Vector3(0, 1.6, 0),
      lookAt: new THREE.Vector3(0, 1.6, -20),
      duration: 3,
      name: 'Entrance',
    },
    // 2. Walk into hallway
    {
      position: new THREE.Vector3(0, 1.6, -10),
      lookAt: new THREE.Vector3(0, 1.6, -30),
      duration: 2,
      name: 'Entrance Hallway',
    },
    // 3. Gallery center
    {
      position: new THREE.Vector3(0, 1.6, -32),
      lookAt: new THREE.Vector3(0, 2.5, -32), // Look up at orb
      duration: 4,
      name: 'Gallery Center',
    },
    // 4. Gallery - Day 1 exhibit
    {
      position: new THREE.Vector3(6, 1.6, -26),
      lookAt: new THREE.Vector3(10, 1.6, -26),
      duration: 4,
      name: 'Day 1: One Color, One Shape',
    },
    // 5. Gallery - Day 7 exhibit
    {
      position: new THREE.Vector3(6, 1.6, -38),
      lookAt: new THREE.Vector3(10, 1.6, -38),
      duration: 4,
      name: 'Day 7: Boolean Algebra',
    },
    // 6. North wing entrance
    {
      position: new THREE.Vector3(0, 1.6, -44),
      lookAt: new THREE.Vector3(0, 1.6, -60),
      duration: 3,
      name: 'North Wing',
    },
    // 7. Inside north wing
    {
      position: new THREE.Vector3(0, 1.6, -52),
      lookAt: new THREE.Vector3(-4, 1.6, -52),
      duration: 4,
      name: 'North Wing Exhibits',
    },
    // 8. Return to gallery
    {
      position: new THREE.Vector3(0, 1.6, -32),
      lookAt: new THREE.Vector3(-12, 1.6, -32),
      duration: 2,
      name: 'Returning to Gallery',
    },
    // 9. West wing
    {
      position: new THREE.Vector3(-16, 1.6, -32),
      lookAt: new THREE.Vector3(-30, 1.6, -32),
      duration: 3,
      name: 'West Wing',
    },
    // 10. Inside west wing
    {
      position: new THREE.Vector3(-24, 1.6, -32),
      lookAt: new THREE.Vector3(-24, 1.6, -28),
      duration: 4,
      name: 'West Wing Exhibits',
    },
    // 11. East wing
    {
      position: new THREE.Vector3(16, 1.6, -32),
      lookAt: new THREE.Vector3(30, 1.6, -32),
      duration: 3,
      name: 'East Wing',
    },
    // 12. Inside east wing
    {
      position: new THREE.Vector3(24, 1.6, -32),
      lookAt: new THREE.Vector3(24, 1.6, -36),
      duration: 4,
      name: 'East Wing Exhibits',
    },
    // 13. Return to gallery center
    {
      position: new THREE.Vector3(0, 1.6, -32),
      lookAt: new THREE.Vector3(0, 2.5, -32),
      duration: 3,
      name: 'Gallery Center',
    },
    // 14. Exit through entrance
    {
      position: new THREE.Vector3(0, 1.6, -10),
      lookAt: new THREE.Vector3(0, 1.6, 0),
      duration: 2,
      name: 'Tour Complete',
    },
  ];
}

// ============================================================================
// Tour System
// ============================================================================

/**
 * Create the tour system
 */
export function createTourSystem(
  navigation: Navigation,
  interaction: InteractionSystem
): TourSystem {
  return {
    navigation,
    interaction,
    isActive: false,
    currentStop: 0,
    tourStops: createTourStops(),
    transitionProgress: 0,
    waitTime: 0,
    onTourEnd: undefined,
  };
}

/**
 * Start the guided tour
 */
export function startTour(tour: TourSystem): void {
  if (tour.isActive) return;

  tour.isActive = true;
  tour.currentStop = 0;
  tour.transitionProgress = 0;
  tour.waitTime = 0;

  // Move to first stop immediately
  const firstStop = tour.tourStops[0];
  tour.navigation.camera.position.copy(firstStop.position);
  tour.navigation.camera.lookAt(firstStop.lookAt);
  tour.navigation.euler.setFromQuaternion(tour.navigation.camera.quaternion);

  showTourIndicator(firstStop.name, tour.currentStop + 1, tour.tourStops.length);
  console.log(`Tour started: ${firstStop.name}`);
}

/**
 * Stop the guided tour
 */
export function stopTour(tour: TourSystem): void {
  if (!tour.isActive) return;

  tour.isActive = false;
  hideTourIndicator();
  console.log('Tour stopped');

  if (tour.onTourEnd) {
    tour.onTourEnd();
  }
}

/**
 * Toggle tour on/off
 */
export function toggleTour(tour: TourSystem): void {
  if (tour.isActive) {
    stopTour(tour);
  } else {
    startTour(tour);
  }
}

/**
 * Update the tour system each frame
 */
export function updateTour(tour: TourSystem, deltaTime: number): boolean {
  if (!tour.isActive) return false;

  const currentStop = tour.tourStops[tour.currentStop];
  const nextStop = tour.tourStops[tour.currentStop + 1];

  // If we're waiting at a stop
  if (tour.transitionProgress >= 1) {
    tour.waitTime += deltaTime;

    if (tour.waitTime >= currentStop.duration) {
      // Move to next stop
      if (nextStop) {
        tour.currentStop++;
        tour.transitionProgress = 0;
        tour.waitTime = 0;
        showTourIndicator(nextStop.name, tour.currentStop + 1, tour.tourStops.length);
        console.log(`Tour: ${nextStop.name}`);
      } else {
        // Tour complete
        stopTour(tour);
        return false;
      }
    }
    return true;
  }

  // Transitioning between stops
  if (nextStop) {
    tour.transitionProgress += deltaTime * TRANSITION_SPEED;
    tour.transitionProgress = Math.min(1, tour.transitionProgress);

    // Smooth interpolation
    const t = smoothstep(tour.transitionProgress);

    // Interpolate position
    tour.navigation.camera.position.lerpVectors(currentStop.position, nextStop.position, t);

    // Interpolate look direction
    const currentLook = currentStop.lookAt.clone();
    const nextLook = nextStop.lookAt.clone();
    const targetLook = currentLook.lerp(nextLook, t);
    tour.navigation.camera.lookAt(targetLook);

    // Update navigation euler
    tour.navigation.euler.setFromQuaternion(tour.navigation.camera.quaternion);
  }

  return true;
}

/**
 * Smoothstep function for eased transitions
 */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ============================================================================
// UI
// ============================================================================

/**
 * Show tour progress indicator
 */
function showTourIndicator(stopName: string, current: number, total: number): void {
  hideTourIndicator();

  const indicator = document.createElement('div');
  indicator.id = 'tour-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      z-index: 200;
      text-align: center;
      backdrop-filter: blur(10px);
    ">
      <div style="font-size: 11px; color: #888; margin-bottom: 4px;">
        GUIDED TOUR • ${current} of ${total}
      </div>
      <div style="font-size: 16px; font-weight: bold;">
        ${stopName}
      </div>
      <div style="font-size: 11px; color: #666; margin-top: 8px;">
        Press T to exit tour
      </div>
    </div>
  `;
  document.body.appendChild(indicator);
}

/**
 * Hide tour indicator
 */
function hideTourIndicator(): void {
  const existing = document.getElementById('tour-indicator');
  if (existing) existing.remove();
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose of tour system
 */
export function disposeTour(tour: TourSystem): void {
  stopTour(tour);
}
