/**
 * Photo Booth
 *
 * Take stylized photos with filters and decorative frames.
 * Enhances the screenshot experience with artistic effects.
 */

// ============================================================================
// Types
// ============================================================================

export interface PhotoFilter {
  id: string;
  name: string;
  cssFilter: string;
}

export interface PhotoFrame {
  id: string;
  name: string;
  svg: string;
}

export interface PhotoBooth {
  container: HTMLElement;
  isOpen: boolean;
  popup: HTMLElement | null;
  currentFilter: string;
  currentFrame: string;
  canvas: HTMLCanvasElement | null;
  onCapture: ((dataUrl: string, dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Filters
// ============================================================================

const FILTERS: PhotoFilter[] = [
  { id: 'none', name: 'Original', cssFilter: 'none' },
  { id: 'grayscale', name: 'Noir', cssFilter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Vintage', cssFilter: 'sepia(80%)' },
  { id: 'vivid', name: 'Vivid', cssFilter: 'saturate(150%) contrast(110%)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(30deg) saturate(90%)' },
  { id: 'warm', name: 'Warm', cssFilter: 'hue-rotate(-15deg) saturate(110%)' },
  { id: 'dramatic', name: 'Dramatic', cssFilter: 'contrast(130%) brightness(90%)' },
  { id: 'dreamy', name: 'Dreamy', cssFilter: 'blur(0.5px) brightness(105%) saturate(80%)' },
  { id: 'night', name: 'Night', cssFilter: 'brightness(70%) saturate(80%) hue-rotate(200deg)' },
];

// ============================================================================
// Frames (SVG-based)
// ============================================================================

const FRAMES: PhotoFrame[] = [
  { id: 'none', name: 'No Frame', svg: '' },
  {
    id: 'classic',
    name: 'Classic',
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="#8b7355" stroke-width="4"/>
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="#c4a35a" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'modern',
    name: 'Modern',
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    svg: `<svg viewBox="0 0 100 120" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="120" fill="white"/>
      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#e0e0e0" stroke-width="1"/>
    </svg>`,
  },
  {
    id: 'ornate',
    name: 'Ornate',
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#c4a35a" stroke-width="3"/>
      <circle cx="5" cy="5" r="3" fill="#c4a35a"/>
      <circle cx="95" cy="5" r="3" fill="#c4a35a"/>
      <circle cx="5" cy="95" r="3" fill="#c4a35a"/>
      <circle cx="95" cy="95" r="3" fill="#c4a35a"/>
    </svg>`,
  },
  {
    id: 'rounded',
    name: 'Rounded',
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="3" y="3" width="94" height="94" rx="8" fill="none" stroke="#4a9eff" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'neon',
    name: 'Neon',
    svg: `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#ff00ff" stroke-width="2" style="filter: drop-shadow(0 0 3px #ff00ff)"/>
      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#00ffff" stroke-width="1" style="filter: drop-shadow(0 0 2px #00ffff)"/>
    </svg>`,
  },
];

// ============================================================================
// Photo Booth Creation
// ============================================================================

/**
 * Create the photo booth system
 */
export function createPhotoBooth(container: HTMLElement): PhotoBooth {
  const booth: PhotoBooth = {
    container,
    isOpen: false,
    popup: null,
    currentFilter: 'none',
    currentFrame: 'none',
    canvas: null,
    onCapture: null,
    cleanup: () => {
      if (booth.popup) {
        booth.popup.remove();
        booth.popup = null;
      }
    },
  };

  return booth;
}

/**
 * Open the photo booth with a canvas source
 */
export function openPhotoBooth(booth: PhotoBooth, sourceCanvas: HTMLCanvasElement, dayNumber: number): void {
  if (booth.popup) return;

  booth.currentFilter = 'none';
  booth.currentFrame = 'none';

  const popup = document.createElement('div');
  popup.id = 'photo-booth-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 20px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <h2 style="margin: 0; font-size: 18px; color: white;">Photo Booth</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Day ${dayNumber}</p>
      </div>
      <button id="photo-booth-close" style="
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

    <div style="padding: 20px;">
      <div id="photo-booth-preview" style="
        width: 100%;
        height: 300px;
        background: #1a1a2e;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        overflow: hidden;
        position: relative;
      ">
        <canvas id="photo-booth-canvas" style="max-width: 100%; max-height: 100%; object-fit: contain;"></canvas>
        <div id="photo-booth-frame" style="position: absolute; inset: 0; pointer-events: none;"></div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Filters</div>
        <div id="photo-booth-filters" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Frames</div>
        <div id="photo-booth-frames" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="photo-booth-cancel" style="
          background: rgba(100, 100, 120, 0.5);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">Cancel</button>
        <button id="photo-booth-save" style="
          background: linear-gradient(135deg, #4a9eff, #a855f7);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">Save Photo</button>
      </div>
    </div>
  `;

  // Copy source canvas to booth canvas
  setTimeout(() => {
    const previewCanvas = document.getElementById('photo-booth-canvas') as HTMLCanvasElement;
    if (previewCanvas && sourceCanvas) {
      // Set canvas dimensions
      previewCanvas.width = sourceCanvas.width;
      previewCanvas.height = sourceCanvas.height;

      // Draw the source
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(sourceCanvas, 0, 0);
      }

      booth.canvas = previewCanvas;
    }

    // Render filter buttons
    const filtersContainer = document.getElementById('photo-booth-filters');
    if (filtersContainer) {
      FILTERS.forEach(filter => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = filter.id;
        btn.style.cssText = `
          background: ${filter.id === booth.currentFilter ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)'};
          border: 1px solid ${filter.id === booth.currentFilter ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)'};
          border-radius: 6px;
          padding: 6px 12px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        `;
        btn.textContent = filter.name;
        btn.onclick = () => {
          booth.currentFilter = filter.id;
          updatePreview(booth, sourceCanvas);
          // Update button styles
          filtersContainer.querySelectorAll('.filter-btn').forEach(b => {
            const isSelected = (b as HTMLElement).dataset.filter === filter.id;
            (b as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)';
            (b as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)';
          });
        };
        filtersContainer.appendChild(btn);
      });
    }

    // Render frame buttons
    const framesContainer = document.getElementById('photo-booth-frames');
    if (framesContainer) {
      FRAMES.forEach(frame => {
        const btn = document.createElement('button');
        btn.className = 'frame-btn';
        btn.dataset.frame = frame.id;
        btn.style.cssText = `
          background: ${frame.id === booth.currentFrame ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)'};
          border: 1px solid ${frame.id === booth.currentFrame ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)'};
          border-radius: 6px;
          padding: 6px 12px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        `;
        btn.textContent = frame.name;
        btn.onclick = () => {
          booth.currentFrame = frame.id;
          updateFrame(booth);
          // Update button styles
          framesContainer.querySelectorAll('.frame-btn').forEach(b => {
            const isSelected = (b as HTMLElement).dataset.frame === frame.id;
            (b as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)';
            (b as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)';
          });
        };
        framesContainer.appendChild(btn);
      });
    }

    // Wire up buttons
    const closeBtn = document.getElementById('photo-booth-close');
    const cancelBtn = document.getElementById('photo-booth-cancel');
    const saveBtn = document.getElementById('photo-booth-save');

    if (closeBtn) closeBtn.onclick = () => closePhotoBooth(booth);
    if (cancelBtn) cancelBtn.onclick = () => closePhotoBooth(booth);
    if (saveBtn) {
      saveBtn.onclick = () => {
        const dataUrl = exportPhoto(booth);
        if (dataUrl) {
          booth.onCapture?.(dataUrl, dayNumber);
          closePhotoBooth(booth);
        }
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePhotoBooth(booth);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  booth.container.appendChild(popup);
  booth.popup = popup;
  booth.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });
}

/**
 * Update the preview with current filter
 */
function updatePreview(booth: PhotoBooth, sourceCanvas: HTMLCanvasElement): void {
  const previewCanvas = booth.canvas;
  if (!previewCanvas) return;

  const filter = FILTERS.find(f => f.id === booth.currentFilter);
  if (!filter) return;

  // Apply CSS filter to canvas container
  previewCanvas.style.filter = filter.cssFilter;
}

/**
 * Update the frame overlay
 */
function updateFrame(booth: PhotoBooth): void {
  const frameContainer = document.getElementById('photo-booth-frame');
  if (!frameContainer) return;

  const frame = FRAMES.find(f => f.id === booth.currentFrame);
  if (!frame || !frame.svg) {
    frameContainer.innerHTML = '';
    return;
  }

  frameContainer.innerHTML = frame.svg;
  frameContainer.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
  `;
  const svg = frameContainer.querySelector('svg');
  if (svg) {
    svg.style.cssText = 'width: 100%; height: 100%;';
  }
}

/**
 * Export the photo with filter applied
 */
function exportPhoto(booth: PhotoBooth): string | null {
  const previewCanvas = booth.canvas;
  if (!previewCanvas) return null;

  const filter = FILTERS.find(f => f.id === booth.currentFilter);

  // Create export canvas with filter baked in
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = previewCanvas.width;
  exportCanvas.height = previewCanvas.height;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return null;

  // Apply filter
  if (filter && filter.cssFilter !== 'none') {
    ctx.filter = filter.cssFilter;
  }

  // Draw the image
  ctx.drawImage(previewCanvas, 0, 0);

  // Note: SVG frames would need more complex rendering to bake into the image
  // For now, just export with filter

  return exportCanvas.toDataURL('image/png');
}

/**
 * Close the photo booth
 */
function closePhotoBooth(booth: PhotoBooth): void {
  if (!booth.popup) return;

  booth.popup.style.opacity = '0';
  const popup = booth.popup;

  setTimeout(() => {
    popup.remove();
    if (booth.popup === popup) {
      booth.popup = null;
    }
  }, 300);

  booth.isOpen = false;
  booth.canvas = null;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePhotoBooth(booth: PhotoBooth): void {
  booth.cleanup();
}
