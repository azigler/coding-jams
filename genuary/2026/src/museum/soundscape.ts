/**
 * Soundscape
 *
 * Dynamic ambient soundscapes that change
 * based on location and exhibit type.
 */

// ============================================================================
// Types
// ============================================================================

export interface SoundscapePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  layers: SoundLayer[];
}

export interface SoundLayer {
  type: 'ambient' | 'accent' | 'nature' | 'music';
  volume: number;
  frequency?: number; // Hz for generated tones
  variation?: number;
}

export interface SoundscapeSystem {
  container: HTMLElement;
  currentPreset: string;
  volume: number;
  isMuted: boolean;
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  oscillators: OscillatorNode[];
  indicator: HTMLElement | null;
  panel: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Presets
// ============================================================================

const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'silent',
    name: 'Silent',
    icon: '🔇',
    description: 'Complete silence',
    layers: [],
  },
  {
    id: 'museum',
    name: 'Museum',
    icon: '🏛️',
    description: 'Gentle echoing ambience',
    layers: [
      { type: 'ambient', volume: 0.15, frequency: 100, variation: 5 },
      { type: 'accent', volume: 0.05, frequency: 200, variation: 20 },
    ],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: '🧘',
    description: 'Calming binaural tones',
    layers: [
      { type: 'ambient', volume: 0.2, frequency: 136, variation: 2 },
      { type: 'accent', volume: 0.15, frequency: 140, variation: 2 },
    ],
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: '🎯',
    description: 'Brown noise for concentration',
    layers: [
      { type: 'ambient', volume: 0.25, frequency: 80, variation: 40 },
    ],
  },
  {
    id: 'space',
    name: 'Space',
    icon: '🌌',
    description: 'Cosmic drones',
    layers: [
      { type: 'ambient', volume: 0.15, frequency: 60, variation: 10 },
      { type: 'accent', volume: 0.1, frequency: 120, variation: 30 },
      { type: 'accent', volume: 0.08, frequency: 180, variation: 50 },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    description: 'Gentle forest ambience',
    layers: [
      { type: 'nature', volume: 0.2, frequency: 400, variation: 200 },
      { type: 'ambient', volume: 0.1, frequency: 150, variation: 30 },
    ],
  },
];

// ============================================================================
// Soundscape System Creation
// ============================================================================

/**
 * Create the soundscape system
 */
export function createSoundscapeSystem(container: HTMLElement): SoundscapeSystem {
  const system: SoundscapeSystem = {
    container,
    currentPreset: 'silent',
    volume: 0.5,
    isMuted: true,
    audioContext: null,
    gainNode: null,
    oscillators: [],
    indicator: null,
    panel: null,
    isOpen: false,
    cleanup: () => {
      stopSoundscape(system);
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      closeSoundscapePanel(system);
    },
  };

  return system;
}

/**
 * Initialize audio context (must be called after user interaction)
 */
export function initSoundscapeAudio(system: SoundscapeSystem): void {
  if (system.audioContext) return;

  try {
    system.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    system.gainNode = system.audioContext.createGain();
    system.gainNode.connect(system.audioContext.destination);
    system.gainNode.gain.value = system.isMuted ? 0 : system.volume;
  } catch (e) {
    console.warn('Failed to create audio context:', e);
  }
}

/**
 * Start a soundscape preset
 */
export function startSoundscape(system: SoundscapeSystem, presetId: string): void {
  const preset = SOUNDSCAPE_PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  // Stop current soundscape
  stopSoundscape(system);

  system.currentPreset = presetId;

  if (preset.layers.length === 0) {
    updateIndicator(system);
    return;
  }

  if (!system.audioContext || !system.gainNode) {
    initSoundscapeAudio(system);
    if (!system.audioContext || !system.gainNode) return;
  }

  // Resume audio context if suspended
  if (system.audioContext.state === 'suspended') {
    system.audioContext.resume();
  }

  // Create oscillators for each layer
  for (const layer of preset.layers) {
    createLayerOscillator(system, layer);
  }

  updateIndicator(system);
}

/**
 * Create oscillator for a sound layer
 */
function createLayerOscillator(system: SoundscapeSystem, layer: SoundLayer): void {
  if (!system.audioContext || !system.gainNode) return;

  const osc = system.audioContext.createOscillator();
  const layerGain = system.audioContext.createGain();

  // Set waveform based on layer type
  switch (layer.type) {
    case 'ambient':
      osc.type = 'sine';
      break;
    case 'accent':
      osc.type = 'triangle';
      break;
    case 'nature':
      osc.type = 'sawtooth';
      break;
    default:
      osc.type = 'sine';
  }

  osc.frequency.value = layer.frequency || 100;
  layerGain.gain.value = layer.volume;

  osc.connect(layerGain);
  layerGain.connect(system.gainNode);

  osc.start();
  system.oscillators.push(osc);

  // Add subtle frequency variation
  if (layer.variation && layer.variation > 0) {
    const baseFreq = layer.frequency || 100;
    const variation = layer.variation;

    const modulate = () => {
      if (!system.audioContext) return;

      const time = system.audioContext.currentTime;
      const newFreq = baseFreq + Math.sin(time * 0.5) * variation;
      osc.frequency.setTargetAtTime(newFreq, time, 0.5);

      if (system.oscillators.includes(osc)) {
        requestAnimationFrame(modulate);
      }
    };
    modulate();
  }
}

/**
 * Stop current soundscape
 */
