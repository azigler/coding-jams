/**
 * Ambient Presets
 *
 * Different lighting and atmosphere presets
 * for customizing the museum experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface AmbientPreset {
  id: string;
  name: string;
  icon: string;
  filter: string;
  fogColor: string;
  fogDensity: number;
}

export interface AmbientPresetsSystem {
  container: HTMLElement;
  currentPreset: string;
  indicator: HTMLElement | null;
  panel: HTMLElement | null;
  isOpen: boolean;
  onPresetChange: ((preset: AmbientPreset) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Presets
// ============================================================================

const PRESETS: AmbientPreset[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '🏛️',
    filter: '',
    fogColor: '#1a1a2e',
    fogDensity: 0.02,
  },
  {
    id: 'gallery-white',
    name: 'Gallery White',
    icon: '⬜',
    filter: 'brightness(1.1) contrast(0.95)',
    fogColor: '#f5f5f5',
    fogDensity: 0.01,
  },
  {
    id: 'warm-evening',
    name: 'Warm Evening',
    icon: '🌅',
    filter: 'sepia(0.2) brightness(0.95)',
    fogColor: '#2a1810',
    fogDensity: 0.025,
  },
  {
    id: 'cool-morning',
    name: 'Cool Morning',
    icon: '🌤️',
    filter: 'saturate(0.9) hue-rotate(-10deg) brightness(1.05)',
    fogColor: '#1a2a3e',
    fogDensity: 0.018,
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: '💜',
    filter: 'saturate(1.3) contrast(1.1) hue-rotate(20deg)',
    fogColor: '#0a0a1e',
    fogDensity: 0.03,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📜',
    filter: 'sepia(0.4) contrast(1.05) brightness(0.95)',
    fogColor: '#2e2a1a',
    fogDensity: 0.022,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    icon: '⚫',
    filter: 'grayscale(1) contrast(1.1)',
    fogColor: '#1a1a1a',
    fogDensity: 0.02,
  },
  {
    id: 'underwater',
    name: 'Underwater',
    icon: '🌊',
    filter: 'saturate(0.9) hue-rotate(-30deg) brightness(0.9)',
    fogColor: '#0a1a2e',
    fogDensity: 0.035,
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-ambient-preset';

// ============================================================================
// Ambient Presets System Creation
// ============================================================================

/**
 * Create the ambient presets system
 */
export function createAmbientPresetsSystem(container: HTMLElement): AmbientPresetsSystem {
  const saved = loadPresetPreference();

  const system: AmbientPresetsSystem = {
    container,
    currentPreset: saved || 'default',
    indicator: null,
    panel: null,
    isOpen: false,
    onPresetChange: null,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      closePresetsPanel(system);
    },
  };

  // Create indicator
  createIndicator(system);

  // Apply initial preset
  const preset = PRESETS.find(p => p.id === system.currentPreset);
  if (preset) {
    applyPreset(system, preset);
  }

  return system;
}

/**
 * Create the preset indicator
 */
function createIndicator(system: AmbientPresetsSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'ambient-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
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

  updateIndicatorContent(system, indicator);

  indicator.onclick = () => togglePresetsPanel(system);

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
 * Update indicator content
 */
function updateIndicatorContent(system: AmbientPresetsSystem, indicator: HTMLElement): void {
  const preset = PRESETS.find(p => p.id === system.currentPreset) || PRESETS[0];
  indicator.innerHTML = `
    <span style="font-size: 14px;">${preset.icon}</span>
    <span>${preset.name}</span>
  `;
  indicator.title = 'Click to change ambient preset';
}

/**
 * Toggle presets panel
 */
export function togglePresetsPanel(system: AmbientPresetsSystem): void {
  if (system.isOpen) {
    closePresetsPanel(system);
  } else {
    openPresetsPanel(system);
  }
}

/**
 * Open presets panel
 */
function openPresetsPanel(system: AmbientPresetsSystem): void {
  if (system.panel) return;

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'ambient-panel';
  panel.style.cssText = `
    position: fixed;
    top: 140px;
    right: 20px;
    width: 200px;
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
      Ambient Presets
    </div>
    <div style="padding: 10px;">
      ${PRESETS.map(preset => `
        <button class="preset-btn" data-preset="${preset.id}" style="
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: ${preset.id === system.currentPreset ? 'rgba(150, 100, 200, 0.3)' : 'rgba(40, 40, 60, 0.3)'};
          border: 1px solid ${preset.id === system.currentPreset ? 'rgba(150, 100, 200, 0.5)' : 'transparent'};
          border-radius: 8px;
          color: white;
          font-size: 12px;
          cursor: pointer;
          margin-bottom: 5px;
          transition: all 0.2s;
          text-align: left;
        ">
          <span style="font-size: 16px;">${preset.icon}</span>
          <span>${preset.name}</span>
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

  // Wire up preset buttons
  const buttons = panel.querySelectorAll('.preset-btn');
  buttons.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const presetId = (btn as HTMLElement).dataset.preset;
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        selectPreset(system, preset);
        closePresetsPanel(system);
      }
    };

    (btn as HTMLElement).onmouseover = () => {
      if ((btn as HTMLElement).dataset.preset !== system.currentPreset) {
        (btn as HTMLElement).style.background = 'rgba(150, 100, 200, 0.2)';
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
      closePresetsPanel(system);
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Close presets panel
 */
function closePresetsPanel(system: AmbientPresetsSystem): void {
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
 * Select a preset
 */
function selectPreset(system: AmbientPresetsSystem, preset: AmbientPreset): void {
  system.currentPreset = preset.id;
  savePresetPreference(preset.id);
  applyPreset(system, preset);

  if (system.indicator) {
    updateIndicatorContent(system, system.indicator);
  }

  if (system.onPresetChange) {
    system.onPresetChange(preset);
  }
}

/**
 * Apply preset visually
 */
function applyPreset(system: AmbientPresetsSystem, preset: AmbientPreset): void {
  const canvas = system.container.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = preset.filter;
  }
}

/**
 * Get current preset
 */
export function getCurrentPreset(system: AmbientPresetsSystem): AmbientPreset {
  return PRESETS.find(p => p.id === system.currentPreset) || PRESETS[0];
}

/**
 * Get all presets
 */
export function getAllPresets(): AmbientPreset[] {
  return [...PRESETS];
}

// ============================================================================
// Persistence
// ============================================================================

function loadPresetPreference(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function savePresetPreference(presetId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, presetId);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeAmbientPresetsSystem(system: AmbientPresetsSystem): void {
  system.cleanup();
}
