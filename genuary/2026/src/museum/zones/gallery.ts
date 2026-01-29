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
  setFrameTexture,
  disposeExhibitFrame,
  createPlacard,
  disposePlacard,
  getDayTexture,
  disposeAllArtwork,
  type ExhibitFrame,
  type Placard,
} from '../exhibits';

// ============================================================================
// Types
// ============================================================================

export interface GalleryZone {
  group: THREE.Group;
  skylightMesh: THREE.Mesh;
  dustParticles: THREE.Points | null;
  orbMesh: THREE.Mesh | null;
  orbBaseY: number;
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

  // Floor - octagonal with polished reflective look
  const floorGeom = createOctagonGeometry(cfg.radius, cfg.numSides);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a45,
    roughness: 0.1,
    metalness: 0.6,
    emissive: 0x252535,
    emissiveIntensity: 0.5,
  });
  const floor = new THREE.Mesh(floorGeom, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling with skylight hole - slightly visible
  const ceilingGeom = createOctagonWithHoleGeometry(cfg.radius, cfg.skylightRadius, cfg.numSides);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a35,
    roughness: 0.8,
    metalness: 0.1,
    emissive: 0x151520,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeom, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = cfg.height;
  group.add(ceiling);

  // Skylight (glass dome effect) - bright glowing portal
  const skylightGeom = new THREE.CircleGeometry(cfg.skylightRadius, 32);
  const skylightMaterial = new THREE.MeshStandardMaterial({
    color: 0x7090c0,
    roughness: 0.05,
    metalness: 0.1,
    emissive: 0x5080c0,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const skylightMesh = new THREE.Mesh(skylightGeom, skylightMaterial);
  skylightMesh.rotation.x = Math.PI / 2;
  skylightMesh.position.y = cfg.height + 0.1;
  group.add(skylightMesh);

  // Skylight light source - MUCH brighter main illumination
  const skylightLight = new THREE.PointLight(0xb0c0e0, 15, 60, 1);
  skylightLight.position.set(0, cfg.height - 0.5, 0);
  skylightLight.castShadow = true;
  skylightLight.shadow.mapSize.width = 1024;
  skylightLight.shadow.mapSize.height = 1024;
  group.add(skylightLight);

  // Strong ambient fill light - fills the whole room
  const ambientFill = new THREE.PointLight(0xa0b0c0, 6, 50, 1);
  ambientFill.position.set(0, cfg.height / 2, 0);
  group.add(ambientFill);

  // Floor level ambient - makes floor visible
  const floorFill = new THREE.PointLight(0x7080a0, 4, 40, 1);
  floorFill.position.set(0, 1.5, 0);
  group.add(floorFill);

  // Wall wash lights - reduced to 4 for performance (exhibit walls only)
  const wallWashRadius = cfg.radius * 0.85;
  const exhibitWallIndices = [1, 3, 5, 7]; // Only exhibit walls
  for (const i of exhibitWallIndices) {
    const angle = (i * Math.PI * 2) / 8;
    const wallLight = new THREE.PointLight(0xffeedd, 6, 15, 1.5);
    wallLight.position.set(
      Math.cos(angle) * wallWashRadius,
      cfg.height - 1.5,
      Math.sin(angle) * wallWashRadius
    );
    group.add(wallLight);
  }

  // Walls
  createWalls(group, cfg);

  // Central pedestal with glowing orb
  const { orb: orbMesh, baseY: orbBaseY } = createPedestal(group, cfg);

  // Doorways to exhibit wings (4 cardinal directions)
  createDoorways(group, cfg);

  // Exhibit frames on non-doorway walls (walls 1, 3, 5, 7)
  const { exhibits, placards } = createExhibits(group, cfg);

  // Dust motes floating in the skylight beam
  const dustParticles = createDustParticles(cfg);
  group.add(dustParticles);

  return {
    group,
    skylightMesh,
    dustParticles,
    orbMesh,
    orbBaseY,
    exhibits,
    placards,
    time: 0,
  };
}

// ============================================================================
// Atmosphere Effects
// ============================================================================

/**
 * Create dust motes floating in the skylight beam
 */
function createDustParticles(cfg: GalleryConfig): THREE.Points {
  const particleCount = 80; // Reduced from 200 for performance
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  // Initialize particles in a cylinder under the skylight
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Random position in a cylinder
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * cfg.skylightRadius * 0.9;
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.random() * cfg.height; // Full height
    positions[i3 + 2] = Math.sin(angle) * radius;

    // Slow random velocities
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Store velocities as custom attribute for animation
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
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

  // Walls with subtle teal tint - liminal space aesthetic
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a4550,
    roughness: 0.7,
    metalness: 0.15,
    emissive: 0x253540,
    emissiveIntensity: 0.6,
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

  // Doorway frames with visible metallic finish
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x505560,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x252530,
    emissiveIntensity: 0.3,
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

    // Single warm light above doorway - simplified for performance
    const doorLight = new THREE.PointLight(0xffddaa, 5, 15, 1.5);
    doorLight.position.set(frameX, doorHeight - 0.3, frameZ);
    group.add(doorLight);

    // Add signage above doorway
    if (i > 0) { // Skip entrance (i=0)
      const sign = createDoorwaySign(doorNames[i]);
      sign.position.set(frameX, doorHeight + 0.4, frameZ);
      sign.rotation.y = angle;
      group.add(sign);
    }
  });
}

