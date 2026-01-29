/**
 * Comparisons
 *
 * Side-by-side comparison view for exhibits.
 * Compare two pieces of art simultaneously.
 */

// ============================================================================
// Types
// ============================================================================

export interface ComparisonSlot {
  dayNumber: number;
  thumbnail?: string;
}

export interface ComparisonSystem {
  container: HTMLElement;
  leftSlot: ComparisonSlot | null;
  rightSlot: ComparisonSlot | null;
  isCompareMode: boolean;
  panel: HTMLElement | null;
  onNavigate: ((dayNumber: number) => void) | null;
  onCapture: ((dayNumber: number) => Promise<string | null>) | null;
  cleanup: () => void;
}

// ============================================================================
// Comparison System Creation
// ============================================================================

/**
 * Create the comparison system
 */
export function createComparisonSystem(container: HTMLElement): ComparisonSystem {
  const system: ComparisonSystem = {
    container,
    leftSlot: null,
    rightSlot: null,
    isCompareMode: false,
    panel: null,
    onNavigate: null,
    onCapture: null,
    cleanup: () => {
      closeComparisonPanel(system);
      exitCompareMode(system);
    },
  };

  return system;
}

/**
 * Add exhibit to comparison
 */
export function addToComparison(system: ComparisonSystem, dayNumber: number): 'left' | 'right' | 'full' {
  if (!system.leftSlot) {
    system.leftSlot = { dayNumber };
    return 'left';
  } else if (!system.rightSlot) {
    system.rightSlot = { dayNumber };
    return 'right';
  } else {
    // Replace right slot
    system.rightSlot = { dayNumber };
    return 'full';
  }
}

/**
 * Remove from comparison
 */
export function removeFromComparison(system: ComparisonSystem, slot: 'left' | 'right'): void {
  if (slot === 'left') {
    system.leftSlot = system.rightSlot;
    system.rightSlot = null;
  } else {
    system.rightSlot = null;
  }
}

/**
 * Clear comparison
 */
export function clearComparison(system: ComparisonSystem): void {
  system.leftSlot = null;
  system.rightSlot = null;
}

/**
 * Check if exhibit is in comparison
 */
export function isInComparison(system: ComparisonSystem, dayNumber: number): boolean {
  return system.leftSlot?.dayNumber === dayNumber || system.rightSlot?.dayNumber === dayNumber;
}

/**
 * Open comparison panel
 */
