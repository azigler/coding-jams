/**
 * Entrance Zone - Adapted from Day 17 (STARE)
 *
 * A 3D hallway at night that serves as the museum entrance.
 * Wall sconces cast warm pools of light, revealing patches of
 * wallpaper that repeat into the darkness.
 *
 * The wallpaper uses p4m symmetry (square lattice with diagonal mirrors).
 * Visitors spawn here and walk toward the main gallery.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface EntranceZone {
  group: THREE.Group;
  sconceLights: THREE.PointLight[];
  wallpaperTexture: THREE.CanvasTexture;
  time: number;
}

export interface EntranceConfig {
  hallWidth: number;
  hallHeight: number;
  hallLength: number;
  patternHue: number;
  patternSaturation: number;
  lightWarmth: number;
  lightFlicker: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultEntranceConfig: EntranceConfig = {
  hallWidth: 4,
  hallHeight: 3.5,
  hallLength: 20,
  patternHue: 35, // Warm beige/cream
  patternSaturation: 30,
  lightWarmth: 0.08, // ~2700K
  lightFlicker: 0.03,
};

// ============================================================================
// Wallpaper Pattern Generation (p4m symmetry)
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
// Zone Creation
// ============================================================================

/**
 * Create the entrance zone
 */
export function createEntranceZone(config: Partial<EntranceConfig> = {}): EntranceZone {
  const cfg = { ...defaultEntranceConfig, ...config };
  const group = new THREE.Group();

  // Generate wallpaper texture
  const wallpaperCanvas = generateWallpaperTexture(512, 4, cfg.patternHue, cfg.patternSaturation);
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
    color: new THREE.Color().setHSL(0.08, 0.3, 0.12), // Dark wood
    roughness: 0.9,
    metalness: 0.0,
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.1, 0.1, 0.18), // Dark off-white
    roughness: 0.95,
    metalness: 0.0,
  });

  // Floor
  const floorGeom = new THREE.PlaneGeometry(cfg.hallWidth, cfg.hallLength);
  const floor = new THREE.Mesh(floorGeom, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -cfg.hallLength / 2);
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling
  const ceilingGeom = new THREE.PlaneGeometry(cfg.hallWidth, cfg.hallLength);
  const ceiling = new THREE.Mesh(ceilingGeom, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, cfg.hallHeight, -cfg.hallLength / 2);
  group.add(ceiling);

  // Left wall
  const leftWallGeom = new THREE.PlaneGeometry(cfg.hallLength, cfg.hallHeight);
  const leftWallMaterial = wallMaterial.clone();
  leftWallMaterial.map = wallpaperTexture.clone();
  (leftWallMaterial.map as THREE.Texture).repeat.set(cfg.hallLength / 4, 1);
  const leftWall = new THREE.Mesh(leftWallGeom, leftWallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-cfg.hallWidth / 2, cfg.hallHeight / 2, -cfg.hallLength / 2);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Right wall
  const rightWallGeom = new THREE.PlaneGeometry(cfg.hallLength, cfg.hallHeight);
  const rightWallMaterial = wallMaterial.clone();
  rightWallMaterial.map = wallpaperTexture.clone();
  (rightWallMaterial.map as THREE.Texture).repeat.set(cfg.hallLength / 4, 1);
  const rightWall = new THREE.Mesh(rightWallGeom, rightWallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(cfg.hallWidth / 2, cfg.hallHeight / 2, -cfg.hallLength / 2);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Entry wall (behind spawn point) - solid dark
  const entryWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    roughness: 0.9,
    metalness: 0.0,
  });
  const entryWallGeom = new THREE.PlaneGeometry(cfg.hallWidth, cfg.hallHeight);
  const entryWall = new THREE.Mesh(entryWallGeom, entryWallMaterial);
  entryWall.rotation.y = Math.PI;
  entryWall.position.set(0, cfg.hallHeight / 2, 1);
  group.add(entryWall);

  // Wall sconces with point lights
  const sconceLights: THREE.PointLight[] = [];
  const numSconces = Math.floor(cfg.hallLength / 5);

  for (let i = 0; i < numSconces; i++) {
    const z = -2 - i * 5;

    // Left sconce light
    const leftLight = new THREE.PointLight(
      new THREE.Color().setHSL(cfg.lightWarmth, 0.8, 0.6),
      1.5,
      8,
      2
    );
    leftLight.position.set(-cfg.hallWidth / 2 + 0.3, cfg.hallHeight * 0.7, z);
    leftLight.castShadow = true;
    leftLight.shadow.mapSize.width = 256;
    leftLight.shadow.mapSize.height = 256;
    group.add(leftLight);
    sconceLights.push(leftLight);

    // Right sconce light
    const rightLight = new THREE.PointLight(
      new THREE.Color().setHSL(cfg.lightWarmth, 0.8, 0.6),
      1.5,
      8,
      2
    );
    rightLight.position.set(cfg.hallWidth / 2 - 0.3, cfg.hallHeight * 0.7, z);
    rightLight.castShadow = true;
    rightLight.shadow.mapSize.width = 256;
    rightLight.shadow.mapSize.height = 256;
    group.add(rightLight);
    sconceLights.push(rightLight);

    // Sconce geometry (simple box with emissive glow)
    const sconceGeom = new THREE.BoxGeometry(0.1, 0.15, 0.1);
    const sconceMat = new THREE.MeshStandardMaterial({
      color: 0x332211,
      emissive: new THREE.Color().setHSL(cfg.lightWarmth, 0.6, 0.3),
      emissiveIntensity: 0.5,
    });

    const leftSconce = new THREE.Mesh(sconceGeom, sconceMat);
    leftSconce.position.set(-cfg.hallWidth / 2 + 0.05, cfg.hallHeight * 0.7, z);
    group.add(leftSconce);

    const rightSconce = new THREE.Mesh(sconceGeom, sconceMat.clone());
    rightSconce.position.set(cfg.hallWidth / 2 - 0.05, cfg.hallHeight * 0.7, z);
    group.add(rightSconce);
  }

  // Doorway at end of hallway (opening to main gallery)
  const doorwayWidth = 2;
  const doorwayHeight = 2.8;

  // Create doorframe
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a40,
    roughness: 0.6,
    metalness: 0.2,
  });

  // Left doorframe
  const leftFrameGeom = new THREE.BoxGeometry(0.2, doorwayHeight, 0.2);
  const leftFrame = new THREE.Mesh(leftFrameGeom, frameMaterial);
  leftFrame.position.set(-doorwayWidth / 2, doorwayHeight / 2, -cfg.hallLength);
  group.add(leftFrame);

  // Right doorframe
  const rightFrame = new THREE.Mesh(leftFrameGeom, frameMaterial);
  rightFrame.position.set(doorwayWidth / 2, doorwayHeight / 2, -cfg.hallLength);
  group.add(rightFrame);

  // Top doorframe
  const topFrameGeom = new THREE.BoxGeometry(doorwayWidth + 0.4, 0.2, 0.2);
  const topFrame = new THREE.Mesh(topFrameGeom, frameMaterial);
  topFrame.position.set(0, doorwayHeight + 0.1, -cfg.hallLength);
  group.add(topFrame);

  // Wall sections around doorway
  const sideWallWidth = (cfg.hallWidth - doorwayWidth) / 2 - 0.1;
  const sideWallGeom = new THREE.PlaneGeometry(sideWallWidth, cfg.hallHeight);

  const leftSideWall = new THREE.Mesh(sideWallGeom, wallMaterial.clone());
  leftSideWall.position.set(
    -cfg.hallWidth / 2 + sideWallWidth / 2,
    cfg.hallHeight / 2,
    -cfg.hallLength
  );
  group.add(leftSideWall);

  const rightSideWall = new THREE.Mesh(sideWallGeom, wallMaterial.clone());
  rightSideWall.position.set(
    cfg.hallWidth / 2 - sideWallWidth / 2,
    cfg.hallHeight / 2,
    -cfg.hallLength
  );
  group.add(rightSideWall);

  // Top section above doorway
  const topWallGeom = new THREE.PlaneGeometry(doorwayWidth, cfg.hallHeight - doorwayHeight - 0.2);
  const topWall = new THREE.Mesh(topWallGeom, wallMaterial.clone());
  topWall.position.set(
    0,
    doorwayHeight + (cfg.hallHeight - doorwayHeight) / 2,
    -cfg.hallLength
  );
  group.add(topWall);

  return {
    group,
    sconceLights,
    wallpaperTexture,
    time: 0,
  };
}

// ============================================================================
// Zone Update
// ============================================================================

/**
 * Update the entrance zone each frame
 */
export function updateEntranceZone(
  zone: EntranceZone,
  deltaTime: number,
  flickerAmount: number = 0.03
): void {
  zone.time += deltaTime;

  // Subtle light flicker for atmosphere
  zone.sconceLights.forEach((light, i) => {
    const flicker = 1 + Math.sin(zone.time * 3 + i * 1.7) * flickerAmount;
    light.intensity = 1.5 * flicker;
  });
}

// ============================================================================
// Zone Cleanup
// ============================================================================

/**
 * Dispose of entrance zone resources
 */
export function disposeEntranceZone(zone: EntranceZone): void {
  // Dispose of wallpaper texture
  zone.wallpaperTexture.dispose();

  // Dispose of all geometries and materials in the group
  zone.group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        object.material.dispose();
      }
    }
  });
}
