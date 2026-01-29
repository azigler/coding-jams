/**
 * Museum Interaction System
 *
 * Handles click-to-zoom for exhibits and other interactive elements.
 */

import * as THREE from 'three';
import type { ExhibitFrame } from './exhibits/frame';
import { dayInfoMap } from './exhibits/placard';

// ============================================================================
// Audio Helpers
// ============================================================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch (e) {
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a subtle zoom-in sound
 */
function playZoomInSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/**
 * Play a subtle zoom-out sound
 */
function playZoomOutSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

// ============================================================================
// Types
// ============================================================================

export interface InteractionSystem {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  element: HTMLElement;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;

  // All clickable exhibit meshes
  exhibitMeshes: THREE.Mesh[];

  // Zoom state
  isZoomed: boolean;
  zoomTarget: THREE.Vector3;
  zoomLookAt: THREE.Vector3;
  originalPosition: THREE.Vector3;
  originalQuaternion: THREE.Quaternion;
  zoomProgress: number;

  // Animation
  animating: boolean;

  // Hover state for cursor
  hoveredExhibit: THREE.Mesh | null;

  // Current exhibit index for keyboard navigation
  currentExhibitIndex: number;

  // Callback when exhibit is viewed
  onExhibitViewed: ((dayNumber: number) => void) | null;

  // Callback when favorite is toggled
  onFavoriteToggle: ((dayNumber: number) => void) | null;

  // Callback to check if a day is favorited
  isFavorite: ((dayNumber: number) => boolean) | null;

  // Callback to get all favorite day numbers
  getFavorites: (() => number[]) | null;

  // Currently viewed day number (when zoomed)
  currentDayNumber: number;

  // Cleanup
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const ZOOM_DISTANCE = 1.2; // Distance from exhibit when zoomed
const ZOOM_SPEED = 3; // Animation speed multiplier
const ZOOM_EASING = 0.08; // Lerp factor

// ============================================================================
// Creation
// ============================================================================

/**
 * Create the interaction system
 */
export function createInteraction(
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  element: HTMLElement
): InteractionSystem {
  const interaction: InteractionSystem = {
    camera,
    scene,
    element,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    exhibitMeshes: [],
    isZoomed: false,
    zoomTarget: new THREE.Vector3(),
    zoomLookAt: new THREE.Vector3(),
    originalPosition: new THREE.Vector3(),
    originalQuaternion: new THREE.Quaternion(),
    zoomProgress: 0,
    animating: false,
    hoveredExhibit: null,
    currentExhibitIndex: -1,
    onExhibitViewed: null,
    onFavoriteToggle: null,
    isFavorite: null,
    getFavorites: null,
    currentDayNumber: -1,
    cleanup: () => {},
  };

  // Event handlers
  const onClick = (event: MouseEvent) => handleClick(interaction, event);
  const onKeyDown = (event: KeyboardEvent) => handleKeyDown(interaction, event);
  const onMouseMove = (event: MouseEvent) => handleMouseMove(interaction, event);

  element.addEventListener('click', onClick);
  element.addEventListener('mousemove', onMouseMove);
  document.addEventListener('keydown', onKeyDown);

  // Set initial cursor
  element.style.cursor = 'grab';

  interaction.cleanup = () => {
    element.removeEventListener('click', onClick);
    element.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);
  };

  return interaction;
}

// ============================================================================
// Exhibit Registration
// ============================================================================

/**
 * Register an exhibit frame for interaction
 */
export function registerExhibit(interaction: InteractionSystem, frame: ExhibitFrame): void {
  // The mesh is the canvas surface - make it clickable
  if (frame.mesh) {
    frame.mesh.userData.exhibitFrame = frame;
    frame.mesh.userData.dayNumber = frame.dayNumber;
    interaction.exhibitMeshes.push(frame.mesh);
  }
}

/**
 * Register multiple exhibits
 */
export function registerExhibits(interaction: InteractionSystem, frames: ExhibitFrame[]): void {
  frames.forEach(frame => registerExhibit(interaction, frame));
}

/**
 * Sort exhibits by day number for logical browsing order
 * Call after all exhibits have been registered
 */
