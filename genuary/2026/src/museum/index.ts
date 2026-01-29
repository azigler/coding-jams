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
  sortExhibitsByDay,
  type InteractionSystem,
} from './interaction';
import {
  createTourSystem,
  startTour,
  stopTour,
  toggleTour,
  updateTour,
  disposeTour,
  type TourSystem,
} from './tour';

// ============================================================================
// Types
// ============================================================================

export interface MuseumContext {
  scene: MuseumScene;
  navigation: Navigation;
  interaction: InteractionSystem;
  tour: TourSystem;
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
// Loading Indicator
// ============================================================================

/**
 * Show loading overlay while museum initializes
 */
function showLoadingOverlay(container: HTMLElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'museum-loading';
  overlay.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%);
      color: white;
      font-family: system-ui, sans-serif;
      z-index: 1000;
      transition: opacity 0.5s;
    ">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">
        GENUARY 2026
      </div>
      <div style="font-size: 16px; color: #888; margin-bottom: 24px;">
        Virtual Museum
      </div>
      <div style="
        width: 200px;
        height: 4px;
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
        overflow: hidden;
      ">
        <div id="loading-bar" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #4a9eff, #a855f7);
          border-radius: 2px;
          transition: width 0.3s;
          animation: loading-pulse 1.5s ease-in-out infinite;
        "></div>
      </div>
      <div id="loading-text" style="
        margin-top: 12px;
        font-size: 12px;
        color: #666;
      ">Loading...</div>
      <style>
        @keyframes loading-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      </style>
    </div>
  `;
  container.appendChild(overlay);
  return overlay;
}

/**
 * Update loading progress
 */
function updateLoadingProgress(percent: number, status: string): void {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = status;
}

/**
 * Hide loading overlay with fade out
 */
function hideLoadingOverlay(): void {
  const overlay = document.getElementById('museum-loading');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
  }
}

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
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
        <div><b>WASD</b> Move</div>
        <div><b>Drag</b> Look</div>
        <div><b>0-5</b> Teleport</div>
        <div><b>Click</b> Zoom</div>
        <div><b>[ ]</b> Browse</div>
        <div><b>R</b> Random</div>
        <div><b>T</b> Tour</div>
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
  // Show loading overlay
  showLoadingOverlay(container);
  updateLoadingProgress(10, 'Initializing scene...');

  // Create Three.js scene
  const scene = createScene(container);
  updateLoadingProgress(40, 'Setting up navigation...');

  // Create navigation system
  const navigation = createNavigation(scene.camera, scene.renderer.domElement);
  updateLoadingProgress(60, 'Registering exhibits...');

  // Create interaction system for click-to-zoom
  const interaction = createInteraction(scene.camera, scene.scene, scene.renderer.domElement);

  // Register all exhibits for interaction
  if (scene.galleryZone) {
    registerExhibits(interaction, scene.galleryZone.exhibits);
  }
  scene.wingZones.forEach(wing => {
    registerExhibits(interaction, wing.exhibits);
  });

  // Sort exhibits by day number for logical browsing
  sortExhibitsByDay(interaction);

  // Create guided tour system
  const tour = createTourSystem(navigation, interaction);
  updateLoadingProgress(80, 'Preparing gallery...');

  // Show help overlay and location indicator
  createHelpOverlay(container);
  createLocationIndicator(container);
  updateLoadingProgress(100, 'Welcome!');

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

  // Tour toggle with T key
  const tourToggleHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && !interaction.isZoomed) {
      toggleTour(tour);
    }
  };
  document.addEventListener('keydown', tourToggleHandler);

  context = {
    scene,
    navigation,
    interaction,
    tour,
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

  // Hide loading overlay after a short delay
  setTimeout(() => {
    hideLoadingOverlay();
    console.log('Museum loaded. Use WASD to move, click and drag to look around.');
  }, 500);

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

    // Update guided tour if active
    const tourActive = updateTour(context.tour, deltaTime);

    // Update navigation only if not in zoom mode or tour mode
    if (!interactionActive && !context.interaction.isZoomed && !tourActive) {
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
  disposeTour(context.tour);
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
