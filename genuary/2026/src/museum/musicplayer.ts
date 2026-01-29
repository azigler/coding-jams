/**
 * Ambient Music Player
 *
 * Plays curated ambient music tracks to enhance the museum experience.
 * Different tracks for different moods and areas.
 */

// ============================================================================
// Types
// ============================================================================

export interface MusicTrack {
  id: string;
  name: string;
  description: string;
  // Procedural audio parameters
  baseFreq: number;
  chordPattern: number[];
  tempo: number;
  mood: 'calm' | 'inspiring' | 'mysterious' | 'energetic';
}

export interface MusicPlayerSystem {
  container: HTMLElement;
  audioCtx: AudioContext | null;
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  oscillators: OscillatorNode[];
  gains: GainNode[];
  indicator: HTMLElement | null;
  beatInterval: number | null;
  cleanup: () => void;
}

// ============================================================================
// Tracks Library
// ============================================================================

const TRACKS: MusicTrack[] = [
  {
    id: 'contemplation',
    name: 'Contemplation',
    description: 'Soft, peaceful tones for quiet reflection',
    baseFreq: 220,
    chordPattern: [0, 4, 7, 12],
    tempo: 60,
    mood: 'calm',
  },
  {
    id: 'discovery',
    name: 'Discovery',
    description: 'Uplifting harmonies for exploration',
    baseFreq: 261.63,
    chordPattern: [0, 4, 7, 11],
    tempo: 80,
    mood: 'inspiring',
  },
  {
    id: 'dreamscape',
    name: 'Dreamscape',
    description: 'Ethereal soundscape for immersion',
    baseFreq: 196,
    chordPattern: [0, 3, 7, 10],
    tempo: 50,
    mood: 'mysterious',
  },
  {
    id: 'creation',
    name: 'Creation',
    description: 'Dynamic tones celebrating generative art',
    baseFreq: 293.66,
    chordPattern: [0, 5, 7, 12],
    tempo: 100,
    mood: 'energetic',
  },
];

// ============================================================================
// Music Player Creation
// ============================================================================

/**
 * Create the music player system
 */
export function createMusicPlayerSystem(container: HTMLElement): MusicPlayerSystem {
  const system: MusicPlayerSystem = {
    container,
    audioCtx: null,
    currentTrack: null,
    isPlaying: false,
    volume: 0.15,
    oscillators: [],
    gains: [],
    indicator: null,
    beatInterval: null,
    cleanup: () => {
      stopMusic(system);
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      if (system.audioCtx) {
        system.audioCtx.close();
        system.audioCtx = null;
      }
    },
  };

  // Create indicator
  createMusicIndicator(system);

  // Keyboard controls
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleMusicPlayer(system);
    } else if (event.code === 'BracketLeft' && event.shiftKey) {
      // Previous track
      event.preventDefault();
      previousTrack(system);
    } else if (event.code === 'BracketRight' && event.shiftKey) {
      // Next track
      event.preventDefault();
      nextTrack(system);
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return system;
}

/**
 * Create the music indicator
 */
