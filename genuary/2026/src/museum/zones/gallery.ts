/**
 * Main Gallery Zone
 *
 * The central hub of the museum - a large open space with a high ceiling
 * where multiple corridors branch off to different exhibit wings.
 *
 * Design:
 * - Octagonal shape to allow multiple exit points
 * - High ceiling with skylight for natural light feel
 * - Central pedestal for featured piece
 * - Four cardinal exits leading to exhibit wings
 */

import * as THREE from 'three';
import {
  createExhibitFrame,
  setPlaceholderTexture,
  disposeExhibitFrame,
  createPlacard,
  disposePlacard,
  type ExhibitFrame,
  type Placard,
} from '../exhibits';

// ============================================================================
// Types
// ============================================================================

export interface GalleryZone {
  group: THREE.Group;
  skylightMesh: THREE.Mesh;
  exhibits: ExhibitFrame[];
  placards: Placard[];
  time: number;
}

export interface GalleryConfig {
  radius: number; // Distance from center to wall
  height: number; // Ceiling height
  numSides: number; // Octagon = 8
  skylightRadius: number;
  floorColor: number;
  wallColor: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultGalleryConfig: GalleryConfig = {
  radius: 12,
  height: 6,
  numSides: 8,
  skylightRadius: 4,
  floorColor: 0x1a1a1f,
  wallColor: 0x2a2a30,
};

// ============================================================================
// Zone Creation
// ============================================================================

/**
 * Create the main gallery zone
 */
export function createGalleryZone(config: Partial<GalleryConfig> = {}): GalleryZone {
  const cfg = { ...defaultGalleryConfig, ...config };
  const group = new THREE.Group();

  // Position the gallery at the end of the entrance hallway
  // Entrance hallway ends at z = -20 (hallLength), so gallery starts there
  const galleryZ = -20 - cfg.radius;
  group.position.set(0, 0, galleryZ);

  // Floor - octagonal with polished look (brighter for visibility)
  const floorGeom = createOctagonGeometry(cfg.radius, cfg.numSides);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x252530,
    roughness: 0.15,
    metalness: 0.4,
    emissive: 0x151520,
    emissiveIntensity: 0.3,
  });
  const floor = new THREE.Mesh(floorGeom, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling with skylight hole
  const ceilingGeom = createOctagonWithHoleGeometry(cfg.radius, cfg.skylightRadius, cfg.numSides);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f1f24,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeom, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = cfg.height;
  group.add(ceiling);

  // Skylight (glass dome effect) - brighter glow for better ambience
  const skylightGeom = new THREE.CircleGeometry(cfg.skylightRadius, 32);
  const skylightMaterial = new THREE.MeshStandardMaterial({
    color: 0x6080b0,
    roughness: 0.1,
    metalness: 0.2,
    emissive: 0x4060a0,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const skylightMesh = new THREE.Mesh(skylightGeom, skylightMaterial);
  skylightMesh.rotation.x = Math.PI / 2;
  skylightMesh.position.y = cfg.height + 0.1;
  group.add(skylightMesh);

  // Skylight light source - main illumination from above (brighter for visibility)
  const skylightLight = new THREE.PointLight(0xa0b0d0, 8, 50, 1);
  skylightLight.position.set(0, cfg.height - 0.5, 0);
  skylightLight.castShadow = true;
  skylightLight.shadow.mapSize.width = 1024;
  skylightLight.shadow.mapSize.height = 1024;
  group.add(skylightLight);

  // Ambient fill light - fills in the shadows (stronger)
  const ambientFill = new THREE.PointLight(0x8090a0, 3, 45, 1.5);
  ambientFill.position.set(0, cfg.height / 2, 0);
  group.add(ambientFill);

  // Additional ambient at floor level (stronger for better floor visibility)
  const floorFill = new THREE.PointLight(0x505060, 2, 30, 1.5);
  floorFill.position.set(0, 1, 0);
  group.add(floorFill);

  // Secondary overhead lights in a ring pattern for better coverage
  const ringRadius = cfg.radius * 0.6;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4 + Math.PI / 4; // Offset to be between walls
    const ringLight = new THREE.PointLight(0x9090a0, 2, 15, 2);
    ringLight.position.set(
      Math.cos(angle) * ringRadius,
      cfg.height - 1,
      Math.sin(angle) * ringRadius
    );
    group.add(ringLight);
  }

  // Walls
  createWalls(group, cfg);

  // Central pedestal
  createPedestal(group, cfg);

  // Doorways to exhibit wings (4 cardinal directions)
  createDoorways(group, cfg);

  // Exhibit frames on non-doorway walls (walls 1, 3, 5, 7)
  const { exhibits, placards } = createExhibits(group, cfg);

  return {
    group,
    skylightMesh,
    exhibits,
    placards,
    time: 0,
  };
}

// ============================================================================
// Geometry Helpers
// ============================================================================

/**
 * Create an octagonal (or n-sided) geometry
 */
function createOctagonGeometry(radius: number, sides: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const angleStep = (Math.PI * 2) / sides;

  for (let i = 0; i <= sides; i++) {
    const angle = i * angleStep - Math.PI / sides; // Offset so flat edge faces entrance
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  return new THREE.ShapeGeometry(shape);
}

/**
 * Create an octagonal geometry with a circular hole for skylight
 */
function createOctagonWithHoleGeometry(
  outerRadius: number,
  holeRadius: number,
  sides: number
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const angleStep = (Math.PI * 2) / sides;

  // Outer octagon
  for (let i = 0; i <= sides; i++) {
    const angle = i * angleStep - Math.PI / sides;
    const x = Math.cos(angle) * outerRadius;
    const y = Math.sin(angle) * outerRadius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  // Inner hole (circle)
  const holePath = new THREE.Path();
  const holeSegments = 32;
  for (let i = 0; i <= holeSegments; i++) {
    const angle = (i / holeSegments) * Math.PI * 2;
    const x = Math.cos(angle) * holeRadius;
    const y = Math.sin(angle) * holeRadius;
    if (i === 0) {
      holePath.moveTo(x, y);
    } else {
      holePath.lineTo(x, y);
    }
  }
  shape.holes.push(holePath);

  return new THREE.ShapeGeometry(shape);
}

/**
 * Create the octagonal walls
 */
function createWalls(group: THREE.Group, cfg: GalleryConfig): void {
  const angleStep = (Math.PI * 2) / cfg.numSides;
  const wallWidth = 2 * cfg.radius * Math.sin(angleStep / 2);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: cfg.wallColor,
    roughness: 0.85,
    metalness: 0.05,
    emissive: 0x202030,
    emissiveIntensity: 0.4,
  });

  for (let i = 0; i < cfg.numSides; i++) {
    // Skip walls where doorways will go (entrance + 3 cardinals)
    // Entrance is at i=0 (south), cardinals at i=2 (west), i=4 (north), i=6 (east)
    if (i === 0 || i === 2 || i === 4 || i === 6) {
      // Create wall sections on either side of doorway
      createWallWithDoorway(group, cfg, i, wallMaterial, wallWidth, angleStep);
      continue;
    }

    const angle = i * angleStep - Math.PI / cfg.numSides + angleStep / 2;
    const wallGeom = new THREE.PlaneGeometry(wallWidth, cfg.height);
    const wall = new THREE.Mesh(wallGeom, wallMaterial);

    // Position at center of wall segment
    const wallDist = cfg.radius * Math.cos(angleStep / 2);
    wall.position.x = Math.sin(angle) * wallDist;
    wall.position.z = -Math.cos(angle) * wallDist;
    wall.position.y = cfg.height / 2;

    // Rotate to face inward
    wall.rotation.y = angle;
    wall.receiveShadow = true;
    group.add(wall);
  }
}

/**
 * Create wall sections around a doorway
 */
function createWallWithDoorway(
  group: THREE.Group,
  cfg: GalleryConfig,
  wallIndex: number,
  material: THREE.MeshStandardMaterial,
  wallWidth: number,
  angleStep: number
): void {
  const doorWidth = 2.5;
  const doorHeight = 3;
  const sideWidth = (wallWidth - doorWidth) / 2;

  const angle = wallIndex * angleStep - Math.PI / cfg.numSides + angleStep / 2;
  const wallDist = cfg.radius * Math.cos(angleStep / 2);

  // Left section
  const leftGeom = new THREE.PlaneGeometry(sideWidth, cfg.height);
  const leftWall = new THREE.Mesh(leftGeom, material);
  leftWall.position.x = Math.sin(angle) * wallDist;
  leftWall.position.z = -Math.cos(angle) * wallDist;
  leftWall.position.y = cfg.height / 2;
  // Offset to the left
  const leftOffset = (wallWidth / 2 - sideWidth / 2);
  leftWall.position.x -= Math.cos(angle) * leftOffset;
  leftWall.position.z -= Math.sin(angle) * leftOffset;
  leftWall.rotation.y = angle;
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Right section
  const rightWall = new THREE.Mesh(leftGeom.clone(), material);
  rightWall.position.x = Math.sin(angle) * wallDist;
  rightWall.position.z = -Math.cos(angle) * wallDist;
  rightWall.position.y = cfg.height / 2;
  // Offset to the right
  rightWall.position.x += Math.cos(angle) * leftOffset;
  rightWall.position.z += Math.sin(angle) * leftOffset;
  rightWall.rotation.y = angle;
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Top section above door
  const topHeight = cfg.height - doorHeight;
  const topGeom = new THREE.PlaneGeometry(doorWidth, topHeight);
  const topWall = new THREE.Mesh(topGeom, material);
  topWall.position.x = Math.sin(angle) * wallDist;
  topWall.position.z = -Math.cos(angle) * wallDist;
  topWall.position.y = doorHeight + topHeight / 2;
  topWall.rotation.y = angle;
  group.add(topWall);
}

/**
 * Create doorway frames
 */
function createDoorways(group: THREE.Group, cfg: GalleryConfig): void {
  const doorWidth = 2.5;
  const doorHeight = 3;
  const angleStep = (Math.PI * 2) / cfg.numSides;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a40,
    roughness: 0.5,
    metalness: 0.3,
  });

  // Doorway indices: 0 (entrance/south), 2 (west), 4 (north), 6 (east)
  const doorIndices = [0, 2, 4, 6];
  const doorNames = ['Entrance', 'West Wing', 'North Gallery', 'East Wing'];

  doorIndices.forEach((wallIndex, i) => {
    const angle = wallIndex * angleStep - Math.PI / cfg.numSides + angleStep / 2;
    const wallDist = cfg.radius * Math.cos(angleStep / 2);

    const frameX = Math.sin(angle) * wallDist;
    const frameZ = -Math.cos(angle) * wallDist;

    // Frame posts
    const postGeom = new THREE.BoxGeometry(0.15, doorHeight, 0.15);
    const leftPost = new THREE.Mesh(postGeom, frameMaterial);
    leftPost.position.set(
      frameX - Math.cos(angle) * (doorWidth / 2 + 0.075),
      doorHeight / 2,
      frameZ - Math.sin(angle) * (doorWidth / 2 + 0.075)
    );
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeom, frameMaterial);
    rightPost.position.set(
      frameX + Math.cos(angle) * (doorWidth / 2 + 0.075),
      doorHeight / 2,
      frameZ + Math.sin(angle) * (doorWidth / 2 + 0.075)
    );
    group.add(rightPost);

    // Top beam
    const beamGeom = new THREE.BoxGeometry(doorWidth + 0.3, 0.15, 0.15);
    const topBeam = new THREE.Mesh(beamGeom, frameMaterial);
    topBeam.position.set(frameX, doorHeight + 0.075, frameZ);
    topBeam.rotation.y = angle;
    group.add(topBeam);

    // Light above doorway
    const doorLight = new THREE.PointLight(0xffddaa, 0.8, 8, 2);
    doorLight.position.set(frameX, doorHeight - 0.3, frameZ);
    group.add(doorLight);

    // TODO: Add signage for wing names
    void doorNames[i]; // Placeholder for future signage
  });
}

