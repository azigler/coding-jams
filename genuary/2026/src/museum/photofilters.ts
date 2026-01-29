/**
 * Photo Filters
 *
 * Apply artistic filters to screenshots for more
 * creative sharing of museum moments.
 */

// ============================================================================
// Types
// ============================================================================

export interface PhotoFilter {
  id: string;
  name: string;
  css: string;
  description: string;
}

export interface PhotoFiltersSystem {
  container: HTMLElement;
  currentFilter: string;
  panel: HTMLElement | null;
  isOpen: boolean;
  onApply: ((filterCss: string) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Filters
// ============================================================================

const FILTERS: PhotoFilter[] = [
  {
    id: 'none',
    name: 'Original',
    css: '',
    description: 'No filter applied',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    css: 'sepia(0.6) contrast(1.1) brightness(0.9)',
    description: 'Warm, nostalgic tones',
  },
  {
    id: 'noir',
    name: 'Noir',
    css: 'grayscale(1) contrast(1.3) brightness(0.9)',
    description: 'Classic black and white',
  },
  {
    id: 'vivid',
    name: 'Vivid',
    css: 'saturate(1.5) contrast(1.1)',
    description: 'Enhanced colors',
  },
  {
    id: 'cool',
    name: 'Cool',
    css: 'saturate(0.9) hue-rotate(-15deg) brightness(1.05)',
    description: 'Blue-shifted tones',
  },
  {
    id: 'warm',
    name: 'Warm',
    css: 'saturate(1.1) hue-rotate(15deg) brightness(1.05)',
    description: 'Orange-shifted tones',
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    css: 'brightness(1.1) contrast(0.9) blur(0.5px)',
    description: 'Soft, ethereal look',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    css: 'saturate(1.4) hue-rotate(40deg) contrast(1.2)',
    description: 'Neon-inspired colors',
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    css: 'sepia(0.2) contrast(1.1) brightness(1.1) saturate(0.9)',
    description: 'Instant camera style',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    css: 'sepia(1) hue-rotate(70deg) saturate(1.5)',
    description: 'Green digital aesthetic',
  },
];

// ============================================================================
// Photo Filters System Creation
// ============================================================================

/**
 * Create the photo filters system
 */
export function createPhotoFiltersSystem(container: HTMLElement): PhotoFiltersSystem {
  const saved = loadFilterPreference();

  const system: PhotoFiltersSystem = {
    container,
    currentFilter: saved || 'none',
    panel: null,
    isOpen: false,
    onApply: null,
    cleanup: () => {
      closeFiltersPanel(system);
    },
  };

  return system;
}

/**
 * Show filters selection panel
 */
export function showFiltersPanel(
  system: PhotoFiltersSystem,
  previewCanvas: HTMLCanvasElement
): void {
  closeFiltersPanel(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'photofilters-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 150, 200, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 900;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  // Create preview image
  const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.8);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 150, 200, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 16px; font-weight: bold; color: white;">
        Photo Filters
      </div>
      <button id="filters-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Preview -->
    <div style="padding: 15px; text-align: center; background: rgba(0,0,0,0.3);">
      <img id="filter-preview" src="${previewUrl}" style="
        max-width: 100%;
        max-height: 200px;
        border-radius: 8px;
        transition: filter 0.3s;
      ">
    </div>

    <!-- Filters Grid -->
    <div style="
      padding: 15px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    ">
      ${FILTERS.map(filter => `
        <button class="filter-btn" data-filter="${filter.id}" data-css="${filter.css}" style="
          padding: 8px;
          background: ${filter.id === system.currentFilter ? 'rgba(255, 150, 200, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
          border: 1px solid ${filter.id === system.currentFilter ? 'rgba(255, 150, 200, 0.5)' : 'transparent'};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="
            font-size: 11px;
            color: white;
            font-weight: 500;
          ">${filter.name}</div>
        </button>
      `).join('')}
    </div>

    <!-- Apply Button -->
    <div style="
      padding: 15px;
      border-top: 1px solid rgba(255, 150, 200, 0.1);
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    ">
      <button id="filters-cancel" style="
        padding: 10px 20px;
        background: rgba(100, 100, 120, 0.3);
        border: none;
        border-radius: 8px;
        color: #aaa;
        font-size: 13px;
        cursor: pointer;
      ">Cancel</button>
      <button id="filters-apply" style="
        padding: 10px 20px;
        background: rgba(255, 150, 200, 0.3);
        border: 1px solid rgba(255, 150, 200, 0.4);
        border-radius: 8px;
        color: white;
        font-size: 13px;
        cursor: pointer;
      ">Apply Filter</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up interactions
  const closeBtn = panel.querySelector('#filters-close') as HTMLButtonElement;
  const cancelBtn = panel.querySelector('#filters-cancel') as HTMLButtonElement;
  const applyBtn = panel.querySelector('#filters-apply') as HTMLButtonElement;
  const preview = panel.querySelector('#filter-preview') as HTMLImageElement;

  closeBtn.onclick = () => closeFiltersPanel(system);
  cancelBtn.onclick = () => closeFiltersPanel(system);

  let selectedFilter = system.currentFilter;
  let selectedCss = FILTERS.find(f => f.id === selectedFilter)?.css || '';

  const filterBtns = panel.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      // Update selection UI
      filterBtns.forEach(b => {
        (b as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
        (b as HTMLElement).style.borderColor = 'transparent';
      });
      (btn as HTMLElement).style.background = 'rgba(255, 150, 200, 0.3)';
      (btn as HTMLElement).style.borderColor = 'rgba(255, 150, 200, 0.5)';

      // Update preview
      selectedFilter = (btn as HTMLElement).dataset.filter || 'none';
      selectedCss = (btn as HTMLElement).dataset.css || '';
      preview.style.filter = selectedCss;
    };

    (btn as HTMLElement).onmouseover = () => {
      const css = (btn as HTMLElement).dataset.css || '';
      preview.style.filter = css;
    };

    (btn as HTMLElement).onmouseout = () => {
      preview.style.filter = selectedCss;
    };
  });

  applyBtn.onclick = () => {
    system.currentFilter = selectedFilter;
    saveFilterPreference(selectedFilter);

    if (system.onApply) {
      system.onApply(selectedCss);
    }

    closeFiltersPanel(system);
  };
}

/**
 * Close filters panel
 */
export function closeFiltersPanel(system: PhotoFiltersSystem): void {
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
 * Get current filter CSS
 */
export function getCurrentFilterCss(system: PhotoFiltersSystem): string {
  return FILTERS.find(f => f.id === system.currentFilter)?.css || '';
}

/**
 * Get all available filters
 */
export function getAvailableFilters(): PhotoFilter[] {
  return [...FILTERS];
}

/**
 * Apply filter to canvas and return data URL
 */
export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  filterCss: string
): string {
  // Create off-screen canvas with filter applied
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;

  const ctx = offscreen.getContext('2d');
  if (!ctx) return canvas.toDataURL();

  // Apply filter
  ctx.filter = filterCss || 'none';
  ctx.drawImage(canvas, 0, 0);

  return offscreen.toDataURL('image/png');
}

// ============================================================================
// Persistence
// ============================================================================

const STORAGE_KEY = 'genuary-museum-photofilter';

function loadFilterPreference(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveFilterPreference(filterId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, filterId);
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePhotoFiltersSystem(system: PhotoFiltersSystem): void {
  system.cleanup();
}
