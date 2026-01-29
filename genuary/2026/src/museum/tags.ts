/**
 * Tags
 *
 * Categorize exhibits with personal tags
 * for custom organization and discovery.
 */

// ============================================================================
// Types
// ============================================================================

export interface TagsSystem {
  container: HTMLElement;
  tags: Map<string, Set<number>>;
  exhibitTags: Map<number, Set<string>>;
  panel: HTMLElement | null;
  isOpen: boolean;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-tags';

// Suggested tags for quick selection
const SUGGESTED_TAGS = [
  'favorite', 'inspiring', 'technical', 'beautiful',
  'creative', 'minimalist', 'colorful', 'abstract',
  'interactive', 'animated', 'peaceful', 'energetic',
];

// ============================================================================
// Tags System Creation
// ============================================================================

/**
 * Create the tags system
 */
export function createTagsSystem(container: HTMLElement): TagsSystem {
  const saved = loadTags();

  const system: TagsSystem = {
    container,
    tags: saved.tags,
    exhibitTags: saved.exhibitTags,
    panel: null,
    isOpen: false,
    onNavigate: null,
    cleanup: () => {
      closeTagsPanel(system);
    },
  };

  return system;
}

/**
 * Add tag to exhibit
 */
export function addTag(system: TagsSystem, dayNumber: number, tag: string): void {
  const normalizedTag = tag.toLowerCase().trim();
  if (!normalizedTag) return;

  // Add to tags map
  if (!system.tags.has(normalizedTag)) {
    system.tags.set(normalizedTag, new Set());
  }
  system.tags.get(normalizedTag)!.add(dayNumber);

  // Add to exhibitTags map
  if (!system.exhibitTags.has(dayNumber)) {
    system.exhibitTags.set(dayNumber, new Set());
  }
  system.exhibitTags.get(dayNumber)!.add(normalizedTag);

  saveTags(system);
}

/**
 * Remove tag from exhibit
 */
export function removeTag(system: TagsSystem, dayNumber: number, tag: string): void {
  const normalizedTag = tag.toLowerCase().trim();

  // Remove from tags map
  const tagSet = system.tags.get(normalizedTag);
  if (tagSet) {
    tagSet.delete(dayNumber);
    if (tagSet.size === 0) {
      system.tags.delete(normalizedTag);
    }
  }

  // Remove from exhibitTags map
  const exhibitSet = system.exhibitTags.get(dayNumber);
  if (exhibitSet) {
    exhibitSet.delete(normalizedTag);
    if (exhibitSet.size === 0) {
      system.exhibitTags.delete(dayNumber);
    }
  }

  saveTags(system);
}

/**
 * Get tags for an exhibit
 */
export function getExhibitTags(system: TagsSystem, dayNumber: number): string[] {
  return Array.from(system.exhibitTags.get(dayNumber) || []);
}

/**
 * Get exhibits with a tag
 */
export function getExhibitsWithTag(system: TagsSystem, tag: string): number[] {
  return Array.from(system.tags.get(tag.toLowerCase()) || []);
}

/**
 * Get all tags
 */
export function getAllTags(system: TagsSystem): string[] {
  return Array.from(system.tags.keys()).sort();
}

/**
 * Open tag manager panel
 */
export function openTagManager(system: TagsSystem, dayNumber: number): void {
  closeTagsPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'tags-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(200, 150, 100, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const currentTags = getExhibitTags(system, dayNumber);
  const allTags = getAllTags(system);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(200, 150, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🏷️ Tags
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Day ${dayNumber}
        </div>
      </div>
      <button id="tags-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Current tags -->
    <div style="padding: 15px;">
      <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Current tags:</div>
      <div id="current-tags" style="
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 30px;
      ">
        ${currentTags.length === 0 ? `
          <span style="color: #666; font-size: 11px;">No tags yet</span>
        ` : currentTags.map(tag => `
          <span class="tag-chip" data-tag="${tag}" style="
            background: rgba(200, 150, 100, 0.2);
            border: 1px solid rgba(200, 150, 100, 0.3);
            border-radius: 12px;
            padding: 4px 10px;
            font-size: 11px;
            color: #c89664;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            ${tag}
            <span class="tag-remove" data-tag="${tag}" style="
              color: #888;
              font-weight: bold;
            ">×</span>
          </span>
        `).join('')}
      </div>
    </div>

    <!-- Add new tag -->
    <div style="padding: 0 15px 15px;">
      <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Add tag:</div>
      <div style="display: flex; gap: 8px;">
        <input id="tag-input" type="text" placeholder="Enter tag..." style="
          flex: 1;
          background: rgba(30, 30, 50, 0.8);
          border: 1px solid rgba(200, 150, 100, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 12px;
        ">
        <button id="tag-add" style="
          background: rgba(200, 150, 100, 0.2);
          border: 1px solid rgba(200, 150, 100, 0.3);
          border-radius: 8px;
          padding: 8px 16px;
          color: white;
          font-size: 12px;
          cursor: pointer;
        ">Add</button>
      </div>
    </div>

    <!-- Suggested tags -->
    <div style="
      padding: 15px;
      border-top: 1px solid rgba(200, 150, 100, 0.1);
      background: rgba(200, 150, 100, 0.05);
    ">
      <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Suggestions:</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${SUGGESTED_TAGS.filter(t => !currentTags.includes(t)).slice(0, 8).map(tag => `
          <button class="suggested-tag" data-tag="${tag}" style="
            background: rgba(40, 40, 60, 0.5);
            border: 1px solid transparent;
            border-radius: 12px;
            padding: 4px 10px;
            font-size: 11px;
            color: #888;
            cursor: pointer;
            transition: all 0.2s;
          ">${tag}</button>
        `).join('')}
      </div>
    </div>

    ${allTags.length > 0 ? `
      <!-- All tags -->
      <div style="
        padding: 15px;
        border-top: 1px solid rgba(200, 150, 100, 0.1);
      ">
        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">All your tags:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${allTags.map(tag => `
            <button class="all-tag" data-tag="${tag}" style="
              background: ${currentTags.includes(tag) ? 'rgba(200, 150, 100, 0.2)' : 'rgba(40, 40, 60, 0.5)'};
              border: 1px solid ${currentTags.includes(tag) ? 'rgba(200, 150, 100, 0.3)' : 'transparent'};
              border-radius: 12px;
              padding: 4px 10px;
              font-size: 11px;
              color: ${currentTags.includes(tag) ? '#c89664' : '#888'};
              cursor: pointer;
              transition: all 0.2s;
            ">${tag} (${system.tags.get(tag)?.size || 0})</button>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#tags-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeTagsPanel(system);

  // Wire up add button
  const addBtn = panel.querySelector('#tag-add') as HTMLButtonElement;
  const input = panel.querySelector('#tag-input') as HTMLInputElement;

  addBtn.onclick = () => {
    const tag = input.value.trim();
    if (tag) {
      addTag(system, dayNumber, tag);
      input.value = '';
      // Refresh panel
      closeTagsPanel(system);
      openTagManager(system, dayNumber);
    }
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  };

  // Wire up remove buttons
  const removeButtons = panel.querySelectorAll('.tag-remove');
  removeButtons.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const tag = (btn as HTMLElement).dataset.tag || '';
      removeTag(system, dayNumber, tag);
      closeTagsPanel(system);
      openTagManager(system, dayNumber);
    };
  });

  // Wire up suggested tags
  const suggestedBtns = panel.querySelectorAll('.suggested-tag');
  suggestedBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const tag = (btn as HTMLElement).dataset.tag || '';
      addTag(system, dayNumber, tag);
      closeTagsPanel(system);
      openTagManager(system, dayNumber);
    };

