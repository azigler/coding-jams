/**
 * Museum Spotlight System
 *
 * Adds dramatic spotlight effect when viewing exhibits.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Spotlight {
  scene: THREE.Scene;
  light: THREE.SpotLight;
  target: THREE.Object3D;
  originalAmbientIntensity: number;
  ambientLight: THREE.AmbientLight | null;
  enabled: boolean;
  isActive: boolean;
  cleanup: () => void;
}

// ============================================================================
// Spotlight Creation
// ============================================================================

/**
 * Create the spotlight system
 */
export function createSpotlight(scene: THREE.Scene): Spotlight {
  // Create spotlight (initially invisible)
  const light = new THREE.SpotLight(0xffffff, 0);
  light.angle = Math.PI / 8; // Narrow cone
  light.penumbra = 0.5; // Soft edges
  light.decay = 1;
  light.distance = 15;
  light.castShadow = false; // No shadow for performance

  // Create target for spotlight to point at
  const target = new THREE.Object3D();
  light.target = target;

  scene.add(light);
  scene.add(target);

  // Find ambient light for dimming
  let ambientLight: THREE.AmbientLight | null = null;
  let originalAmbientIntensity = 0.5;

  scene.traverse(obj => {
    if (obj instanceof THREE.AmbientLight) {
      ambientLight = obj;
      originalAmbientIntensity = obj.intensity;
    }
  });

  const spotlight: Spotlight = {
    scene,
    light,
    target,
    originalAmbientIntensity,
    ambientLight,
    enabled: true,
    isActive: false,
    cleanup: () => {
      scene.remove(light);
      scene.remove(target);
      light.dispose();
    },
  };

  return spotlight;
}

/**
 * Activate spotlight on a specific position
 */
export function activateSpotlight(
  spotlight: Spotlight,
  exhibitPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3
): void {
  if (!spotlight.enabled) return;

  spotlight.isActive = true;

  // Position light between camera and exhibit, slightly above
  const lightPos = new THREE.Vector3().lerpVectors(
    cameraPosition,
    exhibitPosition,
    0.3
  );
  lightPos.y = cameraPosition.y + 2; // Above eye level
  spotlight.light.position.copy(lightPos);

  // Point at exhibit
  spotlight.target.position.copy(exhibitPosition);

  // Fade in spotlight
  animateLightIntensity(spotlight, 2.0, 300);

  // Dim ambient light slightly
  if (spotlight.ambientLight) {
    animateAmbientIntensity(spotlight, spotlight.originalAmbientIntensity * 0.4, 300);
  }
}

/**
 * Deactivate spotlight
 */
export function deactivateSpotlight(spotlight: Spotlight): void {
  if (!spotlight.isActive) return;

  spotlight.isActive = false;

  // Fade out spotlight
  animateLightIntensity(spotlight, 0, 300);

  // Restore ambient light
  if (spotlight.ambientLight) {
    animateAmbientIntensity(spotlight, spotlight.originalAmbientIntensity, 300);
  }
}

/**
 * Update spotlight to follow exhibit (for smooth transitions)
 */
export function updateSpotlightTarget(
  spotlight: Spotlight,
  exhibitPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3
): void {
  if (!spotlight.isActive) return;

  // Smoothly update light position
  const lightPos = new THREE.Vector3().lerpVectors(
    cameraPosition,
    exhibitPosition,
    0.3
  );
  lightPos.y = cameraPosition.y + 2;
  spotlight.light.position.lerp(lightPos, 0.1);

  // Update target
  spotlight.target.position.lerp(exhibitPosition, 0.1);
}

/**
 * Set whether spotlight is enabled
 */
export function setSpotlightEnabled(spotlight: Spotlight, enabled: boolean): void {
  spotlight.enabled = enabled;
  if (!enabled && spotlight.isActive) {
    deactivateSpotlight(spotlight);
  }
}

// ============================================================================
// Animation Helpers
// ============================================================================

function animateLightIntensity(
  spotlight: Spotlight,
  targetIntensity: number,
  duration: number
): void {
  const startIntensity = spotlight.light.intensity;
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

    spotlight.light.intensity = startIntensity + (targetIntensity - startIntensity) * eased;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

function animateAmbientIntensity(
  spotlight: Spotlight,
  targetIntensity: number,
  duration: number
): void {
  if (!spotlight.ambientLight) return;

  const startIntensity = spotlight.ambientLight.intensity;
  const startTime = performance.now();
  const ambientLight = spotlight.ambientLight;

  function animate() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

    ambientLight.intensity = startIntensity + (targetIntensity - startIntensity) * eased;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose spotlight system
 */
export function disposeSpotlight(spotlight: Spotlight): void {
  deactivateSpotlight(spotlight);
  spotlight.cleanup();
}
