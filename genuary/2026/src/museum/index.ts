/**
 * Genuary 2026 Virtual Museum
 *
 * A WebXR virtual museum that showcases all 31 days of Genuary
 * as a unified, navigable 3D experience.
 *
 * The art doesn't hang on walls - it BECOMES the architecture.
 */

import * as THREE from 'three';
import { createScene, updateScene, disposeScene, setQuality, type MuseumScene } from './scene';
import { createNavigation, updateNavigation, disposeNavigation, type Navigation } from './navigation';
import {
  initAudio,
  startAmbient,
  disposeAudio,
  setAudioMuted,
  isAudioMuted,
  playDiscoveryChime,
  playCameraShutter,
  playZoomIn,
  playZoomOut,
  playFavoriteToggle,
} from './audio';
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
import {
  createTipsSystem,
  markTipShown,
  disposeTipsSystem,
  type TipsSystem,
} from './tips';
import {
  createStatsTracker,
  getWelcomeMessage,
  recordExhibitView,
  recordFavoriteAdded,
  recordScreenshot,
  recordSharedView,
  recordMovement,
  recordTourStarted,
  checkSpeedRun,
  showStatsPopup,
  disposeStatsTracker,
  type StatsTracker,
} from './stats';
import {
  createDaySelector,
  disposeDaySelector,
  type DaySelector,
} from './dayselect';
import {
  createAchievementsSystem,
  checkAchievements,
  unlockAchievement,
  showAchievementNotification,
  showAchievementsPopup,
  disposeAchievementsSystem,
  type AchievementsSystem,
} from './achievements';

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
  tips: TipsSystem;
  stats: StatsTracker;
  daySelector: DaySelector;
  achievements: AchievementsSystem;
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
 * Generate and copy a shareable link with current view position
 */
function shareView(camera: THREE.PerspectiveCamera): void {
  const pos = camera.position;
  const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);

  // Encode position and rotation in URL hash
  const params = new URLSearchParams({
    x: pos.x.toFixed(1),
    y: pos.y.toFixed(1),
    z: pos.z.toFixed(1),
    rx: euler.x.toFixed(2),
    ry: euler.y.toFixed(2),
  });

  const url = `${window.location.origin}${window.location.pathname}#museum?${params.toString()}`;

  // Copy to clipboard
  navigator.clipboard.writeText(url).then(() => {
    showNotification('View link copied to clipboard!');
  }).catch(() => {
    // Fallback: show the URL
    showNotification('Share: ' + url.slice(-50));
  });
}

/**
 * Parse shared view parameters from URL
 */
function parseSharedView(): { x: number; y: number; z: number; rx: number; ry: number } | null {
  const hash = window.location.hash;
  if (!hash.includes('museum?')) return null;

  try {
    const queryString = hash.split('?')[1];
    if (!queryString) return null;

    const params = new URLSearchParams(queryString);
    const x = parseFloat(params.get('x') || '');
    const y = parseFloat(params.get('y') || '');
    const z = parseFloat(params.get('z') || '');
    const rx = parseFloat(params.get('rx') || '');
    const ry = parseFloat(params.get('ry') || '');

    if (isNaN(x) || isNaN(y) || isNaN(z)) return null;

    return { x, y, z, rx: rx || 0, ry: ry || 0 };
  } catch {
    return null;
  }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen(container: HTMLElement): void {
  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      showNotification('Entered fullscreen');
    }).catch((err) => {
      console.warn('Fullscreen request failed:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      showNotification('Exited fullscreen');
    }).catch((err) => {
      console.warn('Exit fullscreen failed:', err);
    });
  }
}

/**
 * Trigger confetti celebration for Easter egg
 */
