/**
 * Completion Badge
 *
 * Celebrates when the user has viewed all 31 exhibits.
 * Shows a congratulatory animation and persistent badge.
 */

// ============================================================================
// Types
// ============================================================================

export interface CompletionSystem {
  container: HTMLElement;
  isComplete: boolean;
  hasShownCelebration: boolean;
  badge: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const TOTAL_EXHIBITS = 31;
const STORAGE_KEY = 'genuary-museum-completion';

// ============================================================================
// Completion System Creation
// ============================================================================

/**
 * Create the completion system
 */
export function createCompletionSystem(container: HTMLElement): CompletionSystem {
  const saved = loadCompletionState();

  const system: CompletionSystem = {
    container,
    isComplete: saved.isComplete,
    hasShownCelebration: saved.hasShownCelebration,
    badge: null,
    cleanup: () => {
      if (system.badge) {
        system.badge.remove();
        system.badge = null;
      }
    },
  };

  // Show badge if already complete
  if (system.isComplete) {
    showCompletionBadge(system);
  }

  return system;
}

/**
 * Check for completion
 */
export function checkCompletion(system: CompletionSystem, viewedExhibits: Set<number>): boolean {
  if (system.isComplete) return true;

  if (viewedExhibits.size >= TOTAL_EXHIBITS) {
    system.isComplete = true;
    saveCompletionState(system);

    // Show celebration if first time
    if (!system.hasShownCelebration) {
      showCelebration(system);
      system.hasShownCelebration = true;
      saveCompletionState(system);
    }

    showCompletionBadge(system);
    return true;
  }

  return false;
}

/**
 * Show the completion celebration
 */
function showCelebration(system: CompletionSystem): void {
  const overlay = document.createElement('div');
  overlay.id = 'completion-celebration';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.5s;
  `;

  overlay.innerHTML = `
    <div id="celebration-content" style="
      text-align: center;
      transform: scale(0.5);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <div style="font-size: 80px; margin-bottom: 20px;">🏆</div>
      <h1 style="
        font-family: system-ui, sans-serif;
        font-size: 36px;
        color: white;
        margin: 0 0 10px 0;
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">COMPLETE!</h1>
      <p style="
        font-family: system-ui, sans-serif;
        font-size: 18px;
        color: #c0c0c0;
        margin: 0 0 30px 0;
      ">You've explored all 31 exhibits</p>
      <div style="
        font-family: system-ui, sans-serif;
        font-size: 14px;
        color: #888;
        max-width: 400px;
        line-height: 1.6;
      ">
        Congratulations on completing your journey through Genuary 2026.
        You are now a true connoisseur of generative art.
      </div>
      <button id="celebration-close" style="
        margin-top: 30px;
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        border: none;
        border-radius: 25px;
        padding: 12px 40px;
        color: #1a1a2e;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
      ">Continue</button>
    </div>
  `;

  // Add confetti effect
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: ${['#ffd700', '#ff8c00', '#ff6b6b', '#4ecdc4', '#a855f7', '#4a9eff'][i % 6]};
      left: ${Math.random() * 100}%;
      top: -10px;
      transform: rotate(${Math.random() * 360}deg);
      animation: confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite;
    `;
    overlay.appendChild(confetti);
  }

  // Add keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-fall {
      to {
        top: 110%;
        transform: rotate(${360 + Math.random() * 720}deg);
      }
    }
  `;
  document.head.appendChild(style);

  system.container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    const content = document.getElementById('celebration-content');
    if (content) {
      content.style.transform = 'scale(1)';
      content.style.opacity = '1';
    }
  });

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('celebration-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          style.remove();
        }, 500);
      };
    }
  }, 0);

  // Auto-close after 10 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 500);
    }
  }, 10000);
}

/**
 * Show the completion badge
 */
function showCompletionBadge(system: CompletionSystem): void {
  if (system.badge) return;

  const badge = document.createElement('div');
  badge.id = 'completion-badge';
  badge.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2));
    border: 1px solid rgba(255, 215, 0, 0.4);
    border-radius: 20px;
    padding: 8px 16px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #ffd700;
    z-index: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  badge.innerHTML = `
    <span style="font-size: 16px;">🏆</span>
    <span>Complete!</span>
  `;

  badge.title = 'You have viewed all 31 exhibits';

  system.container.appendChild(badge);
  system.badge = badge;
}

/**
 * Get completion progress
 */
export function getCompletionProgress(viewedExhibits: Set<number>): { viewed: number; total: number; percent: number } {
  const viewed = viewedExhibits.size;
  return {
    viewed,
    total: TOTAL_EXHIBITS,
    percent: Math.round((viewed / TOTAL_EXHIBITS) * 100),
  };
}

// ============================================================================
// Persistence
// ============================================================================

interface CompletionState {
  isComplete: boolean;
  hasShownCelebration: boolean;
}

function loadCompletionState(): CompletionState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return { isComplete: false, hasShownCelebration: false };
}

function saveCompletionState(system: CompletionSystem): void {
  try {
    const state: CompletionState = {
      isComplete: system.isComplete,
      hasShownCelebration: system.hasShownCelebration,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeCompletionSystem(system: CompletionSystem): void {
  system.cleanup();
}
