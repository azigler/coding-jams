/**
 * Day 17: STARE
 *
 * "Wallpaper group." — Ivan Dianov
 *
 * A 3D hallway at night. Low perspective—you're a child who got out of bed,
 * or someone who fell asleep on the couch. Wall sconces cast warm pools of
 * light, revealing patches of wallpaper that repeat into the darkness.
 *
 * The wallpaper uses p4m symmetry (square lattice with diagonal mirrors).
 * But the mathematics aren't the point. The point is that 3am feeling.
 *
 * Three.js. Perspective. 2700K warmth.
 */

import * as THREE from 'three';
import type { DayConfig, ThreeContext, ControlState } from '../types';
import type { ControlConfig } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface HallwayContext extends ThreeContext {
  wallpaperTexture: THREE.CanvasTexture;
  sconceLights: THREE.PointLight[];
  time: number;
}

// ============================================================================
// WALLPAPER PATTERN GENERATION (p4m symmetry)
// ============================================================================

/**
 * Generate a wallpaper pattern with p4m symmetry
 * p4m has 4-fold rotational symmetry with mirror lines
 */
function generateWallpaperTexture(
  size: number,
  patternScale: number,
  hue: number,
  saturation: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background - muted wallpaper base color
  const bgLightness = 35 + Math.random() * 10;
  ctx.fillStyle = `hsl(${hue}, ${saturation * 0.3}%, ${bgLightness}%)`;
  ctx.fillRect(0, 0, size, size);

  // Tile size for p4m pattern
  const tileSize = size / patternScale;

  // Draw the fundamental domain and apply p4m symmetry
  for (let tx = 0; tx < patternScale; tx++) {
    for (let ty = 0; ty < patternScale; ty++) {
      const ox = tx * tileSize;
      const oy = ty * tileSize;

      // Draw pattern elements with p4m symmetry (4-fold rotation + mirrors)
      drawP4mTile(ctx, ox, oy, tileSize, hue, saturation);
    }
  }

  return canvas;
}

/**
 * Draw a single tile with p4m symmetry elements
 */
