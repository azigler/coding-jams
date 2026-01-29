/**
 * Time of Day Lighting
 *
 * Changes the museum's ambient lighting based on the actual time of day.
 * Creates atmosphere and makes the museum feel alive.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface TimeLighting {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  currentPeriod: TimePeriod;
  enabled: boolean;
  cleanup: () => void;
}

export type TimePeriod = 'night' | 'dawn' | 'morning' | 'afternoon' | 'evening' | 'dusk';

interface LightingPreset {
  ambient: { color: number; intensity: number };
  directional: { color: number; intensity: number; position: [number, number, number] };
  fog?: { color: number; density: number };
}

// ============================================================================
// Lighting Presets
// ============================================================================

const LIGHTING_PRESETS: Record<TimePeriod, LightingPreset> = {
  night: {
    ambient: { color: 0x1a1a2e, intensity: 0.3 },
    directional: { color: 0x4a4a8a, intensity: 0.1, position: [0, 10, 0] },
    fog: { color: 0x0a0a15, density: 0.02 },
  },
  dawn: {
    ambient: { color: 0x4a3a5a, intensity: 0.4 },
    directional: { color: 0xff9966, intensity: 0.4, position: [-10, 5, 5] },
    fog: { color: 0x2a2030, density: 0.015 },
  },
  morning: {
    ambient: { color: 0x6a6a7a, intensity: 0.6 },
    directional: { color: 0xffeedd, intensity: 0.7, position: [-8, 12, 8] },
    fog: { color: 0x1a1a22, density: 0.01 },
  },
  afternoon: {
    ambient: { color: 0x8a8a9a, intensity: 0.7 },
    directional: { color: 0xffffee, intensity: 0.8, position: [0, 15, 0] },
    fog: { color: 0x1a1a22, density: 0.008 },
  },
  evening: {
    ambient: { color: 0x7a6a6a, intensity: 0.5 },
    directional: { color: 0xffaa77, intensity: 0.5, position: [10, 8, -5] },
    fog: { color: 0x1a1520, density: 0.012 },
  },
  dusk: {
    ambient: { color: 0x5a4a6a, intensity: 0.4 },
    directional: { color: 0xff7755, intensity: 0.3, position: [12, 3, -8] },
    fog: { color: 0x150a1a, density: 0.018 },
  },
};

// ============================================================================
// Time Period Detection
// ============================================================================

/**
 * Get the current time period based on the hour
 */
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 0 && hour < 5) return 'night';
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'evening';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night';
}

/**
 * Get a human-readable description of the time period
 */
export function getTimePeriodDescription(period: TimePeriod): string {
  switch (period) {
    case 'night': return 'Night hours - the museum is bathed in moonlight';
    case 'dawn': return 'Dawn - first light filters through the skylights';
    case 'morning': return 'Morning - crisp, clear light for viewing art';
    case 'afternoon': return 'Afternoon - warm, full light fills the galleries';
    case 'evening': return 'Evening - golden hour casts long shadows';
    case 'dusk': return 'Dusk - the day fades into twilight';
  }
}

// ============================================================================
// Time Lighting System Creation
// ============================================================================

/**
 * Create the time lighting system
 */
export function createTimeLighting(scene: THREE.Scene): TimeLighting {
  const hour = new Date().getHours();
  const period = getTimePeriod(hour);
  const preset = LIGHTING_PRESETS[period];

  // Create ambient light
  const ambientLight = new THREE.AmbientLight(preset.ambient.color, preset.ambient.intensity);
  ambientLight.name = 'time-ambient-light';
  scene.add(ambientLight);

  // Create directional light (simulates sun/moon)
  const directionalLight = new THREE.DirectionalLight(preset.directional.color, preset.directional.intensity);
  directionalLight.name = 'time-directional-light';
  directionalLight.position.set(...preset.directional.position);
  directionalLight.castShadow = false; // Shadows can be expensive
  scene.add(directionalLight);

  // Set fog if defined
  if (preset.fog) {
    scene.fog = new THREE.FogExp2(preset.fog.color, preset.fog.density);
  }

  const system: TimeLighting = {
    ambientLight,
    directionalLight,
    currentPeriod: period,
    enabled: true,
    cleanup: () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      if (scene.fog) {
        scene.fog = null;
      }
    },
  };

  // Update lighting every minute
  const updateInterval = setInterval(() => {
    if (!system.enabled) return;
    updateTimeLighting(system, scene);
  }, 60000);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    clearInterval(updateInterval);
    originalCleanup();
  };

  return system;
}

/**
 * Update the lighting based on current time
 */
export function updateTimeLighting(system: TimeLighting, scene: THREE.Scene): void {
  if (!system.enabled) return;

  const hour = new Date().getHours();
  const period = getTimePeriod(hour);

  // Only update if period has changed
  if (period === system.currentPeriod) return;

  const preset = LIGHTING_PRESETS[period];
  system.currentPeriod = period;

  // Smoothly transition lights (instant for now, could animate)
  system.ambientLight.color.setHex(preset.ambient.color);
  system.ambientLight.intensity = preset.ambient.intensity;

  system.directionalLight.color.setHex(preset.directional.color);
  system.directionalLight.intensity = preset.directional.intensity;
  system.directionalLight.position.set(...preset.directional.position);

  if (preset.fog) {
    scene.fog = new THREE.FogExp2(preset.fog.color, preset.fog.density);
  }
}

/**
 * Toggle time-based lighting
 */
export function toggleTimeLighting(system: TimeLighting): void {
  system.enabled = !system.enabled;

  if (system.enabled) {
    system.ambientLight.visible = true;
    system.directionalLight.visible = true;
  } else {
    // Reset to default museum lighting
    system.ambientLight.color.setHex(0x404050);
    system.ambientLight.intensity = 0.4;
    system.directionalLight.color.setHex(0xffffff);
    system.directionalLight.intensity = 0.6;
    system.directionalLight.position.set(5, 10, 5);
  }
}

/**
 * Set a specific time period (for testing/preview)
 */
export function setTimePeriod(system: TimeLighting, period: TimePeriod, scene: THREE.Scene): void {
  const preset = LIGHTING_PRESETS[period];
  system.currentPeriod = period;

  system.ambientLight.color.setHex(preset.ambient.color);
  system.ambientLight.intensity = preset.ambient.intensity;

  system.directionalLight.color.setHex(preset.directional.color);
  system.directionalLight.intensity = preset.directional.intensity;
  system.directionalLight.position.set(...preset.directional.position);

  if (preset.fog) {
    scene.fog = new THREE.FogExp2(preset.fog.color, preset.fog.density);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTimeLighting(system: TimeLighting): void {
  system.cleanup();
}
