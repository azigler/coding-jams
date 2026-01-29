/**
 * Exhibit Collections
 *
 * Groups exhibits into themed collections that users can browse.
 * Each collection has a theme, description, and list of related exhibits.
 */

// ============================================================================
// Types
// ============================================================================

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  days: number[];
  unlockCondition?: 'view-all' | 'view-any' | 'always';
}

export interface CollectionsSystem {
  container: HTMLElement;
  collections: Collection[];
  isOpen: boolean;
  popup: HTMLElement | null;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Collection Data
// ============================================================================

const COLLECTIONS: Collection[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Basic building blocks of generative art: lines, shapes, and patterns.',
    icon: '📐',
    days: [1, 12, 13, 29],
    unlockCondition: 'always',
  },
  {
    id: 'color-theory',
    name: 'Color Theory',
    description: 'Exploring the spectrum from pure black to vibrant rainbows.',
    icon: '🎨',
    days: [4, 14, 22, 23],
    unlockCondition: 'always',
  },
  {
    id: 'constraints',
    name: 'Creative Constraints',
    description: 'Art born from strict limitations - 42 lines, no randomness, TAU only.',
    icon: '⛓️',
    days: [3, 7, 10, 27],
    unlockCondition: 'always',
  },
  {
    id: 'geometry',
    name: 'Geometric Forms',
    description: 'Triangles, isometric views, and pure geometric abstraction.',
    icon: '🔷',
    days: [5, 13, 24, 26],
    unlockCondition: 'always',
  },
  {
    id: 'nature',
    name: 'Nature & Motion',
    description: 'Landscapes, wind, textiles, and organic forms.',
    icon: '🌿',
    days: [6, 9, 17, 25],
    unlockCondition: 'always',
  },
  {
    id: 'typography',
    name: 'Typography & Text',
    description: 'Generative letterforms and text-based art.',
    icon: '🔤',
    days: [20],
    unlockCondition: 'always',
  },
  {
    id: 'interactive',
    name: 'Interactive Systems',
    description: 'Collision detection, infinite scroll, and dynamic behaviors.',
    icon: '🎮',
    days: [21, 28],
    unlockCondition: 'always',
  },
  {
    id: 'emotion',
    name: 'Emotional Expression',
    description: 'Abstract emotions and celebrations through code.',
    icon: '💫',
    days: [18, 30, 31],
    unlockCondition: 'always',
  },
  {
    id: 'technical',
    name: 'Technical Feats',
    description: 'One million objects, extremely long lines, and computational challenges.',
    icon: '⚡',
    days: [8, 25],
    unlockCondition: 'always',
  },
  {
    id: 'optical',
    name: 'Optical Illusions',
    description: 'Op art and visual tricks that play with perception.',
    icon: '👁️',
    days: [19],
    unlockCondition: 'always',
  },
  {
    id: 'layers',
    name: 'Depth & Layers',
    description: 'Building complexity through layered elements.',
    icon: '📚',
    days: [2],
    unlockCondition: 'always',
  },
  {
    id: 'film',
    name: 'Cinematic',
    description: 'Color palettes inspired by cinema.',
    icon: '🎬',
    days: [16],
    unlockCondition: 'always',
  },
  {
    id: 'design',
    name: 'Functional Design',
    description: 'Rugs and functional artistic patterns.',
    icon: '🏠',
    days: [15],
    unlockCondition: 'always',
  },
  {
    id: 'impossible',
    name: 'The Impossible',
    description: 'Day 11 - the attempt to satisfy all prompts at once.',
    icon: '🎯',
    days: [11],
    unlockCondition: 'view-all',
  },
];

// ============================================================================
// Collections System Creation
// ============================================================================

/**
 * Create the collections system
 */
