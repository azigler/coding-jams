/**
 * Touch Controls for Mobile Devices
 *
 * Provides a virtual joystick for movement and touch-drag for looking.
 */

import type { Navigation } from './navigation';

// ============================================================================
// Types
// ============================================================================

export interface TouchControls {
  element: HTMLElement;
  navigation: Navigation;
  joystickContainer: HTMLElement | null;
  joystickKnob: HTMLElement | null;
  isJoystickActive: boolean;
  joystickOrigin: { x: number; y: number };
  lookTouchId: number | null;
  lastLookPos: { x: number; y: number };
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 50;
const JOYSTICK_MAX_DISTANCE = 40;
const LOOK_SENSITIVITY = 0.003;

// ============================================================================
// Touch Controls Creation
// ============================================================================

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Create touch controls overlay
 */
export function createTouchControls(
  element: HTMLElement,
  navigation: Navigation
): TouchControls {
  const controls: TouchControls = {
    element,
    navigation,
    joystickContainer: null,
    joystickKnob: null,
    isJoystickActive: false,
    joystickOrigin: { x: 0, y: 0 },
    lookTouchId: null,
    lastLookPos: { x: 0, y: 0 },
    cleanup: () => {},
  };

  // Only create UI on touch devices
  if (!isTouchDevice()) {
    return controls;
  }

  // Create joystick container
  const joystickContainer = document.createElement('div');
  joystickContainer.id = 'touch-joystick';
  joystickContainer.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
    width: ${JOYSTICK_SIZE}px;
    height: ${JOYSTICK_SIZE}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    touch-action: none;
    z-index: 1000;
  `;

  // Create joystick knob
  const joystickKnob = document.createElement('div');
  joystickKnob.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${KNOB_SIZE}px;
    height: ${KNOB_SIZE}px;
    margin-left: -${KNOB_SIZE / 2}px;
    margin-top: -${KNOB_SIZE / 2}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.7);
    transition: transform 0.05s;
  `;
  joystickContainer.appendChild(joystickKnob);
  element.appendChild(joystickContainer);

  controls.joystickContainer = joystickContainer;
  controls.joystickKnob = joystickKnob;

  // Create help text
  const helpText = document.createElement('div');
  helpText.id = 'touch-help';
  helpText.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.6);
    color: #a0a0b0;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    z-index: 1000;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.5s;
  `;
  helpText.textContent = 'Drag joystick to move • Swipe to look • Tap artwork to zoom';
  element.appendChild(helpText);

  // Fade out help text after 5 seconds
  setTimeout(() => {
    helpText.style.opacity = '0';
    setTimeout(() => helpText.remove(), 500);
  }, 5000);

  // Set up event listeners
  const onTouchStart = (e: TouchEvent) => handleTouchStart(controls, e);
  const onTouchMove = (e: TouchEvent) => handleTouchMove(controls, e);
  const onTouchEnd = (e: TouchEvent) => handleTouchEnd(controls, e);

  element.addEventListener('touchstart', onTouchStart, { passive: false });
  element.addEventListener('touchmove', onTouchMove, { passive: false });
  element.addEventListener('touchend', onTouchEnd);
  element.addEventListener('touchcancel', onTouchEnd);

  controls.cleanup = () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
    element.removeEventListener('touchcancel', onTouchEnd);
    joystickContainer.remove();
    helpText.remove();
  };

  return controls;
}

// ============================================================================
// Touch Event Handlers
// ============================================================================

/**
 * Handle touch start
 */
function handleTouchStart(controls: TouchControls, event: TouchEvent): void {
  for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[i];
    const rect = controls.element.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touch is on joystick
    if (controls.joystickContainer) {
      const joystickRect = controls.joystickContainer.getBoundingClientRect();
      const jx = touch.clientX - joystickRect.left - JOYSTICK_SIZE / 2;
      const jy = touch.clientY - joystickRect.top - JOYSTICK_SIZE / 2;
      const dist = Math.sqrt(jx * jx + jy * jy);

      if (dist < JOYSTICK_SIZE) {
        controls.isJoystickActive = true;
        controls.joystickOrigin = {
          x: joystickRect.left + JOYSTICK_SIZE / 2,
          y: joystickRect.top + JOYSTICK_SIZE / 2,
        };
        event.preventDefault();
        return;
      }
    }

    // Otherwise, this is a look touch
    if (controls.lookTouchId === null) {
      controls.lookTouchId = touch.identifier;
      controls.lastLookPos = { x: touch.clientX, y: touch.clientY };
      event.preventDefault();
    }
  }
}

/**
 * Handle touch move
 */
function handleTouchMove(controls: TouchControls, event: TouchEvent): void {
  for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[i];

    // Handle joystick movement
    if (controls.isJoystickActive && controls.joystickKnob) {
      const dx = touch.clientX - controls.joystickOrigin.x;
      const dy = touch.clientY - controls.joystickOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, JOYSTICK_MAX_DISTANCE);
      const angle = Math.atan2(dy, dx);

      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      controls.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

      // Update navigation based on joystick position
      const normalizedX = knobX / JOYSTICK_MAX_DISTANCE;
      const normalizedY = knobY / JOYSTICK_MAX_DISTANCE;

      controls.navigation.moveForward = normalizedY < -0.3;
      controls.navigation.moveBackward = normalizedY > 0.3;
      controls.navigation.moveLeft = normalizedX < -0.3;
      controls.navigation.moveRight = normalizedX > 0.3;

      event.preventDefault();
    }

    // Handle look movement
    if (touch.identifier === controls.lookTouchId) {
      const dx = touch.clientX - controls.lastLookPos.x;
      const dy = touch.clientY - controls.lastLookPos.y;

      controls.navigation.euler.y -= dx * LOOK_SENSITIVITY;
      controls.navigation.euler.x -= dy * LOOK_SENSITIVITY;

      // Clamp vertical rotation
      const MIN_POLAR = Math.PI * 0.1;
      const MAX_POLAR = Math.PI * 0.9;
      controls.navigation.euler.x = Math.max(
        Math.PI / 2 - MAX_POLAR,
        Math.min(Math.PI / 2 - MIN_POLAR, controls.navigation.euler.x)
      );

      controls.navigation.camera.quaternion.setFromEuler(controls.navigation.euler);

      controls.lastLookPos = { x: touch.clientX, y: touch.clientY };
      event.preventDefault();
    }
  }
}

/**
 * Handle touch end
 */
function handleTouchEnd(controls: TouchControls, event: TouchEvent): void {
  for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[i];

    // Reset joystick
    if (controls.isJoystickActive) {
      controls.isJoystickActive = false;
      if (controls.joystickKnob) {
        controls.joystickKnob.style.transform = 'translate(0, 0)';
      }
      controls.navigation.moveForward = false;
      controls.navigation.moveBackward = false;
      controls.navigation.moveLeft = false;
      controls.navigation.moveRight = false;
    }

    // Reset look touch
    if (touch.identifier === controls.lookTouchId) {
      controls.lookTouchId = null;
    }
  }
}

// ============================================================================
// Touch Controls Cleanup
// ============================================================================

/**
 * Dispose touch controls
 */
export function disposeTouchControls(controls: TouchControls): void {
  controls.cleanup();
}
