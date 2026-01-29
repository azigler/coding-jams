/**
 * Museum Tips System
 *
 * Shows contextual tips to help users discover features.
 */

// ============================================================================
// Types
// ============================================================================

export interface TipsSystem {
  container: HTMLElement;
  shownTips: Set<string>;
  tipQueue: string[];
  currentTip: HTMLElement | null;
  cleanup: () => void;
}

interface Tip {
  id: string;
  text: string;
  condition?: () => boolean; // When to show this tip
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-tips';
const TIP_DISPLAY_TIME = 6000; // 6 seconds
const TIP_FADE_TIME = 500;

const TIPS: Tip[] = [
  { id: 'wasd', text: 'Use WASD keys to move around the museum' },
  { id: 'click-zoom', text: 'Click on any exhibit to zoom in for a closer look' },
  { id: 'browse', text: 'While zoomed, use [ ] keys to browse through exhibits' },
  { id: 'random', text: 'Press R to discover a random exhibit' },
  { id: 'tour', text: 'Press T to start a guided tour of the museum' },
  { id: 'favorite', text: 'Press F while viewing an exhibit to add it to favorites' },
  { id: 'jump-fav', text: 'Press J to jump between your favorited exhibits' },
  { id: 'screenshot', text: 'Press P to take a screenshot of your view' },
  { id: 'share', text: 'Press S to copy a shareable link to your current view' },
  { id: 'go-to-day', text: 'Press G to open a quick menu and jump to any day' },
  { id: 'teleport', text: 'Press number keys 1-5 to teleport to different areas' },
  { id: 'minimap', text: 'Check the minimap in the corner to see your location' },
  { id: 'settings', text: 'Click the gear icon to adjust quality and sound settings' },
  { id: 'discovery', text: 'Click the progress badge to see which exhibits you\'ve visited' },
  { id: 'fullscreen', text: 'Press F when walking around to toggle fullscreen mode' },
  { id: 'mute', text: 'Press M to quickly mute or unmute all sounds' },
];

// ============================================================================
// Tips System Creation
// ============================================================================

/**
 * Create the tips system
 */
export function createTipsSystem(container: HTMLElement): TipsSystem {
  const shownTips = loadShownTips();

  const system: TipsSystem = {
    container,
    shownTips,
    tipQueue: [],
    currentTip: null,
    cleanup: () => {},
  };

  // Start showing tips after a delay
  const initialDelay = setTimeout(() => {
    queueUnshownTips(system);
    showNextTip(system);
  }, 10000); // Wait 10 seconds before first tip

  // Show a new tip every 45 seconds if any remain
  const interval = setInterval(() => {
    if (system.tipQueue.length > 0) {
      showNextTip(system);
    }
  }, 45000);

  system.cleanup = () => {
    clearTimeout(initialDelay);
    clearInterval(interval);
    if (system.currentTip) {
      system.currentTip.remove();
    }
  };

  return system;
}

/**
 * Queue tips that haven't been shown yet
 */
function queueUnshownTips(system: TipsSystem): void {
  const unshown = TIPS.filter(tip => !system.shownTips.has(tip.id));
  // Shuffle the tips for variety
  for (let i = unshown.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unshown[i], unshown[j]] = [unshown[j], unshown[i]];
  }
  system.tipQueue = unshown.map(t => t.id);
}

/**
 * Show the next tip in the queue
 */
function showNextTip(system: TipsSystem): void {
  if (system.tipQueue.length === 0) return;
  if (system.currentTip) return; // Don't overlap tips

  const tipId = system.tipQueue.shift()!;
  const tip = TIPS.find(t => t.id === tipId);
  if (!tip) return;

  // Check condition if present
  if (tip.condition && !tip.condition()) {
    // Skip this tip and try next
    showNextTip(system);
    return;
  }

  showTip(system, tip);
}

/**
 * Display a tip
 */
function showTip(system: TipsSystem, tip: Tip): void {
  // Mark as shown
  system.shownTips.add(tip.id);
  saveShownTips(system.shownTips);

  // Create tip element
  const tipEl = document.createElement('div');
  tipEl.id = 'museum-tip';
  tipEl.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 35, 0.9);
    color: #d0d0e0;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    z-index: 150;
    max-width: 350px;
    text-align: center;
    border: 1px solid rgba(100, 150, 255, 0.3);
    opacity: 0;
    transition: opacity ${TIP_FADE_TIME}ms;
    pointer-events: none;
  `;
  tipEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
      <span style="color: #4a9eff;">💡</span>
      <span>${tip.text}</span>
    </div>
  `;

  system.container.appendChild(tipEl);
  system.currentTip = tipEl;

  // Fade in
  requestAnimationFrame(() => {
    tipEl.style.opacity = '1';
  });

  // Fade out and remove
  setTimeout(() => {
    tipEl.style.opacity = '0';
    setTimeout(() => {
      tipEl.remove();
      system.currentTip = null;
    }, TIP_FADE_TIME);
  }, TIP_DISPLAY_TIME);
}

// ============================================================================
// Manual Tip Triggers
// ============================================================================

/**
 * Show a specific tip now (if not already shown)
 */
export function showSpecificTip(system: TipsSystem, tipId: string): void {
  if (system.shownTips.has(tipId)) return;
  const tip = TIPS.find(t => t.id === tipId);
  if (tip) {
    showTip(system, tip);
  }
}

/**
 * Mark a tip as shown without displaying it
 */
export function markTipShown(system: TipsSystem, tipId: string): void {
  system.shownTips.add(tipId);
  saveShownTips(system.shownTips);
  // Remove from queue if present
  const idx = system.tipQueue.indexOf(tipId);
  if (idx !== -1) {
    system.tipQueue.splice(idx, 1);
  }
}

// ============================================================================
// Persistence
// ============================================================================

/**
 * Load shown tips from localStorage
 */
function loadShownTips(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch {
    // localStorage may not be available
  }
  return new Set();
}

/**
 * Save shown tips to localStorage
 */
function saveShownTips(tips: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...tips]));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose tips system
 */
export function disposeTipsSystem(system: TipsSystem): void {
  system.cleanup();
}
