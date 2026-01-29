/**
 * Accessibility Features
 *
 * Quick accessibility toggles for the museum.
 */

// ============================================================================
// Types
// ============================================================================

export interface AccessibilitySystem {
  container: HTMLElement;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  styleElement: HTMLStyleElement | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-accessibility';

// ============================================================================
// CSS Styles
// ============================================================================

const HIGH_CONTRAST_STYLES = `
  /* High contrast mode */
  #museum-location, #discovery-badge, #museum-compass,
  #breadcrumb-trail, .museum-notification, #exhibit-info-panel {
    background: rgba(0, 0, 0, 0.95) !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
    color: white !important;
  }

  #museum-location *, #discovery-badge *, #museum-compass *,
  #breadcrumb-trail *, .museum-notification *, #exhibit-info-panel * {
    color: white !important;
  }

  button, [role="button"] {
    border: 2px solid white !important;
  }
`;

const LARGE_TEXT_STYLES = `
  /* Large text mode */
  #museum-location, #discovery-badge, .museum-notification,
  #exhibit-info-panel, #breadcrumb-trail, #help-overlay,
  #credits-popup, #guestbook-popup, #search-popup {
    font-size: 16px !important;
  }

  #museum-location *, #discovery-badge *, .museum-notification *,
  #exhibit-info-panel *, #breadcrumb-trail *, #help-overlay *,
  #credits-popup *, #guestbook-popup *, #search-popup * {
    font-size: inherit !important;
  }

  kbd {
    font-size: 14px !important;
    padding: 4px 10px !important;
  }
`;

const REDUCED_MOTION_STYLES = `
  /* Reduced motion */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

// ============================================================================
// Accessibility System Creation
// ============================================================================

/**
 * Create the accessibility system
 */
export function createAccessibilitySystem(container: HTMLElement): AccessibilitySystem {
  // Load saved preferences
  const saved = loadPreferences();

  const system: AccessibilitySystem = {
    container,
    highContrast: saved.highContrast ?? false,
    largeText: saved.largeText ?? false,
    reducedMotion: saved.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    styleElement: null,
    cleanup: () => {
      if (system.styleElement) {
        system.styleElement.remove();
        system.styleElement = null;
      }
    },
  };

  // Create style element
  system.styleElement = document.createElement('style');
  system.styleElement.id = 'museum-accessibility-styles';
  document.head.appendChild(system.styleElement);

  // Apply initial styles
  updateStyles(system);

  // Handle keyboard shortcuts
  const keyHandler = (event: KeyboardEvent) => {
    if (!event.altKey) return;

    switch (event.code) {
      case 'KeyH':
        // Alt+H for high contrast
        event.preventDefault();
        toggleHighContrast(system);
        break;
      case 'KeyT':
        // Alt+T for large text
        event.preventDefault();
        toggleLargeText(system);
        break;
      case 'KeyR':
        // Alt+R for reduced motion
        event.preventDefault();
        toggleReducedMotion(system);
        break;
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
 * Toggle high contrast mode
 */
export function toggleHighContrast(system: AccessibilitySystem): void {
  system.highContrast = !system.highContrast;
  updateStyles(system);
  savePreferences(system);
  showAccessibilityNotification(`High contrast: ${system.highContrast ? 'ON' : 'OFF'}`);
}

/**
 * Toggle large text mode
 */
export function toggleLargeText(system: AccessibilitySystem): void {
  system.largeText = !system.largeText;
  updateStyles(system);
  savePreferences(system);
  showAccessibilityNotification(`Large text: ${system.largeText ? 'ON' : 'OFF'}`);
}

/**
 * Toggle reduced motion
 */
export function toggleReducedMotion(system: AccessibilitySystem): void {
  system.reducedMotion = !system.reducedMotion;
  updateStyles(system);
  savePreferences(system);
  showAccessibilityNotification(`Reduced motion: ${system.reducedMotion ? 'ON' : 'OFF'}`);
}

/**
 * Update styles based on current settings
 */
function updateStyles(system: AccessibilitySystem): void {
  if (!system.styleElement) return;

  let css = '';

  if (system.highContrast) {
    css += HIGH_CONTRAST_STYLES;
  }

  if (system.largeText) {
    css += LARGE_TEXT_STYLES;
  }

  if (system.reducedMotion) {
    css += REDUCED_MOTION_STYLES;
  }

  system.styleElement.textContent = css;
}

/**
 * Show accessibility notification
 */
function showAccessibilityNotification(message: string): void {
  // Check if showNotification is available globally
  const existing = document.querySelector('.museum-notification');

  const notification = document.createElement('div');
  notification.className = 'museum-notification';
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.95);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    z-index: 1001;
    border: 1px solid rgba(168, 85, 247, 0.5);
  `;
  notification.textContent = `♿ ${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============================================================================
// Persistence
// ============================================================================

interface AccessibilityPrefs {
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
}

function loadPreferences(): AccessibilityPrefs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return {};
}

function savePreferences(system: AccessibilitySystem): void {
  try {
    const prefs: AccessibilityPrefs = {
      highContrast: system.highContrast,
      largeText: system.largeText,
      reducedMotion: system.reducedMotion,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeAccessibilitySystem(system: AccessibilitySystem): void {
  system.cleanup();
}