export function sortExhibitsByDay(interaction: InteractionSystem): void {
  interaction.exhibitMeshes.sort((a, b) => {
    const dayA = a.userData.dayNumber ?? 999;
    const dayB = b.userData.dayNumber ?? 999;
    return dayA - dayB;
  });
  console.log(`Sorted ${interaction.exhibitMeshes.length} exhibits by day number`);
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle click events
 */
function handleClick(interaction: InteractionSystem, event: MouseEvent): void {
  // If already zoomed, exit zoom on canvas click (not UI clicks)
  if (interaction.isZoomed) {
    // Don't exit if clicking on the info panel
    const target = event.target as HTMLElement;
    if (target.closest('#zoom-indicator')) {
      return; // Let the link handle itself
    }
    exitZoom(interaction);
    return;
  }

  // Calculate mouse position in normalized device coordinates
  const rect = interaction.element.getBoundingClientRect();
  interaction.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  interaction.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Raycast to find intersected exhibits
  interaction.raycaster.setFromCamera(interaction.mouse, interaction.camera);
  const intersects = interaction.raycaster.intersectObjects(interaction.exhibitMeshes, false);

  if (intersects.length > 0) {
    const hit = intersects[0];
    const dayNumber = hit.object.userData.dayNumber;
    if (dayNumber !== undefined) {
      zoomToExhibit(interaction, hit.object as THREE.Mesh, dayNumber);
    }
  }
}

/**
 * Handle keyboard events
 */
function handleKeyDown(interaction: InteractionSystem, event: KeyboardEvent): void {
  // R for random exhibit (works even when not zoomed)
  if (event.code === 'KeyR' && !interaction.animating) {
    zoomToRandomExhibit(interaction);
    event.preventDefault();
    return;
  }

  if (!interaction.isZoomed) return;

  if (event.code === 'Escape') {
    exitZoom(interaction);
    return;
  }

  // Navigate between exhibits with [ and ] or arrow keys
  if (event.code === 'BracketLeft' || event.code === 'ArrowLeft') {
    navigateExhibit(interaction, -1);
    event.preventDefault();
  } else if (event.code === 'BracketRight' || event.code === 'ArrowRight') {
    navigateExhibit(interaction, 1);
    event.preventDefault();
  }

  // Toggle favorite with F key
  if (event.code === 'KeyF' && interaction.currentDayNumber > 0) {
    interaction.onFavoriteToggle?.(interaction.currentDayNumber);
    event.preventDefault();
  }

  // Jump to next favorite with J key
  if (event.code === 'KeyJ') {
    navigateToNextFavorite(interaction);
    event.preventDefault();
  }
}

/**
 * Zoom to a random exhibit
 */
function zoomToRandomExhibit(interaction: InteractionSystem): void {
  if (interaction.exhibitMeshes.length === 0) return;

  // Store original position if not already zoomed
  if (!interaction.isZoomed) {
    interaction.originalPosition.copy(interaction.camera.position);
    interaction.originalQuaternion.copy(interaction.camera.quaternion);
  }

  // Pick a random exhibit (different from current if possible)
  let newIndex: number;
  if (interaction.exhibitMeshes.length === 1) {
    newIndex = 0;
  } else {
    do {
      newIndex = Math.floor(Math.random() * interaction.exhibitMeshes.length);
    } while (newIndex === interaction.currentExhibitIndex && interaction.exhibitMeshes.length > 1);
  }

  const mesh = interaction.exhibitMeshes[newIndex];
  const dayNumber = mesh.userData.dayNumber;

  if (dayNumber !== undefined) {
    interaction.currentExhibitIndex = newIndex;
    zoomToExhibitMesh(interaction, mesh, dayNumber);
    playZoomInSound();
    console.log(`Random exhibit: Day ${dayNumber}`);
  }
}

/**
 * Navigate to previous/next exhibit while zoomed
 */
function navigateExhibit(interaction: InteractionSystem, direction: number): void {
  if (!interaction.isZoomed || interaction.exhibitMeshes.length === 0) return;

  // Calculate new index
  let newIndex = interaction.currentExhibitIndex + direction;

  // Wrap around
  if (newIndex < 0) {
    newIndex = interaction.exhibitMeshes.length - 1;
  } else if (newIndex >= interaction.exhibitMeshes.length) {
    newIndex = 0;
  }

  // Get the new exhibit
  const newMesh = interaction.exhibitMeshes[newIndex];
  const dayNumber = newMesh.userData.dayNumber;

  if (dayNumber !== undefined) {
    // Update current index
    interaction.currentExhibitIndex = newIndex;

    // Zoom to new exhibit (reuses zoom logic)
    zoomToExhibitMesh(interaction, newMesh, dayNumber);

    // Play navigation sound
    playNavigateSound();
  }
}

/**
 * Navigate to the next favorited exhibit
 */
function navigateToNextFavorite(interaction: InteractionSystem): void {
  // Get all favorites
  const favorites = interaction.getFavorites?.() ?? [];
  if (favorites.length === 0) {
    console.log('No favorites to navigate to');
    return;
  }

  // Store original position if not already zoomed
  if (!interaction.isZoomed) {
    interaction.originalPosition.copy(interaction.camera.position);
    interaction.originalQuaternion.copy(interaction.camera.quaternion);
  }

  // Find the current day in the favorites list
  const currentDay = interaction.currentDayNumber;
  const currentFavIndex = favorites.indexOf(currentDay);

  // Calculate next favorite index (wrap around)
  let nextFavIndex: number;
  if (currentFavIndex === -1 || currentFavIndex === favorites.length - 1) {
    nextFavIndex = 0; // Start from first favorite
  } else {
    nextFavIndex = currentFavIndex + 1;
  }

  const nextDay = favorites[nextFavIndex];

  // Find the exhibit mesh for this day
  const meshIndex = interaction.exhibitMeshes.findIndex(
    m => m.userData.dayNumber === nextDay
  );

  if (meshIndex !== -1) {
    interaction.currentExhibitIndex = meshIndex;
    zoomToExhibitMesh(interaction, interaction.exhibitMeshes[meshIndex], nextDay);
    playNavigateSound();
    console.log(`Jumped to favorite: Day ${nextDay} (${nextFavIndex + 1} of ${favorites.length})`);
  }
}

/**
 * Play a subtle navigation sound
 */
function playNavigateSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

// Throttle state for hover detection
let lastHoverCheck = 0;
const HOVER_CHECK_INTERVAL = 100; // Only check hover every 100ms

/**
 * Handle mouse move for hover detection
 */
function handleMouseMove(interaction: InteractionSystem, event: MouseEvent): void {
  // Don't check hover when zoomed
  if (interaction.isZoomed) {
    interaction.element.style.cursor = 'zoom-in';
    return;
  }

  // Throttle hover checks for performance
  const now = performance.now();
  if (now - lastHoverCheck < HOVER_CHECK_INTERVAL) {
    return;
  }
  lastHoverCheck = now;

  // Calculate mouse position in normalized device coordinates
  const rect = interaction.element.getBoundingClientRect();
  interaction.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  interaction.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Raycast to find intersected exhibits
  interaction.raycaster.setFromCamera(interaction.mouse, interaction.camera);
  const intersects = interaction.raycaster.intersectObjects(interaction.exhibitMeshes, false);

  if (intersects.length > 0) {
    const hit = intersects[0].object as THREE.Mesh;
    if (interaction.hoveredExhibit !== hit) {
      interaction.hoveredExhibit = hit;
      interaction.element.style.cursor = 'zoom-in';
      // Show tooltip
      const dayNumber = hit.userData.dayNumber;
      if (dayNumber !== undefined) {
        showHoverTooltip(dayNumber, event.clientX, event.clientY);
      }
    } else {
      // Update tooltip position
      updateTooltipPosition(event.clientX, event.clientY);
    }
  } else {
    if (interaction.hoveredExhibit !== null) {
      interaction.hoveredExhibit = null;
      interaction.element.style.cursor = 'grab';
      hideHoverTooltip();
    }
  }
}

// ============================================================================
// Hover Tooltip
// ============================================================================

/**
 * Show hover tooltip with exhibit info
 */
function showHoverTooltip(dayNumber: number, x: number, y: number): void {
  hideHoverTooltip();

  const info = dayInfoMap[dayNumber];
  const title = info?.title || `Coming Soon`;

  const tooltip = document.createElement('div');
  tooltip.id = 'hover-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${x + 15}px;
    top: ${y - 10}px;
    background: rgba(20, 20, 30, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    z-index: 250;
    pointer-events: none;
    white-space: nowrap;
    border: 1px solid rgba(100, 150, 255, 0.3);
  `;
  tooltip.innerHTML = `
    <span style="color: #4a9eff;">Day ${dayNumber}</span> • ${title}
  `;
  document.body.appendChild(tooltip);
}

/**
 * Update tooltip position
 */
function updateTooltipPosition(x: number, y: number): void {
  const tooltip = document.getElementById('hover-tooltip');
  if (tooltip) {
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y - 10}px`;
  }
}

/**
 * Hide hover tooltip
 */
function hideHoverTooltip(): void {
  const existing = document.getElementById('hover-tooltip');
  if (existing) existing.remove();
}

// ============================================================================
// Zoom Functions
// ============================================================================

/**
 * Zoom to an exhibit (initial zoom from click)
 */
function zoomToExhibit(interaction: InteractionSystem, mesh: THREE.Mesh, dayNumber: number): void {
  // Hide hover tooltip when zooming
  hideHoverTooltip();

  // Store original camera state (only on initial zoom, not navigation)
  interaction.originalPosition.copy(interaction.camera.position);
  interaction.originalQuaternion.copy(interaction.camera.quaternion);

  // Find and store the exhibit index
  interaction.currentExhibitIndex = interaction.exhibitMeshes.indexOf(mesh);

  // Use shared zoom logic
  zoomToExhibitMesh(interaction, mesh, dayNumber);
  playZoomInSound();
}

/**
 * Zoom to exhibit mesh (shared logic for click and keyboard navigation)
 */
function zoomToExhibitMesh(interaction: InteractionSystem, mesh: THREE.Mesh, dayNumber: number): void {

  // Get the world position and normal of the exhibit
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);

  // Get the normal direction the exhibit faces
  const normal = new THREE.Vector3(0, 0, 1);
  const worldQuat = new THREE.Quaternion();
  mesh.getWorldQuaternion(worldQuat);
  normal.applyQuaternion(worldQuat);

  // Calculate zoom target position (in front of exhibit)
  interaction.zoomTarget.copy(worldPos).addScaledVector(normal, ZOOM_DISTANCE);
  interaction.zoomTarget.y = interaction.camera.position.y; // Keep same height

  // Look at the exhibit center
  interaction.zoomLookAt.copy(worldPos);
  interaction.zoomLookAt.y = interaction.camera.position.y;

  interaction.isZoomed = true;
  interaction.animating = true;
  interaction.zoomProgress = 0;
  interaction.currentDayNumber = dayNumber;

  console.log(`Zooming to Day ${dayNumber}`);

  // Notify that exhibit was viewed
  interaction.onExhibitViewed?.(dayNumber);

  // Show vignette and info panel
  showVignette();
  showZoomIndicator(
    interaction,
    dayNumber,
    interaction.currentExhibitIndex,
    interaction.exhibitMeshes.length
  );
}

