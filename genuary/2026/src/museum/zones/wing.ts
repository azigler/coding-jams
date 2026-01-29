/**
 * Exhibit Wing Zone
 *
 * A corridor extending from the main gallery that houses multiple exhibits.
 * Each wing can display 8 days of Genuary artwork (4 on each side).
 *
 * Design:
 * - Long corridor with exhibits on both walls
 * - Warm gallery lighting
 * - Connects to main gallery via doorway
 */

import * as THREE from 'three';
import {
  createExhibitFrame,
  setPlaceholderTexture,
  setFrameTexture,
  getDayTexture,
  disposeExhibitFrame,
  createPlacard,
  disposePlacard,
  type ExhibitFrame,
  type Placard,
} from '../exhibits';

// ============================================================================
// Types
// ============================================================================

export interface WingZone {
  group: THREE.Group;
  exhibits: ExhibitFrame[];
  placards: Placard[];
  wingId: string;
  startDay: number;
  endDay: number;
}

export interface WingConfig {
  length: number;      // Corridor length
  width: number;       // Corridor width
  height: number;      // Ceiling height
  exhibitsPerSide: number; // Number of exhibits on each wall
  wallColor: number;
  floorColor: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultWingConfig: WingConfig = {
  length: 20,
  width: 6,
  height: 4,
  exhibitsPerSide: 4,
  wallColor: 0x3a4550,  // Teal like gallery
  floorColor: 0x2a2a35,
};

// ============================================================================
// Wing Creation
// ============================================================================

/**
 * Create an exhibit wing corridor
 * @param wingId - Unique identifier for this wing (e.g., 'north', 'east')
 * @param startDay - First day number to display (1-31)
 * @param config - Optional configuration overrides
 */
export function createWingZone(
  wingId: string,
  startDay: number,
  config: Partial<WingConfig> = {}
): WingZone {
  const cfg = { ...defaultWingConfig, ...config };
  const group = new THREE.Group();

  const totalExhibits = cfg.exhibitsPerSide * 2;
  const endDay = Math.min(startDay + totalExhibits - 1, 31);

  // Floor
  const floorGeom = new THREE.PlaneGeometry(cfg.width, cfg.length);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: cfg.floorColor,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0x151520,
    emissiveIntensity: 0.3,
  });
  const floor = new THREE.Mesh(floorGeom, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -cfg.length / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling
  const ceilingGeom = new THREE.PlaneGeometry(cfg.width, cfg.length);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a35,
    roughness: 0.8,
    metalness: 0.1,
    emissive: 0x101015,
    emissiveIntensity: 0.2,
  });
  const ceiling = new THREE.Mesh(ceilingGeom, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = cfg.height;
  ceiling.position.z = -cfg.length / 2;
  group.add(ceiling);

  // Left wall
  const wallGeom = new THREE.PlaneGeometry(cfg.length, cfg.height);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: cfg.wallColor,
    roughness: 0.7,
    metalness: 0.15,
    emissive: 0x253540,
    emissiveIntensity: 0.5,
  });
  const leftWall = new THREE.Mesh(wallGeom, wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -cfg.width / 2;
  leftWall.position.y = cfg.height / 2;
  leftWall.position.z = -cfg.length / 2;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(wallGeom.clone(), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.x = cfg.width / 2;
  rightWall.position.y = cfg.height / 2;
  rightWall.position.z = -cfg.length / 2;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // End wall (back of corridor)
  const endWallGeom = new THREE.PlaneGeometry(cfg.width, cfg.height);
  const endWall = new THREE.Mesh(endWallGeom, wallMaterial);
  endWall.position.y = cfg.height / 2;
  endWall.position.z = -cfg.length;
  endWall.receiveShadow = true;
  group.add(endWall);

  // Ceiling lights along corridor
  const numLights = Math.ceil(cfg.length / 5);
  for (let i = 0; i < numLights; i++) {
    const z = -(i + 0.5) * (cfg.length / numLights);
    const ceilingLight = new THREE.PointLight(0xffeedd, 3, 10, 1.5);
    ceilingLight.position.set(0, cfg.height - 0.3, z);
    group.add(ceilingLight);
  }

  // Create exhibits on both walls
  const { exhibits, placards } = createWingExhibits(group, cfg, startDay);

  return {
    group,
    exhibits,
    placards,
    wingId,
    startDay,
    endDay,
  };
}

// ============================================================================
// Artwork Loading
// ============================================================================

/**
 * Asynchronously load live artwork into an exhibit frame
 */
async function loadLiveArtwork(frame: ExhibitFrame, dayNumber: number): Promise<void> {
  try {
    const texture = await getDayTexture(dayNumber);
    if (texture) {
      setFrameTexture(frame, texture);
      console.log(`[Wing] Loaded live artwork for Day ${dayNumber}`);
    } else {
      console.warn(`[Wing] Could not load artwork for Day ${dayNumber}, keeping placeholder`);
    }
  } catch (error) {
    console.error(`[Wing] Error loading artwork for Day ${dayNumber}:`, error);
  }
}

// ============================================================================
// Exhibit Creation
// ============================================================================

/**
 * Create exhibits along both walls of the wing
 */
function createWingExhibits(
  group: THREE.Group,
  cfg: WingConfig,
  startDay: number
): { exhibits: ExhibitFrame[]; placards: Placard[] } {
  const exhibits: ExhibitFrame[] = [];
  const placards: Placard[] = [];

  const frameWidth = 1.4;
  const frameHeight = 0.9;
  const frameConfig = { width: frameWidth, height: frameHeight };
  const totalFrameHeight = frameHeight + 0.18; // Including frame border

  // Spacing between exhibits
  const spacing = cfg.length / (cfg.exhibitsPerSide + 1);
  const exhibitY = cfg.height / 2 + 0.2; // Slightly above center
  const wallOffset = 0.1; // Distance from wall

  let dayNumber = startDay;

  // Left wall exhibits (facing right, toward +X)
  // The frame canvas faces -Z internally, so we need rotation that transforms -Z to +X
  // That's -PI/2 (or equivalently 3*PI/2)
  for (let i = 0; i < cfg.exhibitsPerSide && dayNumber <= 31; i++) {
    const z = -(i + 1) * spacing;

    const currentDay = dayNumber; // Capture for async closure
    const frame = createExhibitFrame(currentDay, frameConfig);
    frame.group.position.set(-cfg.width / 2 + wallOffset, exhibitY, z);
    frame.group.rotation.y = -Math.PI / 2; // Canvas faces -Z, rotate to face +X

    // Set placeholder immediately, then try loading live artwork
    setPlaceholderTexture(frame);
    loadLiveArtwork(frame, currentDay).catch(() => {
      console.log(`[Wing] Day ${currentDay} artwork failed, using placeholder`);
    });
    group.add(frame.group);
    exhibits.push(frame);

    // Placard
    const placard = createPlacard(currentDay);
    const placardY = exhibitY - totalFrameHeight / 2 - 0.1;
    placard.group.position.set(-cfg.width / 2 + wallOffset + 0.02, placardY, z);
    placard.group.rotation.y = -Math.PI / 2; // Match exhibit rotation
    group.add(placard.group);
    placards.push(placard);

    // Spotlight for this exhibit
    const spotlight = new THREE.SpotLight(0xfffaf0, 8, 8, Math.PI / 5, 0.3, 1);
    spotlight.position.set(-cfg.width / 2 + 2, cfg.height - 0.5, z);
    spotlight.target.position.set(-cfg.width / 2 + wallOffset, exhibitY, z);
    spotlight.castShadow = false;
    group.add(spotlight);
    group.add(spotlight.target);

    dayNumber++;
  }

  // Right wall exhibits (facing left, toward -X)
  // The frame canvas faces -Z internally, so we need rotation that transforms -Z to -X
  // That's +PI/2
  for (let i = 0; i < cfg.exhibitsPerSide && dayNumber <= 31; i++) {
    const z = -(i + 1) * spacing;

    const currentDay = dayNumber; // Capture for async closure
    const frame = createExhibitFrame(currentDay, frameConfig);
    frame.group.position.set(cfg.width / 2 - wallOffset, exhibitY, z);
    frame.group.rotation.y = Math.PI / 2; // Canvas faces -Z, rotate to face -X

    // Set placeholder immediately, then try loading live artwork
    setPlaceholderTexture(frame);
    loadLiveArtwork(frame, currentDay).catch(() => {
      console.log(`[Wing] Day ${currentDay} artwork failed, using placeholder`);
    });
    group.add(frame.group);
    exhibits.push(frame);

    // Placard
    const placard = createPlacard(currentDay);
    const placardY = exhibitY - totalFrameHeight / 2 - 0.1;
    placard.group.position.set(cfg.width / 2 - wallOffset - 0.02, placardY, z);
    placard.group.rotation.y = Math.PI / 2; // Match exhibit rotation
    group.add(placard.group);
    placards.push(placard);

    // Spotlight for this exhibit
    const spotlight = new THREE.SpotLight(0xfffaf0, 8, 8, Math.PI / 5, 0.3, 1);
    spotlight.position.set(cfg.width / 2 - 2, cfg.height - 0.5, z);
    spotlight.target.position.set(cfg.width / 2 - wallOffset, exhibitY, z);
    spotlight.castShadow = false;
    group.add(spotlight);
    group.add(spotlight.target);

    dayNumber++;
  }

  return { exhibits, placards };
}

// ============================================================================
// Zone Update
// ============================================================================

/**
 * Update the wing zone each frame
 */
export function updateWingZone(_zone: WingZone, _deltaTime: number): void {
  // No dynamic updates needed for now
}

// ============================================================================
// Zone Cleanup
// ============================================================================

/**
 * Dispose of wing zone resources
 */
export function disposeWingZone(zone: WingZone): void {
  // Dispose exhibits
  zone.exhibits.forEach((exhibit) => {
    disposeExhibitFrame(exhibit);
  });

  // Dispose placards
  zone.placards.forEach((placard) => {
    disposePlacard(placard);
  });

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