    (btn as HTMLElement).onmouseover = () => {
      (btn as HTMLElement).style.background = 'rgba(200, 150, 100, 0.15)';
      (btn as HTMLElement).style.color = '#c89664';
    };
    (btn as HTMLElement).onmouseout = () => {
      (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      (btn as HTMLElement).style.color = '#888';
    };
  });

  // Wire up all tags
  const allTagBtns = panel.querySelectorAll('.all-tag');
  allTagBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const tag = (btn as HTMLElement).dataset.tag || '';
      if (currentTags.includes(tag)) {
        removeTag(system, dayNumber, tag);
      } else {
        addTag(system, dayNumber, tag);
      }
      closeTagsPanel(system);
      openTagManager(system, dayNumber);
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTagsPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Show tag browser (all tags)
 */
export function openTagBrowser(system: TagsSystem): void {
  closeTagsPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'tags-browser';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    max-height: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(200, 150, 100, 0.3);
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

  const allTags = getAllTags(system);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(200, 150, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🏷️ Browse Tags
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          ${allTags.length} tags
        </div>
      </div>
      <button id="tags-browser-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 15px;">
      ${allTags.length === 0 ? `
        <div style="
          text-align: center;
          padding: 30px;
          color: #666;
          font-size: 12px;
        ">
          No tags yet. Add tags to exhibits to organize them.
        </div>
      ` : allTags.map(tag => {
        const exhibits = getExhibitsWithTag(system, tag);
        return `
          <div class="tag-group" data-tag="${tag}" style="
            padding: 12px;
            background: rgba(200, 150, 100, 0.1);
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            ">
              <span style="font-size: 14px; font-weight: bold; color: #c89664;">${tag}</span>
              <span style="font-size: 11px; color: #888;">${exhibits.length} exhibits</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${exhibits.slice(0, 6).map(day => `
                <button class="tag-exhibit" data-day="${day}" style="
                  background: rgba(40, 40, 60, 0.5);
                  border: 1px solid transparent;
                  border-radius: 6px;
                  padding: 4px 8px;
                  font-size: 10px;
                  color: white;
                  cursor: pointer;
                ">Day ${day}</button>
              `).join('')}
              ${exhibits.length > 6 ? `
                <span style="font-size: 10px; color: #666; padding: 4px;">+${exhibits.length - 6} more</span>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#tags-browser-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeTagsPanel(system);

  // Wire up exhibit buttons
  const exhibitBtns = panel.querySelectorAll('.tag-exhibit');
  exhibitBtns.forEach(btn => {
    (btn as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      const day = parseInt((btn as HTMLElement).dataset.day || '0');
      if (day > 0 && system.onNavigate) {
        system.onNavigate(day);
        closeTagsPanel(system);
      }
    };
  });

  // Wire up group hover
  const groups = panel.querySelectorAll('.tag-group');
  groups.forEach(group => {
    (group as HTMLElement).onmouseover = () => {
      (group as HTMLElement).style.background = 'rgba(200, 150, 100, 0.15)';
    };
    (group as HTMLElement).onmouseout = () => {
      (group as HTMLElement).style.background = 'rgba(200, 150, 100, 0.1)';
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTagsPanel(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close tags panel
 */
function closeTagsPanel(system: TagsSystem): void {
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

// ============================================================================
// Persistence
// ============================================================================

interface SavedTags {
  tags: Map<string, Set<number>>;
  exhibitTags: Map<number, Set<string>>;
}

function loadTags(): SavedTags {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const obj = JSON.parse(saved);
      const tags = new Map<string, Set<number>>();
      const exhibitTags = new Map<number, Set<string>>();

      for (const [tag, days] of Object.entries(obj.tags || {})) {
        tags.set(tag, new Set(days as number[]));
      }
      for (const [day, tagList] of Object.entries(obj.exhibitTags || {})) {
        exhibitTags.set(parseInt(day), new Set(tagList as string[]));
      }

      return { tags, exhibitTags };
    }
  } catch {
    // Ignore
  }
  return { tags: new Map(), exhibitTags: new Map() };
}

function saveTags(system: TagsSystem): void {
  try {
    const obj: Record<string, unknown> = {
      tags: {} as Record<string, number[]>,
      exhibitTags: {} as Record<string, string[]>,
    };

    system.tags.forEach((days, tag) => {
      (obj.tags as Record<string, number[]>)[tag] = Array.from(days);
    });
    system.exhibitTags.forEach((tagList, day) => {
      (obj.exhibitTags as Record<string, string[]>)[day.toString()] = Array.from(tagList);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeTagsSystem(system: TagsSystem): void {
  system.cleanup();
}