/**
 * Exit zoom mode
 */
function exitZoom(interaction: InteractionSystem): void {
  if (!interaction.isZoomed) return;

  // Swap target and original for reverse animation
  const tempPos = interaction.zoomTarget.clone();
  const tempLook = interaction.zoomLookAt.clone();

  interaction.zoomTarget.copy(interaction.originalPosition);
  // Keep the look direction more or less the same when exiting
  interaction.zoomLookAt.copy(interaction.originalPosition).add(new THREE.Vector3(0, 0, -5));

  interaction.animating = true;
  interaction.zoomProgress = 0;

  // Will set isZoomed = false when animation completes

  console.log('Exiting zoom');
  playZoomOutSound();
  hideZoomIndicator();
}

// ============================================================================
// UI Helpers
// ============================================================================

/**
 * Show zoom indicator overlay with exhibit details
 */
function showZoomIndicator(
  interaction: InteractionSystem,
  dayNumber: number,
  currentIndex?: number,
  totalCount?: number
): void {
  // Remove existing indicator
  hideZoomIndicator();

  const info = dayInfoMap[dayNumber];
  const title = info?.title || `Day ${dayNumber}`;
  const description = info?.description || '';
  const credit = info?.credit ? `Prompt by ${info.credit}` : '';

  // Progress indicator (e.g., "12 of 34")
  const progressText = (currentIndex !== undefined && totalCount !== undefined)
    ? `${currentIndex + 1} of ${totalCount}`
    : '';

  // Check if favorited
  const favorited = interaction.isFavorite?.(dayNumber) ?? false;

  const indicator = document.createElement('div');
  indicator.id = 'zoom-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      z-index: 200;
      max-width: 280px;
      pointer-events: none;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      ">
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
        ">Genuary 2026</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="favorite-btn" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 2px 4px;
            pointer-events: auto;
            transition: transform 0.2s;
          " title="${favorited ? 'Remove from favorites' : 'Add to favorites (F)'}">${favorited ? '❤️' : '🤍'}</button>
          ${progressText ? `<div style="
            font-size: 11px;
            color: #666;
            background: rgba(255,255,255,0.1);
            padding: 2px 8px;
            border-radius: 10px;
          ">${progressText}</div>` : ''}
        </div>
      </div>
      <div style="
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #fff;
      ">Day ${dayNumber}: ${title}</div>
      ${description ? `<div style="
        font-size: 13px;
        color: #ccc;
        line-height: 1.4;
        margin-bottom: 8px;
      ">${description}</div>` : ''}
      ${credit ? `<div style="
        font-size: 11px;
        color: #666;
        font-style: italic;
      ">${credit}</div>` : ''}
      <a href="#day${dayNumber}" style="
        display: block;
        margin-top: 12px;
        padding: 8px 12px;
        background: rgba(100, 150, 255, 0.2);
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 4px;
        color: #88bbff;
        text-decoration: none;
        font-size: 12px;
        text-align: center;
        pointer-events: auto;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(100, 150, 255, 0.3)'"
         onmouseout="this.style.background='rgba(100, 150, 255, 0.2)'">
        View Interactive Day ${dayNumber} →
      </a>
      <div style="
        font-size: 11px;
        color: #666;
        margin-top: 8px;
        text-align: center;
      ">[ ] or ←→ to browse • F to favorite • ESC to exit</div>
    </div>
  `;
  document.body.appendChild(indicator);

  // Wire up favorite button click
  const favBtn = document.getElementById('favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      interaction.onFavoriteToggle?.(dayNumber);
      // Update button state
      const nowFavorited = interaction.isFavorite?.(dayNumber) ?? false;
      favBtn.innerHTML = nowFavorited ? '❤️' : '🤍';
      favBtn.title = nowFavorited ? 'Remove from favorites' : 'Add to favorites (F)';
      // Animate
      favBtn.style.transform = 'scale(1.3)';
      setTimeout(() => {
        favBtn.style.transform = 'scale(1)';
      }, 200);
    });
  }
}

/**
 * Hide zoom indicator and vignette
 */
function hideZoomIndicator(): void {
  const existing = document.getElementById('zoom-indicator');
  if (existing) existing.remove();
  const vignette = document.getElementById('zoom-vignette');
  if (vignette) vignette.remove();
}

/**
 * Show vignette overlay for focus
 */
function showVignette(): void {
  hideVignette();
  const vignette = document.createElement('div');
  vignette.id = 'zoom-vignette';
  vignette.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(0, 0, 0, 0.4) 100%
    );
    z-index: 150;
    animation: vignette-fade-in 0.3s ease-out;
  `;

  // Add keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes vignette-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(vignette);
}