export function openComparisonPanel(system: ComparisonSystem): void {
  closeComparisonPanel(system);

  const panel = document.createElement('div');
  panel.id = 'comparison-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 200, 150, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 200, 150, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          ⚖️ Compare Exhibits
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          View two exhibits side by side
        </div>
      </div>
      <button id="comparison-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 20px; display: flex; gap: 15px;">
      <!-- Left slot -->
      <div style="flex: 1;">
        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Left</div>
        ${system.leftSlot ? `
          <div style="
            background: rgba(100, 200, 150, 0.1);
            border: 1px solid rgba(100, 200, 150, 0.3);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
          ">
            <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
            <div style="font-size: 14px; font-weight: bold; color: white;">
              Day ${system.leftSlot.dayNumber}
            </div>
            <button class="remove-slot" data-slot="left" style="
              margin-top: 10px;
              background: rgba(255, 100, 100, 0.2);
              border: 1px solid rgba(255, 100, 100, 0.3);
              border-radius: 4px;
              padding: 5px 10px;
              color: #ff8080;
              font-size: 10px;
              cursor: pointer;
            ">Remove</button>
          </div>
        ` : `
          <div style="
            background: rgba(100, 100, 100, 0.1);
            border: 2px dashed rgba(100, 100, 100, 0.3);
            border-radius: 10px;
            padding: 30px;
            text-align: center;
          ">
            <div style="font-size: 24px; color: #666;">+</div>
            <div style="font-size: 11px; color: #666; margin-top: 8px;">
              Press = when viewing
            </div>
          </div>
        `}
      </div>

      <!-- VS divider -->
      <div style="
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666;
        font-weight: bold;
      ">
        VS
      </div>

      <!-- Right slot -->
      <div style="flex: 1;">
        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Right</div>
        ${system.rightSlot ? `
          <div style="
            background: rgba(100, 200, 150, 0.1);
            border: 1px solid rgba(100, 200, 150, 0.3);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
          ">
            <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
            <div style="font-size: 14px; font-weight: bold; color: white;">
              Day ${system.rightSlot.dayNumber}
            </div>
            <button class="remove-slot" data-slot="right" style="
              margin-top: 10px;
              background: rgba(255, 100, 100, 0.2);
              border: 1px solid rgba(255, 100, 100, 0.3);
              border-radius: 4px;
              padding: 5px 10px;
              color: #ff8080;
              font-size: 10px;
              cursor: pointer;
            ">Remove</button>
          </div>
        ` : `
          <div style="
            background: rgba(100, 100, 100, 0.1);
            border: 2px dashed rgba(100, 100, 100, 0.3);
            border-radius: 10px;
            padding: 30px;
            text-align: center;
          ">
            <div style="font-size: 24px; color: #666;">+</div>
            <div style="font-size: 11px; color: #666; margin-top: 8px;">
              Press = when viewing
            </div>
          </div>
        `}
      </div>
    </div>

    <div style="
      padding: 15px;
      border-top: 1px solid rgba(100, 200, 150, 0.1);
      display: flex;
      gap: 10px;
    ">
      <button id="clear-comparison" style="
        flex: 1;
        padding: 12px;
        background: rgba(100, 100, 100, 0.2);
        border: 1px solid rgba(100, 100, 100, 0.3);
        border-radius: 8px;
        color: #888;
        font-size: 12px;
        cursor: pointer;
      ">Clear All</button>
      <button id="start-compare" style="
        flex: 2;
        padding: 12px;
        background: ${system.leftSlot && system.rightSlot ? 'rgba(100, 200, 150, 0.3)' : 'rgba(100, 100, 100, 0.1)'};
        border: 1px solid ${system.leftSlot && system.rightSlot ? 'rgba(100, 200, 150, 0.4)' : 'rgba(100, 100, 100, 0.2)'};
        border-radius: 8px;
        color: ${system.leftSlot && system.rightSlot ? 'white' : '#666'};
        font-size: 12px;
        cursor: ${system.leftSlot && system.rightSlot ? 'pointer' : 'not-allowed'};
      ">Start Comparison</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#comparison-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeComparisonPanel(system);

  // Wire up remove buttons
  const removeBtns = panel.querySelectorAll('.remove-slot');
  removeBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const slot = (btn as HTMLElement).dataset.slot as 'left' | 'right';
      removeFromComparison(system, slot);
      closeComparisonPanel(system);
      openComparisonPanel(system);
    };
  });

  // Wire up clear
  const clearBtn = panel.querySelector('#clear-comparison') as HTMLButtonElement;
  clearBtn.onclick = () => {
    clearComparison(system);
    closeComparisonPanel(system);
    openComparisonPanel(system);
  };

  // Wire up start compare
  const startBtn = panel.querySelector('#start-compare') as HTMLButtonElement;
  if (system.leftSlot && system.rightSlot) {
    startBtn.onclick = () => {
      closeComparisonPanel(system);
      enterCompareMode(system);
    };
  }

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeComparisonPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close comparison panel
 */
function closeComparisonPanel(system: ComparisonSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);
}

/**
 * Toggle comparison panel
 */
export function toggleComparisonPanel(system: ComparisonSystem): void {
  if (system.panel) {
    closeComparisonPanel(system);
  } else {
    openComparisonPanel(system);
  }
}

/**
 * Enter compare mode (split screen)
 */
