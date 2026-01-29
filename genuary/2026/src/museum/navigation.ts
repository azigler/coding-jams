/**
 * Museum Navigation System
 *
 * WASD + mouse look navigation for desktop.
 * Future: touch controls for mobile, WebXR for VR.
 */

import * as THREE from 'three';
import { playFootstep, playTeleport } from './audio';

// ============================================================================
// Types
// ============================================================================

/**
 * Axis-aligned bounding box for collision
 */
export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Navigation {
  camera: THREE.PerspectiveCamera;
  element: HTMLElement;

  // Movement state
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;

  // Mouse look state
  isLooking: boolean;
  euler: THREE.Euler;

  // Velocity for smooth movement
  velocity: THREE.Vector3;

  // Collision boundaries
  collisionBoxes: CollisionBox[];

  // Footstep timing
  footstepTimer: number;

  // Cleanup handlers
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

// Movement speed (meters per second)
const MOVE_SPEED = 5;

// Mouse sensitivity
const MOUSE_SENSITIVITY = 0.002;

// Vertical look limits (radians)
const MIN_POLAR_ANGLE = Math.PI * 0.1; // Look up limit
const MAX_POLAR_ANGLE = Math.PI * 0.9; // Look down limit

// Movement damping
const DAMPING = 10;

// Player collision radius (how close to walls)
const PLAYER_RADIUS = 0.3;

// ============================================================================
// Navigation Creation
// ============================================================================

/**
 * Create navigation controls
 */
/**
 * Generate collision boundaries for the museum
 */
function createCollisionBoundaries(): CollisionBox[] {
  const boxes: CollisionBox[] = [];

  // Entrance hallway configuration
  const hallWidth = 4;
  const hallLength = 20;

  // Entrance hallway - allowed area (inside the hallway)
  // Player must stay within x: [-hallWidth/2 + radius, hallWidth/2 - radius]
  // and z: [1, -hallLength] while in the hallway

  // Gallery configuration
  const galleryRadius = 12;
  const galleryZ = -20 - galleryRadius; // -32

  // For simplicity, define the allowed movement area as an inverse
  // (where player CAN go) rather than walls (where they can't)
  // We'll use a different approach: define walls as solid boxes

  // Entrance hallway walls (solid boxes)
  // Left wall of entrance
  boxes.push({
    minX: -50, // Far left
    maxX: -hallWidth / 2, // Wall edge
    minZ: -hallLength - 5,
    maxZ: 5,
  });

  // Right wall of entrance
  boxes.push({
    minX: hallWidth / 2, // Wall edge
    maxX: 50, // Far right
    minZ: -hallLength - 5,
    maxZ: 5,
  });

  // Back wall (behind spawn)
  boxes.push({
    minX: -50,
    maxX: 50,
    minZ: 1, // Behind spawn at z=0
    maxZ: 50,
  });

  // The gallery is octagonal, but for simple collision we approximate
  // with a circular boundary. We'll handle this in the collision check.

  return boxes;
}

/**
 * Create navigation controls
 */
export function createNavigation(
  camera: THREE.PerspectiveCamera,
  element: HTMLElement
): Navigation {
  const navigation: Navigation = {
    camera,
    element,
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    isLooking: false,
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    velocity: new THREE.Vector3(),
    collisionBoxes: createCollisionBoundaries(),
    footstepTimer: 0,
    cleanup: () => {},
  };

  // Initialize euler from camera
  navigation.euler.setFromQuaternion(camera.quaternion);

  // Set up event listeners
  const onKeyDown = (event: KeyboardEvent) => handleKeyDown(navigation, event);
  const onKeyUp = (event: KeyboardEvent) => handleKeyUp(navigation, event);
  const onMouseDown = (event: MouseEvent) => handleMouseDown(navigation, event);
  const onMouseUp = () => handleMouseUp(navigation);
  const onMouseMove = (event: MouseEvent) => handleMouseMove(navigation, event);
  const onContextMenu = (event: Event) => event.preventDefault();

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  element.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
  element.addEventListener('contextmenu', onContextMenu);

  // Store cleanup function
  navigation.cleanup = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    element.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('contextmenu', onContextMenu);
  };

  return navigation;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Teleport points for quick navigation (press 0-5 or Home)
 */
const TELEPORT_POINTS: Record<string, { pos: [number, number, number]; lookAt: [number, number, number]; name: string }> = {
  'Digit0': { pos: [0, 1.6, 0], lookAt: [0, 1.6, -20], name: 'Spawn' },         // Original spawn
  'Home': { pos: [0, 1.6, 0], lookAt: [0, 1.6, -20], name: 'Spawn' },           // Home key alias
  'Digit1': { pos: [0, 1.6, -2], lookAt: [0, 1.6, -20], name: 'Entrance' },     // Entrance
  'Digit2': { pos: [0, 1.6, -32], lookAt: [0, 1.6, -50], name: 'Gallery' },     // Gallery center
  'Digit3': { pos: [0, 1.6, -44], lookAt: [0, 1.6, -60], name: 'North Wing' },  // North wing
  'Digit4': { pos: [-16, 1.6, -32], lookAt: [-30, 1.6, -32], name: 'West Wing' }, // West wing
  'Digit5': { pos: [16, 1.6, -32], lookAt: [30, 1.6, -32], name: 'East Wing' },   // East wing
};

/**
 * Handle key down events
 */
function handleKeyDown(navigation: Navigation, event: KeyboardEvent): void {
  // Check for teleport keys
  const teleport = TELEPORT_POINTS[event.code];
  if (teleport) {
    const { pos, lookAt, name } = teleport;
    navigation.camera.position.set(pos[0], pos[1], pos[2]);
    navigation.camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    navigation.euler.setFromQuaternion(navigation.camera.quaternion);
    navigation.velocity.set(0, 0, 0);
    playTeleport();
    console.log(`Teleported to ${name}`);
    return;
  }

  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      navigation.moveForward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      navigation.moveBackward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      navigation.moveLeft = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      navigation.moveRight = true;
      break;
  }
}

