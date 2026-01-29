/**
 * Comments
 *
 * Leave personal notes and reactions on individual exhibits.
 * Creates a more personal museum experience.
 */

// ============================================================================
// Types
// ============================================================================

export interface Comment {
  id: string;
  dayNumber: number;
  text: string;
  timestamp: number;
  emoji?: string;
}

export interface CommentsSystem {
  container: HTMLElement;
  comments: Map<number, Comment[]>;
  panel: HTMLElement | null;
  isOpen: boolean;
  currentDay: number;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-comments';

const QUICK_REACTIONS = ['💭', '🤔', '💡', '🎨', '✨', '🔥', '💖', '🌟'];

// ============================================================================
// Comments System Creation
// ============================================================================

/**
 * Create the comments system
 */
export function createCommentsSystem(container: HTMLElement): CommentsSystem {
  const saved = loadComments();

  const system: CommentsSystem = {
    container,
    comments: saved,
    panel: null,
    isOpen: false,
    currentDay: 0,
    cleanup: () => {
      closeComments(system);
    },
  };

  return system;
}

/**
 * Open comments panel for an exhibit
 */
export function openComments(system: CommentsSystem, dayNumber: number): void {
  closeComments(system);

  system.isOpen = true;
  system.currentDay = dayNumber;

  const panel = document.createElement('div');
  panel.id = 'comments-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    max-height: 450px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(150, 200, 100, 0.3);
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

  const dayComments = system.comments.get(dayNumber) || [];

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(150, 200, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          💬 My Notes
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Day ${dayNumber}
        </div>
      </div>
      <button id="comments-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Comments list -->
    <div id="comments-list" style="
      flex: 1;
      overflow-y: auto;
      padding: 10px 15px;
      max-height: 200px;
    ">
      ${dayComments.length === 0 ? `
        <div style="
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        ">
          No notes yet. Add your thoughts below!
        </div>
      ` : dayComments.map(comment => `
        <div class="comment-item" data-id="${comment.id}" style="
          padding: 10px;
          background: rgba(150, 200, 100, 0.1);
          border-radius: 8px;
          margin-bottom: 8px;
          position: relative;
        ">
          ${comment.emoji ? `<span style="font-size: 18px; margin-right: 8px;">${comment.emoji}</span>` : ''}
          <span style="font-size: 12px; color: white;">${escapeHtml(comment.text)}</span>
          <div style="font-size: 10px; color: #666; margin-top: 6px;">
            ${formatTimestamp(comment.timestamp)}
          </div>
          <button class="comment-delete" data-id="${comment.id}" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: #666;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
          ">×</button>
        </div>
      `).join('')}
    </div>

    <!-- Quick reactions -->
    <div style="
      padding: 10px 15px;
      border-top: 1px solid rgba(150, 200, 100, 0.1);
      display: flex;
      justify-content: center;
      gap: 8px;
    ">
      ${QUICK_REACTIONS.map(emoji => `
        <button class="quick-reaction" data-emoji="${emoji}" style="
          background: rgba(40, 40, 60, 0.5);
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        ">${emoji}</button>
      `).join('')}
    </div>

    <!-- Add comment -->
    <div style="
      padding: 15px;
      border-top: 1px solid rgba(150, 200, 100, 0.1);
    ">
      <div style="display: flex; gap: 10px;">
        <textarea id="comment-input" placeholder="Add a note..." style="
          flex: 1;
          background: rgba(30, 30, 50, 0.8);
          border: 1px solid rgba(150, 200, 100, 0.2);
          border-radius: 8px;
          padding: 10px;
          color: white;
          font-size: 12px;
          font-family: inherit;
          resize: none;
          height: 60px;
        "></textarea>
      </div>
      <button id="comment-submit" style="
        width: 100%;
        margin-top: 10px;
        padding: 10px;
        background: rgba(150, 200, 100, 0.2);
        border: 1px solid rgba(150, 200, 100, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      ">Add Note</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#comments-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeComments(system);

  // Wire up submit
  const submitBtn = panel.querySelector('#comment-submit') as HTMLButtonElement;
  const input = panel.querySelector('#comment-input') as HTMLTextAreaElement;

  submitBtn.onclick = () => {
    const text = input.value.trim();
    if (text) {
      addComment(system, dayNumber, text);
      input.value = '';
      refreshCommentsList(system, dayNumber);
    }
  };

  // Wire up quick reactions
  const reactionBtns = panel.querySelectorAll('.quick-reaction');
  reactionBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const emoji = (btn as HTMLElement).dataset.emoji || '';
      addComment(system, dayNumber, '', emoji);
      refreshCommentsList(system, dayNumber);
    };

    (btn as HTMLElement).onmouseover = () => {
      (btn as HTMLElement).style.background = 'rgba(150, 200, 100, 0.2)';
    };
    (btn as HTMLElement).onmouseout = () => {
      (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
    };
  });

  // Wire up delete buttons
  wireUpDeleteButtons(system, dayNumber);

  // Show delete on hover
  const items = panel.querySelectorAll('.comment-item');
  items.forEach(item => {
    const deleteBtn = item.querySelector('.comment-delete') as HTMLElement;
    (item as HTMLElement).onmouseover = () => {
      deleteBtn.style.opacity = '1';
    };
    (item as HTMLElement).onmouseout = () => {
      deleteBtn.style.opacity = '0';
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeComments(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Wire up delete buttons
 */
function wireUpDeleteButtons(system: CommentsSystem, dayNumber: number): void {
  const deleteBtns = system.panel?.querySelectorAll('.comment-delete');
  deleteBtns?.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id || '';
      deleteComment(system, dayNumber, id);
      refreshCommentsList(system, dayNumber);
    };
  });
}

/**
 * Refresh comments list
 */
function refreshCommentsList(system: CommentsSystem, dayNumber: number): void {
  const listEl = system.panel?.querySelector('#comments-list');
  if (!listEl) return;

  const comments = system.comments.get(dayNumber) || [];

  listEl.innerHTML = comments.length === 0 ? `
    <div style="
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    ">
      No notes yet. Add your thoughts below!
    </div>
  ` : comments.map(comment => `
    <div class="comment-item" data-id="${comment.id}" style="
      padding: 10px;
      background: rgba(150, 200, 100, 0.1);
      border-radius: 8px;
      margin-bottom: 8px;
      position: relative;
    ">
      ${comment.emoji ? `<span style="font-size: 18px; margin-right: 8px;">${comment.emoji}</span>` : ''}
      <span style="font-size: 12px; color: white;">${escapeHtml(comment.text)}</span>
      <div style="font-size: 10px; color: #666; margin-top: 6px;">
        ${formatTimestamp(comment.timestamp)}
      </div>
      <button class="comment-delete" data-id="${comment.id}" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: #666;
        font-size: 12px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
      ">×</button>
    </div>
  `).join('');

  // Re-wire delete buttons
  wireUpDeleteButtons(system, dayNumber);

  // Re-wire hover
  const items = listEl.querySelectorAll('.comment-item');
  items.forEach(item => {
    const deleteBtn = item.querySelector('.comment-delete') as HTMLElement;
    (item as HTMLElement).onmouseover = () => {
      deleteBtn.style.opacity = '1';
    };
    (item as HTMLElement).onmouseout = () => {
      deleteBtn.style.opacity = '0';
    };
  });
}

/**
 * Close comments panel
 */
export function closeComments(system: CommentsSystem): void {
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
  system.currentDay = 0;
}

/**
 * Add a comment
 */
export function addComment(system: CommentsSystem, dayNumber: number, text: string, emoji?: string): void {
  const comments = system.comments.get(dayNumber) || [];

  comments.push({
    id: generateId(),
    dayNumber,
    text,
    timestamp: Date.now(),
    emoji,
  });

  system.comments.set(dayNumber, comments);
  saveComments(system.comments);
}

/**
 * Delete a comment
 */
export function deleteComment(system: CommentsSystem, dayNumber: number, id: string): void {
  const comments = system.comments.get(dayNumber) || [];
  const filtered = comments.filter(c => c.id !== id);

  if (filtered.length > 0) {
    system.comments.set(dayNumber, filtered);
  } else {
    system.comments.delete(dayNumber);
  }

  saveComments(system.comments);
}

/**
 * Get comment count for a day
 */
export function getCommentCount(system: CommentsSystem, dayNumber: number): number {
  return (system.comments.get(dayNumber) || []).length;
}

/**
 * Get total comment count
 */
export function getTotalCommentCount(system: CommentsSystem): number {
  let total = 0;
  system.comments.forEach(comments => {
    total += comments.length;
  });
  return total;
}

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Persistence
// ============================================================================

function loadComments(): Map<number, Comment[]> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const obj = JSON.parse(saved) as Record<string, Comment[]>;
      const map = new Map<number, Comment[]>();
      for (const [key, value] of Object.entries(obj)) {
        map.set(parseInt(key), value);
      }
      return map;
    }
  } catch {
    // Ignore
  }
  return new Map();
}

function saveComments(comments: Map<number, Comment[]>): void {
  try {
    const obj: Record<string, Comment[]> = {};
    comments.forEach((value, key) => {
      obj[key.toString()] = value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeCommentsSystem(system: CommentsSystem): void {
  system.cleanup();
}
