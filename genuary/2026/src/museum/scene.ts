/**
 * Museum Scene Setup
 *
 * Creates the Three.js scene with camera, lights, and basic geometry.
 * This is the foundation that all zones and exhibits build upon.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface MuseumScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  time: number;
}

// ============================================================================
// Constants
// ============================================================================

// Human eye height when standing
const CAMERA_HEIGHT = 1.6;

// Initial camera position (entrance)
const INITIAL_POSITION = new THREE.Vector3(0, CAMERA_HEIGHT, 5);

// Canvas size
const CANVAS_SIZE = 800;

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

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true, // Required for screenshots
  });
  renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

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

  // Add ground plane
  addGround(scene);

  // Add placeholder entrance structure
  addEntranceStructure(scene);

  return {
    renderer,
    scene,
    camera,
    time: 0,
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

  // Directional light - simulates moonlight
  const directional = new THREE.DirectionalLight(0x8090a0, 0.5);
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -20;
  directional.shadow.camera.right = 20;
  directional.shadow.camera.top = 20;
  directional.shadow.camera.bottom = -20;
  scene.add(directional);

  // Warm point light at entrance - welcoming
  const entranceLight = new THREE.PointLight(0xffaa77, 2, 15, 2);
  entranceLight.position.set(0, 3, 2);
  entranceLight.castShadow = true;
  entranceLight.shadow.mapSize.width = 512;
  entranceLight.shadow.mapSize.height = 512;
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

/**
 * Add placeholder entrance structure
 * This will be replaced with Day 17 hallway integration
 */
function addEntranceStructure(scene: THREE.Scene): void {
  // Simple archway to mark the entrance
  const archMaterial = new THREE.MeshStandardMaterial({
    color: 0x444455,
    roughness: 0.7,
    metalness: 0.2,
  });

  // Left pillar
  const pillarGeometry = new THREE.BoxGeometry(0.5, 4, 0.5);
  const leftPillar = new THREE.Mesh(pillarGeometry, archMaterial);
  leftPillar.position.set(-2, 2, 0);
  leftPillar.castShadow = true;
  leftPillar.receiveShadow = true;
  scene.add(leftPillar);

  // Right pillar
  const rightPillar = new THREE.Mesh(pillarGeometry, archMaterial);
  rightPillar.position.set(2, 2, 0);
  rightPillar.castShadow = true;
  rightPillar.receiveShadow = true;
  scene.add(rightPillar);

  // Top beam
  const beamGeometry = new THREE.BoxGeometry(5, 0.5, 0.5);
  const beam = new THREE.Mesh(beamGeometry, archMaterial);
  beam.position.set(0, 4.25, 0);
  beam.castShadow = true;
  scene.add(beam);

  // Sign above entrance
  const signGeometry = new THREE.PlaneGeometry(3, 0.6);
  const signMaterial = new THREE.MeshStandardMaterial({
    color: 0x888899,
    roughness: 0.5,
    metalness: 0.3,
    emissive: 0x222233,
    emissiveIntensity: 0.3,
  });
  const sign = new THREE.Mesh(signGeometry, signMaterial);
  sign.position.set(0, 3.8, 0.26);
  scene.add(sign);

  // TODO: Add text to sign using CanvasTexture
  // For now, use a placeholder

  // Placeholder wall behind entrance (leads into museum)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x333340,
    roughness: 0.9,
    metalness: 0.0,
  });

  const backWallGeometry = new THREE.PlaneGeometry(20, 5);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, 2.5, -10);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Side walls
  const sideWallGeometry = new THREE.PlaneGeometry(10, 5);

  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.set(-10, 2.5, -5);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.set(10, 2.5, -5);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  scene.add(rightWall);
}

// ============================================================================
// Scene Update
// ============================================================================

/**
 * Update the scene each frame
 */
export function updateScene(museumScene: MuseumScene, deltaTime: number): void {
  museumScene.time += deltaTime;

  // Future: animate exhibits, update LOD, etc.
}

// ============================================================================
// Scene Cleanup
// ============================================================================

/**
 * Dispose of all scene resources
 */
export function disposeScene(museumScene: MuseumScene): void {
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