export function createCollectionsSystem(container: HTMLElement): CollectionsSystem {
  const system: CollectionsSystem = {
    container,
    collections: COLLECTIONS,
    isOpen: false,
    popup: null,
    onNavigate: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Handle C key for collections (when not already bound)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyC' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      // Check if any modal is open
      const anyModalOpen = document.querySelector('#help-overlay, #credits-popup, #guestbook-popup, #search-popup');
      if (anyModalOpen) return;

      toggleCollections(system);
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
 * Toggle collections visibility
 */
export function toggleCollections(system: CollectionsSystem): void {
  if (system.isOpen) {
    closeCollections(system);
  } else {
    openCollections(system);
  }
}

/**
 * Open the collections panel
 */
function openCollections(system: CollectionsSystem, viewedDays?: Set<number>): void {
  if (system.popup) return;

  const viewed = viewedDays || new Set<number>();

  const popup = document.createElement('div');
  popup.id = 'collections-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
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
  popup.innerHTML = `
    <div style="
      padding: 20px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <h2 style="margin: 0; font-size: 18px; color: white;">Themed Collections</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
          Browse exhibits by theme
        </p>
      </div>
      <button id="collections-close" style="
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
    <div id="collections-list" style="
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    "></div>
  `;

  // Render collections
  const listEl = popup.querySelector('#collections-list') as HTMLElement;
  system.collections.forEach(collection => {
    const viewedInCollection = collection.days.filter(d => viewed.has(d)).length;
    const progress = Math.round((viewedInCollection / collection.days.length) * 100);

    const collectionEl = document.createElement('div');
    collectionEl.className = 'collection-item';
    collectionEl.style.cssText = `
      background: rgba(40, 40, 60, 0.5);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: background 0.2s;
    `;

    collectionEl.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <span style="font-size: 28px;">${collection.icon}</span>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 600; color: white; margin-bottom: 4px;">
            ${collection.name}
          </div>
          <div style="font-size: 12px; color: #888; line-height: 1.4; margin-bottom: 8px;">
            ${collection.description}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              flex: 1;
              height: 4px;
              background: rgba(100, 100, 120, 0.5);
              border-radius: 2px;
              overflow: hidden;
            ">
              <div style="
                width: ${progress}%;
                height: 100%;
                background: linear-gradient(90deg, #4a9eff, #a855f7);
                transition: width 0.3s;
              "></div>
            </div>
            <span style="font-size: 10px; color: #666;">${viewedInCollection}/${collection.days.length}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">
            ${collection.days.map(day => `
              <span class="collection-day" data-day="${day}" style="
                background: ${viewed.has(day) ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)'};
                color: ${viewed.has(day) ? '#4a9eff' : '#666'};
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
              ">Day ${day}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Hover effect
    collectionEl.onmouseenter = () => {
      collectionEl.style.background = 'rgba(60, 60, 80, 0.5)';
    };
    collectionEl.onmouseleave = () => {
      collectionEl.style.background = 'rgba(40, 40, 60, 0.5)';
    };

    // Click on day badges to navigate
    collectionEl.querySelectorAll('.collection-day').forEach(badge => {
      (badge as HTMLElement).onclick = (e) => {
        e.stopPropagation();
        const day = parseInt((badge as HTMLElement).dataset.day!, 10);
        system.onNavigate?.(day);
        closeCollections(system);
      };

      (badge as HTMLElement).onmouseenter = () => {
        (badge as HTMLElement).style.transform = 'scale(1.1)';
      };
      (badge as HTMLElement).onmouseleave = () => {
        (badge as HTMLElement).style.transform = 'scale(1)';
      };
    });

    listEl.appendChild(collectionEl);
  });

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('collections-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeCollections(system);
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCollections(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  system.container.appendChild(popup);
  system.popup = popup;
  system.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });
}

/**
 * Close the collections panel
 */
function closeCollections(system: CollectionsSystem): void {
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
 * Open collections with viewed days context
 */
export function openCollectionsWithContext(system: CollectionsSystem, viewedDays: Set<number>): void {
  if (system.isOpen) {
    closeCollections(system);
  }
  openCollections(system, viewedDays);
}

/**
 * Get collection containing a specific day
 */
export function getCollectionForDay(day: number): Collection | undefined {
  return COLLECTIONS.find(c => c.days.includes(day));
}

/**
 * Get all collections
 */
export function getAllCollections(): Collection[] {
  return COLLECTIONS;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeCollectionsSystem(system: CollectionsSystem): void {
  system.cleanup();
}
