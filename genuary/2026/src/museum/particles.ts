/**
 * Museum Ambient Particles
 *
 * Floating dust/light particles for atmospheric effect.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface ParticleSystem {
  scene: THREE.Scene;
  particles: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  velocities: Float32Array;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; minY: number; maxY: number };
  enabled: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const PARTICLE_COUNT = 200;
const PARTICLE_SIZE = 0.02;
const DRIFT_SPEED = 0.01;

// ============================================================================
// Particle System Creation
// ============================================================================

/**
 * Create the ambient particle system
 */
export function createParticleSystem(scene: THREE.Scene): ParticleSystem {
  // Define museum bounds
  const bounds = {
    minX: -25,
    maxX: 25,
    minZ: -60,
    maxZ: 0,
    minY: 0.5,
    maxY: 4.5,
  };

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Random position within bounds
    positions[i3] = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    positions[i3 + 1] = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    positions[i3 + 2] = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

    // Random drift velocity
    velocities[i3] = (Math.random() - 0.5) * DRIFT_SPEED;
    velocities[i3 + 1] = (Math.random() - 0.5) * DRIFT_SPEED * 0.3;
    velocities[i3 + 2] = (Math.random() - 0.5) * DRIFT_SPEED;

    // Random size variation
    sizes[i] = PARTICLE_SIZE * (0.5 + Math.random() * 0.5);

    // Random alpha
    alphas[i] = 0.3 + Math.random() * 0.4;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

  // Create material with custom shader for varying alpha
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: PARTICLE_SIZE,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // Create points object
  const particles = new THREE.Points(geometry, material);
  particles.name = 'ambient-particles';
  scene.add(particles);

  const system: ParticleSystem = {
    scene,
    particles,
    geometry,
    material,
    velocities,
    bounds,
    enabled: true,
    cleanup: () => {
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
    },
  };

  return system;
}

/**
 * Update particle positions
 */
export function updateParticles(system: ParticleSystem, deltaTime: number): void {
  if (!system.enabled) return;

  const positions = system.geometry.getAttribute('position') as THREE.BufferAttribute;
  const posArray = positions.array as Float32Array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Update position
    posArray[i3] += system.velocities[i3] * deltaTime * 60;
    posArray[i3 + 1] += system.velocities[i3 + 1] * deltaTime * 60;
    posArray[i3 + 2] += system.velocities[i3 + 2] * deltaTime * 60;

    // Wrap around bounds
    if (posArray[i3] < system.bounds.minX) posArray[i3] = system.bounds.maxX;
    if (posArray[i3] > system.bounds.maxX) posArray[i3] = system.bounds.minX;
    if (posArray[i3 + 1] < system.bounds.minY) posArray[i3 + 1] = system.bounds.maxY;
    if (posArray[i3 + 1] > system.bounds.maxY) posArray[i3 + 1] = system.bounds.minY;
    if (posArray[i3 + 2] < system.bounds.minZ) posArray[i3 + 2] = system.bounds.maxZ;
    if (posArray[i3 + 2] > system.bounds.maxZ) posArray[i3 + 2] = system.bounds.minZ;

    // Add slight random drift variation
    if (Math.random() < 0.01) {
      system.velocities[i3] += (Math.random() - 0.5) * DRIFT_SPEED * 0.1;
      system.velocities[i3 + 1] += (Math.random() - 0.5) * DRIFT_SPEED * 0.05;
      system.velocities[i3 + 2] += (Math.random() - 0.5) * DRIFT_SPEED * 0.1;

      // Clamp velocities
      const maxVel = DRIFT_SPEED * 2;
      system.velocities[i3] = Math.max(-maxVel, Math.min(maxVel, system.velocities[i3]));
      system.velocities[i3 + 1] = Math.max(-maxVel * 0.5, Math.min(maxVel * 0.5, system.velocities[i3 + 1]));
      system.velocities[i3 + 2] = Math.max(-maxVel, Math.min(maxVel, system.velocities[i3 + 2]));
    }
  }

  positions.needsUpdate = true;
}

/**
 * Set particle visibility
 */
export function setParticlesEnabled(system: ParticleSystem, enabled: boolean): void {
  system.enabled = enabled;
  system.particles.visible = enabled;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose particle system
 */
export function disposeParticleSystem(system: ParticleSystem): void {
  system.cleanup();
}
