/**
 * Virtual Postcards
 *
 * Create stylized postcards from exhibits to share with friends.
 * Adds a decorative frame and message to screenshots.
 */

// ============================================================================
// Types
// ============================================================================

export interface PostcardTemplate {
  id: string;
  name: string;
  borderColor: string;
  textColor: string;
  bgGradient: string;
  stampEmoji: string;
}

export interface PostcardSystem {
  container: HTMLElement;
  isOpen: boolean;
  popup: HTMLElement | null;
  currentTemplate: string;
  message: string;
  onSave: ((dataUrl: string) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Templates
// ============================================================================

const TEMPLATES: PostcardTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    borderColor: '#8b7355',
    textColor: '#4a3728',
    bgGradient: 'linear-gradient(135deg, #f5f5dc, #fffacd)',
    stampEmoji: '🏛️',
  },
  {
    id: 'modern',
    name: 'Modern',
    borderColor: '#333',
    textColor: '#222',
    bgGradient: 'linear-gradient(135deg, #fff, #f0f0f0)',
    stampEmoji: '🎨',
  },
  {
    id: 'neon',
    name: 'Neon',
    borderColor: '#ff00ff',
    textColor: '#00ffff',
    bgGradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    stampEmoji: '✨',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    borderColor: '#8b4513',
    textColor: '#654321',
    bgGradient: 'linear-gradient(135deg, #d4a574, #c19a6b)',
    stampEmoji: '📮',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    borderColor: '#ddd',
    textColor: '#666',
    bgGradient: 'linear-gradient(135deg, #fafafa, #f5f5f5)',
    stampEmoji: '💌',
  },
];

// ============================================================================
// Messages
// ============================================================================

const DEFAULT_MESSAGES = [
  'Greetings from Genuary 2026!',
  'Wish you were here!',
  'Art is everywhere.',
  'Code creates beauty.',
  'Found this gem today.',
];

// ============================================================================
// Postcard System Creation
// ============================================================================

/**
 * Create the postcard system
 */
export function createPostcardSystem(container: HTMLElement): PostcardSystem {
  const system: PostcardSystem = {
    container,
    isOpen: false,
    popup: null,
    currentTemplate: 'classic',
    message: DEFAULT_MESSAGES[0],
    onSave: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  return system;
}

/**
 * Open the postcard creator
 */
export function openPostcardCreator(
  system: PostcardSystem,
  sourceCanvas: HTMLCanvasElement,
  dayNumber: number
): void {
  if (system.popup) return;

  system.message = DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)];
  system.currentTemplate = 'classic';

  const popup = document.createElement('div');
  popup.id = 'postcard-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 650px;
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
        <h2 style="margin: 0; font-size: 18px; color: white;">Create Postcard</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Day ${dayNumber}</p>
      </div>
      <button id="postcard-close" style="
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
      <div id="postcard-preview" style="
        width: 100%;
        height: 320px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      "></div>

      <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Message</div>
        <input type="text" id="postcard-message" value="${system.message}" maxlength="50" style="
          width: 100%;
          box-sizing: border-box;
          background: rgba(40, 40, 60, 0.8);
          border: 1px solid rgba(100, 150, 255, 0.3);
          border-radius: 6px;
          padding: 10px 12px;
          color: white;
          font-size: 13px;
        ">
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Style</div>
        <div id="postcard-templates" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="postcard-cancel" style="
          background: rgba(100, 100, 120, 0.5);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">Cancel</button>
        <button id="postcard-save" style="
          background: linear-gradient(135deg, #4a9eff, #a855f7);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">Save Postcard</button>
      </div>
    </div>
  `;

  // Initialize after DOM insertion
  setTimeout(() => {
    // Render preview
    renderPostcardPreview(system, sourceCanvas, dayNumber);

    // Render template buttons
    const templatesContainer = document.getElementById('postcard-templates');
    if (templatesContainer) {
      TEMPLATES.forEach(template => {
        const btn = document.createElement('button');
        btn.className = 'template-btn';
        btn.dataset.template = template.id;
        btn.style.cssText = `
          background: ${template.id === system.currentTemplate ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)'};
          border: 1px solid ${template.id === system.currentTemplate ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)'};
          border-radius: 6px;
          padding: 6px 12px;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        `;
        btn.innerHTML = `${template.stampEmoji} ${template.name}`;
        btn.onclick = () => {
          system.currentTemplate = template.id;
          renderPostcardPreview(system, sourceCanvas, dayNumber);
          // Update button styles
          templatesContainer.querySelectorAll('.template-btn').forEach(b => {
            const isSelected = (b as HTMLElement).dataset.template === template.id;
            (b as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.3)' : 'rgba(60, 60, 80, 0.5)';
            (b as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.5)' : 'rgba(100, 100, 120, 0.5)';
          });
        };
        templatesContainer.appendChild(btn);
      });
    }

    // Message input
    const messageInput = document.getElementById('postcard-message') as HTMLInputElement;
    if (messageInput) {
      messageInput.oninput = () => {
        system.message = messageInput.value;
        renderPostcardPreview(system, sourceCanvas, dayNumber);
      };
    }

    // Buttons
    const closeBtn = document.getElementById('postcard-close');
    const cancelBtn = document.getElementById('postcard-cancel');
    const saveBtn = document.getElementById('postcard-save');

    if (closeBtn) closeBtn.onclick = () => closePostcardCreator(system);
    if (cancelBtn) cancelBtn.onclick = () => closePostcardCreator(system);
    if (saveBtn) {
      saveBtn.onclick = () => {
        const dataUrl = exportPostcard(system, sourceCanvas, dayNumber);
        if (dataUrl) {
          system.onSave?.(dataUrl);
          closePostcardCreator(system);
        }
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePostcardCreator(system);
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
 * Render the postcard preview
 */
function renderPostcardPreview(
  system: PostcardSystem,
  sourceCanvas: HTMLCanvasElement,
  dayNumber: number
): void {
  const previewContainer = document.getElementById('postcard-preview');
  if (!previewContainer) return;

  const template = TEMPLATES.find(t => t.id === system.currentTemplate) || TEMPLATES[0];

  // Create a mini postcard preview
  previewContainer.style.background = template.bgGradient;
  previewContainer.style.border = `4px solid ${template.borderColor}`;
  previewContainer.style.padding = '15px';
  previewContainer.style.boxSizing = 'border-box';

  previewContainer.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      gap: 15px;
    ">
      <div style="
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${template.borderColor};
        border-radius: 4px;
        overflow: hidden;
        background: #000;
      ">
        <canvas id="postcard-canvas" style="max-width: 100%; max-height: 100%; object-fit: contain;"></canvas>
      </div>
      <div style="
        width: 180px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10px;
      ">
        <div>
          <div style="
            font-size: 11px;
            color: ${template.textColor};
            font-style: italic;
            line-height: 1.4;
            margin-bottom: 10px;
          ">"${system.message}"</div>
          <div style="
            font-size: 10px;
            color: ${template.textColor};
            opacity: 0.7;
          ">Day ${dayNumber} - Genuary 2026</div>
        </div>
        <div style="
          text-align: right;
          font-size: 32px;
        ">${template.stampEmoji}</div>
      </div>
    </div>
  `;

  // Draw the source canvas to the preview
  setTimeout(() => {
    const canvas = document.getElementById('postcard-canvas') as HTMLCanvasElement;
    if (canvas && sourceCanvas) {
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(sourceCanvas, 0, 0);
      }
    }
  }, 0);
}

