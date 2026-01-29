/**
 * Artwork Loader for Museum Exhibits
 *
 * Dynamically renders Genuary day sketches to offscreen canvases
 * and creates Three.js textures from them for display in the museum.
 */

import * as THREE from 'three';
import p5 from 'p5';
import type { DayConfig, DayModule, ControlState } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface LiveArtwork {
  dayNumber: number;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  p5Instance: p5 | null;
  isRunning: boolean;
  lastUpdate: number;
}

// ============================================================================
// Day Import Map
// ============================================================================

// Dynamic imports for each day
const dayImports: Record<number, () => Promise<DayModule>> = {
  1: () => import('../../days/01') as Promise<DayModule>,
  2: () => import('../../days/02') as Promise<DayModule>,
  3: () => import('../../days/03') as Promise<DayModule>,
  4: () => import('../../days/04') as Promise<DayModule>,
  5: () => import('../../days/05') as Promise<DayModule>,
  6: () => import('../../days/06') as Promise<DayModule>,
  7: () => import('../../days/07') as Promise<DayModule>,
  8: () => import('../../days/08') as Promise<DayModule>,
  9: () => import('../../days/09') as Promise<DayModule>,
  10: () => import('../../days/10') as Promise<DayModule>,
  11: () => import('../../days/11') as Promise<DayModule>,
  12: () => import('../../days/12') as Promise<DayModule>,
  13: () => import('../../days/13') as Promise<DayModule>,
  14: () => import('../../days/14') as Promise<DayModule>,
  15: () => import('../../days/15') as Promise<DayModule>,
  16: () => import('../../days/16') as Promise<DayModule>,
  17: () => import('../../days/17') as Promise<DayModule>,
  18: () => import('../../days/18') as Promise<DayModule>,
  19: () => import('../../days/19') as Promise<DayModule>,
  20: () => import('../../days/20') as Promise<DayModule>,
  21: () => import('../../days/21') as Promise<DayModule>,
  22: () => import('../../days/22') as Promise<DayModule>,
  23: () => import('../../days/23') as Promise<DayModule>,
  24: () => import('../../days/24') as Promise<DayModule>,
  25: () => import('../../days/25') as Promise<DayModule>,
  26: () => import('../../days/26') as Promise<DayModule>,
  27: () => import('../../days/27') as Promise<DayModule>,
  28: () => import('../../days/28') as Promise<DayModule>,
  29: () => import('../../days/29') as Promise<DayModule>,
  30: () => import('../../days/30') as Promise<DayModule>,
  31: () => import('../../days/31') as Promise<DayModule>,
};

// ============================================================================
// Artwork Cache
// ============================================================================

const artworkCache: Map<number, LiveArtwork> = new Map();

// ============================================================================
// Artwork Creation
// ============================================================================

/**
 * Create a live artwork that renders a day's sketch to a texture
 */
export async function createLiveArtwork(dayNumber: number): Promise<LiveArtwork | null> {
  // Check cache first
  if (artworkCache.has(dayNumber)) {
    return artworkCache.get(dayNumber)!;
  }

  // Check if day exists
  if (!dayImports[dayNumber]) {
    console.warn(`Day ${dayNumber} not available for museum exhibit`);
    return null;
  }

  try {
    // Import the day module
    const module = await dayImports[dayNumber]();
    const config = module.default;
    const defaultControls = module.defaultControls || {};

    // Only support p5 mode for now
    if (config.mode && config.mode !== 'p5') {
      console.warn(`Day ${dayNumber} uses ${config.mode} mode, not supported yet`);
      return null;
    }

    // Create a hidden container for the p5 canvas
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '400px';
    container.style.height = '400px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    // Create placeholder for canvas reference
    let p5Canvas: HTMLCanvasElement | null = null;

    // Create texture (will be updated once p5 creates its canvas)
    const texture = new THREE.CanvasTexture(document.createElement('canvas'));
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create p5 instance in instance mode
    const artwork: LiveArtwork = {
      dayNumber,
      canvas: document.createElement('canvas'), // Placeholder, updated later
      texture,
      p5Instance: null,
      isRunning: false,
      lastUpdate: 0,
    };

    // Track when first frame is rendered
    let frameCount = 0;
    let resolveFirstFrame: (() => void) | null = null;
    const firstFramePromise = new Promise<void>((resolve) => {
      resolveFirstFrame = resolve;
    });

    // Create p5 sketch
    const sketch = (p: p5) => {
      // Attach controls to p5 instance
      (p as unknown as Record<string, unknown>)._controls = { ...defaultControls };

      p.setup = () => {
        // Create canvas at exhibit size
        const c = p.createCanvas(400, 400);
        p.pixelDensity(1);

        // Get the actual canvas element
        p5Canvas = (c as unknown as { elt: HTMLCanvasElement }).elt;
        if (p5Canvas) {
          artwork.canvas = p5Canvas;
          // Update texture to use the actual p5 canvas
          texture.image = p5Canvas;
          texture.needsUpdate = true;
        }

        // Call day's setup if it exists
        if (config.setup) {
          config.setup(p);
        }
      };

      p.draw = () => {
        // Call day's draw if it exists
        if (config.draw) {
          config.draw(p);
        }

        // Mark texture as needing update
        texture.needsUpdate = true;
        artwork.lastUpdate = performance.now();

        // Signal first frame rendered after a few frames (to ensure content is drawn)
        frameCount++;
        if (frameCount >= 5 && resolveFirstFrame) {
          resolveFirstFrame();
          resolveFirstFrame = null;
        }
      };
    };

    // Create p5 instance attached to hidden container
    artwork.p5Instance = new p5(sketch, container);
    artwork.isRunning = true;

    // Wait for first few frames to render (with timeout)
    await Promise.race([
      firstFramePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 2000)), // 2 second timeout
    ]);

    // Ensure texture is updated with rendered content
    texture.needsUpdate = true;

    // PERFORMANCE: Stop the p5 loop after capturing initial frames
    // The texture is already captured, no need to keep animating
    if (artwork.p5Instance) {
      artwork.p5Instance.noLoop();
      artwork.isRunning = false;
    }

    // Cache the artwork
    artworkCache.set(dayNumber, artwork);

    return artwork;
  } catch (error) {
    console.error(`Failed to load Day ${dayNumber} for museum:`, error);
    return null;
  }
}