/**
 * Handle key up events
 */
function handleKeyUp(navigation: Navigation, event: KeyboardEvent): void {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      navigation.moveForward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      navigation.moveBackward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      navigation.moveLeft = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      navigation.moveRight = false;
      break;
  }
}

/**
 * Handle mouse down events
 */
function handleMouseDown(navigation: Navigation, event: MouseEvent): void {
  // Left click or right click to start looking
  if (event.button === 0 || event.button === 2) {
    navigation.isLooking = true;
    navigation.element.style.cursor = 'grabbing';
  }
}

/**
 * Handle mouse up events
 */
function handleMouseUp(navigation: Navigation): void {
  navigation.isLooking = false;
  navigation.element.style.cursor = 'grab';
}

/**
 * Handle mouse move events
 */
function handleMouseMove(navigation: Navigation, event: MouseEvent): void {
  if (!navigation.isLooking) return;

  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  // Update euler angles
  navigation.euler.y -= movementX * MOUSE_SENSITIVITY;
  navigation.euler.x -= movementY * MOUSE_SENSITIVITY;

  // Clamp vertical rotation
  navigation.euler.x = Math.max(
    Math.PI / 2 - MAX_POLAR_ANGLE,
    Math.min(Math.PI / 2 - MIN_POLAR_ANGLE, navigation.euler.x)
  );

  // Apply to camera
  navigation.camera.quaternion.setFromEuler(navigation.euler);
}

// ============================================================================
// Navigation Update
// ============================================================================

/**
 * Check if a position collides with any collision box
 */