export function stopSoundscape(system: SoundscapeSystem): void {
  for (const osc of system.oscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignore errors from already stopped oscillators
    }
  }
  system.oscillators = [];
}

/**
 * Set master volume
 */
export function setSoundscapeVolume(system: SoundscapeSystem, volume: number): void {
  system.volume = Math.max(0, Math.min(1, volume));

  if (system.gainNode) {
    system.gainNode.gain.setTargetAtTime(
      system.isMuted ? 0 : system.volume,
      system.audioContext?.currentTime || 0,
      0.1
    );
  }

  updateIndicator(system);
}

/**
 * Toggle mute
 */
export function toggleSoundscapeMute(system: SoundscapeSystem): boolean {
  system.isMuted = !system.isMuted;

  if (system.gainNode) {
    system.gainNode.gain.setTargetAtTime(
      system.isMuted ? 0 : system.volume,
      system.audioContext?.currentTime || 0,
      0.1
    );
  }

  updateIndicator(system);
  return system.isMuted;
}

/**
 * Cycle to next preset
 */
export function cycleSoundscape(system: SoundscapeSystem): string {
  const currentIndex = SOUNDSCAPE_PRESETS.findIndex(p => p.id === system.currentPreset);
  const nextIndex = (currentIndex + 1) % SOUNDSCAPE_PRESETS.length;
  const nextPreset = SOUNDSCAPE_PRESETS[nextIndex];

  startSoundscape(system, nextPreset.id);
  return nextPreset.name;
}

/**
 * Show or update indicator
 */
function updateIndicator(system: SoundscapeSystem): void {
  if (!system.indicator) {
    createIndicator(system);
  }

  const preset = SOUNDSCAPE_PRESETS.find(p => p.id === system.currentPreset);
  if (!preset || !system.indicator) return;

  const icon = system.isMuted ? '🔇' : preset.icon;
  system.indicator.innerHTML = `
    <span style="font-size: 14px;">${icon}</span>
    <span>${system.isMuted ? 'Muted' : preset.name}</span>
  `;
}

/**
 * Create indicator
 */
function createIndicator(system: SoundscapeSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'soundscape-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(150, 100, 200, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #c8a0ff;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  indicator.onclick = () => openSoundscapePanel(system);

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(150, 100, 200, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(150, 100, 200, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Open soundscape panel
 */
export function openSoundscapePanel(system: SoundscapeSystem): void {
  closeSoundscapePanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'soundscape-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 20px;
    width: 240px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(150, 100, 200, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 12px 15px;
      border-bottom: 1px solid rgba(150, 100, 200, 0.2);
      font-size: 12px;
      font-weight: bold;
      color: white;
    ">
      🎧 Soundscape
    </div>

    <!-- Volume slider -->
    <div style="padding: 12px 15px; border-bottom: 1px solid rgba(150, 100, 200, 0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; color: #888;">Volume</span>
        <span style="font-size: 11px; color: #888;">${Math.round(system.volume * 100)}%</span>
      </div>
      <input type="range" id="soundscape-volume" min="0" max="100" value="${system.volume * 100}" style="
        width: 100%;
        accent-color: #c8a0ff;
      ">
    </div>

    <!-- Presets -->
    <div style="padding: 10px;">
      ${SOUNDSCAPE_PRESETS.map(preset => `
        <button class="soundscape-preset" data-preset="${preset.id}" style="
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: ${preset.id === system.currentPreset ? 'rgba(150, 100, 200, 0.3)' : 'rgba(40, 40, 60, 0.3)'};
          border: 1px solid ${preset.id === system.currentPreset ? 'rgba(150, 100, 200, 0.5)' : 'transparent'};
          border-radius: 8px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          margin-bottom: 5px;
          transition: all 0.2s;
          text-align: left;
        ">
          <span style="font-size: 16px;">${preset.icon}</span>
          <div>
            <div style="font-weight: bold;">${preset.name}</div>
            <div style="font-size: 10px; color: #888;">${preset.description}</div>
          </div>
        </button>
      `).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up volume slider
  const volumeSlider = panel.querySelector('#soundscape-volume') as HTMLInputElement;
  volumeSlider.oninput = () => {
    setSoundscapeVolume(system, parseInt(volumeSlider.value) / 100);
  };

  // Wire up preset buttons
  const presetBtns = panel.querySelectorAll('.soundscape-preset');
  presetBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const presetId = (btn as HTMLElement).dataset.preset || 'silent';
      startSoundscape(system, presetId);
      closeSoundscapePanel(system);
    };

    (btn as HTMLElement).onmouseover = () => {
      if ((btn as HTMLElement).dataset.preset !== system.currentPreset) {
        (btn as HTMLElement).style.background = 'rgba(150, 100, 200, 0.15)';
      }
    };
    (btn as HTMLElement).onmouseout = () => {
      if ((btn as HTMLElement).dataset.preset !== system.currentPreset) {
        (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.3)';
      }
    };
  });

  // Close on click outside
  const clickHandler = (e: MouseEvent) => {
    if (!panel.contains(e.target as Node) && e.target !== system.indicator) {
      closeSoundscapePanel(system);
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Close soundscape panel
 */
function closeSoundscapePanel(system: SoundscapeSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Get current preset
 */
export function getCurrentSoundscape(system: SoundscapeSystem): SoundscapePreset | undefined {
  return SOUNDSCAPE_PRESETS.find(p => p.id === system.currentPreset);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSoundscapeSystem(system: SoundscapeSystem): void {
  system.cleanup();
  if (system.audioContext) {
    system.audioContext.close();
    system.audioContext = null;
  }
}
