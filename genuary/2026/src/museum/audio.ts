/**
 * Museum Audio System
 *
 * Provides ambient audio for the museum experience.
 * Uses Web Audio API for spatial sound effects.
 */

// ============================================================================
// Types
// ============================================================================

export interface AudioSystem {
  context: AudioContext | null;
  masterGain: GainNode | null;
  isPlaying: boolean;
  ambientOscillators: OscillatorNode[];
}

// ============================================================================
// State
// ============================================================================

let audioSystem: AudioSystem | null = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the audio system
 * Must be called after user interaction (browser autoplay policy)
 */
export function initAudio(): AudioSystem {
  if (audioSystem) return audioSystem;

  try {
    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.15; // Low ambient volume
    masterGain.connect(context.destination);

    audioSystem = {
      context,
      masterGain,
      isPlaying: false,
      ambientOscillators: [],
    };

    console.log('Museum audio system initialized');
    return audioSystem;
  } catch (e) {
    console.warn('Could not initialize audio:', e);
    return {
      context: null,
      masterGain: null,
      isPlaying: false,
      ambientOscillators: [],
    };
  }
}

// ============================================================================
// Volume Control
// ============================================================================

let isMuted = false;
const MASTER_VOLUME = 0.15;

/**
 * Set whether audio is muted
 */
export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
  if (audioSystem?.masterGain) {
    audioSystem.masterGain.gain.value = muted ? 0 : MASTER_VOLUME;
  }
}

/**
 * Check if audio is muted
 */
export function isAudioMuted(): boolean {
  return isMuted;
}

// ============================================================================
// Ambient Sound
// ============================================================================

/**
 * Start ambient museum atmosphere
 * Creates a subtle drone/hum like an empty gallery
 */
export function startAmbient(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;
  if (audioSystem.isPlaying) return;

  const ctx = audioSystem.context;

  // Create subtle ambient tones (low frequency hum)
  const frequencies = [55, 82.5, 110]; // A1, E2, A2 - very low ambient tones

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Individual gain for each oscillator
    const gain = ctx.createGain();
    gain.gain.value = 0.03 / (i + 1); // Decreasing volume for higher frequencies

    // Add slight detune for organic feel
    osc.detune.value = Math.random() * 10 - 5;

    osc.connect(gain);
    gain.connect(audioSystem!.masterGain!);
    osc.start();

    audioSystem!.ambientOscillators.push(osc);
  });

  // Add filtered noise for air/room tone
  const noiseBuffer = createNoiseBuffer(ctx, 2);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 200;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.02;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioSystem.masterGain);
  noiseSource.start();

  audioSystem.isPlaying = true;
  console.log('Ambient audio started');
}

/**
 * Stop all ambient sounds
 */
export function stopAmbient(): void {
  if (!audioSystem) return;

  audioSystem.ambientOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Oscillator may already be stopped
    }
  });
  audioSystem.ambientOscillators = [];
  audioSystem.isPlaying = false;
  console.log('Ambient audio stopped');
}

// ============================================================================
// Sound Effects
// ============================================================================

/**
 * Play a subtle footstep sound
 */
export function playFootstep(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;

  // Create a short filtered noise burst for footstep
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 80 + Math.random() * 40;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(audioSystem.masterGain);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * Play a whoosh/teleport sound
 */
export function playTeleport(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;

  // Create a sweeping "whoosh" effect
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  // Add some filtered noise for texture
  const noiseLength = 0.3;
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(audioSystem.masterGain);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioSystem.masterGain);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
  noiseSource.start(ctx.currentTime);
  noiseSource.stop(ctx.currentTime + noiseLength);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create a buffer of white noise
 */
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose of the audio system
 */
export function disposeAudio(): void {
  stopAmbient();

  if (audioSystem?.context) {
    audioSystem.context.close();
  }

  audioSystem = null;
  console.log('Museum audio system disposed');
}
