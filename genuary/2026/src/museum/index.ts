/**
 * Genuary 2026 Virtual Museum
 *
 * A WebXR virtual museum that showcases all 31 days of Genuary
 * as a unified, navigable 3D experience.
 *
 * The art doesn't hang on walls - it BECOMES the architecture.
 */

import { createScene, updateScene, disposeScene, type MuseumScene } from './scene';
import { createNavigation, updateNavigation, disposeNavigation, type Navigation } from './navigation';

// ============================================================================
// Types
// ============================================================================

export interface MuseumContext {
  scene: MuseumScene;
  navigation: Navigation;
  container: HTMLElement;
  isRunning: boolean;
  lastTime: number;
  animationId: number | null;
}

// ============================================================================
// State
// ============================================================================

let context: MuseumContext | null = null;

// ============================================================================
// Museum Lifecycle
// ============================================================================

/**
 * Initialize the museum
 */
export function initMuseum(container: HTMLElement): MuseumContext {
  // Create Three.js scene
  const scene = createScene(container);

  // Create navigation system
  const navigation = createNavigation(scene.camera, scene.renderer.domElement);

  context = {
    scene,
    navigation,
    container,
    isRunning: false,
    lastTime: 0,
    animationId: null,
  };

  // Expose debug API
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).museumSetCamera = (x: number, y: number, z: number) => {
      if (context) {
        context.scene.camera.position.set(x, y, z);
      }
    };
    (window as unknown as Record<string, unknown>).museumLookAt = (x: number, y: number, z: number) => {
      if (context) {
        context.scene.camera.lookAt(x, y, z);
        // Update navigation euler to match new camera orientation
        context.navigation.euler.setFromQuaternion(context.scene.camera.quaternion);
      }
    };
    (window as unknown as Record<string, unknown>).museumGetFPS = () => {
      if (context && context.lastTime) {
        return Math.round(1000 / context.lastTime);
      }
      return 0;
    };
  }

  return context;
}

/**
 * Start the museum render loop
 */
export function startMuseum(): void {
  if (!context || context.isRunning) return;

  context.isRunning = true;
  context.lastTime = performance.now();

  const animate = (time: number) => {
    if (!context || !context.isRunning) return;

    const deltaTime = (time - context.lastTime) / 1000;
    context.lastTime = time;

    // Update navigation (camera movement)
    updateNavigation(context.navigation, deltaTime);

    // Update scene (animations, etc.)
    updateScene(context.scene, deltaTime);

    // Render
    context.scene.renderer.render(context.scene.scene, context.scene.camera);

    context.animationId = requestAnimationFrame(animate);
  };

  context.animationId = requestAnimationFrame(animate);
}

/**
 * Stop the museum render loop
 */
export function stopMuseum(): void {
  if (!context) return;

  context.isRunning = false;

  if (context.animationId !== null) {
    cancelAnimationFrame(context.animationId);
    context.animationId = null;
  }
}

/**
 * Clean up the museum
 */
export function disposeMuseum(): void {
  if (!context) return;

  stopMuseum();
  disposeNavigation(context.navigation);
  disposeScene(context.scene);

  // Remove debug API
  if (typeof window !== 'undefined') {
    delete (window as unknown as Record<string, unknown>).museumSetCamera;
    delete (window as unknown as Record<string, unknown>).museumGetFPS;
  }

  context = null;
}

/**
 * Get the current museum context (for testing)
 */
export function getMuseumContext(): MuseumContext | null {
  return context;
}

/**
 * Get the canvas element
 */
export function getMuseumCanvas(): HTMLCanvasElement | null {
  return context?.scene.renderer.domElement ?? null;
}
