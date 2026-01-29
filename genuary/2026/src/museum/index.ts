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
import { initAudio, startAmbient, disposeAudio } from './audio';
import {
  createInteraction,
  updateInteraction,
  disposeInteraction,
  registerExhibits,
  type InteractionSystem,
} from './interaction';

// ============================================================================
// Types
// ============================================================================

export interface MuseumContext {
  scene: MuseumScene;
  navigation: Navigation;
  interaction: InteractionSystem;
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
 * Create the location indicator showing current area
 */
function createLocationIndicator(container: HTMLElement): HTMLElement {
  const indicator = document.createElement('div');
  indicator.id = 'museum-location';
  indicator.innerHTML = `
    <div style="
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.5);
      color: #a0a0b0;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      pointer-events: none;
      z-index: 100;
    ">
      <span id="location-text">Entrance</span>
    </div>
  `;
  container.appendChild(indicator);
  return indicator;
}

/**
 * Update the location indicator based on camera position
 */
function updateLocationIndicator(z: number, x: number): void {
  const textEl = document.getElementById('location-text');
  if (!textEl) return;

  let location = 'Entrance';

  // Determine location based on camera position
  // Gallery center is at z = -32
  if (z < -20 && z > -45) {
    if (Math.abs(x) < 8) {
      location = 'Main Gallery';
    } else if (x < -8) {
      location = 'West Wing';
    } else if (x > 8) {
      location = 'East Wing';
    }
  } else if (z <= -45) {
    location = 'North Wing';
  } else if (z >= -5) {
    location = 'Entrance';
  } else {
    location = 'Entrance Hallway';
  }

  textEl.textContent = location;
}

/**
 * Create the help overlay showing controls
 */
function createHelpOverlay(container: HTMLElement, permanent: boolean = false): HTMLElement {
  // Remove existing help overlay
  const existing = document.getElementById('museum-help');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'museum-help';
  overlay.innerHTML = `
    <div style="
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: #b0b0c0;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      pointer-events: none;
      transition: opacity 0.5s;
      z-index: 100;
    ">
      <div style="text-align: center; margin-bottom: 8px; color: #fff; font-weight: bold;">
        Controls
      </div>
      <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
        <div><b>WASD</b> Move</div>
        <div><b>Drag</b> Look</div>
        <div><b>1-5</b> Teleport</div>
        <div><b>Click</b> Zoom Exhibit</div>
        <div><b>H</b> Help</div>
      </div>
    </div>
  `;
  container.style.position = 'relative';
  container.appendChild(overlay);

  // Fade out after 5 seconds unless permanent
  if (!permanent) {
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 5000);
  }

  return overlay;
}

/**
 * Toggle help overlay visibility
 */
function toggleHelpOverlay(container: HTMLElement): void {
  const existing = document.getElementById('museum-help');
  if (existing) {
    existing.style.opacity = '0';
    setTimeout(() => existing.remove(), 300);
  } else {
    createHelpOverlay(container, true);
  }
}

/**
 * Initialize the museum
 */
export function initMuseum(container: HTMLElement): MuseumContext {
  // Create Three.js scene
  const scene = createScene(container);

  // Create navigation system
  const navigation = createNavigation(scene.camera, scene.renderer.domElement);

  // Create interaction system for click-to-zoom
  const interaction = createInteraction(scene.camera, scene.scene, scene.renderer.domElement);

  // Register all exhibits for interaction
  if (scene.galleryZone) {
    registerExhibits(interaction, scene.galleryZone.exhibits);
  }
  scene.wingZones.forEach(wing => {
    registerExhibits(interaction, wing.exhibits);
  });

  // Show help overlay and location indicator
  createHelpOverlay(container);
  createLocationIndicator(container);

  // Initialize audio on first user interaction (browser autoplay policy)
  const startAudioOnInteraction = () => {
    initAudio();
    startAmbient();
    // Remove listeners after first interaction
    document.removeEventListener('click', startAudioOnInteraction);
    document.removeEventListener('keydown', startAudioOnInteraction);
  };
  document.addEventListener('click', startAudioOnInteraction, { once: true });
  document.addEventListener('keydown', startAudioOnInteraction, { once: true });

  // Help toggle with H key
  const helpToggleHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyH') {
      toggleHelpOverlay(container);
    }
  };
  document.addEventListener('keydown', helpToggleHandler);

  context = {
    scene,
    navigation,
    interaction,
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

    // Update interaction (click-to-zoom)
    const interactionActive = updateInteraction(context.interaction, deltaTime);

    // Update navigation only if not in zoom mode
    if (!interactionActive && !context.interaction.isZoomed) {
      updateNavigation(context.navigation, deltaTime);
    }

    // Update scene (animations, etc.)
    updateScene(context.scene, deltaTime);

    // Update location indicator
    const pos = context.scene.camera.position;
    updateLocationIndicator(pos.z, pos.x);

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
  disposeAudio();
  disposeInteraction(context.interaction);
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
