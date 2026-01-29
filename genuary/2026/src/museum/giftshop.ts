/**
 * Virtual Gift Shop
 *
 * Allows visitors to "purchase" digital items like
 * prints, posters, and postcards of their favorite exhibits.
 */

// ============================================================================
// Types
// ============================================================================

export interface GiftItem {
  id: string;
  type: 'print' | 'poster' | 'postcard' | 'wallpaper';
  dayNumber: number;
  createdAt: number;
  size?: string;
}

export interface GiftShopSystem {
  container: HTMLElement;
  collection: GiftItem[];
  popup: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-giftshop';

const ITEM_TYPES = [
  { type: 'print', name: 'Art Print', icon: '🖼️', description: '8x10 gallery print' },
  { type: 'poster', name: 'Poster', icon: '📜', description: 'Large 24x36 poster' },
  { type: 'postcard', name: 'Postcard', icon: '💌', description: 'Mini collectible card' },
  { type: 'wallpaper', name: 'Wallpaper', icon: '🖥️', description: 'Desktop wallpaper' },
] as const;

// ============================================================================
// Gift Shop Creation
// ============================================================================

/**
 * Create the gift shop system
 */
export function createGiftShopSystem(container: HTMLElement): GiftShopSystem {
  const saved = loadCollection();

  const system: GiftShopSystem = {
    container,
    collection: saved || [],
    popup: null,
    isOpen: false,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Toggle with Shift+G
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyG' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeGiftShop(system);
      } else {
        openGiftShop(system);
      }
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
 * Open the gift shop popup
 */
export function openGiftShop(system: GiftShopSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'giftshop-popup';
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-height: 550px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 182, 73, 0.4);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const collectionByDay = new Map<number, GiftItem[]>();
  system.collection.forEach(item => {
    const items = collectionByDay.get(item.dayNumber) || [];
    items.push(item);
    collectionByDay.set(item.dayNumber, items);
  });

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(255, 182, 73, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, rgba(255, 182, 73, 0.1), transparent);
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        🛍️ Gift Shop Collection
      </div>
      <button id="giftshop-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px; max-height: 450px; overflow-y: auto;">
      ${system.collection.length === 0 ? `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <div style="font-size: 40px; margin-bottom: 15px;">🎨</div>
          <div style="font-size: 13px; margin-bottom: 10px;">Your collection is empty</div>
          <div style="font-size: 11px; color: #555;">
            While viewing an exhibit, press <b>+</b> to add items
          </div>
        </div>
      ` : `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #888; margin-bottom: 10px;">
            ${system.collection.length} item${system.collection.length > 1 ? 's' : ''} collected
          </div>
        </div>

        ${Array.from(collectionByDay.entries()).map(([dayNumber, items]) => `
          <div style="margin-bottom: 15px;">
            <div style="
              font-size: 12px;
              color: #ffb649;
              font-weight: bold;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span>Day ${dayNumber}</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${items.map(item => {
                const typeInfo = ITEM_TYPES.find(t => t.type === item.type);
                return `
                  <div class="gift-item" data-id="${item.id}" style="
                    padding: 8px 12px;
                    background: rgba(40, 40, 60, 0.5);
                    border: 1px solid rgba(255, 182, 73, 0.2);
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                  " onmouseover="this.style.borderColor='rgba(255, 182, 73, 0.5)'"
                     onmouseout="this.style.borderColor='rgba(255, 182, 73, 0.2)'">
                    <span>${typeInfo?.icon || '📦'}</span>
                    <span style="margin-left: 4px;">${typeInfo?.name || item.type}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}

        <button id="clear-collection" style="
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: rgba(255, 100, 100, 0.1);
          border: 1px solid rgba(255, 100, 100, 0.3);
          border-radius: 6px;
          color: #ff8888;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        ">Clear Collection</button>
      `}
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  setTimeout(() => {
    const closeBtn = document.getElementById('giftshop-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeGiftShop(system);
    }

    const clearBtn = document.getElementById('clear-collection');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (confirm('Clear your entire collection?')) {
          system.collection = [];
          saveCollection(system);
          closeGiftShop(system);
          openGiftShop(system);
        }
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeGiftShop(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the gift shop popup
 */
export function closeGiftShop(system: GiftShopSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Show add item menu
 */
export function showAddItemMenu(
  system: GiftShopSystem,
  dayNumber: number,
  x: number,
  y: number
): void {
  // Remove existing menu
  const existing = document.getElementById('giftshop-add-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'giftshop-add-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 182, 73, 0.4);
    border-radius: 8px;
    padding: 8px;
    font-family: system-ui, sans-serif;
    z-index: 1000;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.2s;
  `;

  menu.innerHTML = `
    <div style="
      font-size: 10px;
      color: #888;
      padding: 4px 8px;
      border-bottom: 1px solid rgba(255, 182, 73, 0.2);
      margin-bottom: 4px;
    ">Add to Collection</div>
    ${ITEM_TYPES.map(type => `
      <div class="add-item-option" data-type="${type.type}" style="
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(255, 182, 73, 0.2)'"
         onmouseout="this.style.background='transparent'">
        <span style="font-size: 16px;">${type.icon}</span>
        <div>
          <div style="font-size: 12px; color: white;">${type.name}</div>
          <div style="font-size: 10px; color: #666;">${type.description}</div>
        </div>
      </div>
    `).join('')}
  `;

  document.body.appendChild(menu);

  // Animate in
  requestAnimationFrame(() => {
    menu.style.opacity = '1';
    menu.style.transform = 'scale(1)';
  });

  // Wire up clicks
  const options = menu.querySelectorAll('.add-item-option');
  options.forEach(opt => {
    (opt as HTMLElement).onclick = () => {
      const type = (opt as HTMLElement).dataset.type as GiftItem['type'];
      addToCollection(system, dayNumber, type);
      menu.remove();
    };
  });

  // Close on click outside
  const closeHandler = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeHandler);
  }, 100);
}

/**
 * Add item to collection
 */
export function addToCollection(
  system: GiftShopSystem,
  dayNumber: number,
  type: GiftItem['type']
): void {
  const item: GiftItem = {
    id: `${type}-${dayNumber}-${Date.now()}`,
    type,
    dayNumber,
    createdAt: Date.now(),
  };

  system.collection.push(item);
  saveCollection(system);

  // Show notification
  const typeInfo = ITEM_TYPES.find(t => t.type === type);
  showGiftNotification(system, `${typeInfo?.icon} ${typeInfo?.name} added to collection!`);
}

/**
 * Get collection count
 */
export function getCollectionCount(system: GiftShopSystem): number {
  return system.collection.length;
}

/**
 * Show notification
 */
function showGiftNotification(system: GiftShopSystem, message: string): void {
  const existing = document.getElementById('gift-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'gift-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 182, 73, 0.95);
    color: #1a1a2e;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    font-weight: bold;
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s;
  `;
  notification.textContent = message;

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ============================================================================
// Persistence
// ============================================================================

function loadCollection(): GiftItem[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveCollection(system: GiftShopSystem): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system.collection));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeGiftShopSystem(system: GiftShopSystem): void {
  system.cleanup();
}