/**
 * Export the postcard as an image
 */
function exportPostcard(
  system: PostcardSystem,
  sourceCanvas: HTMLCanvasElement,
  dayNumber: number
): string | null {
  const template = TEMPLATES.find(t => t.id === system.currentTemplate) || TEMPLATES[0];

  // Create export canvas
  const width = 800;
  const height = 500;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (template.id === 'classic') {
    gradient.addColorStop(0, '#f5f5dc');
    gradient.addColorStop(1, '#fffacd');
  } else if (template.id === 'modern') {
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#f0f0f0');
  } else if (template.id === 'neon') {
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
  } else if (template.id === 'vintage') {
    gradient.addColorStop(0, '#d4a574');
    gradient.addColorStop(1, '#c19a6b');
  } else {
    gradient.addColorStop(0, '#fafafa');
    gradient.addColorStop(1, '#f5f5f5');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw border
  ctx.strokeStyle = template.borderColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Draw image area
  const imgX = 30;
  const imgY = 30;
  const imgW = 450;
  const imgH = height - 60;

  ctx.strokeStyle = template.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(imgX, imgY, imgW, imgH);

  // Draw the source image
  const sourceAspect = sourceCanvas.width / sourceCanvas.height;
  const targetAspect = imgW / imgH;
  let drawW, drawH, drawX, drawY;

  if (sourceAspect > targetAspect) {
    drawW = imgW;
    drawH = imgW / sourceAspect;
    drawX = imgX;
    drawY = imgY + (imgH - drawH) / 2;
  } else {
    drawH = imgH;
    drawW = imgH * sourceAspect;
    drawX = imgX + (imgW - drawW) / 2;
    drawY = imgY;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(imgX, imgY, imgW, imgH);
  ctx.drawImage(sourceCanvas, drawX, drawY, drawW, drawH);

  // Draw text area
  const textX = imgX + imgW + 30;
  const textY = 50;

  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = template.textColor;
  ctx.textAlign = 'left';

  // Word wrap the message
  const maxWidth = width - textX - 40;
  const words = system.message.split(' ');
  let line = '"';
  let y = textY;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '"') {
      ctx.fillText(line, textX, y);
      line = word + ' ';
      y += 24;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim() + '"', textX, y);

  // Draw day info
  ctx.font = '14px system-ui, sans-serif';
  ctx.globalAlpha = 0.7;
  ctx.fillText(`Day ${dayNumber} - Genuary 2026`, textX, y + 40);
  ctx.globalAlpha = 1;

  // Draw stamp emoji
  ctx.font = '48px serif';
  ctx.textAlign = 'right';
  ctx.fillText(template.stampEmoji, width - 40, height - 40);

  return canvas.toDataURL('image/png');
}

/**
 * Close the postcard creator
 */
function closePostcardCreator(system: PostcardSystem): void {
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

// ============================================================================
// Cleanup
// ============================================================================

export function disposePostcardSystem(system: PostcardSystem): void {
  system.cleanup();
}
