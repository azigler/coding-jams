/**
 * Themes
 *
 * Visual theme presets for museum UI elements.
 * Customize the look and feel of overlays and panels.
 */

// ============================================================================
// Types
// ============================================================================

export type ThemeId = 'default' | 'minimal' | 'neon' | 'classic' | 'dark' | 'warm' | 'cool' | 'monochrome';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  borderRadius: string;
  fontFamily: string;
}

export interface ThemesSystem {
  container: HTMLElement;
  currentTheme: Theme;
  panel: HTMLElement | null;
  isOpen: boolean;
  styleElement: HTMLStyleElement | null;
  cleanup: () => void;
}

// ============================================================================
// Theme Definitions
// ============================================================================

const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Museum Default',
    description: 'The original museum experience',
    colors: {
      primary: '#4a9eff',
      secondary: '#a855f7',
      accent: '#ffc864',
      background: 'rgba(15, 15, 25, 0.98)',
      text: '#e0e0e0',
      muted: '#888888',
      border: 'rgba(100, 150, 255, 0.3)',
      success: '#64c896',
      warning: '#ffc864',
      error: '#ff6b6b',
    },
    borderRadius: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and understated',
    colors: {
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#ffffff',
      background: 'rgba(0, 0, 0, 0.9)',
      text: '#ffffff',
      muted: '#666666',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#ffffff',
      warning: '#ffffff',
      error: '#ffffff',
    },
    borderRadius: '4px',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Vibrant cyberpunk aesthetic',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#00ff00',
      background: 'rgba(10, 0, 20, 0.98)',
      text: '#00ffff',
      muted: '#008888',
      border: 'rgba(0, 255, 255, 0.4)',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
    },
    borderRadius: '0px',
    fontFamily: '"Courier New", monospace',
  },
  {
    id: 'classic',
    name: 'Classic Gallery',
    description: 'Traditional art gallery feel',
    colors: {
      primary: '#c4a060',
      secondary: '#8b7355',
      accent: '#daa520',
      background: 'rgba(25, 20, 15, 0.98)',
      text: '#e8e0d0',
      muted: '#a09080',
      border: 'rgba(196, 160, 96, 0.3)',
      success: '#8fbc8f',
      warning: '#daa520',
      error: '#cd5c5c',
    },
    borderRadius: '8px',
    fontFamily: 'Georgia, serif',
  },
  {
    id: 'dark',
    name: 'Pure Dark',
    description: 'Maximum contrast',
    colors: {
      primary: '#ffffff',
      secondary: '#00aaff',
      accent: '#ff6600',
      background: 'rgba(0, 0, 0, 0.98)',
      text: '#ffffff',
      muted: '#555555',
      border: 'rgba(255, 255, 255, 0.2)',
      success: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0000',
    },
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'warm',
    name: 'Warm Sunset',
    description: 'Cozy warm tones',
    colors: {
      primary: '#ff8c42',
      secondary: '#ff6b6b',
      accent: '#ffd93d',
      background: 'rgba(30, 15, 10, 0.98)',
      text: '#fff5e6',
      muted: '#cc9966',
      border: 'rgba(255, 140, 66, 0.3)',
      success: '#9acd32',
      warning: '#ffd93d',
      error: '#ff4444',
    },
    borderRadius: '16px',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'cool',
    name: 'Cool Arctic',
    description: 'Calming cool tones',
    colors: {
      primary: '#7ec8e3',
      secondary: '#a0d2db',
      accent: '#d4f1f9',
      background: 'rgba(10, 20, 30, 0.98)',
      text: '#e6f2ff',
      muted: '#6699aa',
      border: 'rgba(126, 200, 227, 0.3)',
      success: '#90ee90',
      warning: '#87ceeb',
      error: '#ff7f7f',
    },
    borderRadius: '12px',
    fontFamily: 'system-ui, sans-serif',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Black, white, and shades of gray',
    colors: {
      primary: '#cccccc',
      secondary: '#999999',
      accent: '#ffffff',
      background: 'rgba(20, 20, 20, 0.98)',
      text: '#dddddd',
      muted: '#666666',
      border: 'rgba(150, 150, 150, 0.3)',
      success: '#aaaaaa',
      warning: '#888888',
      error: '#666666',
    },
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
  },
];

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-theme';

// ============================================================================
// Themes System Creation
// ============================================================================

/**
 * Create the themes system
 */
export function createThemesSystem(container: HTMLElement): ThemesSystem {
  const savedThemeId = loadThemeId();
  const savedTheme = THEMES.find(t => t.id === savedThemeId) || THEMES[0];

  const system: ThemesSystem = {
    container,
    currentTheme: savedTheme,
    panel: null,
    isOpen: false,
    styleElement: null,
    cleanup: () => {
      closeThemesPanel(system);
      removeThemeStyles(system);
    },
  };

  // Apply saved theme
  applyTheme(system, savedTheme);

  return system;
}

/**
 * Apply a theme
 */
