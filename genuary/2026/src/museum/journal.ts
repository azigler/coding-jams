/**
 * Visitor Journal
 *
 * Allows visitors to write personal notes about exhibits.
 * Notes are saved locally and can be reviewed anytime.
 */

// ============================================================================
// Types
// ============================================================================

export interface JournalEntry {
  dayNumber: number;
  note: string;
  timestamp: number;
}

export interface JournalSystem {
  container: HTMLElement;
  entries: Map<number, JournalEntry>;
  popup: HTMLElement | null;
  isOpen: boolean;
  currentDay: number | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-journal';
const MAX_NOTE_LENGTH = 280; // Tweet-length notes

// ============================================================================
// Journal System Creation
// ============================================================================

/**
 * Create the journal system
 */
export function createJournalSystem(container: HTMLElement): JournalSystem {
  const savedEntries = loadJournalEntries();

  const system: JournalSystem = {
    container,
    entries: savedEntries,
    popup: null,
    isOpen: false,
    currentDay: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Toggle with J key (when viewing exhibit)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyJ' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeJournal(system);
      } else {
        openJournalBrowser(system);
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
 * Open the journal entry editor for a specific day
 */
export function openJournalEntry(system: JournalSystem, dayNumber: number): void {
  if (system.popup) {
    system.popup.remove();
  }

  system.currentDay = dayNumber;
  system.isOpen = true;

  const existingEntry = system.entries.get(dayNumber);
  const currentNote = existingEntry?.note || '';

  const popup = document.createElement('div');
  popup.id = 'journal-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 14px; font-weight: bold; color: white;">📓 Journal Entry</div>
        <div style="font-size: 11px; color: #888; margin-top: 2px;">Day ${dayNumber}</div>
      </div>
      <button id="journal-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 14px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px 20px;">
      <textarea id="journal-note" placeholder="Write your thoughts about this exhibit..." style="
        width: 100%;
        height: 80px;
        box-sizing: border-box;
        background: rgba(40, 40, 60, 0.8);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 6px;
        padding: 10px 12px;
        color: white;
        font-size: 13px;
        font-family: inherit;
        resize: none;
      ">${currentNote}</textarea>
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
      ">
        <span id="journal-chars" style="font-size: 11px; color: #666;">
          ${currentNote.length}/${MAX_NOTE_LENGTH}
        </span>
        <div style="display: flex; gap: 8px;">
          ${existingEntry ? `
            <button id="journal-delete" style="
              background: rgba(255, 100, 100, 0.3);
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              color: #ff6b6b;
              font-size: 12px;
              cursor: pointer;
            ">Delete</button>
          ` : ''}
          <button id="journal-save" style="
            background: linear-gradient(135deg, #a855f7, #4a9eff);
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            color: white;
            font-size: 12px;
            cursor: pointer;
          ">Save</button>
        </div>
      </div>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  setTimeout(() => {
    const closeBtn = document.getElementById('journal-close');
    const saveBtn = document.getElementById('journal-save');
    const deleteBtn = document.getElementById('journal-delete');
    const textarea = document.getElementById('journal-note') as HTMLTextAreaElement;
    const charsEl = document.getElementById('journal-chars');

    if (closeBtn) {
      closeBtn.onclick = () => closeJournal(system);
    }

    if (textarea) {
      textarea.focus();
      textarea.oninput = () => {
        // Enforce max length
        if (textarea.value.length > MAX_NOTE_LENGTH) {
          textarea.value = textarea.value.slice(0, MAX_NOTE_LENGTH);
        }
        if (charsEl) {
          charsEl.textContent = `${textarea.value.length}/${MAX_NOTE_LENGTH}`;
        }
      };

      // Save on Ctrl+Enter
      textarea.onkeydown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          saveJournalEntry(system, dayNumber, textarea.value);
          closeJournal(system);
        }
      };
    }

    if (saveBtn) {
      saveBtn.onclick = () => {
        if (textarea) {
          saveJournalEntry(system, dayNumber, textarea.value);
          closeJournal(system);
        }
      };
    }

    if (deleteBtn) {
      deleteBtn.onclick = () => {
        deleteJournalEntry(system, dayNumber);
        closeJournal(system);
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeJournal(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Open the journal browser to view all entries
 */
export function openJournalBrowser(system: JournalSystem): void {
  if (system.popup) {
    system.popup.remove();
  }

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'journal-browser';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    max-height: 70vh;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const entries = Array.from(system.entries.values()).sort((a, b) => a.dayNumber - b.dayNumber);

  popup.innerHTML = `
    <div style="
      padding: 20px;
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <h2 style="margin: 0; font-size: 18px; color: white;">📓 My Journal</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
          ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>
      <button id="journal-browser-close" style="
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
      ">×</button>
    </div>

    <div id="journal-entries" style="
      flex: 1;
      overflow-y: auto;
      padding: 15px 20px;
    ">
      ${entries.length === 0 ? `
        <div style="
          text-align: center;
          padding: 40px 20px;
          color: #666;
        ">
          <div style="font-size: 40px; margin-bottom: 10px;">📝</div>
          <div style="font-size: 14px;">No journal entries yet.</div>
          <div style="font-size: 12px; margin-top: 5px;">
            View an exhibit and press Ctrl+J to write a note.
          </div>
        </div>
      ` : entries.map(entry => `
        <div class="journal-entry" data-day="${entry.dayNumber}" style="
          background: rgba(40, 40, 60, 0.5);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 8px;
          padding: 12px 15px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: background 0.2s;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          ">
            <span style="font-weight: bold; color: #a855f7;">Day ${entry.dayNumber}</span>
            <span style="font-size: 10px; color: #666;">
              ${formatDate(entry.timestamp)}
            </span>
          </div>
          <div style="font-size: 13px; color: #c0c0c0; line-height: 1.4;">
            ${escapeHtml(entry.note)}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  setTimeout(() => {
    const closeBtn = document.getElementById('journal-browser-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeJournal(system);
    }

    // Entry click handlers
    const entryElements = popup.querySelectorAll('.journal-entry');
    entryElements.forEach(el => {
      (el as HTMLElement).onmouseover = () => {
        (el as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
      };
      (el as HTMLElement).onmouseout = () => {
        (el as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      };
      (el as HTMLElement).onclick = () => {
        const day = parseInt((el as HTMLElement).dataset.day || '0', 10);
        if (day > 0) {
          closeJournal(system);
          openJournalEntry(system, day);
        }
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeJournal(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the journal
 */
export function closeJournal(system: JournalSystem): void {
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
  system.currentDay = null;
}

/**
 * Save a journal entry
 */
function saveJournalEntry(system: JournalSystem, dayNumber: number, note: string): void {
  const trimmedNote = note.trim();

  if (trimmedNote.length === 0) {
    // Delete if empty
    deleteJournalEntry(system, dayNumber);
    return;
  }

  const entry: JournalEntry = {
    dayNumber,
    note: trimmedNote,
    timestamp: Date.now(),
  };

  system.entries.set(dayNumber, entry);
  saveJournalEntries(system.entries);
}

/**
 * Delete a journal entry
 */
function deleteJournalEntry(system: JournalSystem, dayNumber: number): void {
  system.entries.delete(dayNumber);
  saveJournalEntries(system.entries);
}

/**
 * Check if a day has a journal entry
 */
export function hasJournalEntry(system: JournalSystem, dayNumber: number): boolean {
  return system.entries.has(dayNumber);
}

/**
 * Get the journal entry for a day
 */
export function getJournalEntry(system: JournalSystem, dayNumber: number): JournalEntry | undefined {
  return system.entries.get(dayNumber);
}

/**
 * Get total number of journal entries
 */
export function getJournalCount(system: JournalSystem): number {
  return system.entries.size;
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${month} ${day}, ${hour12}:${minute} ${ampm}`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Persistence
// ============================================================================

function loadJournalEntries(): Map<number, JournalEntry> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const entries = JSON.parse(saved) as JournalEntry[];
      return new Map(entries.map(e => [e.dayNumber, e]));
    }
  } catch {
    // localStorage may not be available
  }
  return new Map();
}

function saveJournalEntries(entries: Map<number, JournalEntry>): void {
  try {
    const array = Array.from(entries.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeJournalSystem(system: JournalSystem): void {
  system.cleanup();
}