/**
 * Get a texture for a day (creates if needed, returns from cache if exists)
 */
export async function getDayTexture(dayNumber: number): Promise<THREE.CanvasTexture | null> {
  const artwork = await createLiveArtwork(dayNumber);
  return artwork?.texture || null;
}

/**
 * Stop and dispose a live artwork
 */
export function disposeLiveArtwork(dayNumber: number): void {
  const artwork = artworkCache.get(dayNumber);
  if (!artwork) return;

  // Stop p5 instance
  if (artwork.p5Instance) {
    artwork.p5Instance.remove();
  }

  // Dispose texture
  artwork.texture.dispose();

  // Remove container (which includes the canvas) from DOM
  if (artwork.canvas.parentElement?.parentElement) {
    // The container is the parent of the canvas
    const container = artwork.canvas.parentElement;
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  }

  // Remove from cache
  artworkCache.delete(dayNumber);
}

/**
 * Dispose all live artworks
 */
export function disposeAllArtwork(): void {
  for (const dayNumber of artworkCache.keys()) {
    disposeLiveArtwork(dayNumber);
  }
}

/**
 * Pause a live artwork (stop animation but keep texture)
 */
export function pauseArtwork(dayNumber: number): void {
  const artwork = artworkCache.get(dayNumber);
  if (artwork?.p5Instance) {
    artwork.p5Instance.noLoop();
    artwork.isRunning = false;
  }
}

/**
 * Resume a paused artwork
 */
export function resumeArtwork(dayNumber: number): void {
  const artwork = artworkCache.get(dayNumber);
  if (artwork?.p5Instance) {
    artwork.p5Instance.loop();
    artwork.isRunning = true;
  }
}

/**
 * Update controls for a live artwork
 */
export function updateArtworkControls(dayNumber: number, controls: Partial<ControlState>): void {
  const artwork = artworkCache.get(dayNumber);
  if (artwork?.p5Instance) {
    const p5Controls = (artwork.p5Instance as unknown as Record<string, unknown>)._controls as ControlState;
    Object.assign(p5Controls, controls);
  }
}

/**
 * Get all currently running artworks
 */
export function getRunningArtworks(): number[] {
  return Array.from(artworkCache.entries())
    .filter(([_, artwork]) => artwork.isRunning)
    .map(([dayNumber]) => dayNumber);
}

// ============================================================================
// Visibility-Based Animation
// ============================================================================

// Frustum for visibility culling
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();

// Distance threshold for animating (closer exhibits get animated)
const ANIMATION_DISTANCE = 15; // meters

// Throttle visibility checks
let lastVisibilityCheck = 0;
const VISIBILITY_CHECK_INTERVAL = 500; // Check every 500ms

// Track which artworks were visible last check
const previouslyVisible = new Set<number>();

/**
 * Update artwork animation based on visibility to camera
 * Call this from the render loop to animate only visible exhibits
 */
export function updateArtworkVisibility(
  camera: THREE.PerspectiveCamera,
  exhibitMeshes: THREE.Mesh[]
): void {
  const now = performance.now();
  if (now - lastVisibilityCheck < VISIBILITY_CHECK_INTERVAL) {
    return; // Skip - not time for a check yet
  }
  lastVisibilityCheck = now;

  // Update frustum from camera
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  const cameraPos = camera.position;
  const currentlyVisible = new Set<number>();

  // Check each exhibit mesh for visibility
  for (const mesh of exhibitMeshes) {
    const dayNumber = mesh.userData?.dayNumber;
    if (dayNumber === undefined) continue;

    // Check if artwork is loaded
    if (!artworkCache.has(dayNumber)) continue;

    // Get world position of the exhibit
    const meshPos = new THREE.Vector3();
    mesh.getWorldPosition(meshPos);

    // Check distance to camera
    const distance = cameraPos.distanceTo(meshPos);
    if (distance > ANIMATION_DISTANCE) {
      continue; // Too far away
    }

    // Check if in camera frustum using bounding sphere
    const boundingSphere = mesh.geometry.boundingSphere;
    if (boundingSphere) {
      const worldSphere = boundingSphere.clone();
      worldSphere.center.copy(meshPos);
      if (!frustum.intersectsSphere(worldSphere)) {
        continue; // Not in view
      }
    }

    // This exhibit is visible!
    currentlyVisible.add(dayNumber);
  }

  // Resume newly visible artworks
  for (const dayNumber of currentlyVisible) {
    if (!previouslyVisible.has(dayNumber)) {
      resumeArtwork(dayNumber);
    }
  }

  // Pause artworks that are no longer visible
  for (const dayNumber of previouslyVisible) {
    if (!currentlyVisible.has(dayNumber)) {
      pauseArtwork(dayNumber);
    }
  }

  // Update tracking
  previouslyVisible.clear();
  for (const dayNumber of currentlyVisible) {
    previouslyVisible.add(dayNumber);
  }
}
