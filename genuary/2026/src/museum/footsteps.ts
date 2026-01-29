/**
 * Footstep Sounds
 *
 * Generates subtle footstep sounds when walking through the museum.
 * Uses Web Audio API for procedural audio generation.
 */

// ============================================================================
// Types
// ============================================================================

export interface FootstepSystem {
  audioCtx: AudioContext | null;
  lastStepTime: number;
  stepInterval: number;
  isMoving: boolean;
  volume: number;
  enabled: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const BASE_STEP_INTERVAL = 450; // ms between steps at normal speed
const MIN_STEP_INTERVAL = 300;  // ms at fast speed
const MAX_STEP_INTERVAL = 600;  // ms at slow speed

// ============================================================================
// Footstep System Creation
// ============================================================================

/**
 * Create the footstep system
 */
export function createFootstepSystem(): FootstepSystem {
  const system: FootstepSystem = {
    audioCtx: null,
    lastStepTime: 0,
    stepInterval: BASE_STEP_INTERVAL,
    isMoving: false,
    volume: 0.15,
    enabled: true,
    cleanup: () => {
      if (system.audioCtx) {
        system.audioCtx.close();
        system.audioCtx = null;
      }
    },
  };

  return system;
}

/**
 * Initialize audio context (must be called on user interaction)
 */
export function initFootstepAudio(system: FootstepSystem): void {
  if (system.audioCtx) return;

  try {
    system.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    // Audio not available
  }
}

/**
 * Update movement state and play footsteps
 */
export function updateFootsteps(
  system: FootstepSystem,
  isMoving: boolean,
  speed: number = 1
): void {
  if (!system.enabled || !system.audioCtx) return;

  system.isMoving = isMoving;

  if (!isMoving) return;

  const now = Date.now();

  // Calculate step interval based on speed
  system.stepInterval = Math.max(
    MIN_STEP_INTERVAL,
    Math.min(MAX_STEP_INTERVAL, BASE_STEP_INTERVAL / speed)
  );

  if (now - system.lastStepTime >= system.stepInterval) {
    playFootstep(system);
    system.lastStepTime = now;
  }
}

/**
 * Play a single footstep sound
 */
function playFootstep(system: FootstepSystem): void {
  if (!system.audioCtx) return;

  const ctx = system.audioCtx;
  const now = ctx.currentTime;

  // Create a subtle thump sound
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Configure oscillator for low frequency thump
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(60 + Math.random() * 20, now);
  oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.08);

  // Configure filter for muffled sound
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);
  filter.Q.setValueAtTime(1, now);

  // Configure envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(system.volume, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // Connect nodes
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play
  oscillator.start(now);
  oscillator.stop(now + 0.15);

  // Add a subtle click/tap layer
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();

  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(800 + Math.random() * 200, now);
  clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

  clickGain.gain.setValueAtTime(0, now);
  clickGain.gain.linearRampToValueAtTime(system.volume * 0.3, now + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);

  clickOsc.start(now);
  clickOsc.stop(now + 0.05);
}

/**
 * Toggle footsteps on/off
 */
export function toggleFootsteps(system: FootstepSystem): void {
  system.enabled = !system.enabled;
}

/**
 * Set footstep volume (0-1)
 */
export function setFootstepVolume(system: FootstepSystem, volume: number): void {
  system.volume = Math.max(0, Math.min(1, volume));
}

/**
 * Check if footsteps are enabled
 */
export function areFootstepsEnabled(system: FootstepSystem): boolean {
  return system.enabled;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeFootstepSystem(system: FootstepSystem): void {
  system.cleanup();
}
