/**
 * Museum Credits/About Screen
 *
 * Shows information about the Genuary 2026 Virtual Museum.
 */

// ============================================================================
// Types
// ============================================================================

export interface CreditsSystem {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Credits System Creation
// ============================================================================

/**
 * Create the credits system
 */
export function createCreditsSystem(container: HTMLElement): CreditsSystem {
  const system: CreditsSystem = {
    container,
    popup: null,
    isOpen: false,
    cleanup: () => {},
  };

  // Handle C key for credits
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyC' && !event.ctrlKey && !event.metaKey) {
      toggleCredits(system);
    }
  };
  document.addEventListener('keydown', keyHandler);

  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    if (system.popup) {
      system.popup.remove();
    }
  };

  return system;
}

// ============================================================================
// Credits Display
// ============================================================================

/**
 * Toggle credits popup
 */
export function toggleCredits(system: CreditsSystem): void {
  if (system.isOpen) {
    closeCredits(system);
  } else {
    openCredits(system);
  }
}

/**
 * Open credits popup
 */
function openCredits(system: CreditsSystem): void {
  if (system.popup) return;

  const popup = document.createElement('div');
  popup.id = 'credits-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 16px;
    padding: 30px 40px;
    font-family: system-ui, sans-serif;
    color: white;
    z-index: 500;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    animation: credits-fade-in 0.3s ease-out;
  `;

  popup.innerHTML = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 28px; font-weight: bold; background: linear-gradient(90deg, #4a9eff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        GENUARY 2026
      </div>
      <div style="font-size: 14px; color: #888; margin-top: 5px;">
        Virtual Museum
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        About
      </div>
      <div style="color: #b0b0c0; font-size: 13px; line-height: 1.6;">
        A virtual gallery showcasing 31 days of generative art created for Genuary 2026.
        Navigate the museum, discover unique artworks, and unlock achievements.
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Controls
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
        <div style="color: #888;"><span style="color: #4a9eff;">WASD</span> Move</div>
        <div style="color: #888;"><span style="color: #4a9eff;">Mouse</span> Look</div>
        <div style="color: #888;"><span style="color: #4a9eff;">Click</span> Zoom</div>
        <div style="color: #888;"><span style="color: #4a9eff;">[ ]</span> Browse</div>
        <div style="color: #888;"><span style="color: #4a9eff;">R</span> Random</div>
        <div style="color: #888;"><span style="color: #4a9eff;">T</span> Tour</div>
        <div style="color: #888;"><span style="color: #4a9eff;">G</span> Go to Day</div>
        <div style="color: #888;"><span style="color: #4a9eff;">F</span> Fav/Full</div>
        <div style="color: #888;"><span style="color: #4a9eff;">P</span> Photo</div>
        <div style="color: #888;"><span style="color: #4a9eff;">S</span> Share</div>
        <div style="color: #888;"><span style="color: #4a9eff;">I</span> Stats</div>
        <div style="color: #888;"><span style="color: #4a9eff;">A</span> Awards</div>
        <div style="color: #888;"><span style="color: #4a9eff;">M</span> Mute</div>
        <div style="color: #888;"><span style="color: #4a9eff;">H</span> Help</div>
        <div style="color: #888;"><span style="color: #4a9eff;">0-5</span> Teleport</div>
        <div style="color: #888;"><span style="color: #4a9eff;">Shift+P</span> Photo Mode</div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Built With
      </div>
      <div style="color: #888; font-size: 12px;">
        Three.js, TypeScript, Web Audio API, Vite
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Curator Agent
      </div>
      <div style="color: #888; font-size: 12px;">
        This museum was designed and built by Claude, an AI assistant by Anthropic.
      </div>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <div style="color: #666; font-size: 11px;">
        Press C or Escape to close
      </div>
    </div>

    <style>
      @keyframes credits-fade-in {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    </style>
  `;

  system.container.appendChild(popup);
  system.popup = popup;
  system.isOpen = true;

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      closeCredits(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Close on click outside
  const clickHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      closeCredits(system);
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', clickHandler), 0);
}

/**
 * Close credits popup
 */
function closeCredits(system: CreditsSystem): void {
  if (system.popup) {
    system.popup.style.opacity = '0';
    system.popup.style.transition = 'opacity 0.2s';
    setTimeout(() => {
      system.popup?.remove();
      system.popup = null;
      system.isOpen = false;
    }, 200);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose credits system
 */
export function disposeCreditsSystem(system: CreditsSystem): void {
  system.cleanup();
}
