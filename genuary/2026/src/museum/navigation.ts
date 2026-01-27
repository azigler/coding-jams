/**
 * Museum Navigation System
 *
 * WASD + mouse look navigation for desktop.
 * Future: touch controls for mobile, WebXR for VR.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Navigation Creation
// ============================================================================

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
 * Handle key down events
 */
function handleKeyDown(navigation: Navigation, event: KeyboardEvent): void {
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

  // Apply velocity to camera position
  navigation.camera.position.addScaledVector(navigation.velocity, deltaTime);

  // Keep camera at fixed height (no jumping/crouching for now)
  navigation.camera.position.y = 1.6;

  // TODO: Add collision detection
  // - Raycast from camera position in movement direction
  // - Stop movement if collision detected
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
