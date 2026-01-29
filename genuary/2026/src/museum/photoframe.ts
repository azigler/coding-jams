/**
 * Photo Frame
 *
 * Display exhibit screenshots in an elegant frame
 * for sharing or personal enjoyment.
 */

// ============================================================================
// Types
// ============================================================================

export interface PhotoFrameOptions {
  style: 'classic' | 'modern' | 'ornate' | 'minimal';
  matColor: string;
  showCaption: boolean;
  showDate: boolean;
}

export interface PhotoFrameSystem {
  container: HTMLElement;
  overlay: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Frame Styles
// ============================================================================

const FRAME_STYLES = {
  classic: {
    name: 'Classic',
    border: '16px solid #8B4513',
    innerBorder: '4px solid #D4AF37',
    borderRadius: '0',
    shadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)',
  },
  modern: {
    name: 'Modern',
    border: '8px solid #333',
    innerBorder: '2px solid #555',
    borderRadius: '2px',
    shadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  ornate: {
    name: 'Ornate',
    border: '24px solid #654321',
    innerBorder: '6px solid #B8860B',
    borderRadius: '4px',
    shadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 4px 8px rgba(255,215,0,0.2)',
  },
  minimal: {
    name: 'Minimal',
    border: '2px solid #666',
    innerBorder: 'none',
    borderRadius: '0',
    shadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
};

const MAT_COLORS = [
  { name: 'White', value: '#f5f5f5' },
  { name: 'Cream', value: '#f5f5dc' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1a1a3e' },
  { name: 'Burgundy', value: '#3e1a1a' },
];

// ============================================================================
// Photo Frame System Creation
// ============================================================================

/**
 * Create the photo frame system
 */
export function createPhotoFrameSystem(container: HTMLElement): PhotoFrameSystem {
  const system: PhotoFrameSystem = {
    container,
    overlay: null,
    isOpen: false,
    cleanup: () => {
      closePhotoFrame(system);
    },
  };

  return system;
}

/**
 * Show photo in frame
 */
export function showPhotoInFrame(
  system: PhotoFrameSystem,
  imageUrl: string,
  dayNumber: number,
  options: PhotoFrameOptions = {
    style: 'classic',
    matColor: '#f5f5f5',
    showCaption: true,
    showDate: true,
  }
): void {
  closePhotoFrame(system);

  system.isOpen = true;

  const frameStyle = FRAME_STYLES[options.style];

  const overlay = document.createElement('div');
  overlay.id = 'photoframe-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  overlay.innerHTML = `
    <!-- Frame -->
    <div id="frame-container" style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        background: ${options.matColor};
        padding: 40px;
        border: ${frameStyle.border};
        border-radius: ${frameStyle.borderRadius};
        box-shadow: ${frameStyle.shadow};
        position: relative;
      ">
        ${frameStyle.innerBorder !== 'none' ? `
          <div style="
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            border: ${frameStyle.innerBorder};
            pointer-events: none;
          "></div>
        ` : ''}

        <img src="${imageUrl}" style="
          max-width: 500px;
          max-height: 400px;
          display: block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        " />

        ${options.showCaption || options.showDate ? `
          <div style="
            margin-top: 20px;
            text-align: center;
            font-family: 'Georgia', serif;
            color: #333;
          ">
            ${options.showCaption ? `
              <div style="font-size: 16px; font-style: italic;">
                Day ${dayNumber} — Genuary 2026
              </div>
            ` : ''}
            ${options.showDate ? `
              <div style="font-size: 12px; margin-top: 8px; color: #666;">
                ${date}
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Controls -->
      <div style="
        margin-top: 30px;
        display: flex;
        gap: 15px;
        align-items: center;
      ">
        <!-- Frame style selector -->
        <div style="display: flex; gap: 8px;">
          ${Object.entries(FRAME_STYLES).map(([key, style]) => `
            <button class="frame-style-btn" data-style="${key}" style="
              background: ${key === options.style ? 'rgba(255, 200, 100, 0.3)' : 'rgba(40, 40, 60, 0.8)'};
              border: 1px solid ${key === options.style ? 'rgba(255, 200, 100, 0.5)' : 'rgba(100, 100, 100, 0.3)'};
              border-radius: 8px;
              padding: 8px 12px;
              color: white;
              font-size: 11px;
              cursor: pointer;
              font-family: system-ui, sans-serif;
            ">${style.name}</button>
          `).join('')}
        </div>

        <!-- Mat color selector -->
        <div style="display: flex; gap: 4px; margin-left: 15px;">
          ${MAT_COLORS.map(color => `
            <button class="mat-color-btn" data-color="${color.value}" title="${color.name}" style="
              width: 24px;
              height: 24px;
              background: ${color.value};
              border: 2px solid ${color.value === options.matColor ? '#ffc864' : 'transparent'};
              border-radius: 4px;
              cursor: pointer;
            "></button>
          `).join('')}
        </div>

        <!-- Download button -->
        <button id="frame-download" style="
          background: rgba(100, 200, 100, 0.3);
          border: 1px solid rgba(100, 200, 100, 0.5);
          border-radius: 8px;
          padding: 8px 16px;
          color: white;
          font-size: 12px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          margin-left: 15px;
        ">Download</button>
      </div>
    </div>

    <!-- Close button -->
    <button id="frame-close" style="
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(40, 40, 60, 0.8);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      font-size: 20px;
      cursor: pointer;
    ">×</button>
  `;

  system.container.appendChild(overlay);
  system.overlay = overlay;

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = overlay.querySelector('#frame-close') as HTMLButtonElement;
  closeBtn.onclick = () => closePhotoFrame(system);

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closePhotoFrame(system);
    }
  };

  // Wire up frame style buttons
  const styleBtns = overlay.querySelectorAll('.frame-style-btn');
  styleBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const newStyle = (btn as HTMLElement).dataset.style as PhotoFrameOptions['style'];
      showPhotoInFrame(system, imageUrl, dayNumber, { ...options, style: newStyle });
    };
  });

  // Wire up mat color buttons
  const colorBtns = overlay.querySelectorAll('.mat-color-btn');
  colorBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const newColor = (btn as HTMLElement).dataset.color || '#f5f5f5';
      showPhotoInFrame(system, imageUrl, dayNumber, { ...options, matColor: newColor });
    };
  });

  // Wire up download
  const downloadBtn = overlay.querySelector('#frame-download') as HTMLButtonElement;
  downloadBtn.onclick = () => {
    downloadFramedPhoto(imageUrl, dayNumber, options);
  };

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePhotoFrame(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Download framed photo
 */
function downloadFramedPhoto(
  imageUrl: string,
  dayNumber: number,
  options: PhotoFrameOptions
): void {
  // Create a canvas and draw the framed photo
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const padding = 60;
    const frameWidth = 20;

    canvas.width = img.width + padding * 2 + frameWidth * 2;
    canvas.height = img.height + padding * 2 + frameWidth * 2 + 60; // Extra for caption

    // Draw frame background
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mat
    ctx.fillStyle = options.matColor;
    ctx.fillRect(frameWidth, frameWidth, canvas.width - frameWidth * 2, canvas.height - frameWidth * 2);

    // Draw image
    ctx.drawImage(img, frameWidth + padding, frameWidth + padding);

    // Draw caption
    if (options.showCaption) {
      ctx.fillStyle = '#333';
      ctx.font = 'italic 16px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(`Day ${dayNumber} — Genuary 2026`, canvas.width / 2, canvas.height - frameWidth - 30);
    }

    // Download
    const link = document.createElement('a');
    link.download = `genuary-day-${dayNumber}-framed.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = imageUrl;
}

/**
 * Close photo frame
 */
export function closePhotoFrame(system: PhotoFrameSystem): void {
  if (!system.overlay) return;

  system.overlay.style.opacity = '0';
  const overlay = system.overlay;

  setTimeout(() => {
    overlay.remove();
    if (system.overlay === overlay) {
      system.overlay = null;
    }
  }, 300);

  system.isOpen = false;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePhotoFrameSystem(system: PhotoFrameSystem): void {
  system.cleanup();
}
