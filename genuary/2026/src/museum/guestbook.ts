/**
 * Museum Guestbook
 *
 * Local guestbook for visitors to leave comments about exhibits.
 * Stored in localStorage.
 */

// ============================================================================
// Types
// ============================================================================

export interface GuestbookEntry {
  id: string;
  dayNumber: number;
  message: string;
  timestamp: number;
}

export interface Guestbook {
  container: HTMLElement;
  entries: GuestbookEntry[];
  isOpen: boolean;
  popup: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-guestbook';
const MAX_ENTRIES = 100;
const MAX_MESSAGE_LENGTH = 280;

// ============================================================================
// Guestbook Creation
// ============================================================================

/**
 * Create the guestbook system
 */
export function createGuestbook(container: HTMLElement): Guestbook {
  const entries = loadEntries();

  const guestbook: Guestbook = {
    container,
    entries,
    isOpen: false,
    popup: null,
    cleanup: () => {
      if (guestbook.popup) {
        guestbook.popup.remove();
        guestbook.popup = null;
      }
    },
  };

  // Handle L key for guestbook (L for Log)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyL' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      toggleGuestbook(guestbook);
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = guestbook.cleanup;
  guestbook.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return guestbook;
}

/**
 * Toggle guestbook visibility
 */
export function toggleGuestbook(guestbook: Guestbook, dayNumber?: number): void {
  if (guestbook.isOpen) {
    closeGuestbook(guestbook);
  } else {
    openGuestbook(guestbook, dayNumber);
  }
}

/**
 * Open the guestbook
 */
function openGuestbook(guestbook: Guestbook, filterDay?: number): void {
  if (guestbook.popup) return;

  const popup = document.createElement('div');
  popup.id = 'guestbook-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    max-height: 80vh;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px;
    border-bottom: 1px solid rgba(100, 150, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <div>
      <h2 style="margin: 0; font-size: 18px; color: white;">📖 Guestbook</h2>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
        ${guestbook.entries.length} ${guestbook.entries.length === 1 ? 'entry' : 'entries'}
      </p>
    </div>
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
  `;
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => closeGuestbook(guestbook);
  header.appendChild(closeBtn);

  popup.appendChild(header);

  // Add entry form
  const form = document.createElement('div');
  form.style.cssText = `
    padding: 15px 20px;
    border-bottom: 1px solid rgba(100, 150, 255, 0.2);
  `;
  form.innerHTML = `
    <div style="margin-bottom: 10px;">
      <label style="font-size: 12px; color: #888;">Leave a message:</label>
    </div>
    <div style="display: flex; gap: 10px;">
      <select id="guestbook-day" style="
        background: rgba(40, 40, 60, 0.8);
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 6px;
        padding: 8px;
        color: white;
        font-size: 12px;
      ">
        <option value="0">General</option>
        ${Array.from({ length: 31 }, (_, i) => i + 1).map(d =>
          `<option value="${d}"${filterDay === d ? ' selected' : ''}>Day ${d}</option>`
        ).join('')}
      </select>
      <input type="text" id="guestbook-message" maxlength="${MAX_MESSAGE_LENGTH}" placeholder="Your thoughts..." style="
        flex: 1;
        background: rgba(40, 40, 60, 0.8);
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 6px;
        padding: 8px 12px;
        color: white;
        font-size: 13px;
      ">
      <button id="guestbook-submit" style="
        background: linear-gradient(135deg, #4a9eff, #a855f7);
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        color: white;
        font-size: 13px;
        cursor: pointer;
      ">Post</button>
    </div>
  `;
  popup.appendChild(form);

  // Wire up form submission
  setTimeout(() => {
    const submitBtn = document.getElementById('guestbook-submit');
    const messageInput = document.getElementById('guestbook-message') as HTMLInputElement;
    const daySelect = document.getElementById('guestbook-day') as HTMLSelectElement;

    if (submitBtn && messageInput && daySelect) {
      const submit = () => {
        const message = messageInput.value.trim();
        const day = parseInt(daySelect.value, 10);

        if (message) {
          addEntry(guestbook, day, message);
          messageInput.value = '';
          // Refresh the entries display
          closeGuestbook(guestbook);
          openGuestbook(guestbook, filterDay);
        }
      };

      submitBtn.onclick = submit;
      messageInput.onkeydown = (e) => {
        if (e.key === 'Enter') submit();
      };
    }
  }, 0);

  // Entries list
  const entriesList = document.createElement('div');
  entriesList.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 15px 20px;
  `;

  const filteredEntries = filterDay
    ? guestbook.entries.filter(e => e.dayNumber === filterDay)
    : guestbook.entries;

  if (filteredEntries.length === 0) {
    entriesList.innerHTML = `
      <div style="text-align: center; color: #666; padding: 30px;">
        <div style="font-size: 32px; margin-bottom: 10px;">📝</div>
        <p>No entries yet. Be the first!</p>
      </div>
    `;
  } else {
    filteredEntries
      .slice()
      .reverse()
      .forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.style.cssText = `
          background: rgba(40, 40, 60, 0.5);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        `;

        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        entryEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="
              font-size: 11px;
              color: ${entry.dayNumber > 0 ? '#4a9eff' : '#888'};
            ">${entry.dayNumber > 0 ? `Day ${entry.dayNumber}` : 'General'}</span>
            <span style="font-size: 10px; color: #666;">${dateStr}</span>
          </div>
          <p style="margin: 0; font-size: 13px; color: #d0d0e0; line-height: 1.4;">${escapeHtml(entry.message)}</p>
        `;

        entriesList.appendChild(entryEl);
      });
  }

  popup.appendChild(entriesList);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeGuestbook(guestbook);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  guestbook.container.appendChild(popup);
  guestbook.popup = popup;
  guestbook.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Focus message input
  setTimeout(() => {
    const input = document.getElementById('guestbook-message') as HTMLInputElement;
    if (input) input.focus();
  }, 100);
}

/**
 * Close the guestbook
 */
function closeGuestbook(guestbook: Guestbook): void {
  if (!guestbook.popup) return;

  guestbook.popup.style.opacity = '0';
  const popup = guestbook.popup;

  setTimeout(() => {
    popup.remove();
    if (guestbook.popup === popup) {
      guestbook.popup = null;
    }
  }, 300);

  guestbook.isOpen = false;
}

/**
 * Add an entry to the guestbook
 */
export function addEntry(guestbook: Guestbook, dayNumber: number, message: string): void {
  const entry: GuestbookEntry = {
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dayNumber,
    message: message.slice(0, MAX_MESSAGE_LENGTH),
    timestamp: Date.now(),
  };

  guestbook.entries.push(entry);

  // Limit entries
  while (guestbook.entries.length > MAX_ENTRIES) {
    guestbook.entries.shift();
  }

  saveEntries(guestbook.entries);
}

/**
 * Get entries for a specific day
 */
export function getEntriesForDay(guestbook: Guestbook, dayNumber: number): GuestbookEntry[] {
  return guestbook.entries.filter(e => e.dayNumber === dayNumber);
}

// ============================================================================
// Helpers
// ============================================================================

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Persistence
// ============================================================================

function loadEntries(): GuestbookEntry[] {
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

function saveEntries(entries: GuestbookEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeGuestbook(guestbook: Guestbook): void {
  guestbook.cleanup();
}
