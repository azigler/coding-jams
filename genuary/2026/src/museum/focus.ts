/**
 * Focus Mode
 *
 * Dims the UI and surroundings to focus on the current exhibit.
 * Creates an immersive viewing experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface FocusSystem {
  container: HTMLElement;
  isActive: boolean;
  overlay: HTMLElement | null;
  vignette: HTMLElement | null;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Focus System Creation
// ============================================================================

/**
 * Create the focus mode system
 */
export function createFocusSystem(container: HTMLElement): FocusSystem {
  const system: FocusSystem = {
    container,
    isActive: false,
    overlay: null,
    vignette: null,
    indicator: null,
    cleanup: () => {
      if (system.overlay) {
        system.overlay.remove();
        system.overlay = null;
      }
      if (system.vignette) {
        system.vignette.remove();
        system.vignette = null;
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Toggle with Shift+F
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyF' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleFocusMode(system);
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
 * Toggle focus mode
 */
export function toggleFocusMode(system: FocusSystem): void {
  if (system.isActive) {
    deactivateFocusMode(system);
  } else {
    activateFocusMode(system);
  }
}

/**
 * Activate focus mode
 */
export function activateFocusMode(system: FocusSystem): void {
  if (system.isActive) return;

  system.isActive = true;

  // Hide UI elements
  const uiElements = [
    'museum-location',
    'minimap-canvas',
    'museum-help',
    'discovery-badge',
    'settings-button',
    'museum-tip',
    'tour-progress',
    'compass-container',
    'bookmarks-indicator',
    'history-indicator',
    'mood-indicator',
    'challenge-indicator',
    'completion-badge',
  ];

  uiElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.dataset.focusHidden = el.style.display;
      el.style.display = 'none';
    }
  });

  // Create vignette overlay
  const vignette = document.createElement('div');
  vignette.id = 'focus-vignette';
  vignette.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 500;
    background: radial-gradient(
      ellipse 80% 80% at center,
      transparent 30%,
      rgba(0, 0, 0, 0.3) 60%,
      rgba(0, 0, 0, 0.7) 100%
    );
    opacity: 0;
    transition: opacity 0.5s;
  `;
  system.container.appendChild(vignette);
  system.vignette = vignette;

  // Fade in vignette
  requestAnimationFrame(() => {
    vignette.style.opacity = '1';
  });

  // Create subtle indicator
  const indicator = document.createElement('div');
  indicator.id = 'focus-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 15, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 20px;
    padding: 6px 14px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #888;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.5s;
  `;
  indicator.innerHTML = `🎯 Focus Mode · Shift+F to exit`;
  system.container.appendChild(indicator);
  system.indicator = indicator;

  // Fade in indicator then fade out
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
    setTimeout(() => {
      if (indicator) {
        indicator.style.opacity = '0';
      }
    }, 3000);
  });
}

/**
 * Deactivate focus mode
 */
export function deactivateFocusMode(system: FocusSystem): void {
  if (!system.isActive) return;

  system.isActive = false;

  // Restore UI elements
  const uiElements = [
    'museum-location',
    'minimap-canvas',
    'museum-help',
    'discovery-badge',
    'settings-button',
    'museum-tip',
    'tour-progress',
    'compass-container',
    'bookmarks-indicator',
    'history-indicator',
    'mood-indicator',
    'challenge-indicator',
    'completion-badge',
  ];

  uiElements.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.dataset.focusHidden !== undefined) {
      el.style.display = el.dataset.focusHidden || '';
      delete el.dataset.focusHidden;
    }
  });

  // Fade out vignette
  if (system.vignette) {
    system.vignette.style.opacity = '0';
    const vignette = system.vignette;
    setTimeout(() => {
      vignette.remove();
      if (system.vignette === vignette) {
        system.vignette = null;
      }
    }, 500);
  }

  // Remove indicator
  if (system.indicator) {
    system.indicator.remove();
    system.indicator = null;
  }
}

/**
 * Check if focus mode is active
 */
export function isFocusModeActive(system: FocusSystem): boolean {
  return system.isActive;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeFocusSystem(system: FocusSystem): void {
  if (system.isActive) {
    deactivateFocusMode(system);
  }
  system.cleanup();
}
