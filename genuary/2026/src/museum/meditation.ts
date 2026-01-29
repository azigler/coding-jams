/**
 * Meditation Mode
 *
 * A calm, contemplative mode for mindful art viewing.
 * Slows down time, adds breathing prompts, and creates
 * a serene viewing environment.
 */

// ============================================================================
// Types
// ============================================================================

export interface MeditationSystem {
  container: HTMLElement;
  isActive: boolean;
  overlay: HTMLElement | null;
  breathingGuide: HTMLElement | null;
  breathPhase: 'inhale' | 'hold' | 'exhale';
  breathInterval: number | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const BREATH_INHALE_MS = 4000;
const BREATH_HOLD_MS = 2000;
const BREATH_EXHALE_MS = 6000;

// ============================================================================
// Meditation System Creation
// ============================================================================

/**
 * Create the meditation mode system
 */
export function createMeditationSystem(container: HTMLElement): MeditationSystem {
  const system: MeditationSystem = {
    container,
    isActive: false,
    overlay: null,
    breathingGuide: null,
    breathPhase: 'inhale',
    breathInterval: null,
    cleanup: () => {
      if (system.isActive) {
        deactivateMeditation(system);
      }
    },
  };

  // Toggle with Shift+Z (Zen mode)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyZ' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleMeditation(system);
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
 * Toggle meditation mode
 */
export function toggleMeditation(system: MeditationSystem): void {
  if (system.isActive) {
    deactivateMeditation(system);
  } else {
    activateMeditation(system);
  }
}

/**
 * Activate meditation mode
 */
export function activateMeditation(system: MeditationSystem): void {
  if (system.isActive) return;

  system.isActive = true;

  // Create serene overlay
  const overlay = document.createElement('div');
  overlay.id = 'meditation-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 450;
    background: radial-gradient(
      ellipse 100% 100% at center,
      transparent 20%,
      rgba(20, 25, 40, 0.3) 60%,
      rgba(15, 18, 30, 0.6) 100%
    );
    opacity: 0;
    transition: opacity 2s ease-in-out;
  `;
  system.container.appendChild(overlay);
  system.overlay = overlay;

  // Fade in overlay
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // Create breathing guide
  const breathingGuide = document.createElement('div');
  breathingGuide.id = 'breathing-guide';
  breathingGuide.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 500;
    opacity: 0;
    transition: opacity 1s;
  `;

  breathingGuide.innerHTML = `
    <div id="breath-circle" style="
      width: 60px;
      height: 60px;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(100, 180, 255, 0.3), transparent);
      border: 2px solid rgba(100, 180, 255, 0.4);
      transition: transform 4s ease-in-out, opacity 2s;
    "></div>
    <div id="breath-text" style="
      font-family: system-ui, sans-serif;
      font-size: 14px;
      color: rgba(150, 180, 220, 0.8);
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: opacity 0.5s;
    ">Breathe in...</div>
  `;

  system.container.appendChild(breathingGuide);
  system.breathingGuide = breathingGuide;

  // Start breathing animation
  setTimeout(() => {
    breathingGuide.style.opacity = '1';
    startBreathingCycle(system);
  }, 1000);

  // Show activation message
  showMeditationMessage(system, 'Meditation Mode — Shift+Z to exit');

  // Add slow motion CSS filter
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.transition = 'filter 2s';
    canvas.style.filter = 'saturate(0.85) brightness(0.95)';
  }
}

/**
 * Start the breathing cycle
 */
function startBreathingCycle(system: MeditationSystem): void {
  if (!system.isActive) return;

  const breathCycle = () => {
    if (!system.isActive || !system.breathingGuide) return;

    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');

    // Inhale
    system.breathPhase = 'inhale';
    if (circle) circle.style.transform = 'scale(1.3)';
    if (text) text.textContent = 'Breathe in...';

    // Hold after inhale
    setTimeout(() => {
      if (!system.isActive) return;
      system.breathPhase = 'hold';
      if (text) text.textContent = 'Hold...';
    }, BREATH_INHALE_MS);

    // Exhale
    setTimeout(() => {
      if (!system.isActive) return;
      system.breathPhase = 'exhale';
      if (circle) circle.style.transform = 'scale(1)';
      if (text) text.textContent = 'Breathe out...';
    }, BREATH_INHALE_MS + BREATH_HOLD_MS);
  };

  // Initial breath
  breathCycle();

  // Continue cycle
  const totalCycleTime = BREATH_INHALE_MS + BREATH_HOLD_MS + BREATH_EXHALE_MS;
  system.breathInterval = window.setInterval(breathCycle, totalCycleTime);
}

/**
 * Deactivate meditation mode
 */
export function deactivateMeditation(system: MeditationSystem): void {
  if (!system.isActive) return;

  system.isActive = false;

  // Stop breathing cycle
  if (system.breathInterval) {
    clearInterval(system.breathInterval);
    system.breathInterval = null;
  }

  // Fade out overlay
  if (system.overlay) {
    system.overlay.style.opacity = '0';
    const overlay = system.overlay;
    setTimeout(() => {
      overlay.remove();
      if (system.overlay === overlay) {
        system.overlay = null;
      }
    }, 2000);
  }

  // Fade out breathing guide
  if (system.breathingGuide) {
    system.breathingGuide.style.opacity = '0';
    const guide = system.breathingGuide;
    setTimeout(() => {
      guide.remove();
      if (system.breathingGuide === guide) {
        system.breathingGuide = null;
      }
    }, 1000);
  }

  // Remove canvas filter
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = '';
  }

  showMeditationMessage(system, 'Meditation Mode ended');
}

/**
 * Check if meditation is active
 */
export function isMeditationActive(system: MeditationSystem): boolean {
  return system.isActive;
}

/**
 * Show meditation message
 */
function showMeditationMessage(system: MeditationSystem, message: string): void {
  const existing = document.getElementById('meditation-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.id = 'meditation-message';
  msg.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15, 20, 35, 0.9);
    border: 1px solid rgba(100, 180, 255, 0.3);
    border-radius: 8px;
    padding: 15px 25px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: rgba(150, 180, 220, 0.9);
    letter-spacing: 1px;
    z-index: 600;
    opacity: 0;
    transition: opacity 1s;
  `;
  msg.textContent = message;

  system.container.appendChild(msg);

  requestAnimationFrame(() => {
    msg.style.opacity = '1';
  });

  setTimeout(() => {
    msg.style.opacity = '0';
    setTimeout(() => msg.remove(), 1000);
  }, 3000);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeMeditationSystem(system: MeditationSystem): void {
  system.cleanup();
}
