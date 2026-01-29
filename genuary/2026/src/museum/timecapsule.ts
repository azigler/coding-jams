/**
 * Time Capsule
 *
 * Allows visitors to save memorable moments from their visit
 * to revisit later, including position, time, and notes.
 */

// ============================================================================
// Types
// ============================================================================

export interface Capsule {
  id: string;
  dayNumber: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  timestamp: number;
  note: string;
  mood?: string;
}

export interface TimeCapsuleSystem {
  container: HTMLElement;
  capsules: Capsule[];
  popup: HTMLElement | null;
  createPopup: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((capsule: Capsule) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-timecapsule';
const MAX_CAPSULES = 20;

// ============================================================================
// Time Capsule System Creation
// ============================================================================

/**
 * Create the time capsule system
 */
export function createTimeCapsuleSystem(container: HTMLElement): TimeCapsuleSystem {
  const saved = loadCapsules();

  const system: TimeCapsuleSystem = {
    container,
    capsules: saved || [],
    popup: null,
    createPopup: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
      if (system.createPopup) {
        system.createPopup.remove();
        system.createPopup = null;
      }
    },
  };

  // Keyboard shortcuts
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyK' && event.shiftKey && !event.ctrlKey) {
      // Shift+K to view capsules
      event.preventDefault();
      if (system.isOpen) {
        closeCapsuleList(system);
      } else {
        openCapsuleList(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  // Check for capsule anniversaries
  checkAnniversaries(system);

  return system;
}

/**
 * Check for capsule anniversaries (1 week, 1 month)
 */
function checkAnniversaries(system: TimeCapsuleSystem): void {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;

  system.capsules.forEach(capsule => {
    const age = now - capsule.timestamp;
    const weekAnniversary = age >= oneWeek && age < oneWeek + 60000;
    const monthAnniversary = age >= oneMonth && age < oneMonth + 60000;

    if (weekAnniversary || monthAnniversary) {
      const timeAgo = weekAnniversary ? 'one week' : 'one month';
      setTimeout(() => {
        showAnniversaryNotification(system, capsule, timeAgo);
      }, 5000);
    }
  });
}

/**
 * Show anniversary notification
 */
function showAnniversaryNotification(
  system: TimeCapsuleSystem,
  capsule: Capsule,
  timeAgo: string
): void {
  const notification = document.createElement('div');
  notification.id = 'capsule-anniversary';
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 260px;
    background: rgba(20, 20, 35, 0.98);
    border: 1px solid rgba(180, 140, 255, 0.4);
    border-radius: 12px;
    padding: 15px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s;
    cursor: pointer;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <span style="font-size: 24px;">⏰</span>
      <div>
        <div style="font-size: 12px; font-weight: bold; color: #b88cff;">
          Time Capsule Memory
        </div>
        <div style="font-size: 10px; color: #888;">
          ${timeAgo} ago
        </div>
      </div>
    </div>
    <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">
      Day ${capsule.dayNumber}${capsule.note ? `: "${capsule.note.slice(0, 30)}..."` : ''}
    </div>
    <div style="font-size: 10px; color: #666;">
      Click to revisit this moment
    </div>
  `;

  notification.onclick = () => {
    system.onNavigate?.(capsule);
    notification.remove();
  };

  system.container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

/**
 * Open the create capsule popup
 */
export function openCreateCapsule(
  system: TimeCapsuleSystem,
  dayNumber: number,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number }
): void {
  if (system.createPopup) return;

  const popup = document.createElement('div');
  popup.id = 'capsule-create';
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: rgba(20, 20, 35, 0.98);
    border: 1px solid rgba(180, 140, 255, 0.4);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 950;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(180, 140, 255, 0.2);
      background: linear-gradient(90deg, rgba(180, 140, 255, 0.1), transparent);
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        ⏰ Create Time Capsule
      </div>
      <div style="font-size: 11px; color: #888; margin-top: 4px;">
        Day ${dayNumber} · ${new Date().toLocaleDateString()}
      </div>
    </div>

    <div style="padding: 15px;">
      <div style="margin-bottom: 15px;">
        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 6px;">
          Add a note (optional)
        </label>
        <textarea id="capsule-note" placeholder="What made this moment special?"
          style="
            width: 100%;
            height: 80px;
            padding: 10px;
            background: rgba(40, 40, 60, 0.5);
            border: 1px solid rgba(180, 140, 255, 0.2);
            border-radius: 6px;
            color: white;
            font-size: 12px;
            resize: none;
            outline: none;
            font-family: inherit;
          "></textarea>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 6px;">
          How are you feeling?
        </label>
        <div id="mood-selector" style="display: flex; gap: 8px;">
          ${['😊', '🤔', '😍', '🎨', '✨'].map(emoji => `
            <button class="mood-btn" data-mood="${emoji}" style="
              width: 36px;
              height: 36px;
              background: rgba(40, 40, 60, 0.5);
              border: 1px solid rgba(180, 140, 255, 0.2);
              border-radius: 8px;
              font-size: 18px;
              cursor: pointer;
              transition: all 0.2s;
            ">${emoji}</button>
          `).join('')}
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button id="capsule-cancel" style="
          flex: 1;
          padding: 10px;
          background: rgba(100, 100, 120, 0.3);
          border: 1px solid rgba(100, 100, 120, 0.4);
          border-radius: 6px;
          color: #aaa;
          font-size: 12px;
          cursor: pointer;
        ">Cancel</button>
        <button id="capsule-save" style="
          flex: 1;
          padding: 10px;
          background: rgba(180, 140, 255, 0.3);
          border: 1px solid rgba(180, 140, 255, 0.5);
          border-radius: 6px;
          color: white;
          font-size: 12px;
          cursor: pointer;
        ">Save Capsule</button>
      </div>
    </div>
  `;

  system.container.appendChild(popup);
  system.createPopup = popup;

  // Animate in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Track selected mood
  let selectedMood = '';

  // Wire up interactions
  setTimeout(() => {
    // Mood selector
    const moodBtns = popup.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
      (btn as HTMLElement).onclick = () => {
        moodBtns.forEach(b => {
          (b as HTMLElement).style.borderColor = 'rgba(180, 140, 255, 0.2)';
          (b as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
        });
        (btn as HTMLElement).style.borderColor = 'rgba(180, 140, 255, 0.6)';
        (btn as HTMLElement).style.background = 'rgba(180, 140, 255, 0.2)';
        selectedMood = (btn as HTMLElement).dataset.mood || '';
      };
    });

    // Cancel button
    const cancelBtn = document.getElementById('capsule-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => closeCreateCapsule(system);
    }

    // Save button
    const saveBtn = document.getElementById('capsule-save');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const noteInput = document.getElementById('capsule-note') as HTMLTextAreaElement;
        const note = noteInput?.value || '';

        const capsule: Capsule = {
          id: `capsule-${Date.now()}`,
          dayNumber,
          position,
          rotation,
          timestamp: Date.now(),
          note,
          mood: selectedMood,
        };

        addCapsule(system, capsule);
        closeCreateCapsule(system);
        showCapsuleNotification(system, 'Time capsule saved!');
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCreateCapsule(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close create capsule popup
 */
function closeCreateCapsule(system: TimeCapsuleSystem): void {
  if (!system.createPopup) return;

  system.createPopup.style.opacity = '0';
  const popup = system.createPopup;

  setTimeout(() => {
    popup.remove();
    if (system.createPopup === popup) {
      system.createPopup = null;
    }
  }, 300);
}

/**
 * Add a capsule
 */
function addCapsule(system: TimeCapsuleSystem, capsule: Capsule): void {
  system.capsules.unshift(capsule);

  // Limit capsules
  if (system.capsules.length > MAX_CAPSULES) {
    system.capsules = system.capsules.slice(0, MAX_CAPSULES);
  }

  saveCapsules(system);
}

/**
 * Open capsule list
 */
export function openCapsuleList(system: TimeCapsuleSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'capsule-list';
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    max-height: 500px;
    background: rgba(20, 20, 35, 0.98);
    border: 1px solid rgba(180, 140, 255, 0.4);
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
      padding: 15px;
      border-bottom: 1px solid rgba(180, 140, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 14px; color: white; font-weight: bold;">
        ⏰ Time Capsules
      </div>
      <button id="capsule-list-close" style="
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

    <div style="padding: 15px; max-height: 400px; overflow-y: auto;">
      ${system.capsules.length === 0 ? `
        <div style="text-align: center; padding: 30px; color: #666;">
          <div style="font-size: 32px; margin-bottom: 10px;">⏰</div>
          <div style="font-size: 12px;">No capsules yet</div>
          <div style="font-size: 11px; margin-top: 5px; color: #555;">
            Press Ctrl+K while viewing to create one
          </div>
        </div>
      ` : system.capsules.map(capsule => {
        const date = new Date(capsule.timestamp);
        const timeAgo = getTimeAgo(capsule.timestamp);
        return `
          <div class="capsule-item" data-id="${capsule.id}" style="
            padding: 12px;
            background: rgba(40, 40, 60, 0.4);
            border: 1px solid rgba(180, 140, 255, 0.15);
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.borderColor='rgba(180, 140, 255, 0.4)'"
             onmouseout="this.style.borderColor='rgba(180, 140, 255, 0.15)'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 13px; font-weight: bold; color: #b88cff;">
                Day ${capsule.dayNumber} ${capsule.mood || ''}
              </div>
              <div style="font-size: 10px; color: #666;">
                ${timeAgo}
              </div>
            </div>
            ${capsule.note ? `
              <div style="font-size: 11px; color: #aaa; margin-top: 6px;">
                "${capsule.note.slice(0, 60)}${capsule.note.length > 60 ? '...' : ''}"
              </div>
            ` : ''}
            <div style="font-size: 10px; color: #555; margin-top: 6px;">
              ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `;
      }).join('')}
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
    const closeBtn = document.getElementById('capsule-list-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeCapsuleList(system);
    }

    const items = popup.querySelectorAll('.capsule-item');
    items.forEach(item => {
      (item as HTMLElement).onclick = () => {
        const id = (item as HTMLElement).dataset.id;
        const capsule = system.capsules.find(c => c.id === id);
        if (capsule) {
          system.onNavigate?.(capsule);
          closeCapsuleList(system);
        }
      };
    });
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCapsuleList(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close capsule list
 */
export function closeCapsuleList(system: TimeCapsuleSystem): void {
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
 * Get human-readable time ago
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

/**
 * Show notification
 */
function showCapsuleNotification(system: TimeCapsuleSystem, message: string): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(180, 140, 255, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
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

/**
 * Get capsule count
 */
export function getCapsuleCount(system: TimeCapsuleSystem): number {
  return system.capsules.length;
}

// ============================================================================
// Persistence
// ============================================================================

function loadCapsules(): Capsule[] | null {
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

function saveCapsules(system: TimeCapsuleSystem): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(system.capsules));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTimeCapsuleSystem(system: TimeCapsuleSystem): void {
  system.cleanup();
}