function checkBoxCollision(x: number, z: number, boxes: CollisionBox[]): boolean {
  for (const box of boxes) {
    if (
      x >= box.minX - PLAYER_RADIUS &&
      x <= box.maxX + PLAYER_RADIUS &&
      z >= box.minZ - PLAYER_RADIUS &&
      z <= box.maxZ + PLAYER_RADIUS
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if position is inside an allowed zone
 */
interface AllowedZone {
  type: 'rect' | 'circle';
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
  centerX?: number;
  centerZ?: number;
  radius?: number;
}

/**
 * Define all allowed movement zones in the museum
 */
function getAllowedZones(): AllowedZone[] {
  const galleryZ = -32;
  const galleryRadius = 11; // Slightly less than 12 for wall clearance
  const wingLength = 18;
  const wingWidth = 5; // Slightly less than 6 for wall clearance
  const wallDist = galleryRadius * Math.cos(Math.PI / 8); // ~11.1

  return [
    // Entrance hallway
    {
      type: 'rect',
      minX: -1.7,
      maxX: 1.7,
      minZ: -21,
      maxZ: 1,
    },
    // Main gallery (octagonal approximated as circle)
    {
      type: 'circle',
      centerX: 0,
      centerZ: galleryZ,
      radius: galleryRadius,
    },
    // North wing corridor (extends from gallery toward -Z)
    {
      type: 'rect',
      minX: -wingWidth / 2,
      maxX: wingWidth / 2,
      minZ: galleryZ - wallDist - wingLength,
      maxZ: galleryZ - wallDist + 2,
    },
    // West wing corridor (extends from gallery toward -X)
    {
      type: 'rect',
      minX: -wallDist - wingLength,
      maxX: -wallDist + 2,
      minZ: galleryZ - wingWidth / 2,
      maxZ: galleryZ + wingWidth / 2,
    },
    // East wing corridor (extends from gallery toward +X)
    {
      type: 'rect',
      minX: wallDist - 2,
      maxX: wallDist + wingLength,
      minZ: galleryZ - wingWidth / 2,
      maxZ: galleryZ + wingWidth / 2,
    },
    // South wing corridor (angled, but approximate as rect for now)
    // Positioned at angle toward +X +Z from gallery
    {
      type: 'rect',
      minX: wallDist * 0.4,
      maxX: wallDist * 0.7 + wingLength * 0.7,
      minZ: galleryZ + wallDist * 0.4,
      maxZ: galleryZ + wallDist * 0.7 + wingLength * 0.7,
    },
  ];
}

// Cache allowed zones
let cachedZones: AllowedZone[] | null = null;

/**
 * Check if position is valid within the museum bounds
 */
function isPositionValid(x: number, z: number, _boxes: CollisionBox[]): boolean {
  if (!cachedZones) {
    cachedZones = getAllowedZones();
  }

  // Check if position is in any allowed zone
  for (const zone of cachedZones) {
    if (zone.type === 'rect') {
      if (
        x >= zone.minX! + PLAYER_RADIUS &&
        x <= zone.maxX! - PLAYER_RADIUS &&
        z >= zone.minZ! + PLAYER_RADIUS &&
        z <= zone.maxZ! - PLAYER_RADIUS
      ) {
        return true;
      }
    } else if (zone.type === 'circle') {
      const dx = x - zone.centerX!;
      const dz = z - zone.centerZ!;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < zone.radius! - PLAYER_RADIUS) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Update navigation each frame
 */
export function updateNavigation(navigation: Navigation, deltaTime: number): void {
  // Calculate movement direction
  const direction = new THREE.Vector3();

  if (navigation.moveForward) direction.z -= 1;
  if (navigation.moveBackward) direction.z += 1;
  if (navigation.moveLeft) direction.x -= 1;
  if (navigation.moveRight) direction.x += 1;

  // Normalize diagonal movement
  if (direction.length() > 0) {
    direction.normalize();
  }

  // Apply camera rotation to movement direction (only Y axis)
  const cameraDirection = new THREE.Vector3();
  navigation.camera.getWorldDirection(cameraDirection);
  cameraDirection.y = 0;
  cameraDirection.normalize();

  const sideDirection = new THREE.Vector3();
  sideDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
  sideDirection.normalize();

  // Calculate target velocity
  const targetVelocity = new THREE.Vector3();
  targetVelocity.addScaledVector(cameraDirection, -direction.z * MOVE_SPEED);
  targetVelocity.addScaledVector(sideDirection, direction.x * MOVE_SPEED);

  // Smooth velocity with damping
  navigation.velocity.lerp(targetVelocity, 1 - Math.exp(-DAMPING * deltaTime));

  // Calculate proposed new position
  const currentPos = navigation.camera.position.clone();
  const movement = navigation.velocity.clone().multiplyScalar(deltaTime);
  const newPos = currentPos.clone().add(movement);

  // Check collision and apply movement
  if (isPositionValid(newPos.x, newPos.z, navigation.collisionBoxes)) {
    // Full movement allowed
    navigation.camera.position.copy(newPos);
  } else {
    // Try X-only movement (slide along walls)
    const xOnlyPos = new THREE.Vector3(newPos.x, currentPos.y, currentPos.z);
    if (isPositionValid(xOnlyPos.x, xOnlyPos.z, navigation.collisionBoxes)) {
      navigation.camera.position.x = xOnlyPos.x;
      navigation.velocity.z = 0; // Stop Z velocity
    }

    // Try Z-only movement (slide along walls)
    const zOnlyPos = new THREE.Vector3(currentPos.x, currentPos.y, newPos.z);
    if (isPositionValid(zOnlyPos.x, zOnlyPos.z, navigation.collisionBoxes)) {
      navigation.camera.position.z = zOnlyPos.z;
      navigation.velocity.x = 0; // Stop X velocity
    }
  }

  // Keep camera at fixed height (no jumping/crouching for now)
  navigation.camera.position.y = 1.6;

  // Footstep sounds when moving
  const speed = navigation.velocity.length();
  if (speed > 0.5) {
    navigation.footstepTimer += deltaTime * speed;
    // Play footstep every ~0.5 meters of movement
    if (navigation.footstepTimer > 0.5) {
      playFootstep();
      navigation.footstepTimer = 0;
    }
  } else {
    navigation.footstepTimer = 0;
  }
}

// ============================================================================
// Navigation Cleanup
// ============================================================================

/**
 * Dispose of navigation resources
 */
export function disposeNavigation(navigation: Navigation): void {
  navigation.cleanup();
}
