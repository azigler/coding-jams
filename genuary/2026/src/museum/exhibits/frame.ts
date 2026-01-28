/**
 * Exhibit Frame System
 *
 * Creates framed displays for showcasing Genuary artwork.
 * Frames can display:
 * - Static textures (screenshots)
 * - Animated canvases (rendered to texture)
 * - Placeholder "Coming Soon" content
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface ExhibitFrame {
  group: THREE.Group;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  frameMesh: THREE.Mesh;
  dayNumber: number;
  width: number;
  height: number;
  texture: THREE.Texture | null;
  label: THREE.Mesh | null;
}

export interface FrameConfig {
  width: number;
  height: number;
  frameDepth: number;
  frameWidth: number;
  frameColor: number;
  matteColor: number;
  matteWidth: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const defaultFrameConfig: FrameConfig = {
  width: 1.6,      // ~16:9 aspect ratio for landscape art
  height: 1.0,
  frameDepth: 0.08,
  frameWidth: 0.06,
  frameColor: 0x2a2522, // Dark wood
  matteColor: 0xf5f5f0, // Off-white matte
  matteWidth: 0.03,
};

// ============================================================================
// Frame Creation
// ============================================================================

/**
 * Create an exhibit frame for displaying artwork
 */
export function createExhibitFrame(
  dayNumber: number,
  config: Partial<FrameConfig> = {}
): ExhibitFrame {
  const cfg = { ...defaultFrameConfig, ...config };
  const group = new THREE.Group();

  // Canvas material (the artwork surface)
  const material = new THREE.MeshStandardMaterial({
    color: 0x111111, // Dark placeholder
    roughness: 0.1,
    metalness: 0.0,
    emissive: 0x080808,
    emissiveIntensity: 0.2,
  });

  // Canvas mesh (where the art displays)
  const canvasGeom = new THREE.PlaneGeometry(cfg.width, cfg.height);
  const mesh = new THREE.Mesh(canvasGeom, material);
  mesh.position.z = cfg.frameDepth / 2;
  group.add(mesh);

  // Matte border (off-white inner frame)
  const matteGeom = createMatteGeometry(cfg);
  const matteMaterial = new THREE.MeshStandardMaterial({
    color: cfg.matteColor,
    roughness: 0.9,
    metalness: 0.0,
  });
  const matte = new THREE.Mesh(matteGeom, matteMaterial);
  matte.position.z = cfg.frameDepth / 2 - 0.001;
  group.add(matte);

  // Frame (outer wooden border)
  const frameGeom = createFrameGeometry(cfg);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: cfg.frameColor,
    roughness: 0.7,
    metalness: 0.1,
  });
  const frameMesh = new THREE.Mesh(frameGeom, frameMaterial);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  // Back panel
  const backGeom = new THREE.PlaneGeometry(
    cfg.width + cfg.matteWidth * 2 + cfg.frameWidth * 2,
    cfg.height + cfg.matteWidth * 2 + cfg.frameWidth * 2
  );
  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.0,
  });
  const back = new THREE.Mesh(backGeom, backMaterial);
  back.rotation.y = Math.PI;
  back.position.z = -cfg.frameDepth / 2;
  group.add(back);

  // Day number label
  const label = createLabel(dayNumber, cfg);
  if (label) {
    group.add(label);
  }

  return {
    group,
    mesh,
    material,
    frameMesh,
    dayNumber,
    width: cfg.width,
    height: cfg.height,
    texture: null,
    label,
  };
}

// ============================================================================
// Geometry Helpers
// ============================================================================

/**
 * Create the matte border geometry (white inner frame)
 */
function createMatteGeometry(cfg: FrameConfig): THREE.BufferGeometry {
  const innerW = cfg.width;
  const innerH = cfg.height;
  const outerW = cfg.width + cfg.matteWidth * 2;
  const outerH = cfg.height + cfg.matteWidth * 2;

  const shape = new THREE.Shape();
  shape.moveTo(-outerW / 2, -outerH / 2);
  shape.lineTo(outerW / 2, -outerH / 2);
  shape.lineTo(outerW / 2, outerH / 2);
  shape.lineTo(-outerW / 2, outerH / 2);
  shape.closePath();

  // Hole for the canvas
  const hole = new THREE.Path();
  hole.moveTo(-innerW / 2, -innerH / 2);
  hole.lineTo(innerW / 2, -innerH / 2);
  hole.lineTo(innerW / 2, innerH / 2);
  hole.lineTo(-innerW / 2, innerH / 2);
  hole.closePath();
  shape.holes.push(hole);

  return new THREE.ShapeGeometry(shape);
}

/**
 * Create the frame geometry (wooden outer border)
 */
function createFrameGeometry(cfg: FrameConfig): THREE.BufferGeometry {
  const innerW = cfg.width + cfg.matteWidth * 2;
  const innerH = cfg.height + cfg.matteWidth * 2;
  const outerW = innerW + cfg.frameWidth * 2;
  const outerH = innerH + cfg.frameWidth * 2;

  const shape = new THREE.Shape();
  shape.moveTo(-outerW / 2, -outerH / 2);
  shape.lineTo(outerW / 2, -outerH / 2);
  shape.lineTo(outerW / 2, outerH / 2);
  shape.lineTo(-outerW / 2, outerH / 2);
  shape.closePath();

  // Hole for the matte
  const hole = new THREE.Path();
  hole.moveTo(-innerW / 2, -innerH / 2);
  hole.lineTo(innerW / 2, -innerH / 2);
  hole.lineTo(innerW / 2, innerH / 2);
  hole.lineTo(-innerW / 2, innerH / 2);
  hole.closePath();
  shape.holes.push(hole);

  const extrudeSettings = {
    depth: cfg.frameDepth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.translate(0, 0, -cfg.frameDepth / 2);

  return geom;
}

/**
 * Create a day number label (simple plane for now)
 */
function createLabel(dayNumber: number, cfg: FrameConfig): THREE.Mesh | null {
  // Create a canvas with the day number
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  ctx.fillStyle = '#c0c0c0';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Day ${dayNumber}`, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const labelGeom = new THREE.PlaneGeometry(0.3, 0.08);
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const label = new THREE.Mesh(labelGeom, labelMaterial);
  label.position.y = -(cfg.height / 2 + cfg.matteWidth + cfg.frameWidth + 0.06);
  label.position.z = 0.01;

  return label;
}

// ============================================================================
// Texture Management
// ============================================================================

/**
 * Set a texture on an exhibit frame
 */
export function setFrameTexture(frame: ExhibitFrame, texture: THREE.Texture): void {
  frame.texture = texture;
  frame.material.map = texture;
  frame.material.color.setHex(0xffffff);
  frame.material.emissive.setHex(0x000000);
  frame.material.emissiveIntensity = 0;
  frame.material.needsUpdate = true;
}

/**
 * Set a placeholder "Coming Soon" texture
 */
export function setPlaceholderTexture(frame: ExhibitFrame): void {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Day number
  ctx.fillStyle = '#eee';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Day ${frame.dayNumber}`, canvas.width / 2, canvas.height / 2 - 20);

  // Subtitle
  ctx.fillStyle = '#888';
  ctx.font = '20px monospace';
  ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2 + 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  setFrameTexture(frame, texture);
}

/**
 * Create a texture from an existing canvas element
 */
export function createTextureFromCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose of exhibit frame resources
 */
export function disposeExhibitFrame(frame: ExhibitFrame): void {
  // Dispose textures
  if (frame.texture) {
    frame.texture.dispose();
  }

  // Dispose geometries and materials
  frame.group.traverse((object) => {
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
