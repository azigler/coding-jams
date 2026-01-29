/**
 * Visitor Trail
 *
 * Shows a glowing trail of where the visitor has walked,
 * creating a visual record of their museum journey.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface TrailPoint {
  position: THREE.Vector3;
  timestamp: number;
}

export interface TrailSystem {
  scene: THREE.Scene;
  points: TrailPoint[];
  mesh: THREE.Line | null;
  isVisible: boolean;
  lastRecordedPosition: THREE.Vector3;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_POINTS = 500;
const MIN_DISTANCE = 0.5; // Minimum distance between recorded points
const TRAIL_COLOR = 0x4a9eff;
const TRAIL_FADE_TIME = 60000; // Points fade after 60 seconds

// ============================================================================
// Trail System Creation
// ============================================================================

/**
 * Create the trail system
 */
export function createTrailSystem(scene: THREE.Scene): TrailSystem {
  const system: TrailSystem = {
    scene,
    points: [],
    mesh: null,
    isVisible: false,
    lastRecordedPosition: new THREE.Vector3(),
    cleanup: () => {
      if (system.mesh) {
        scene.remove(system.mesh);
        system.mesh.geometry.dispose();
        (system.mesh.material as THREE.Material).dispose();
        system.mesh = null;
      }
    },
  };

  return system;
}

/**
 * Record a position on the trail
 */
export function recordTrailPosition(
  system: TrailSystem,
  position: THREE.Vector3
): void {
  // Check minimum distance
  const distance = position.distanceTo(system.lastRecordedPosition);
  if (distance < MIN_DISTANCE) return;

  // Add point
  system.points.push({
    position: position.clone(),
    timestamp: Date.now(),
  });

  // Limit points
  if (system.points.length > MAX_POINTS) {
    system.points.shift();
  }

  system.lastRecordedPosition.copy(position);

  // Update mesh if visible
  if (system.isVisible) {
    updateTrailMesh(system);
  }
}

/**
 * Show the trail
 */
export function showTrail(system: TrailSystem): void {
  if (system.isVisible) return;

  system.isVisible = true;
  updateTrailMesh(system);
}

/**
 * Hide the trail
 */
export function hideTrail(system: TrailSystem): void {
  if (!system.isVisible) return;

  system.isVisible = false;

  if (system.mesh) {
    system.scene.remove(system.mesh);
    system.mesh.geometry.dispose();
    (system.mesh.material as THREE.Material).dispose();
    system.mesh = null;
  }
}

/**
 * Toggle trail visibility
 */
export function toggleTrail(system: TrailSystem): void {
  if (system.isVisible) {
    hideTrail(system);
  } else {
    showTrail(system);
  }
}

/**
 * Update the trail mesh geometry
 */
function updateTrailMesh(system: TrailSystem): void {
  // Remove old mesh
  if (system.mesh) {
    system.scene.remove(system.mesh);
    system.mesh.geometry.dispose();
  }

  if (system.points.length < 2) return;

  // Filter out old points
  const now = Date.now();
  const activePoints = system.points.filter(
    p => now - p.timestamp < TRAIL_FADE_TIME
  );

  if (activePoints.length < 2) return;

  // Create geometry
  const positions: number[] = [];
  const colors: number[] = [];
  const color = new THREE.Color(TRAIL_COLOR);

  activePoints.forEach((point, index) => {
    // Position at floor level
    positions.push(point.position.x, 0.05, point.position.z);

    // Fade based on age
    const age = (now - point.timestamp) / TRAIL_FADE_TIME;
    const alpha = 1 - age;
    colors.push(color.r * alpha, color.g * alpha, color.b * alpha);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });

  system.mesh = new THREE.Line(geometry, material);
  system.scene.add(system.mesh);
}

/**
 * Update trail (called each frame to fade old points)
 */
export function updateTrail(system: TrailSystem): void {
  if (!system.isVisible) return;

  // Update mesh periodically to fade old points
  updateTrailMesh(system);
}

/**
 * Clear the trail
 */
export function clearTrail(system: TrailSystem): void {
  system.points = [];
  system.lastRecordedPosition.set(0, 0, 0);

  if (system.mesh) {
    system.scene.remove(system.mesh);
    system.mesh.geometry.dispose();
    (system.mesh.material as THREE.Material).dispose();
    system.mesh = null;
  }
}

/**
 * Get trail statistics
 */
export function getTrailStats(system: TrailSystem): {
  totalPoints: number;
  totalDistance: number;
} {
  let totalDistance = 0;
  for (let i = 1; i < system.points.length; i++) {
    totalDistance += system.points[i].position.distanceTo(
      system.points[i - 1].position
    );
  }

  return {
    totalPoints: system.points.length,
    totalDistance,
  };
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTrailSystem(system: TrailSystem): void {
  system.cleanup();
  system.points = [];
}