export function enterCompareMode(system: ComparisonSystem): void {
  if (!system.leftSlot || !system.rightSlot) return;

  system.isCompareMode = true;

  const overlay = document.createElement('div');
  overlay.id = 'compare-mode-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    z-index: 900;
    display: flex;
    flex-direction: column;
    font-family: system-ui, sans-serif;
  `;

  overlay.innerHTML = `
    <div style="
      padding: 15px 20px;
      background: rgba(20, 20, 30, 0.9);
      border-bottom: 1px solid rgba(100, 200, 150, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="color: white; font-size: 14px;">
        ⚖️ Comparing Day ${system.leftSlot.dayNumber} vs Day ${system.rightSlot.dayNumber}
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="compare-swap" style="
          background: rgba(100, 200, 150, 0.2);
          border: 1px solid rgba(100, 200, 150, 0.3);
          border-radius: 6px;
          padding: 8px 15px;
          color: white;
          font-size: 12px;
          cursor: pointer;
        ">⇄ Swap</button>
        <button id="compare-exit" style="
          background: rgba(255, 100, 100, 0.2);
          border: 1px solid rgba(255, 100, 100, 0.3);
          border-radius: 6px;
          padding: 8px 15px;
          color: white;
          font-size: 12px;
          cursor: pointer;
        ">✕ Exit</button>
      </div>
    </div>

    <div style="flex: 1; display: flex;">
      <!-- Left side -->
      <div id="compare-left" style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: 1px solid rgba(100, 200, 150, 0.2);
      ">
        <div style="font-size: 24px; color: #888;">Day ${system.leftSlot.dayNumber}</div>
        <div style="font-size: 12px; color: #666; margin-top: 10px;">
          Click to view full
        </div>
      </div>

      <!-- Right side -->
      <div id="compare-right" style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      ">
        <div style="font-size: 24px; color: #888;">Day ${system.rightSlot.dayNumber}</div>
        <div style="font-size: 12px; color: #666; margin-top: 10px;">
          Click to view full
        </div>
      </div>
    </div>

    <div style="
      padding: 10px;
      background: rgba(20, 20, 30, 0.9);
      border-top: 1px solid rgba(100, 200, 150, 0.2);
      text-align: center;
      font-size: 11px;
      color: #666;
    ">
      Press Escape to exit comparison mode
    </div>
  `;

  system.container.appendChild(overlay);

  // Wire up swap
  const swapBtn = overlay.querySelector('#compare-swap') as HTMLButtonElement;
  swapBtn.onclick = () => {
    const temp = system.leftSlot;
    system.leftSlot = system.rightSlot;
    system.rightSlot = temp;
    exitCompareMode(system);
    enterCompareMode(system);
  };

  // Wire up exit
  const exitBtn = overlay.querySelector('#compare-exit') as HTMLButtonElement;
  exitBtn.onclick = () => exitCompareMode(system);

  // Wire up side clicks
  const leftSide = overlay.querySelector('#compare-left') as HTMLElement;
  const rightSide = overlay.querySelector('#compare-right') as HTMLElement;

  leftSide.onclick = () => {
    if (system.onNavigate && system.leftSlot) {
      exitCompareMode(system);
      system.onNavigate(system.leftSlot.dayNumber);
    }
  };
  leftSide.style.cursor = 'pointer';

  rightSide.onclick = () => {
    if (system.onNavigate && system.rightSlot) {
      exitCompareMode(system);
      system.onNavigate(system.rightSlot.dayNumber);
    }
  };
  rightSide.style.cursor = 'pointer';

  // Escape to exit
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      exitCompareMode(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Exit compare mode
 */
export function exitCompareMode(system: ComparisonSystem): void {
  system.isCompareMode = false;

  const overlay = document.getElementById('compare-mode-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }
}

/**
 * Get comparison status
 */
export function getComparisonStatus(system: ComparisonSystem): {
  left: number | null;
  right: number | null;
  canCompare: boolean;
} {
  return {
    left: system.leftSlot?.dayNumber || null,
    right: system.rightSlot?.dayNumber || null,
    canCompare: !!(system.leftSlot && system.rightSlot),
  };
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeComparisonSystem(system: ComparisonSystem): void {
  system.cleanup();
}
