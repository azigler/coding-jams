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
  wingFilterNode: BiquadFilterNode | null;
  currentWing: string;
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
      wingFilterNode: null,
      currentWing: 'gallery',
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
      wingFilterNode: null,
      currentWing: 'gallery',
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

/**
 * Update ambient sound based on wing location
 * Each wing has a unique audio character
 */
export function updateAmbientForWing(wing: string): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;
  if (audioSystem.currentWing === wing) return;

  audioSystem.currentWing = wing;
  const ctx = audioSystem.context;

  // Create or update wing filter
  if (!audioSystem.wingFilterNode) {
    audioSystem.wingFilterNode = ctx.createBiquadFilter();
    audioSystem.wingFilterNode.type = 'lowpass';
    audioSystem.wingFilterNode.frequency.value = 500;
    audioSystem.wingFilterNode.Q.value = 1;
  }

  const filter = audioSystem.wingFilterNode;
  const now = ctx.currentTime;

  // Smoothly transition filter parameters based on wing
  switch (wing.toLowerCase()) {
    case 'north':
      // North wing: crisp, airy
      filter.frequency.linearRampToValueAtTime(800, now + 0.5);
      filter.Q.linearRampToValueAtTime(0.5, now + 0.5);
      break;
    case 'south':
      // South wing: warm, muffled
      filter.frequency.linearRampToValueAtTime(300, now + 0.5);
      filter.Q.linearRampToValueAtTime(2, now + 0.5);
      break;
    case 'east':
      // East wing: bright, resonant
      filter.frequency.linearRampToValueAtTime(600, now + 0.5);
      filter.Q.linearRampToValueAtTime(1.5, now + 0.5);
      break;
    case 'west':
      // West wing: deep, cavernous
      filter.frequency.linearRampToValueAtTime(400, now + 0.5);
      filter.Q.linearRampToValueAtTime(3, now + 0.5);
      break;
    case 'gallery':
    default:
      // Gallery/center: balanced
      filter.frequency.linearRampToValueAtTime(500, now + 0.5);
      filter.Q.linearRampToValueAtTime(1, now + 0.5);
      break;
  }

  // Update ambient oscillator frequencies slightly per wing
  const wingOffsets: Record<string, number> = {
    north: 0,
    east: 2,
    south: -3,
    west: -1,
    gallery: 0,
  };
  const offset = wingOffsets[wing.toLowerCase()] ?? 0;

  audioSystem.ambientOscillators.forEach((osc, i) => {
    const baseFreq = [55, 82.5, 110][i] ?? 55;
    osc.frequency.linearRampToValueAtTime(baseFreq + offset, now + 0.5);
  });
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
 * Play a discovery chime (when first viewing an exhibit)
 */
export function playDiscoveryChime(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  // Create a pleasant ascending chime
  const notes = [523.25, 659.26, 783.99]; // C5, E5, G5 - major chord

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const startTime = now + i * 0.08;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

    osc.connect(gain);
    gain.connect(audioSystem!.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

/**
 * Play an achievement unlock sound
 */
export function playAchievementUnlock(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  // Triumphant ascending fanfare
  const notes = [
    { freq: 392.00, delay: 0, duration: 0.15 },     // G4
    { freq: 493.88, delay: 0.12, duration: 0.15 },  // B4
    { freq: 587.33, delay: 0.24, duration: 0.15 },  // D5
    { freq: 783.99, delay: 0.36, duration: 0.4 },   // G5 (hold)
  ];

  notes.forEach(({ freq, delay, duration }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const startTime = now + delay;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(audioSystem!.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });

  // Add a subtle shimmer effect
  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(1200, now + 0.4);
  shimmer.frequency.exponentialRampToValueAtTime(2000, now + 0.7);

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(0, now + 0.4);
  shimmerGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(audioSystem.masterGain);

  shimmer.start(now + 0.4);
  shimmer.stop(now + 0.9);
}

/**
 * Play a camera shutter sound (for screenshots)
 */
export function playCameraShutter(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  // Quick click sound
  const clickOsc = ctx.createOscillator();
  clickOsc.type = 'square';
  clickOsc.frequency.value = 1200;

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.08, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  clickOsc.connect(clickGain);
  clickGain.connect(audioSystem.masterGain);

  clickOsc.start(now);
  clickOsc.stop(now + 0.05);

  // Mechanical shutter follow sound
  const mechOsc = ctx.createOscillator();
  mechOsc.type = 'triangle';
  mechOsc.frequency.value = 400;

  const mechGain = ctx.createGain();
  mechGain.gain.setValueAtTime(0, now + 0.03);
  mechGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
  mechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  mechOsc.connect(mechGain);
  mechGain.connect(audioSystem.masterGain);

  mechOsc.start(now + 0.03);
  mechOsc.stop(now + 0.15);
}

/**
 * Play a zoom-in sound (when focusing on exhibit)
 */
export function playZoomIn(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  // Soft ascending tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(audioSystem.masterGain);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Play a zoom-out sound (when unfocusing from exhibit)
 */
export function playZoomOut(): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  // Soft descending tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.03, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(audioSystem.masterGain);

  osc.start(now);
  osc.stop(now + 0.25);
}

/**
 * Play a favorite toggle sound
 */
export function playFavoriteToggle(added: boolean): void {
  if (!audioSystem?.context || !audioSystem.masterGain) return;

  const ctx = audioSystem.context;
  const now = ctx.currentTime;

  if (added) {
    // Happy ascending ding
    const freq1 = 659.26; // E5
    const freq2 = 880;    // A5

    [freq1, freq2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(audioSystem!.masterGain!);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  } else {
    // Soft descending tone for removal
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioSystem.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
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