export function applyTheme(system: ThemesSystem, theme: Theme): void {
  system.currentTheme = theme;
  removeThemeStyles(system);

  const style = document.createElement('style');
  style.id = 'museum-theme-styles';
  style.textContent = `
    :root {
      --museum-primary: ${theme.colors.primary};
      --museum-secondary: ${theme.colors.secondary};
      --museum-accent: ${theme.colors.accent};
      --museum-background: ${theme.colors.background};
      --museum-text: ${theme.colors.text};
      --museum-muted: ${theme.colors.muted};
      --museum-border: ${theme.colors.border};
      --museum-success: ${theme.colors.success};
      --museum-warning: ${theme.colors.warning};
      --museum-error: ${theme.colors.error};
      --museum-radius: ${theme.borderRadius};
      --museum-font: ${theme.fontFamily};
    }
  `;
  document.head.appendChild(style);
  system.styleElement = style;

  saveThemeId(theme.id);
}

/**
 * Remove theme styles
 */
function removeThemeStyles(system: ThemesSystem): void {
  if (system.styleElement) {
    system.styleElement.remove();
    system.styleElement = null;
  }
}

/**
 * Set theme by ID
 */
export function setTheme(system: ThemesSystem, themeId: ThemeId): boolean {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return false;

  applyTheme(system, theme);
  return true;
}

/**
 * Cycle to next theme
 */
export function cycleTheme(system: ThemesSystem): Theme {
  const currentIndex = THEMES.findIndex(t => t.id === system.currentTheme.id);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  const nextTheme = THEMES[nextIndex];
  applyTheme(system, nextTheme);
  return nextTheme;
}

/**
 * Open themes panel
 */
export function openThemesPanel(system: ThemesSystem): void {
  closeThemesPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'themes-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-height: 550px;
    background: var(--museum-background, rgba(15, 15, 25, 0.98));
    border: 1px solid var(--museum-border, rgba(100, 150, 255, 0.3));
    border-radius: var(--museum-radius, 12px);
    font-family: var(--museum-font, system-ui, sans-serif);
    color: var(--museum-text, #e0e0e0);
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid var(--museum-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: var(--museum-text);">
          🎨 Themes
        </div>
        <div style="font-size: 11px; color: var(--museum-muted); margin-top: 4px;">
          Customize your museum experience
        </div>
      </div>
      <button id="themes-close" style="
        background: none;
        border: none;
        color: var(--museum-muted);
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${THEMES.map(theme => `
        <div class="theme-option" data-id="${theme.id}" style="
          padding: 15px;
          background: ${theme.id === system.currentTheme.id ? 'rgba(100, 150, 255, 0.15)' : 'rgba(100, 100, 100, 0.1)'};
          border: 2px solid ${theme.id === system.currentTheme.id ? 'var(--museum-primary)' : 'transparent'};
          border-radius: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; gap: 4px;">
              ${Object.entries(theme.colors).slice(0, 5).map(([_, color]) => `
                <div style="
                  width: 16px;
                  height: 16px;
                  background: ${color};
                  border-radius: 50%;
                  border: 1px solid rgba(255,255,255,0.2);
                "></div>
              `).join('')}
            </div>
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: bold; color: var(--museum-text);">
                ${theme.name}
              </div>
              <div style="font-size: 11px; color: var(--museum-muted); margin-top: 2px;">
                ${theme.description}
              </div>
            </div>
            ${theme.id === system.currentTheme.id ? `
              <div style="color: var(--museum-success); font-size: 14px;">✓</div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div style="
      padding: 10px 15px;
      border-top: 1px solid var(--museum-border);
      font-size: 10px;
      color: var(--museum-muted);
      text-align: center;
    ">
      Press Ctrl+T to cycle themes
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#themes-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeThemesPanel(system);

  // Wire up theme options
  const themeOptions = panel.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    (option as HTMLElement).onmouseover = () => {
      if ((option as HTMLElement).dataset.id !== system.currentTheme.id) {
        (option as HTMLElement).style.background = 'rgba(100, 150, 255, 0.1)';
      }
    };
    (option as HTMLElement).onmouseout = () => {
      if ((option as HTMLElement).dataset.id !== system.currentTheme.id) {
        (option as HTMLElement).style.background = 'rgba(100, 100, 100, 0.1)';
      }
    };
    (option as HTMLElement).onclick = () => {
      const themeId = (option as HTMLElement).dataset.id as ThemeId;
      setTheme(system, themeId);
      closeThemesPanel(system);
      openThemesPanel(system);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeThemesPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close themes panel
 */
function closeThemesPanel(system: ThemesSystem): void {
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
 * Toggle themes panel
 */
export function toggleThemesPanel(system: ThemesSystem): void {
  if (system.isOpen) {
    closeThemesPanel(system);
  } else {
    openThemesPanel(system);
  }
}

/**
 * Get current theme
 */
export function getCurrentTheme(system: ThemesSystem): Theme {
  return system.currentTheme;
}

/**
 * Get all themes
 */
export function getAllThemes(): Theme[] {
  return [...THEMES];
}

// ============================================================================
// Persistence
// ============================================================================

function loadThemeId(): ThemeId | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return saved as ThemeId;
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveThemeId(themeId: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeThemesSystem(system: ThemesSystem): void {
  system.cleanup();
}
