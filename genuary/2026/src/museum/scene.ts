/**
 * Museum Scene Setup
 *
 * Creates the Three.js scene with camera, lights, and basic geometry.
 * This is the foundation that all zones and exhibits build upon.
 */

import * as THREE from 'three';
import {
  createEntranceZone,
  updateEntranceZone,
  disposeEntranceZone,
  type EntranceZone,
} from './zones/entrance';
import {
  createGalleryZone,
  updateGalleryZone,
  disposeGalleryZone,
  type GalleryZone,
} from './zones/gallery';
import {
  createWingZone,
  updateWingZone,
  disposeWingZone,
  type WingZone,
} from './zones/wing';

// ============================================================================
// Types
// ============================================================================

export interface MuseumScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  time: number;
  entranceZone: EntranceZone | null;
  galleryZone: GalleryZone | null;
  wingZones: WingZone[];
}

// ============================================================================
// Constants
// ============================================================================

// Human eye height when standing
const CAMERA_HEIGHT = 1.6;

// Initial camera position (inside entrance hallway, looking toward the main gallery)
const INITIAL_POSITION = new THREE.Vector3(0, CAMERA_HEIGHT, -2);

// Canvas size - reduced from 800 for better performance
const CANVAS_SIZE = 640;

// ============================================================================
// Scene Creation
// ============================================================================

/**
 * Create the museum scene
 */
export function createScene(container: HTMLElement): MuseumScene {
  // Scene
  const scene = new THREE.Scene();

  // Sky color - deep twilight blue
  const skyColor = new THREE.Color().setHSL(0.6, 0.3, 0.08);
  scene.background = skyColor;

  // Fog for atmosphere
  scene.fog = new THREE.Fog(skyColor, 10, 60);

  // Camera
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  camera.position.copy(INITIAL_POSITION);
  camera.lookAt(0, CAMERA_HEIGHT, -10);

  // Renderer - optimized for performance
  const renderer = new THREE.WebGLRenderer({
    antialias: false, // Disable antialiasing for performance
    preserveDrawingBuffer: true, // Required for screenshots
    powerPreference: 'high-performance',
  });
  renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
  renderer.setPixelRatio(1); // Fixed pixel ratio for consistent performance
  renderer.shadowMap.enabled = false; // Disable shadows for performance
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2; // Slightly brighter to compensate for no shadows

  // Style the canvas
  const canvas = renderer.domElement;
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.cursor = 'grab';

  container.appendChild(canvas);

  // Add basic lighting
  addLighting(scene);

  // Add ground plane (outside the entrance hallway)
  addGround(scene);

  // Create entrance zone (Day 17 hallway)
  const entranceZone = createEntranceZone();
  scene.add(entranceZone.group);

  // Create main gallery zone (connects to entrance)
  const galleryZone = createGalleryZone();
  scene.add(galleryZone.group);

  // Create exhibit wings off the gallery doorways
  // Gallery center is at z = -32, radius = 12
  // Doorways at walls 2 (west), 4 (north), 6 (east)
  const galleryZ = -32;
  const galleryRadius = 12;
  const wallDist = galleryRadius * Math.cos(Math.PI / 8);
  const wingZones: WingZone[] = [];

  // North wing (wall 4) - Days 2-9 (gallery has Day 1)
  const northWing = createWingZone('north', 2);
  northWing.group.position.set(0, 0, galleryZ - wallDist);
  northWing.group.rotation.y = 0; // Faces -Z
  scene.add(northWing.group);
  wingZones.push(northWing);

  // West wing (wall 2) - Days 10-17 (gallery has Day 7)
  const westWing = createWingZone('west', 10);
  westWing.group.position.set(-wallDist, 0, galleryZ);
  westWing.group.rotation.y = -Math.PI / 2; // Faces -X
  scene.add(westWing.group);
  wingZones.push(westWing);

  // East wing (wall 6) - Days 18-25
  const eastWing = createWingZone('east', 18);
  eastWing.group.position.set(wallDist, 0, galleryZ);
  eastWing.group.rotation.y = Math.PI / 2; // Faces +X
  scene.add(eastWing.group);
  wingZones.push(eastWing);

  // South wing (back toward entrance, but offset) - Days 26-31
  // Position it parallel to entrance hallway but offset to the side
  const southWing = createWingZone('south', 26, { exhibitsPerSide: 3 }); // 6 exhibits for Days 26-31
  southWing.group.position.set(wallDist * 0.7, 0, galleryZ + wallDist * 0.7);
  southWing.group.rotation.y = Math.PI * 0.75; // Angled southeast
  scene.add(southWing.group);
  wingZones.push(southWing);

  return {
    renderer,
    scene,
    camera,
    time: 0,
    entranceZone,
    galleryZone,
    wingZones,
  };
}

// ============================================================================
// Scene Components
// ============================================================================

/**
 * Add basic lighting to the scene
 */
function addLighting(scene: THREE.Scene): void {
  // Ambient light - very dim for atmosphere
  const ambient = new THREE.AmbientLight(0x404060, 0.3);
  scene.add(ambient);

  // Directional light - simulates moonlight (shadows disabled for performance)
  const directional = new THREE.DirectionalLight(0x8090a0, 0.8);
  directional.position.set(10, 20, 10);
  scene.add(directional);

  // Warm point light at entrance - welcoming
  const entranceLight = new THREE.PointLight(0xffaa77, 3, 20, 2);
  entranceLight.position.set(0, 3, 2);
  scene.add(entranceLight);
}

/**
 * Add ground plane
 */
function addGround(scene: THREE.Scene): void {
  // Floor material - dark polished concrete look
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x222228,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Large floor plane
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid helper for development (subtle)
  const gridHelper = new THREE.GridHelper(50, 50, 0x333344, 0x222233);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);
}


// ============================================================================
// Scene Update
// ============================================================================

/**
 * Update the scene each frame
 */
export function updateScene(museumScene: MuseumScene, deltaTime: number): void {
  museumScene.time += deltaTime;

  // Update entrance zone (flickering lights)
  if (museumScene.entranceZone) {
    updateEntranceZone(museumScene.entranceZone, deltaTime);
  }

  // Update gallery zone (skylight animation, orb proximity)
  if (museumScene.galleryZone) {
    updateGalleryZone(museumScene.galleryZone, deltaTime, museumScene.camera.position);
  }

  // Update wing zones
  for (const wing of museumScene.wingZones) {
    updateWingZone(wing, deltaTime);
  }
}

// ============================================================================
// Scene Cleanup
// ============================================================================

/**
 * Dispose of all scene resources
 */
export function disposeScene(museumScene: MuseumScene): void {
  // Dispose of entrance zone
  if (museumScene.entranceZone) {
    disposeEntranceZone(museumScene.entranceZone);
  }

  // Dispose of gallery zone
  if (museumScene.galleryZone) {
    disposeGalleryZone(museumScene.galleryZone);
  }

  // Dispose of wing zones
  for (const wing of museumScene.wingZones) {
    disposeWingZone(wing);
  }

  // Dispose of all geometries and materials
  museumScene.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  // Dispose of renderer
  museumScene.renderer.dispose();

  // Remove canvas from DOM
  const canvas = museumScene.renderer.domElement;
  if (canvas.parentElement) {
    canvas.parentElement.removeChild(canvas);
  }
}