/**
 * Create central pedestal for featured artwork
 */
function createPedestal(group: THREE.Group, cfg: GalleryConfig): void {
  const pedestalRadius = 1;
  const pedestalHeight = 1.2;

  // Base
  const baseGeom = new THREE.CylinderGeometry(pedestalRadius * 1.2, pedestalRadius * 1.3, 0.15, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a30,
    roughness: 0.4,
    metalness: 0.2,
  });
  const base = new THREE.Mesh(baseGeom, baseMaterial);
  base.position.y = 0.075;
  base.receiveShadow = true;
  base.castShadow = true;
  group.add(base);

  // Column
  const columnGeom = new THREE.CylinderGeometry(pedestalRadius, pedestalRadius, pedestalHeight, 32);
  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a40,
    roughness: 0.6,
    metalness: 0.1,
  });
  const column = new THREE.Mesh(columnGeom, columnMaterial);
  column.position.y = 0.15 + pedestalHeight / 2;
  column.castShadow = true;
  group.add(column);

  // Top platform
  const topGeom = new THREE.CylinderGeometry(pedestalRadius * 1.1, pedestalRadius, 0.1, 32);
  const top = new THREE.Mesh(topGeom, baseMaterial);
  top.position.y = 0.15 + pedestalHeight + 0.05;
  top.receiveShadow = true;
  group.add(top);

  // Spotlight on pedestal (brighter, no shadow to reduce texture units)
  const spotlight = new THREE.SpotLight(0xffffff, 5, 12, Math.PI / 5, 0.4, 1);
  spotlight.position.set(0, cfg.height - 0.5, 0);
  spotlight.target.position.set(0, pedestalHeight + 0.15, 0);
  spotlight.castShadow = false; // Disabled to reduce texture unit usage
  group.add(spotlight);
  group.add(spotlight.target);
}

