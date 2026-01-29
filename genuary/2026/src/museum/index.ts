/**
 * Genuary 2026 Virtual Museum
 *
 * A WebXR virtual museum that showcases all 31 days of Genuary
 * as a unified, navigable 3D experience.
 *
 * The art doesn't hang on walls - it BECOMES the architecture.
 */

import { createScene, updateScene, disposeScene, setQuality, type MuseumScene } from './scene';
import { createNavigation, updateNavigation, disposeNavigation, type Navigation } from './navigation';
import { initAudio, startAmbient, disposeAudio, setAudioMuted } from './audio';
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
import { updateArtworkVisibility } from './exhibits/artwork';
import {
  createTouchControls,
  disposeTouchControls,
  isTouchDevice,
  type TouchControls,
} from './touch';
import {
  createMinimap,
  updateMinimap,
  disposeMinimap,
  type Minimap,
} from './minimap';
import {
  createSettingsPanel,
  disposeSettingsPanel,
  type SettingsPanel,
  type Settings,
} from './settings';
import {
  createDiscoveryTracker,
  markDayDiscovered,
  refreshDiscoveryBadge,
  disposeDiscoveryTracker,
  type DiscoveryTracker,
} from './discovery';
import {
  createFavoritesSystem,
  toggleFavorite,
  isFavorite,
  getFavorites,
  disposeFavoritesSystem,
  type FavoritesSystem,
} from './favorites';

// ============================================================================
// Types
// ============================================================================

export interface MuseumContext {
  scene: MuseumScene;
  navigation: Navigation;
  interaction: InteractionSystem;
  tour: TourSystem;
  touch: TouchControls | null;
  minimap: Minimap;
  settings: SettingsPanel;
  discovery: DiscoveryTracker;
  favorites: FavoritesSystem;
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
 * Take a screenshot of the current view
 */
function takeScreenshot(canvas: HTMLCanvasElement): void {
  try {
    // Create a link element
    const link = document.createElement('a');
    link.download = `genuary-museum-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Show confirmation
    showNotification('Screenshot saved!');
  } catch (e) {
    console.error('Screenshot failed:', e);
    showNotification('Screenshot failed');
  }
}

/**
 * Show a temporary notification
 */
function showNotification(message: string): void {
  const existing = document.getElementById('museum-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'museum-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(74, 158, 255, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 1000;
    animation: fadeInOut 2s ease-in-out;
  `;
  notification.textContent = message;

  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
      15% { opacity: 1; transform: translateX(-50%) translateY(0); }
      85% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
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
        <div><b>F</b> Fav</div>
        <div><b>J</b> Jump Fav</div>
        <div><b>P</b> Photo</div>
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

  // Create touch controls for mobile devices
  const touch = isTouchDevice() ? createTouchControls(container, navigation) : null;

  // Create minimap
  const minimap = createMinimap(container);

  // Create settings panel
  const settings = createSettingsPanel(container);

  // Handle settings changes
  settings.onSettingsChange = (newSettings: Settings) => {
    // Toggle minimap visibility
    minimap.canvas.style.display = newSettings.minimapVisible ? 'block' : 'none';

    // Toggle sound
    setAudioMuted(!newSettings.soundEnabled);

    // Apply quality settings
    setQuality(scene, newSettings.qualityLevel);
  };

  // Apply initial settings
  if (!settings.settings.minimapVisible) {
    minimap.canvas.style.display = 'none';
  }
  if (!settings.settings.soundEnabled) {
    setAudioMuted(true);
  }
  // Apply initial quality (default is medium, which matches our defaults)
  if (settings.settings.qualityLevel !== 'medium') {
    setQuality(scene, settings.settings.qualityLevel);
  }

  // Create favorites system (before discovery, so we can wire them up)
  const favorites = createFavoritesSystem();

  // Create discovery tracker
  const discovery = createDiscoveryTracker(container);

  // Wire up discovery to access favorites
  discovery.getFavoritesCount = () => getFavorites(favorites).length;
  discovery.isFavorite = (dayNumber: number) => isFavorite(favorites, dayNumber);

  // Wire up interaction to track discoveries
  interaction.onExhibitViewed = (dayNumber: number) => {
    markDayDiscovered(discovery, dayNumber);
  };

  // Wire up interaction to toggle favorites
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const nowFavorite = toggleFavorite(favorites, dayNumber);
    showNotification(nowFavorite ? `Day ${dayNumber} added to favorites` : `Day ${dayNumber} removed from favorites`);
    // Update discovery badge to show new favorites count
    refreshDiscoveryBadge(discovery);
  };

  // Wire up interaction to check favorite status
  interaction.isFavorite = (dayNumber: number) => {
    return isFavorite(favorites, dayNumber);
  };

  // Wire up interaction to get all favorites
  interaction.getFavorites = () => {
    return getFavorites(favorites);
  };

  updateLoadingProgress(80, 'Preparing gallery...');

  // Show help overlay and location indicator (skip on touch devices - they get their own help)
  if (!isTouchDevice()) {
    createHelpOverlay(container);
  }
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

  // Screenshot with P key
  const screenshotHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP') {
      takeScreenshot(scene.renderer.domElement);
    }
  };
  document.addEventListener('keydown', screenshotHandler);

  context = {
    scene,
    navigation,
    interaction,
    tour,
    touch,
    minimap,
    settings,
    discovery,
    favorites,
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

    // Update artwork visibility (animate only visible exhibits)
    updateArtworkVisibility(context.scene.camera, context.interaction.exhibitMeshes);

    // Update location indicator
    const pos = context.scene.camera.position;
    updateLocationIndicator(pos.z, pos.x);

    // Update minimap
    updateMinimap(context.minimap, context.scene.camera);

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
  if (context.touch) {
    disposeTouchControls(context.touch);
  }
  disposeMinimap(context.minimap);
  disposeSettingsPanel(context.settings);
  disposeDiscoveryTracker(context.discovery);
  disposeFavoritesSystem(context.favorites);
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