/**
 * Hide vignette overlay
 */
function hideVignette(): void {
  const vignette = document.getElementById('zoom-vignette');
  if (vignette) vignette.remove();
}

// ============================================================================
// Update Loop
// ============================================================================

/**
 * Update interaction system (call each frame)
 */
export function updateInteraction(interaction: InteractionSystem, deltaTime: number): boolean {
  if (!interaction.animating) return false;

  // Lerp camera position toward target
  interaction.camera.position.lerp(interaction.zoomTarget, ZOOM_EASING * ZOOM_SPEED);

  // Look at target smoothly
  const currentLook = new THREE.Vector3();
  interaction.camera.getWorldDirection(currentLook);
  currentLook.add(interaction.camera.position);

  currentLook.lerp(interaction.zoomLookAt, ZOOM_EASING * ZOOM_SPEED);

  // Only update lookAt if we're zooming in (not exiting)
  if (interaction.isZoomed) {
    interaction.camera.lookAt(interaction.zoomLookAt);
  }

  interaction.zoomProgress += deltaTime * ZOOM_SPEED;

  // Check if animation is complete
  const distance = interaction.camera.position.distanceTo(interaction.zoomTarget);
  if (distance < 0.05) {
    interaction.animating = false;

    // If we were exiting zoom, mark as no longer zoomed
    if (!interaction.isZoomed || interaction.zoomProgress > 2) {
      // We've completed an exit animation
    }
  }

  // Check if exit animation complete
  if (!interaction.isZoomed === false && interaction.zoomProgress > 1) {
    // Reset zoom state after exit animation
    interaction.isZoomed = false;
  }

  return true; // Indicates camera was moved by interaction
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose of interaction system
 */
export function disposeInteraction(interaction: InteractionSystem): void {
  hideZoomIndicator();
  interaction.cleanup();
  interaction.exhibitMeshes = [];
}