function drawP4mTile(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  size: number,
  hue: number,
  saturation: number
): void {
  const center = size / 2;
  const cx = ox + center;
  const cy = oy + center;

  // Pattern color - slightly lighter than background
  const patternLightness = 45 + Math.random() * 5;
  ctx.strokeStyle = `hsl(${hue}, ${saturation * 0.5}%, ${patternLightness}%)`;
  ctx.fillStyle = `hsl(${hue}, ${saturation * 0.4}%, ${patternLightness + 5}%)`;
  ctx.lineWidth = size * 0.02;

  // Draw elements with 4-fold rotational symmetry
  for (let rot = 0; rot < 4; rot++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 2);
    ctx.translate(-cx, -cy);

    // Curved element in each quadrant
    ctx.beginPath();
    ctx.moveTo(ox + size * 0.1, oy + size * 0.1);
    ctx.quadraticCurveTo(
      ox + size * 0.3,
      oy + size * 0.05,
      ox + size * 0.5,
      oy + size * 0.15
    );
    ctx.stroke();

    // Small decorative element
    ctx.beginPath();
    ctx.arc(ox + size * 0.25, oy + size * 0.25, size * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Diagonal line toward center
    ctx.beginPath();
    ctx.moveTo(ox + size * 0.15, oy + size * 0.15);
    ctx.lineTo(ox + size * 0.35, oy + size * 0.35);
    ctx.stroke();

    ctx.restore();
  }

  // Central motif
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${hue}, ${saturation * 0.6}%, ${patternLightness - 5}%)`;
  ctx.fill();

  // Diamond shape at center
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.15);
  ctx.lineTo(cx + size * 0.15, cy);
  ctx.lineTo(cx, cy + size * 0.15);
  ctx.lineTo(cx - size * 0.15, cy);
  ctx.closePath();
  ctx.strokeStyle = `hsl(${hue}, ${saturation * 0.5}%, ${patternLightness}%)`;
  ctx.stroke();
}

// ============================================================================
// THREE.JS SETUP
// ============================================================================

function threeSetup(container: HTMLElement, controls: ControlState): HallwayContext {
  // Scene
  const scene = new THREE.Scene();

  // Fog for atmosphere - dark blue-ish
  const fogColor = new THREE.Color().setHSL(0.6, 0.2, 0.05);
  scene.fog = new THREE.Fog(fogColor, 1, controls.hallwayLength as number || 25);
  scene.background = fogColor;

  // Camera - low perspective
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  const cameraHeight = (controls.cameraHeight as number) || 0.3;
  camera.position.set(0, cameraHeight, 0);
  camera.lookAt(0, cameraHeight + 0.1, -20);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true, // Required for image capture/recording
  });
  renderer.setSize(800, 800);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  container.appendChild(renderer.domElement);

  // Style the canvas
  const canvas = renderer.domElement;
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  // Generate wallpaper texture
  const patternHue = (controls.patternHue as number) || 35; // Warm beige/cream
  const patternSaturation = (controls.patternSaturation as number) || 30;
  const wallpaperCanvas = generateWallpaperTexture(512, 4, patternHue, patternSaturation);
  const wallpaperTexture = new THREE.CanvasTexture(wallpaperCanvas);
  wallpaperTexture.wrapS = THREE.RepeatWrapping;
  wallpaperTexture.wrapT = THREE.RepeatWrapping;
  wallpaperTexture.repeat.set(2, 1);

  // Materials
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperTexture,
    roughness: 0.8,
    metalness: 0.0,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.08, 0.3, 0.15), // Dark wood
    roughness: 0.9,
    metalness: 0.0,
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.1, 0.1, 0.2), // Dark off-white
    roughness: 0.95,
    metalness: 0.0,
  });

  // Hallway dimensions
  const hallWidth = 3;
  const hallHeight = 3;
  const hallLength = (controls.hallwayLength as number) || 25;

  // Floor
  const floorGeom = new THREE.PlaneGeometry(hallWidth, hallLength);
  const floor = new THREE.Mesh(floorGeom, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -hallLength / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceilingGeom = new THREE.PlaneGeometry(hallWidth, hallLength);
  const ceiling = new THREE.Mesh(ceilingGeom, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, hallHeight, -hallLength / 2);
  scene.add(ceiling);

  // Left wall
  const leftWallGeom = new THREE.PlaneGeometry(hallLength, hallHeight);
  const leftWall = new THREE.Mesh(leftWallGeom, wallMaterial.clone());
  (leftWall.material as THREE.MeshStandardMaterial).map = wallpaperTexture.clone();
  ((leftWall.material as THREE.MeshStandardMaterial).map as THREE.Texture).repeat.set(hallLength / 3, 1);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-hallWidth / 2, hallHeight / 2, -hallLength / 2);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right wall
  const rightWallGeom = new THREE.PlaneGeometry(hallLength, hallHeight);
  const rightWall = new THREE.Mesh(rightWallGeom, wallMaterial.clone());
  (rightWall.material as THREE.MeshStandardMaterial).map = wallpaperTexture.clone();
  ((rightWall.material as THREE.MeshStandardMaterial).map as THREE.Texture).repeat.set(hallLength / 3, 1);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(hallWidth / 2, hallHeight / 2, -hallLength / 2);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Back wall (end of hallway)
  const backWallGeom = new THREE.PlaneGeometry(hallWidth, hallHeight);
  const backWall = new THREE.Mesh(backWallGeom, wallMaterial.clone());
  backWall.position.set(0, hallHeight / 2, -hallLength);
  scene.add(backWall);

  // Wall sconces (point lights)
  const sconceLights: THREE.PointLight[] = [];
  const numSconces = Math.floor(hallLength / 5);
  const lightWarmth = (controls.lightWarmth as number) || 0.08; // ~2700K

  for (let i = 0; i < numSconces; i++) {
    const z = -3 - i * 5;

    // Left sconce
    const leftLight = new THREE.PointLight(
      new THREE.Color().setHSL(lightWarmth, 0.8, 0.6),
      2,
      8,
      2
    );
    leftLight.position.set(-hallWidth / 2 + 0.2, hallHeight * 0.7, z);
    leftLight.castShadow = true;
    leftLight.shadow.mapSize.width = 256;
    leftLight.shadow.mapSize.height = 256;
    scene.add(leftLight);
    sconceLights.push(leftLight);

    // Right sconce
    const rightLight = new THREE.PointLight(
      new THREE.Color().setHSL(lightWarmth, 0.8, 0.6),
      2,
      8,
      2
    );
    rightLight.position.set(hallWidth / 2 - 0.2, hallHeight * 0.7, z);
    rightLight.castShadow = true;
    rightLight.shadow.mapSize.width = 256;
    rightLight.shadow.mapSize.height = 256;
    scene.add(rightLight);
    sconceLights.push(rightLight);

    // Sconce geometry (simple)
    const sconceGeom = new THREE.BoxGeometry(0.1, 0.15, 0.1);
    const sconceMat = new THREE.MeshStandardMaterial({
      color: 0x332211,
      emissive: new THREE.Color().setHSL(lightWarmth, 0.6, 0.3),
      emissiveIntensity: 0.5,
    });

    const leftSconce = new THREE.Mesh(sconceGeom, sconceMat);
    leftSconce.position.set(-hallWidth / 2 + 0.05, hallHeight * 0.7, z);
    scene.add(leftSconce);

    const rightSconce = new THREE.Mesh(sconceGeom, sconceMat.clone());
    rightSconce.position.set(hallWidth / 2 - 0.05, hallHeight * 0.7, z);
    scene.add(rightSconce);
  }

  // Very dim ambient light
  const ambient = new THREE.AmbientLight(0x111122, 0.1);
  scene.add(ambient);

  return {
    renderer,
    scene,
    camera,
    canvas,
    wallpaperTexture,
    sconceLights,
    time: 0,
  };
}

// ============================================================================
// UPDATE LOOP
// ============================================================================

function threeUpdate(baseCtx: ThreeContext, controls: ControlState, deltaTime: number): void {
  const ctx = baseCtx as HallwayContext;
  ctx.time += deltaTime;

  // Update camera height based on controls
  const cameraHeight = (controls.cameraHeight as number) || 0.3;
  ctx.camera.position.y = cameraHeight;
  (ctx.camera as THREE.PerspectiveCamera).lookAt(0, cameraHeight + 0.1, -20);

  // Subtle light flicker
  const flickerAmount = (controls.lightFlicker as number) || 0.05;
  ctx.sconceLights.forEach((light, i) => {
    const flicker = 1 + Math.sin(ctx.time * 3 + i * 1.7) * flickerAmount;
    light.intensity = 2 * flicker;
  });

  // Update fog distance
  const hallLength = (controls.hallwayLength as number) || 25;
  if (ctx.scene.fog) {
    (ctx.scene.fog as THREE.Fog).far = hallLength;
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

function threeCleanup(baseCtx: ThreeContext): void {
  const ctx = baseCtx as HallwayContext;
  // Dispose of textures
  ctx.wallpaperTexture.dispose();

  // Dispose of geometries and materials
  ctx.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  cameraHeight: 0.3,
  hallwayLength: 25,
  lightWarmth: 0.08,
  lightFlicker: 0.05,
  patternHue: 35,
  patternSaturation: 30,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  cameraHeight: {
    label: 'Camera Height',
    min: 0.15,
    max: 1.5,
    defaultValue: 0.3,
    step: 0.05,
  },
  hallwayLength: {
    label: 'Hallway Depth',
    min: 15,
    max: 40,
    defaultValue: 25,
    step: 1,
  },
  lightWarmth: {
    label: 'Light Warmth',
    min: 0.02,
    max: 0.15,
    defaultValue: 0.08,
    step: 0.01,
  },
  lightFlicker: {
    label: 'Light Flicker',
    min: 0,
    max: 0.15,
    defaultValue: 0.05,
    step: 0.01,
  },
  patternHue: {
    label: 'Wallpaper Hue',
    min: 0,
    max: 360,
    defaultValue: 35,
    step: 5,
  },
  patternSaturation: {
    label: 'Wallpaper Saturation',
    min: 10,
    max: 60,
    defaultValue: 30,
    step: 5,
  },
};

// ============================================================================
// CONFIG
// ============================================================================

const config: DayConfig = {
  day: 17,
  prompt: 'Wallpaper group.',
  creditName: 'Ivan Dianov',
  creditUrl: 'https://ivandianov.com/',
  mode: 'three',
  threeSetup,
  threeUpdate,
  threeCleanup,
  recording: {
    enabled: true,
    duration: 10,
    filename: 'genuary-2026-day-17',
  },
};

// Claude's Choice — that 3am feeling
export function getClaudesChoice(): Partial<ControlState> {
  return {
    cameraHeight: 0.25,
    hallwayLength: 28,
    lightWarmth: 0.07,
    lightFlicker: 0.04,
    patternHue: 32,
    patternSaturation: 25,
  };
}

export { controlConfigs, defaultControls };
export default config;