function createMusicIndicator(system: MusicPlayerSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'music-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #a0a0b0;
    z-index: 400;
    display: none;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s;
  `;

  indicator.innerHTML = `
    <span id="music-icon" style="font-size: 14px;">🎵</span>
    <span id="music-track-name">No track</span>
    <div id="music-visualizer" style="
      display: flex;
      gap: 2px;
      align-items: flex-end;
      height: 12px;
    ">
      <div class="viz-bar" style="width: 2px; height: 4px; background: #a855f7; transition: height 0.1s;"></div>
      <div class="viz-bar" style="width: 2px; height: 8px; background: #a855f7; transition: height 0.1s;"></div>
      <div class="viz-bar" style="width: 2px; height: 6px; background: #a855f7; transition: height 0.1s;"></div>
      <div class="viz-bar" style="width: 2px; height: 10px; background: #a855f7; transition: height 0.1s;"></div>
    </div>
  `;

  indicator.onclick = () => toggleMusicPlayer(system);

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update the indicator display
 */
function updateIndicator(system: MusicPlayerSystem): void {
  if (!system.indicator) return;

  const trackName = document.getElementById('music-track-name');
  const icon = document.getElementById('music-icon');

  if (system.isPlaying && system.currentTrack) {
    system.indicator.style.display = 'flex';
    system.indicator.style.borderColor = 'rgba(168, 85, 247, 0.5)';
    if (trackName) trackName.textContent = system.currentTrack.name;
    if (icon) icon.textContent = '🎵';
  } else if (system.currentTrack) {
    system.indicator.style.display = 'flex';
    system.indicator.style.borderColor = 'rgba(168, 85, 247, 0.2)';
    if (trackName) trackName.textContent = `${system.currentTrack.name} (paused)`;
    if (icon) icon.textContent = '⏸';
  } else {
    system.indicator.style.display = 'none';
  }
}

/**
 * Animate the visualizer
 */
function animateVisualizer(system: MusicPlayerSystem): void {
  const bars = system.indicator?.querySelectorAll('.viz-bar');
  if (!bars || !system.isPlaying) return;

  bars.forEach((bar) => {
    const height = 3 + Math.random() * 10;
    (bar as HTMLElement).style.height = `${height}px`;
  });
}

/**
 * Initialize audio context
 */
function initAudio(system: MusicPlayerSystem): boolean {
  if (system.audioCtx) return true;

  try {
    system.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return true;
  } catch {
    return false;
  }
}

/**
 * Toggle music player on/off
 */
export function toggleMusicPlayer(system: MusicPlayerSystem): void {
  if (system.isPlaying) {
    pauseMusic(system);
  } else if (system.currentTrack) {
    playMusic(system);
  } else {
    // Start with first track
    playTrack(system, TRACKS[0]);
  }
}

/**
 * Play a specific track
 */
export function playTrack(system: MusicPlayerSystem, track: MusicTrack): void {
  stopMusic(system);

  if (!initAudio(system) || !system.audioCtx) return;

  system.currentTrack = track;
  system.isPlaying = true;

  const ctx = system.audioCtx;

  // Create chord oscillators
  track.chordPattern.forEach((semitone, index) => {
    const freq = track.baseFreq * Math.pow(2, semitone / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Different wave types for variety
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Low pass filter for softness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    // Set volume (quieter for higher notes)
    const noteVolume = system.volume * (1 - index * 0.15);
    gain.gain.setValueAtTime(noteVolume * 0.3, ctx.currentTime);

    // Connect
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    system.oscillators.push(osc);
    system.gains.push(gain);
  });

  // Create rhythm/beat
  system.beatInterval = window.setInterval(() => {
    if (!system.isPlaying || !system.audioCtx) return;

    // Subtle volume modulation for rhythm
    system.gains.forEach((gain, index) => {
      const baseVolume = system.volume * (1 - index * 0.15) * 0.3;
      const modulation = 0.02 * Math.sin(Date.now() / 1000 * (track.tempo / 60));
      gain.gain.setValueAtTime(baseVolume + modulation, system.audioCtx!.currentTime);
    });

    // Animate visualizer
    animateVisualizer(system);
  }, 100);

  updateIndicator(system);
  showMusicNotification(system, `Now playing: ${track.name}`);
}

/**
 * Pause music
 */
export function pauseMusic(system: MusicPlayerSystem): void {
  system.isPlaying = false;

  // Fade out
  system.gains.forEach(gain => {
    if (system.audioCtx) {
      gain.gain.linearRampToValueAtTime(0, system.audioCtx.currentTime + 0.5);
    }
  });

  // Stop oscillators after fade
  setTimeout(() => {
    system.oscillators.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    system.oscillators = [];
    system.gains = [];
  }, 500);

  if (system.beatInterval) {
    clearInterval(system.beatInterval);
    system.beatInterval = null;
  }

  updateIndicator(system);
}

/**
 * Play current track (resume)
 */
export function playMusic(system: MusicPlayerSystem): void {
  if (system.currentTrack) {
    playTrack(system, system.currentTrack);
  }
}

/**
 * Stop music completely
 */
export function stopMusic(system: MusicPlayerSystem): void {
  system.oscillators.forEach(osc => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  system.oscillators = [];
  system.gains = [];

  if (system.beatInterval) {
    clearInterval(system.beatInterval);
    system.beatInterval = null;
  }

  system.isPlaying = false;
  updateIndicator(system);
}

/**
 * Next track
 */
export function nextTrack(system: MusicPlayerSystem): void {
  if (!system.currentTrack) {
    playTrack(system, TRACKS[0]);
    return;
  }

  const currentIndex = TRACKS.findIndex(t => t.id === system.currentTrack!.id);
  const nextIndex = (currentIndex + 1) % TRACKS.length;
  playTrack(system, TRACKS[nextIndex]);
}

/**
 * Previous track
 */
export function previousTrack(system: MusicPlayerSystem): void {
  if (!system.currentTrack) {
    playTrack(system, TRACKS[TRACKS.length - 1]);
    return;
  }

  const currentIndex = TRACKS.findIndex(t => t.id === system.currentTrack!.id);
  const prevIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
  playTrack(system, TRACKS[prevIndex]);
}

/**
 * Set volume (0-1)
 */
export function setMusicVolume(system: MusicPlayerSystem, volume: number): void {
  system.volume = Math.max(0, Math.min(1, volume));

  // Update current gains
  system.gains.forEach((gain, index) => {
    if (system.audioCtx) {
      const noteVolume = system.volume * (1 - index * 0.15) * 0.3;
      gain.gain.setValueAtTime(noteVolume, system.audioCtx.currentTime);
    }
  });
}

/**
 * Get available tracks
 */
export function getTracks(): MusicTrack[] {
  return [...TRACKS];
}

/**
 * Show music notification
 */
function showMusicNotification(system: MusicPlayerSystem, message: string): void {
  const existing = document.getElementById('music-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'music-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 20px;
    background: rgba(168, 85, 247, 0.9);
    border-radius: 6px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: white;
    z-index: 500;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
  `;
  notification.textContent = message;

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeMusicPlayerSystem(system: MusicPlayerSystem): void {
  system.cleanup();
}