function triggerConfetti(container: HTMLElement): void {
  const confettiCount = 100;
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#686de0', '#7bed9f'];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;
    const size = 6 + Math.random() * 8;

    confetti.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: -20px;
      z-index: 10000;
      pointer-events: none;
      animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
      transform: rotate(${Math.random() * 360}deg);
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;

    container.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), (duration + delay) * 1000 + 100);
  }

  // Add keyframes if not already present
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
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
        <div><b>G</b> Go to Day</div>
        <div><b>Click</b> Zoom</div>
        <div><b>[ ]</b> Browse</div>
        <div><b>R</b> Random</div>
        <div><b>T</b> Tour</div>
        <div><b>F</b> Fav/Full</div>
        <div><b>J</b> Jump Fav</div>
        <div><b>P</b> Photo</div>
        <div><b>S</b> Share</div>
        <div><b>I</b> Stats</div>
        <div><b>A</b> Awards</div>
        <div><b>M</b> Mute</div>
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
    const wasNew = !discovery.viewedDays.has(dayNumber);
    markDayDiscovered(discovery, dayNumber);
    // Play discovery chime for new exhibits
    if (wasNew) {
      playDiscoveryChime();
    }
    // Record stat
    recordExhibitView(stats);
  };

  // Wire up interaction to toggle favorites
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const nowFavorite = toggleFavorite(favorites, dayNumber);
    playFavoriteToggle(nowFavorite);
    showNotification(nowFavorite ? `Day ${dayNumber} added to favorites` : `Day ${dayNumber} removed from favorites`);
    // Update discovery badge to show new favorites count
    refreshDiscoveryBadge(discovery);
    // Mark tip as used
    markTipShown(tips, 'favorite');
    // Record stat if adding
    if (nowFavorite) {
      recordFavoriteAdded(stats);
    }
  };

  // Wire up interaction to check favorite status
  interaction.isFavorite = (dayNumber: number) => {
    return isFavorite(favorites, dayNumber);
  };

  // Wire up interaction to get all favorites
  interaction.getFavorites = () => {
    return getFavorites(favorites);
  };

  // Create tips system for contextual help
  const tips = createTipsSystem(container);

  // Create stats tracker
  const stats = createStatsTracker();

  // Show welcome back message for returning visitors (delayed)
  const welcomeMessage = getWelcomeMessage(stats);
  if (welcomeMessage) {
    setTimeout(() => {
      showNotification(welcomeMessage);
    }, 3000); // Show after 3 seconds to let things settle
  }

  // Create day selector for quick navigation
  const daySelector = createDaySelector(container);

  // Wire up day selector to zoom to exhibit
  daySelector.onDaySelected = (dayNumber: number) => {
    // Find the exhibit mesh for this day
    const mesh = interaction.exhibitMeshes.find(
      m => m.userData.dayNumber === dayNumber
    );
    if (mesh) {
      // Trigger zoom to this exhibit
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      // Store original position if not already zoomed
      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      // Calculate zoom target (similar to zoomToExhibitMesh logic)
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      const worldQuat = new THREE.Quaternion();
      mesh.getWorldQuaternion(worldQuat);
      normal.applyQuaternion(worldQuat);

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;

      // Mark as discovered
      markDayDiscovered(discovery, dayNumber);
      recordExhibitView(stats);

      showNotification(`Viewing Day ${dayNumber}`);
    } else {
      showNotification(`Day ${dayNumber} exhibit not found`);
    }
  };

  // Create achievements system
  const achievements = createAchievementsSystem();

  // Show notification when achievement unlocks
  achievements.onAchievementUnlocked = (achievement) => {
    showAchievementNotification(achievement);
  };

  // Override onExhibitViewed to also check speed run (now that achievements exists)
  const originalOnExhibitViewed = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    originalOnExhibitViewed?.(dayNumber);
    // Check for speed run after each exhibit view
    if (checkSpeedRun(stats)) {
      unlockAchievement(achievements, 'speed-run');
    }
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
      const wasActive = tour.isActive;
      toggleTour(tour);
      // Record stat if starting a new tour
      if (!wasActive && tour.isActive) {
        recordTourStarted(stats);
      }
    }
  };
  document.addEventListener('keydown', tourToggleHandler);

  // Screenshot with P key
  const screenshotHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP') {
      playCameraShutter();
      takeScreenshot(scene.renderer.domElement);
      recordScreenshot(stats);
    }
  };
  document.addEventListener('keydown', screenshotHandler);

  // Share view with S key
  const shareHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyS' && !interaction.isZoomed) {
      shareView(scene.camera);
      recordSharedView(stats);
    }
  };
  document.addEventListener('keydown', shareHandler);

  // Stats with I key (I for Info)
  const statsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyI' && !interaction.isZoomed) {
      showStatsPopup(stats, container);
    }
  };
  document.addEventListener('keydown', statsHandler);

  // Achievements with A key
  const achievementsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyA' && !interaction.isZoomed) {
      showAchievementsPopup(achievements, container);
    }
  };
  document.addEventListener('keydown', achievementsHandler);

  // Mute toggle with M key
  const muteHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM') {
      const newMuted = !isAudioMuted();
      setAudioMuted(newMuted);
      showNotification(newMuted ? 'Sound muted' : 'Sound enabled');
    }
  };
  document.addEventListener('keydown', muteHandler);

  // Fullscreen toggle with F key (when not zoomed, to avoid conflicts)
  const fullscreenHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyF' && !interaction.isZoomed && !event.shiftKey) {
      toggleFullscreen(container);
    }
  };
  document.addEventListener('keydown', fullscreenHandler);

  // Konami code Easter egg: up up down down left right left right b a
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let konamiIndex = 0;
  let konamiTriggered = false;

  const konamiHandler = (event: KeyboardEvent) => {
    if (konamiTriggered) return;

    if (event.code === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiTriggered = true;
        triggerConfetti(container);
        showNotification('You found the secret!');
        unlockAchievement(achievements, 'konami');
      }
    } else {
      konamiIndex = 0;
      // Check if current key starts the sequence
      if (event.code === konamiCode[0]) {
        konamiIndex = 1;
      }
    }
  };
  document.addEventListener('keydown', konamiHandler);

  // Apply shared view if present in URL
  const sharedView = parseSharedView();
  if (sharedView) {
    scene.camera.position.set(sharedView.x, sharedView.y, sharedView.z);
    navigation.euler.set(sharedView.rx, sharedView.ry, 0, 'YXZ');
    scene.camera.quaternion.setFromEuler(navigation.euler);
    showNotification('Loaded shared view');
  }

  // Check for auto-tour URL parameter
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const autoTour = urlParams.get('tour') === '1' || urlParams.get('autoTour') === 'true';
  if (autoTour) {
    // Start tour after a brief delay to allow scene to load
    setTimeout(() => {
      startTour(tour);
      recordTourStarted(stats);
      showNotification('Tour starting...');
    }, 2000);
  }

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
    tips,
    stats,
    daySelector,
    achievements,
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

    // Track movement distance for stats
    recordMovement(context.stats, pos.x, pos.z);

    // Update minimap
    updateMinimap(context.minimap, context.scene.camera);

    // Render
    context.scene.renderer.render(context.scene.scene, context.scene.camera);

    context.animationId = requestAnimationFrame(animate);
  };

  context.animationId = requestAnimationFrame(animate);

  // Periodically check achievements
  const achievementCheckInterval = setInterval(() => {
    if (!context) return;
    checkAchievements(context.achievements, {
      exhibitsViewed: context.discovery.viewedDays.size,
      favoritesCount: getFavorites(context.favorites).length,
      screenshotsTaken: context.stats.stats.screenshotsTaken,
      toursTaken: context.stats.stats.toursTaken,
      totalTimeSpent: context.stats.stats.totalTimeSpent,
      distanceWalked: context.stats.stats.distanceWalked,
      sharedViews: context.stats.stats.sharedViews,
    });

    // Check for speed run achievement (10 exhibits in under 2 minutes)
    if (checkSpeedRun(context.stats)) {
      unlockAchievement(context.achievements, 'speed-run');
    }
  }, 10000); // Check every 10 seconds

  // Store interval for cleanup
  (context as unknown as Record<string, unknown>).achievementCheckInterval = achievementCheckInterval;
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

  // Clear achievement check interval
  const interval = (context as unknown as Record<string, unknown>).achievementCheckInterval as number | undefined;
  if (interval) {
    clearInterval(interval);
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
  disposeTipsSystem(context.tips);
  disposeStatsTracker(context.stats);
  disposeDaySelector(context.daySelector);
  disposeAchievementsSystem(context.achievements);
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