/**
 * Create a text sign for a doorway
 */
function createDoorwaySign(text: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#404050';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Text
    ctx.fillStyle = '#b0b0c0';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(0.8, 0.2);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  return new THREE.Mesh(geometry, material);
}

/**
 * Create central pedestal for featured artwork
 * Returns the orb mesh for animation
 */
function createPedestal(group: THREE.Group, cfg: GalleryConfig): { orb: THREE.Mesh; baseY: number } {
  const pedestalRadius = 1;
  const pedestalHeight = 1.2;

  // Base - polished stone look with subtle glow
  const baseGeom = new THREE.CylinderGeometry(pedestalRadius * 1.2, pedestalRadius * 1.3, 0.15, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x404550,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0x202530,
    emissiveIntensity: 0.4,
  });
  const base = new THREE.Mesh(baseGeom, baseMaterial);
  base.position.y = 0.075;
  base.receiveShadow = true;
  base.castShadow = true;
  group.add(base);

  // Column - slightly glowing pillar
  const columnGeom = new THREE.CylinderGeometry(pedestalRadius, pedestalRadius, pedestalHeight, 32);
  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a55,
    roughness: 0.4,
    metalness: 0.3,
    emissive: 0x252535,
    emissiveIntensity: 0.5,
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

  // Bright spotlight on pedestal
  const spotlight = new THREE.SpotLight(0xffffff, 10, 15, Math.PI / 4, 0.3, 1);
  spotlight.position.set(0, cfg.height - 0.5, 0);
  spotlight.target.position.set(0, pedestalHeight + 0.15, 0);
  spotlight.castShadow = false;
  group.add(spotlight);
  group.add(spotlight.target);

  // Single accent light at pedestal base (reduced from 4 for performance)
  const baseLight = new THREE.PointLight(0x8090a0, 4, 8, 2);
  baseLight.position.set(0, 0.5, 0);
  group.add(baseLight);

  // Glowing orb on top - focal point of the gallery
  const orbRadius = 0.3;
  const orbBaseY = 0.15 + pedestalHeight + 0.1 + orbRadius;
  const orbGeom = new THREE.SphereGeometry(orbRadius, 32, 32);
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0x6080c0,
    roughness: 0.1,
    metalness: 0.2,
    emissive: 0x4060a0,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9,
  });
  const orb = new THREE.Mesh(orbGeom, orbMaterial);
  orb.position.y = orbBaseY;
  group.add(orb);

  // Inner glow light from the orb
  const orbLight = new THREE.PointLight(0x6090c0, 3, 8, 1.5);
  orbLight.position.copy(orb.position);
  group.add(orbLight);

  return { orb, baseY: orbBaseY };
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
      console.log(`Loaded live artwork for Day ${dayNumber}`);
    } else {
      console.warn(`Could not load artwork for Day ${dayNumber}, keeping placeholder`);
    }
  } catch (error) {
    console.error(`Error loading artwork for Day ${dayNumber}:`, error);
  }
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

    // Try loading live p5 artwork - fall back to placeholder if it fails
    loadLiveArtwork(frame, dayNumbers[i]).catch(() => {
      console.log(`Day ${dayNumbers[i]} artwork failed to load, using placeholder`);
    });
    // Also set placeholder immediately as fallback while artwork loads
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

    // Single point light per exhibit (combined spotlight + fill for performance)
    const exhibitLight = new THREE.PointLight(0xfff8f0, 6, 10, 1.5);
    exhibitLight.position.set(
      Math.sin(angle) * (wallDist - 2),
      cfg.height - 1,
      -Math.cos(angle) * (wallDist - 2)
    );
    group.add(exhibitLight);

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
 * @param cameraPos Optional camera position for proximity effects
 */
