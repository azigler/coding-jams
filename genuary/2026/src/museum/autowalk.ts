/**
 * Auto-Walk Mode
 *
 * Leisurely automatic exploration of the museum.
 * Different from tour - more relaxed, random wandering.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface AutoWalk {
  isActive: boolean;
  camera: THREE.PerspectiveCamera | null;
  exhibitMeshes: THREE.Mesh[];
  currentTarget: THREE.Vector3;
  lookTarget: THREE.Vector3;
  dwellTime: number;
  movementSpeed: number;
  visitedOrder: number[];
  onExhibitReached: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const WALK_SPEED = 2; // Units per second
const DWELL_TIME = 5000; // Time to pause at each exhibit (ms)
const ROTATION_SPEED = 0.03;

// ============================================================================
// Auto-Walk Creation
// ============================================================================

/**
 * Create the auto-walk system
 */
export function createAutoWalk(): AutoWalk {
  const walk: AutoWalk = {
    isActive: false,
    camera: null,
    exhibitMeshes: [],
    currentTarget: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
    dwellTime: 0,
    movementSpeed: WALK_SPEED,
    visitedOrder: [],
    onExhibitReached: null,
    cleanup: () => {},
  };

  return walk;
}

/**
 * Start auto-walk mode
 */
export function startAutoWalk(
  walk: AutoWalk,
  camera: THREE.PerspectiveCamera,
  exhibitMeshes: THREE.Mesh[]
): void {
  walk.isActive = true;
  walk.camera = camera;
  walk.exhibitMeshes = exhibitMeshes;
  walk.visitedOrder = [];
  walk.dwellTime = 0;

  // Pick first random target
  pickNextTarget(walk);
}

/**
 * Stop auto-walk mode
 */
export function stopAutoWalk(walk: AutoWalk): void {
  walk.isActive = false;
  walk.camera = null;
  walk.exhibitMeshes = [];
}

/**
 * Toggle auto-walk mode
 */
export function toggleAutoWalk(
  walk: AutoWalk,
  camera: THREE.PerspectiveCamera,
  exhibitMeshes: THREE.Mesh[]
): boolean {
  if (walk.isActive) {
    stopAutoWalk(walk);
    return false;
  } else {
    startAutoWalk(walk, camera, exhibitMeshes);
    return true;
  }
}

/**
 * Update auto-walk (call each frame)
 */
export function updateAutoWalk(walk: AutoWalk, deltaTime: number): boolean {
  if (!walk.isActive || !walk.camera) return false;

  // Check if dwelling
  if (walk.dwellTime > 0) {
    walk.dwellTime -= deltaTime * 1000;
    // Slowly look around during dwell
    const wobble = Math.sin(Date.now() / 2000) * 0.1;
    const lookDir = new THREE.Vector3()
      .subVectors(walk.lookTarget, walk.camera.position)
      .normalize();
    lookDir.x += wobble;
    walk.camera.lookAt(
      walk.camera.position.x + lookDir.x,
      walk.camera.position.y + lookDir.y,
      walk.camera.position.z + lookDir.z
    );
    return true;
  }

  // Move toward target
  const distanceToTarget = walk.camera.position.distanceTo(walk.currentTarget);

  if (distanceToTarget < 0.5) {
    // Reached target - dwell and pick next
    walk.dwellTime = DWELL_TIME;

    // Find which exhibit we reached
    const closestExhibit = findClosestExhibit(walk, walk.camera.position);
    if (closestExhibit !== -1) {
      walk.onExhibitReached?.(closestExhibit);
    }

    pickNextTarget(walk);
    return true;
  }

  // Move toward target
  const direction = new THREE.Vector3()
    .subVectors(walk.currentTarget, walk.camera.position)
    .normalize();

  const moveDistance = walk.movementSpeed * deltaTime;
  walk.camera.position.add(direction.multiplyScalar(moveDistance));

  // Smoothly rotate to face target
  const targetQuaternion = new THREE.Quaternion();
  const lookMatrix = new THREE.Matrix4();
  lookMatrix.lookAt(walk.camera.position, walk.lookTarget, new THREE.Vector3(0, 1, 0));
  targetQuaternion.setFromRotationMatrix(lookMatrix);
  walk.camera.quaternion.slerp(targetQuaternion, ROTATION_SPEED);

  return true;
}

/**
 * Pick the next target to walk to
 */
function pickNextTarget(walk: AutoWalk): void {
  if (!walk.camera || walk.exhibitMeshes.length === 0) return;

  // Find unvisited exhibits
  const unvisited = walk.exhibitMeshes
    .map((mesh, index) => ({ mesh, index }))
    .filter(({ mesh }) => {
      const dayNumber = mesh.userData.dayNumber;
      return !walk.visitedOrder.includes(dayNumber);
    });

  // If all visited, reset
  if (unvisited.length === 0) {
    walk.visitedOrder = [];
    pickNextTarget(walk);
    return;
  }

  // Pick random unvisited exhibit
  const choice = unvisited[Math.floor(Math.random() * unvisited.length)];
  const mesh = choice.mesh;
  const dayNumber = mesh.userData.dayNumber;

  walk.visitedOrder.push(dayNumber);

  // Get exhibit position
  const exhibitPos = new THREE.Vector3();
  mesh.getWorldPosition(exhibitPos);

  // Calculate viewing position (in front of exhibit)
  const normal = new THREE.Vector3(0, 0, 1);
  if (mesh.parent) {
    normal.applyQuaternion(mesh.parent.quaternion);
  }

  walk.currentTarget.copy(exhibitPos).addScaledVector(normal, 2.5);
  walk.currentTarget.y = 1.6; // Eye height

  // Look at the exhibit
  walk.lookTarget.copy(exhibitPos);
  walk.lookTarget.y = 1.6;
}

/**
 * Find closest exhibit to a position
 */
function findClosestExhibit(walk: AutoWalk, position: THREE.Vector3): number {
  let closestDay = -1;
  let closestDist = Infinity;

  const tempPos = new THREE.Vector3();

  for (const mesh of walk.exhibitMeshes) {
    mesh.getWorldPosition(tempPos);
    const dist = position.distanceTo(tempPos);
    if (dist < closestDist) {
      closestDist = dist;
      closestDay = mesh.userData.dayNumber ?? -1;
    }
  }

  return closestDist < 5 ? closestDay : -1;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose auto-walk system
 */
export function disposeAutoWalk(walk: AutoWalk): void {
  stopAutoWalk(walk);
  walk.cleanup();
}
