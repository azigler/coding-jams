/**
 * Museum Settings Panel
 *
 * Provides user controls for sound, display, and quality settings.
 */

// ============================================================================
// Types
// ============================================================================

export interface Settings {
  soundEnabled: boolean;
  minimapVisible: boolean;
  qualityLevel: 'low' | 'medium' | 'high';
}

export interface SettingsPanel {
  container: HTMLElement;
  panel: HTMLElement;
  isOpen: boolean;
  settings: Settings;
  onSettingsChange: ((settings: Settings) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  minimapVisible: true,
  qualityLevel: 'medium',
};

// ============================================================================
// Settings Panel Creation
// ============================================================================

/**
 * Create the settings panel
 */
export function createSettingsPanel(container: HTMLElement): SettingsPanel {
  // Load saved settings from localStorage
  const savedSettings = loadSettings();
  const settings: Settings = { ...DEFAULT_SETTINGS, ...savedSettings };

  // Create settings button
  const button = document.createElement('button');
  button.id = 'settings-button';
  button.innerHTML = '⚙️';
  button.style.cssText = `
    position: absolute;
    top: 10px;
    right: 140px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 18px;
    cursor: pointer;
    z-index: 100;
    transition: background 0.2s;
  `;
  button.title = 'Settings';
  container.appendChild(button);

  // Create settings panel
  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.style.cssText = `
    position: absolute;
    top: 55px;
    right: 10px;
    width: 200px;
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    color: #b0b0c0;
    z-index: 100;
    display: none;
  `;

  panel.innerHTML = `
    <div style="font-weight: bold; color: white; margin-bottom: 12px; font-size: 14px;">
      Settings
    </div>

    <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
      <input type="checkbox" id="setting-sound" ${settings.soundEnabled ? 'checked' : ''}
        style="margin-right: 8px; cursor: pointer;">
      Sound Effects
    </label>

    <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
      <input type="checkbox" id="setting-minimap" ${settings.minimapVisible ? 'checked' : ''}
        style="margin-right: 8px; cursor: pointer;">
      Show Minimap
    </label>

    <div style="margin-bottom: 10px;">
      <div style="margin-bottom: 5px;">Quality:</div>
      <select id="setting-quality" style="
        width: 100%;
        padding: 5px;
        background: rgba(40, 40, 50, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #b0b0c0;
        cursor: pointer;
      ">
        <option value="low" ${settings.qualityLevel === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${settings.qualityLevel === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${settings.qualityLevel === 'high' ? 'selected' : ''}>High</option>
      </select>
    </div>

    <button id="setting-fullscreen" style="
      width: 100%;
      padding: 8px;
      background: rgba(74, 158, 255, 0.3);
      border: 1px solid rgba(74, 158, 255, 0.5);
      border-radius: 4px;
      color: #4a9eff;
      cursor: pointer;
      font-size: 13px;
      margin-top: 5px;
    ">
      Fullscreen
    </button>
  `;

  container.appendChild(panel);

  const settingsPanel: SettingsPanel = {
    container,
    panel,
    isOpen: false,
    settings,
    onSettingsChange: null,
    cleanup: () => {
      button.remove();
      panel.remove();
    },
  };

  // Toggle panel on button click
  button.addEventListener('click', () => {
    settingsPanel.isOpen = !settingsPanel.isOpen;
    panel.style.display = settingsPanel.isOpen ? 'block' : 'none';
  });

  // Handle settings changes
  const soundCheckbox = panel.querySelector('#setting-sound') as HTMLInputElement;
  const minimapCheckbox = panel.querySelector('#setting-minimap') as HTMLInputElement;
  const qualitySelect = panel.querySelector('#setting-quality') as HTMLSelectElement;
  const fullscreenButton = panel.querySelector('#setting-fullscreen') as HTMLButtonElement;

  soundCheckbox.addEventListener('change', () => {
    settingsPanel.settings.soundEnabled = soundCheckbox.checked;
    saveSettings(settingsPanel.settings);
    settingsPanel.onSettingsChange?.(settingsPanel.settings);
  });

  minimapCheckbox.addEventListener('change', () => {
    settingsPanel.settings.minimapVisible = minimapCheckbox.checked;
    saveSettings(settingsPanel.settings);
    settingsPanel.onSettingsChange?.(settingsPanel.settings);
  });

  qualitySelect.addEventListener('change', () => {
    settingsPanel.settings.qualityLevel = qualitySelect.value as 'low' | 'medium' | 'high';
    saveSettings(settingsPanel.settings);
    settingsPanel.onSettingsChange?.(settingsPanel.settings);
  });

  fullscreenButton.addEventListener('click', () => {
    toggleFullscreen(container);
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (settingsPanel.isOpen &&
        !panel.contains(e.target as Node) &&
        !button.contains(e.target as Node)) {
      settingsPanel.isOpen = false;
      panel.style.display = 'none';
    }
  });

  return settingsPanel;
}

// ============================================================================
// Settings Persistence
// ============================================================================

const STORAGE_KEY = 'genuary-museum-settings';

/**
 * Load settings from localStorage
 */
function loadSettings(): Partial<Settings> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Fullscreen
// ============================================================================

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen(element: HTMLElement): void {
  if (!document.fullscreenElement) {
    element.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

// ============================================================================
// Settings Panel Cleanup
// ============================================================================

/**
 * Dispose settings panel
 */
export function disposeSettingsPanel(panel: SettingsPanel): void {
  panel.cleanup();
}
