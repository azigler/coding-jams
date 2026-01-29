/**
 * Wish List
 *
 * Track exhibits you want to revisit later,
 * separate from favorites for better organization.
 */

// ============================================================================
// Types
// ============================================================================

export interface WishListSystem {
  container: HTMLElement;
  items: Set<number>;
  indicator: HTMLElement | null;
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-wishlist';

// ============================================================================
// Wish List System Creation
// ============================================================================

/**
 * Create the wish list system
 */
export function createWishListSystem(container: HTMLElement): WishListSystem {
  const saved = loadWishList();

  const system: WishListSystem = {
    container,
    items: saved,
    indicator: null,
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      closeWishList(system);
    },
  };

  // Create indicator if there are items
  if (system.items.size > 0) {
    createIndicator(system);
  }

  return system;
}

/**
 * Create the wish list indicator
 */
function createIndicator(system: WishListSystem): void {
  if (system.indicator) return;

  const indicator = document.createElement('div');
  indicator.id = 'wishlist-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 140px;
    left: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #64c8ff;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  updateIndicatorContent(system, indicator);

  indicator.onclick = () => toggleWishList(system);

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(100, 200, 255, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(100, 200, 255, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update indicator content
 */
function updateIndicatorContent(system: WishListSystem, indicator: HTMLElement): void {
  indicator.innerHTML = `
    <span style="font-size: 14px;">📌</span>
    <span>${system.items.size} to revisit</span>
  `;
  indicator.title = 'Click to view wish list (Shift+W)';
}

/**
 * Add to wish list
 */
export function addToWishList(system: WishListSystem, dayNumber: number): boolean {
  if (system.items.has(dayNumber)) {
    return false;
  }

  system.items.add(dayNumber);
  saveWishList(system.items);

  if (!system.indicator) {
    createIndicator(system);
  } else {
    updateIndicatorContent(system, system.indicator);
  }

  return true;
}

/**
 * Remove from wish list
 */
export function removeFromWishList(system: WishListSystem, dayNumber: number): boolean {
  if (!system.items.has(dayNumber)) {
    return false;
  }

  system.items.delete(dayNumber);
  saveWishList(system.items);

  if (system.indicator) {
    if (system.items.size === 0) {
      system.indicator.remove();
      system.indicator = null;
    } else {
      updateIndicatorContent(system, system.indicator);
    }
  }

  return true;
}

/**
 * Toggle wish list item
 */
export function toggleWishListItem(system: WishListSystem, dayNumber: number): boolean {
  if (system.items.has(dayNumber)) {
    removeFromWishList(system, dayNumber);
    return false;
  } else {
    addToWishList(system, dayNumber);
    return true;
  }
}

/**
 * Check if in wish list
 */
export function isInWishList(system: WishListSystem, dayNumber: number): boolean {
  return system.items.has(dayNumber);
}

/**
 * Toggle wish list panel
 */
export function toggleWishList(system: WishListSystem): void {
  if (system.isOpen) {
    closeWishList(system);
  } else {
    openWishList(system);
  }
}

/**
 * Open wish list panel
 */
function openWishList(system: WishListSystem): void {
  if (system.panel) return;

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'wishlist-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    max-height: 450px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const items = Array.from(system.items).sort((a, b) => a - b);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          📌 Wish List
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${items.length} exhibits to revisit
        </div>
      </div>
      <button id="wishlist-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    ">
      ${items.length === 0 ? `
        <div style="
          text-align: center;
          padding: 30px;
          color: #666;
          font-size: 12px;
        ">
          No items in your wish list yet.<br>
          Press W while viewing an exhibit to add it.
        </div>
      ` : items.map(dayNumber => `
        <div class="wishlist-item" data-day="${dayNumber}" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(100, 200, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div>
            <div style="font-size: 14px; font-weight: bold; color: white;">Day ${dayNumber}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="wishlist-go" data-day="${dayNumber}" style="
              background: rgba(100, 200, 255, 0.2);
              border: 1px solid rgba(100, 200, 255, 0.3);
              border-radius: 6px;
              padding: 6px 12px;
              color: white;
              font-size: 11px;
              cursor: pointer;
            ">Visit</button>
            <button class="wishlist-remove" data-day="${dayNumber}" style="
              background: rgba(255, 100, 100, 0.2);
              border: 1px solid rgba(255, 100, 100, 0.3);
              border-radius: 6px;
              padding: 6px 8px;
              color: #ff6b6b;
              font-size: 11px;
              cursor: pointer;
            ">×</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close button
  const closeBtn = panel.querySelector('#wishlist-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeWishList(system);

  // Wire up visit buttons
  const goButtons = panel.querySelectorAll('.wishlist-go');
  goButtons.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const dayNumber = parseInt((btn as HTMLElement).dataset.day || '0');
      if (dayNumber > 0 && system.onNavigate) {
        system.onNavigate(dayNumber);
        closeWishList(system);
      }
    };
  });

  // Wire up remove buttons
  const removeButtons = panel.querySelectorAll('.wishlist-remove');
  removeButtons.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const dayNumber = parseInt((btn as HTMLElement).dataset.day || '0');
      if (dayNumber > 0) {
        removeFromWishList(system, dayNumber);
        // Refresh panel
        closeWishList(system);
        openWishList(system);
      }
    };
  });

  // Wire up item hover
  const items2 = panel.querySelectorAll('.wishlist-item');
  items2.forEach(item => {
    (item as HTMLElement).onmouseover = () => {
      (item as HTMLElement).style.background = 'rgba(100, 200, 255, 0.2)';
    };
    (item as HTMLElement).onmouseout = () => {
      (item as HTMLElement).style.background = 'rgba(100, 200, 255, 0.1)';
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeWishList(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close wish list panel
 */
function closeWishList(system: WishListSystem): void {
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
 * Get wish list items
 */
export function getWishList(system: WishListSystem): number[] {
  return Array.from(system.items).sort((a, b) => a - b);
}

// ============================================================================
// Persistence
// ============================================================================

function loadWishList(): Set<number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
  } catch {
    // Ignore
  }
  return new Set();
}

function saveWishList(items: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(items)));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeWishListSystem(system: WishListSystem): void {
  system.cleanup();
}