// ============================================================================
// Exhibits
// ============================================================================

/**
 * Create exhibit frames on the non-doorway walls (walls 1, 3, 5, 7)
 * These walls are between the doorways at positions 0, 2, 4, 6
 */
function createExhibits(
  group: THREE.Group,
  cfg: GalleryConfig
): { exhibits: ExhibitFrame[]; placards: Placard[] } {
  const exhibits: ExhibitFrame[] = [];
  const placards: Placard[] = [];
  const angleStep = (Math.PI * 2) / cfg.numSides;
  const wallDist = cfg.radius * Math.cos(angleStep / 2);

  // Non-doorway wall indices: 1, 3, 5, 7
  // Place one exhibit on each wall
  const exhibitWalls = [1, 3, 5, 7];
  const dayNumbers = [1, 7, 11, 13]; // Featured days to display

  // Frame configuration
  const frameWidth = 1.8;
  const frameHeight = 1.2;
  const frameConfig = { frameWidth: 0.06, matteWidth: 0.03 };
  const totalFrameHeight = frameHeight + (frameConfig.frameWidth + frameConfig.matteWidth) * 2;

  exhibitWalls.forEach((wallIndex, i) => {
    const angle = wallIndex * angleStep - Math.PI / cfg.numSides + angleStep / 2;

    // Position on the wall
    const x = Math.sin(angle) * (wallDist - 0.1); // Slightly in front of wall
    const z = -Math.cos(angle) * (wallDist - 0.1);
    const y = cfg.height / 2; // Center height

    // Create the frame
    const frame = createExhibitFrame(dayNumbers[i], {
      width: frameWidth,
      height: frameHeight,
    });

    // Position and rotate to face center
    frame.group.position.set(x, y, z);
    frame.group.rotation.y = angle + Math.PI; // Face inward

    // Set placeholder for now
    setPlaceholderTexture(frame);

    // Create placard below the frame
    const placard = createPlacard(dayNumbers[i]);
    const placardY = y - totalFrameHeight / 2 - 0.12; // Below frame with gap
    placard.group.position.set(x, placardY, z);
    placard.group.rotation.y = angle + Math.PI; // Same rotation as frame
    // Move placard slightly forward to avoid z-fighting
    placard.group.position.x += Math.sin(angle + Math.PI) * 0.02;
    placard.group.position.z -= Math.cos(angle + Math.PI) * 0.02;
    group.add(placard.group);
    placards.push(placard);

    // Add spotlight for this exhibit (brighter, no shadows to reduce texture units)
    const spotlight = new THREE.SpotLight(0xffffff, 4, 12, Math.PI / 6, 0.3, 1);
    spotlight.position.set(
      Math.sin(angle) * (wallDist - 2),
      cfg.height - 0.5,
      -Math.cos(angle) * (wallDist - 2)
    );
    spotlight.target.position.set(x, y, z);
    spotlight.castShadow = false; // Disabled to reduce texture unit usage
    group.add(spotlight);
    group.add(spotlight.target);

    group.add(frame.group);
    exhibits.push(frame);
  });

  return { exhibits, placards };
}

// ============================================================================
// Zone Update
// ============================================================================

/**
 * Update the gallery zone each frame
 */
export function updateGalleryZone(zone: GalleryZone, deltaTime: number): void {
  zone.time += deltaTime;

  // Subtle skylight color shift (simulating clouds passing)
  const material = zone.skylightMesh.material as THREE.MeshStandardMaterial;
  const shift = Math.sin(zone.time * 0.1) * 0.05;
  material.emissiveIntensity = 0.3 + shift;
}

// ============================================================================
// Zone Cleanup
// ============================================================================

/**
 * Dispose of gallery zone resources
 */
export function disposeGalleryZone(zone: GalleryZone): void {
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
