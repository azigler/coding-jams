/**
 * Ambient Sound Mixer
 *
 * Lets visitors customize the audio atmosphere with different
 * ambient sounds and volume levels.
 */

// ============================================================================
// Types
// ============================================================================

export interface SoundLayer {
  id: string;
  name: string;
  icon: string;
  volume: number;
  enabled: boolean;
  oscillator?: OscillatorNode;
  gain?: GainNode;
  filter?: BiquadFilterNode;
}

export interface SoundMixerSystem {
  container: HTMLElement;
  audioCtx: AudioContext | null;
  layers: SoundLayer[];
  masterVolume: number;
  popup: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-soundmixer';

// ============================================================================
// Default Layers
// ============================================================================

const DEFAULT_LAYERS: Omit<SoundLayer, 'oscillator' | 'gain' | 'filter'>[] = [
  { id: 'ambience', name: 'Museum Ambience', icon: '🏛️', volume: 0.3, enabled: true },
  { id: 'rain', name: 'Gentle Rain', icon: '🌧️', volume: 0, enabled: false },
  { id: 'wind', name: 'Soft Wind', icon: '💨', volume: 0, enabled: false },
  { id: 'cafe', name: 'Distant Chatter', icon: '☕', volume: 0, enabled: false },
  { id: 'nature', name: 'Nature Sounds', icon: '🌿', volume: 0, enabled: false },
];

// ============================================================================
// Sound Mixer System Creation
// ============================================================================

/**
 * Create the sound mixer system
 */
export function createSoundMixerSystem(container: HTMLElement): SoundMixerSystem {
  const saved = loadMixerState();

  const system: SoundMixerSystem = {
    container,
    audioCtx: null,
    layers: saved?.layers || DEFAULT_LAYERS.map(l => ({ ...l })),
    masterVolume: saved?.masterVolume ?? 0.5,
    popup: null,
    isOpen: false,
    cleanup: () => {
      stopAllSounds(system);
      if (system.audioCtx) {
        system.audioCtx.close();
        system.audioCtx = null;
      }
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Open with Shift+A (Audio)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyA' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeMixer(system);
      } else {
        openMixer(system);
      }
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
 * Initialize audio context (call on user interaction)
 */
export function initMixerAudio(system: SoundMixerSystem): void {
  if (system.audioCtx) return;

  try {
    system.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Start enabled layers
    system.layers.forEach(layer => {
      if (layer.enabled && layer.volume > 0) {
        startLayerSound(system, layer);
      }
    });
  } catch {
    // Audio not available
  }
}

/**
 * Open the mixer popup
 */
export function openMixer(system: SoundMixerSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'soundmixer-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 280px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        🎧 Sound Mixer
      </div>
      <button id="mixer-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px;">
      <!-- Master Volume -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #888;">Master Volume</span>
          <span id="master-value" style="font-size: 12px; color: #4a9eff;">${Math.round(system.masterVolume * 100)}%</span>
        </div>
        <input type="range" id="master-volume" min="0" max="100" value="${Math.round(system.masterVolume * 100)}" style="
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: rgba(100, 150, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
        ">
      </div>

      <!-- Sound Layers -->
      <div id="mixer-layers">
        ${system.layers.map(layer => `
          <div class="mixer-layer" data-layer="${layer.id}" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            margin-bottom: 8px;
            background: rgba(40, 40, 60, 0.5);
            border-radius: 8px;
          ">
            <button class="layer-toggle" data-layer="${layer.id}" style="
              width: 32px;
              height: 32px;
              background: ${layer.enabled ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)'};
              border: 1px solid ${layer.enabled ? 'rgba(74, 158, 255, 0.5)' : 'rgba(80, 80, 100, 0.5)'};
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
            ">${layer.icon}</button>
            <div style="flex: 1;">
              <div style="font-size: 12px; color: white; margin-bottom: 4px;">${layer.name}</div>
              <input type="range" class="layer-volume" data-layer="${layer.id}"
                min="0" max="100" value="${Math.round(layer.volume * 100)}"
                style="
                  width: 100%;
                  height: 3px;
                  -webkit-appearance: none;
                  background: rgba(100, 150, 255, 0.2);
                  border-radius: 2px;
                  cursor: pointer;
                  opacity: ${layer.enabled ? '1' : '0.5'};
                ">
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <style>
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: #4a9eff;
        border-radius: 50%;
        cursor: pointer;
      }
    </style>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';
  });

  // Wire up interactions
  wireUpMixer(system);
}

/**
 * Wire up mixer interactions
 */
function wireUpMixer(system: SoundMixerSystem): void {
  if (!system.popup) return;

  setTimeout(() => {
    const closeBtn = document.getElementById('mixer-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeMixer(system);
    }

    // Master volume
    const masterSlider = document.getElementById('master-volume') as HTMLInputElement;
    const masterValue = document.getElementById('master-value');
    if (masterSlider) {
      masterSlider.oninput = () => {
        system.masterVolume = parseInt(masterSlider.value, 10) / 100;
        if (masterValue) {
          masterValue.textContent = `${masterSlider.value}%`;
        }
        updateAllVolumes(system);
        saveMixerState(system);
      };
    }

    // Layer toggles
    const toggleBtns = system.popup?.querySelectorAll('.layer-toggle');
    toggleBtns?.forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        const layerId = (btn as HTMLElement).dataset.layer;
        const layer = system.layers.find(l => l.id === layerId);
        if (layer) {
          layer.enabled = !layer.enabled;
          (btn as HTMLElement).style.background = layer.enabled ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)';
          (btn as HTMLElement).style.borderColor = layer.enabled ? 'rgba(74, 158, 255, 0.5)' : 'rgba(80, 80, 100, 0.5)';

          const slider = system.popup?.querySelector(`.layer-volume[data-layer="${layerId}"]`) as HTMLInputElement;
          if (slider) {
            slider.style.opacity = layer.enabled ? '1' : '0.5';
          }

          if (layer.enabled && layer.volume > 0) {
            startLayerSound(system, layer);
          } else {
            stopLayerSound(layer);
          }
          saveMixerState(system);
        }
      };
    });

    // Layer volume sliders
    const volumeSliders = system.popup?.querySelectorAll('.layer-volume');
    volumeSliders?.forEach(slider => {
      (slider as HTMLInputElement).oninput = () => {
        const layerId = (slider as HTMLInputElement).dataset.layer;
        const layer = system.layers.find(l => l.id === layerId);
        if (layer) {
          layer.volume = parseInt((slider as HTMLInputElement).value, 10) / 100;
          updateLayerVolume(system, layer);
          saveMixerState(system);
        }
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMixer(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the mixer
 */
export function closeMixer(system: SoundMixerSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  system.popup.style.transform = 'translateY(10px)';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Start a layer's sound
 */
function startLayerSound(system: SoundMixerSystem, layer: SoundLayer): void {
  if (!system.audioCtx || layer.oscillator) return;

  const ctx = system.audioCtx;

  // Create oscillator based on layer type
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  switch (layer.id) {
    case 'ambience':
      // Low rumble
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(40, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      break;

    case 'rain':
      // White noise filtered
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      break;

    case 'wind':
      // Low frequency modulation
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(30, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, ctx.currentTime);
      break;

    case 'cafe':
      // Mid-range buzz
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);
      break;

    case 'nature':
      // Higher frequency chirps
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);
      break;

    default:
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
  }

  // Set volume
  const volume = layer.volume * system.masterVolume * 0.1; // Keep it subtle
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  // Connect nodes
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Start
  oscillator.start();

  // Store references
  layer.oscillator = oscillator;
  layer.gain = gain;
  layer.filter = filter;
}

/**
 * Stop a layer's sound
 */
function stopLayerSound(layer: SoundLayer): void {
  if (layer.oscillator) {
    try {
      layer.oscillator.stop();
    } catch {
      // Already stopped
    }
    layer.oscillator = undefined;
    layer.gain = undefined;
    layer.filter = undefined;
  }
}

/**
 * Stop all sounds
 */
function stopAllSounds(system: SoundMixerSystem): void {
  system.layers.forEach(layer => stopLayerSound(layer));
}

/**
 * Update a layer's volume
 */
function updateLayerVolume(system: SoundMixerSystem, layer: SoundLayer): void {
  if (layer.gain && system.audioCtx) {
    const volume = layer.volume * system.masterVolume * 0.1;
    layer.gain.gain.setValueAtTime(volume, system.audioCtx.currentTime);
  }

  // Start/stop based on volume
  if (layer.enabled && layer.volume > 0 && !layer.oscillator) {
    startLayerSound(system, layer);
  } else if (layer.volume === 0 && layer.oscillator) {
    stopLayerSound(layer);
  }
}

/**
 * Update all volumes
 */
function updateAllVolumes(system: SoundMixerSystem): void {
  system.layers.forEach(layer => updateLayerVolume(system, layer));
}

// ============================================================================
// Persistence
// ============================================================================

interface MixerState {
  layers: Omit<SoundLayer, 'oscillator' | 'gain' | 'filter'>[];
  masterVolume: number;
}

function loadMixerState(): MixerState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveMixerState(system: SoundMixerSystem): void {
  try {
    const state: MixerState = {
      layers: system.layers.map(({ id, name, icon, volume, enabled }) => ({
        id, name, icon, volume, enabled,
      })),
      masterVolume: system.masterVolume,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSoundMixerSystem(system: SoundMixerSystem): void {
  system.cleanup();
}