export function updateGalleryZone(zone: GalleryZone, deltaTime: number, cameraPos?: THREE.Vector3): void {
  zone.time += deltaTime;

  // Subtle skylight color shift (simulating clouds passing)
  const skylightMat = zone.skylightMesh.material as THREE.MeshStandardMaterial;
  const shift = Math.sin(zone.time * 0.1) * 0.05;
  skylightMat.emissiveIntensity = 0.3 + shift;

  // Animate dust particles - only update every 3rd frame for performance
  if (zone.dustParticles && Math.floor(zone.time * 20) % 3 === 0) {
    const positions = zone.dustParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const velocities = zone.dustParticles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
    const height = 6; // Gallery height
    const skyRadius = 4; // Skylight radius
    const dt = deltaTime * 3; // Compensate for skipped frames

    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;

      // Update position
      positions.array[i3] += velocities.array[i3] * dt * 60;
      positions.array[i3 + 1] += velocities.array[i3 + 1] * dt * 60;
      positions.array[i3 + 2] += velocities.array[i3 + 2] * dt * 60;

      // Gentle upward drift in the light beam
      positions.array[i3 + 1] += 0.005 * dt * 60;

      // Wrap around at boundaries
      if (positions.array[i3 + 1] > height) {
        positions.array[i3 + 1] = 0;
      }

      // Keep within skylight cylinder
      const dist = Math.sqrt(positions.array[i3] ** 2 + positions.array[i3 + 2] ** 2);
      if (dist > skyRadius) {
        const scale = skyRadius / dist * 0.9;
        positions.array[i3] *= scale;
        positions.array[i3 + 2] *= scale;
      }
    }

    positions.needsUpdate = true;
  }

  // Animate the glowing orb - gentle bobbing motion
  if (zone.orbMesh) {
    const bobAmount = Math.sin(zone.time * 1.5) * 0.05;
    zone.orbMesh.position.y = zone.orbBaseY + bobAmount;

    // Base pulsing glow
    let baseGlow = 1.3 + Math.sin(zone.time * 2) * 0.3;

    // Proximity boost - orb glows brighter when player is near
    if (cameraPos) {
      const orbPos = zone.orbMesh.position;
      const dx = cameraPos.x - orbPos.x;
      const dz = cameraPos.z - orbPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Start boosting at 6m, max boost at 2m
      const proximityBoost = Math.max(0, Math.min(1, (6 - dist) / 4));
      baseGlow += proximityBoost * 0.8; // Up to 0.8 extra intensity
    }

    const orbMat = zone.orbMesh.material as THREE.MeshStandardMaterial;
    orbMat.emissiveIntensity = baseGlow;
  }
}

// ============================================================================
// Zone Cleanup
// ============================================================================

/**
 * Dispose of gallery zone resources
 */
export function disposeGalleryZone(zone: GalleryZone): void {
  // Dispose all live artwork first
  disposeAllArtwork();

  // Dispose dust particles
  if (zone.dustParticles) {
    zone.dustParticles.geometry.dispose();
    (zone.dustParticles.material as THREE.PointsMaterial).dispose();
  }

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
