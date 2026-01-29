/**
 * Bookmarks System
 *
 * Save and recall favorite camera positions in the museum.
 * Quick way to return to specific viewpoints.
 */

import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

export interface Bookmark {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  dayNumber: number | null;
  timestamp: number;
}

export interface BookmarksSystem {
  container: HTMLElement;
  bookmarks: Bookmark[];
  popup: HTMLElement | null;
  indicator: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((bookmark: Bookmark) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-bookmarks';
const MAX_BOOKMARKS = 20;

// ============================================================================
// Bookmarks System Creation
// ============================================================================

/**
 * Create the bookmarks system
 */
export function createBookmarksSystem(container: HTMLElement): BookmarksSystem {
  const savedBookmarks = loadBookmarks();

  const system: BookmarksSystem = {
    container,
    bookmarks: savedBookmarks,
    popup: null,
    indicator: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
    },
  };

  // Create indicator
  createBookmarkIndicator(system);

  // Open with Shift+B
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyB' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeBookmarks(system);
      } else {
        openBookmarks(system);
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
 * Create the bookmark indicator
 */
function createBookmarkIndicator(system: BookmarksSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'bookmarks-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(255, 180, 100, 0.3);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    color: #ffb464;
    cursor: pointer;
    z-index: 400;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  indicator.innerHTML = `
    <span>🔖</span>
    <span id="bookmarks-count">${system.bookmarks.length}</span>
  `;
  indicator.title = 'Click or Shift+B to manage bookmarks';

  indicator.onclick = () => {
    if (system.isOpen) {
      closeBookmarks(system);
    } else {
      openBookmarks(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(255, 180, 100, 0.6)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(255, 180, 100, 0.3)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Update the indicator count
 */
function updateIndicator(system: BookmarksSystem): void {
  const countEl = document.getElementById('bookmarks-count');
  if (countEl) {
    countEl.textContent = system.bookmarks.length.toString();
  }
}

/**
 * Open the bookmarks popup
 */
export function openBookmarks(system: BookmarksSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'bookmarks-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 20px;
    width: 280px;
    max-height: 400px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 180, 100, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(255, 180, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        🔖 Bookmarks
      </div>
      <button id="bookmarks-close" style="
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

    <div id="bookmarks-list" style="
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    ">
      ${system.bookmarks.length === 0 ? `
        <div style="
          text-align: center;
          padding: 30px 15px;
          color: #666;
        ">
          <div style="font-size: 24px; margin-bottom: 8px;">🔖</div>
          <div style="font-size: 12px;">No bookmarks yet.</div>
          <div style="font-size: 11px; margin-top: 5px; color: #555;">
            Press Ctrl+B to save current position.
          </div>
        </div>
      ` : system.bookmarks.map((bookmark, index) => `
        <div class="bookmark-item" data-index="${index}" style="
          display: flex;
          align-items: center;
          padding: 10px;
          margin-bottom: 6px;
          background: rgba(40, 40, 60, 0.5);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        ">
          <div style="flex: 1;">
            <div style="font-size: 13px; color: white;">${bookmark.name}</div>
            <div style="font-size: 10px; color: #666; margin-top: 2px;">
              ${bookmark.dayNumber ? `Day ${bookmark.dayNumber} · ` : ''}${formatDate(bookmark.timestamp)}
            </div>
          </div>
          <button class="bookmark-delete" data-index="${index}" style="
            background: rgba(255, 100, 100, 0.2);
            border: none;
            color: #ff6b6b;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;
          ">×</button>
        </div>
      `).join('')}
    </div>

    <div style="
      padding: 10px;
      border-top: 1px solid rgba(255, 180, 100, 0.2);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Ctrl+B to save current position
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';
  });

  // Wire up interactions
  wireUpBookmarks(system);
}

/**
 * Wire up bookmark interactions
 */
function wireUpBookmarks(system: BookmarksSystem): void {
  if (!system.popup) return;

  setTimeout(() => {
    const closeBtn = document.getElementById('bookmarks-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeBookmarks(system);
    }

    const items = system.popup?.querySelectorAll('.bookmark-item');
    items?.forEach(item => {
      (item as HTMLElement).onmouseover = () => {
        (item as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
      };
      (item as HTMLElement).onmouseout = () => {
        (item as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      };
      (item as HTMLElement).onclick = (e) => {
        // Check if delete button was clicked
        if ((e.target as HTMLElement).classList.contains('bookmark-delete')) {
          return;
        }
        const index = parseInt((item as HTMLElement).dataset.index || '0', 10);
        const bookmark = system.bookmarks[index];
        if (bookmark && system.onNavigate) {
          system.onNavigate(bookmark);
          closeBookmarks(system);
        }
      };
    });

    const deleteButtons = system.popup?.querySelectorAll('.bookmark-delete');
    deleteButtons?.forEach(btn => {
      (btn as HTMLElement).onmouseover = () => {
        (btn as HTMLElement).style.opacity = '1';
      };
      (btn as HTMLElement).onmouseout = () => {
        (btn as HTMLElement).style.opacity = '0.6';
      };
      (btn as HTMLElement).onclick = (e) => {
        e.stopPropagation();
        const index = parseInt((btn as HTMLElement).dataset.index || '0', 10);
        deleteBookmark(system, index);
        closeBookmarks(system);
        openBookmarks(system);
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBookmarks(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Close on click outside
  setTimeout(() => {
    const clickHandler = (e: MouseEvent) => {
      if (system.popup && !system.popup.contains(e.target as Node) && e.target !== system.indicator) {
        closeBookmarks(system);
        document.removeEventListener('click', clickHandler);
      }
    };
    document.addEventListener('click', clickHandler);
  }, 100);
}

/**
 * Close the bookmarks popup
 */
export function closeBookmarks(system: BookmarksSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  system.popup.style.transform = 'translateY(10px)';
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
 * Add a bookmark
 */
export function addBookmark(
  system: BookmarksSystem,
  camera: THREE.Camera,
  dayNumber: number | null,
  customName?: string
): void {
  if (system.bookmarks.length >= MAX_BOOKMARKS) {
    // Remove oldest
    system.bookmarks.pop();
  }

  const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');

  const bookmark: Bookmark = {
    id: `bookmark-${Date.now()}`,
    name: customName || (dayNumber ? `Day ${dayNumber}` : `Position ${system.bookmarks.length + 1}`),
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    rotation: {
      x: euler.x,
      y: euler.y,
      z: euler.z,
    },
    dayNumber,
    timestamp: Date.now(),
  };

  system.bookmarks.unshift(bookmark);
  saveBookmarks(system);
  updateIndicator(system);
}

/**
 * Delete a bookmark
 */
function deleteBookmark(system: BookmarksSystem, index: number): void {
  system.bookmarks.splice(index, 1);
  saveBookmarks(system);
  updateIndicator(system);
}

/**
 * Get all bookmarks
 */
export function getBookmarks(system: BookmarksSystem): Bookmark[] {
  return [...system.bookmarks];
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// Persistence
// ============================================================================

function loadBookmarks(): Bookmark[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return [];
}

function saveBookmarks(system: BookmarksSystem): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system.bookmarks));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeBookmarksSystem(system: BookmarksSystem): void {
  system.cleanup();
}
