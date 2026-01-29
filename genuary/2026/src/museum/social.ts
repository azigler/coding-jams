/**
 * Social Share
 *
 * Enhanced sharing with formatted images including
 * exhibit info, museum branding, and visitor stats.
 */

// ============================================================================
// Types
// ============================================================================

export interface ShareTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface ShareData {
  dayNumber: number;
  promptTitle: string;
  exhibitsViewed: number;
  favoritesCount: number;
  timeSpent: number;
}

export interface SocialSystem {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  currentTemplate: string;
  cleanup: () => void;
}

// ============================================================================
// Templates
// ============================================================================

const TEMPLATES: ShareTemplate[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    bgColor: '#0a0a12',
    textColor: '#ffffff',
    accentColor: '#4a9eff',
  },
  {
    id: 'light',
    name: 'Light Mode',
    bgColor: '#fafafa',
    textColor: '#1a1a1a',
    accentColor: '#4a9eff',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    bgColor: 'gradient',
    textColor: '#ffffff',
    accentColor: '#a855f7',
  },
  {
    id: 'neon',
    name: 'Neon',
    bgColor: '#1a1a2e',
    textColor: '#00ffff',
    accentColor: '#ff00ff',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    bgColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#666666',
  },
];

// ============================================================================
// Prompt Titles (subset for quick reference)
// ============================================================================

const PROMPT_TITLES: Record<number, string> = {
  1: 'Vertical or horizontal lines only',
  2: 'Layers upon layers upon layers',
  3: 'Exactly 42 lines of code',
  4: 'Black on black',
  5: 'Isometric Art',
  6: 'Make a landscape using only primitives',
  7: 'Use software that is new to you',
  8: 'Chaotic',
  9: 'The textile design industry',
  10: 'Hex codes only',
  11: 'Impossible',
  12: 'Subdivision',
  13: 'Triangles and only triangles',
  14: 'Shaders',
  15: 'Design a rug',
  16: 'Generative palette',
  17: 'Inspired by architecture',
  18: 'Connections',
  19: 'Flocking',
  20: 'Generative typography',
  21: 'Combine two',
  22: 'Gradients',
  23: 'ASCII/code/terminal output',
  24: 'Inspired by early net art',
  25: 'Infinity mirror',
  26: 'Geometric pattern',
  27: 'Moiré',
  28: 'Skeuomorphic',
  29: 'Glitch',
  30: 'Abstract maps',
  31: 'Retrospective',
};

// ============================================================================
// Social System Creation
// ============================================================================

/**
 * Create the social share system
 */
export function createSocialSystem(container: HTMLElement): SocialSystem {
  const system: SocialSystem = {
    container,
    popup: null,
    isOpen: false,
    currentTemplate: 'dark',
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
 * Open the share popup
 */
export function openSharePopup(
  system: SocialSystem,
  sourceCanvas: HTMLCanvasElement,
  data: ShareData
): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'social-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
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

  const promptTitle = PROMPT_TITLES[data.dayNumber] || `Day ${data.dayNumber}`;

  popup.innerHTML = `
    <div style="
      padding: 20px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <h2 style="margin: 0; font-size: 18px; color: white;">📤 Share Exhibit</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
          Day ${data.dayNumber}: ${promptTitle}
        </p>
      </div>
      <button id="social-close" style="
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
      <!-- Preview -->
      <div id="social-preview" style="
        background: #0a0a12;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 15px;
      ">
        <canvas id="social-canvas" style="width: 100%; display: block;"></canvas>
      </div>

      <!-- Template selector -->
      <div style="margin-bottom: 15px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Style</div>
        <div id="social-templates" style="display: flex; gap: 8px;">
          ${TEMPLATES.map(t => `
            <button class="template-btn" data-template="${t.id}" style="
              flex: 1;
              background: ${t.id === system.currentTemplate ? 'rgba(74, 158, 255, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
              border: 1px solid ${t.id === system.currentTemplate ? 'rgba(74, 158, 255, 0.5)' : 'rgba(60, 60, 80, 0.5)'};
              border-radius: 6px;
              padding: 8px;
              color: white;
              font-size: 10px;
              cursor: pointer;
            ">${t.name}</button>
          `).join('')}
        </div>
      </div>

      <!-- Share buttons -->
      <div style="display: flex; gap: 10px;">
        <button id="social-download" style="
          flex: 1;
          background: linear-gradient(135deg, #4a9eff, #a855f7);
          border: none;
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">⬇️ Download Image</button>
        <button id="social-copy" style="
          flex: 1;
          background: rgba(40, 40, 60, 0.5);
          border: 1px solid rgba(100, 100, 120, 0.5);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">📋 Copy to Clipboard</button>
      </div>

      <!-- Share text -->
      <div style="margin-top: 15px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Share text</div>
        <textarea id="social-text" style="
          width: 100%;
          height: 60px;
          box-sizing: border-box;
          background: rgba(40, 40, 60, 0.5);
          border: 1px solid rgba(100, 100, 120, 0.5);
          border-radius: 6px;
          padding: 10px;
          color: white;
          font-size: 12px;
          font-family: inherit;
          resize: none;
        ">Day ${data.dayNumber} of Genuary 2026 "${promptTitle}" 🎨

Explored ${data.exhibitsViewed} exhibits at the virtual museum!

#genuary #genuary2026 #generativeart #creativecoding</textarea>
      </div>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Render initial preview
  setTimeout(() => {
    renderShareImage(system, sourceCanvas, data);
    wireUpSocialPopup(system, sourceCanvas, data);
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSharePopup(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Render the share image
 */
function renderShareImage(
  system: SocialSystem,
  sourceCanvas: HTMLCanvasElement,
  data: ShareData
): void {
  const canvas = document.getElementById('social-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const template = TEMPLATES.find(t => t.id === system.currentTemplate) || TEMPLATES[0];
  const promptTitle = PROMPT_TITLES[data.dayNumber] || `Day ${data.dayNumber}`;

  // Set canvas size (1200x630 for social media)
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw background
  if (template.bgColor === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4a9eff');
    gradient.addColorStop(0.5, '#a855f7');
    gradient.addColorStop(1, '#ff6b6b');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = template.bgColor;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw exhibit image
  const imgSize = 400;
  const imgX = 60;
  const imgY = (canvas.height - imgSize) / 2;

  // Draw border around image
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(imgX - 2, imgY - 2, imgSize + 4, imgSize + 4);

  // Draw the source canvas
  ctx.drawImage(sourceCanvas, imgX, imgY, imgSize, imgSize);

  // Draw text content
  const textX = imgX + imgSize + 60;
  const textWidth = canvas.width - textX - 60;

  // Title
  ctx.fillStyle = template.textColor;
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.fillText(`Day ${data.dayNumber}`, textX, 140);

  // Prompt title
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillStyle = template.accentColor;

  // Word wrap prompt title
  const words = promptTitle.split(' ');
  let line = '';
  let y = 190;
  const maxWidth = textWidth;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), textX, y);
      line = word + ' ';
      y += 36;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), textX, y);

  // Stats
  ctx.fillStyle = template.textColor;
  ctx.globalAlpha = 0.7;
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(`${data.exhibitsViewed} exhibits explored`, textX, canvas.height - 140);
  ctx.fillText(`${data.favoritesCount} favorites`, textX, canvas.height - 110);
  ctx.fillText(`${formatTime(data.timeSpent)} spent`, textX, canvas.height - 80);
  ctx.globalAlpha = 1;

  // Branding
  ctx.fillStyle = template.textColor;
  ctx.globalAlpha = 0.5;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('GENUARY 2026 VIRTUAL MUSEUM', textX, canvas.height - 30);
  ctx.globalAlpha = 1;
}

/**
 * Wire up the social popup interactions
 */
function wireUpSocialPopup(
  system: SocialSystem,
  sourceCanvas: HTMLCanvasElement,
  data: ShareData
): void {
  if (!system.popup) return;

  const closeBtn = document.getElementById('social-close');
  const downloadBtn = document.getElementById('social-download');
  const copyBtn = document.getElementById('social-copy');
  const templateBtns = system.popup.querySelectorAll('.template-btn');

  if (closeBtn) {
    closeBtn.onclick = () => closeSharePopup(system);
  }

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const canvas = document.getElementById('social-canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `genuary-2026-day-${data.dayNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
  }

  if (copyBtn) {
    copyBtn.onclick = async () => {
      const canvas = document.getElementById('social-canvas') as HTMLCanvasElement;
      if (canvas) {
        try {
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/png');
          });
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            copyBtn.textContent = '✓ Copied!';
            setTimeout(() => {
              copyBtn.textContent = '📋 Copy to Clipboard';
            }, 2000);
          }
        } catch {
          // Fallback: copy share text
          const textArea = document.getElementById('social-text') as HTMLTextAreaElement;
          if (textArea) {
            await navigator.clipboard.writeText(textArea.value);
            copyBtn.textContent = '✓ Text Copied!';
            setTimeout(() => {
              copyBtn.textContent = '📋 Copy to Clipboard';
            }, 2000);
          }
        }
      }
    };
  }

  templateBtns.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      system.currentTemplate = (btn as HTMLElement).dataset.template || 'dark';
      renderShareImage(system, sourceCanvas, data);

      // Update button styles
      templateBtns.forEach(b => {
        const isSelected = (b as HTMLElement).dataset.template === system.currentTemplate;
        (b as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.3)' : 'rgba(40, 40, 60, 0.5)';
        (b as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.5)' : 'rgba(60, 60, 80, 0.5)';
      });
    };
  });
}

/**
 * Close the share popup
 */
export function closeSharePopup(system: SocialSystem): void {
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
 * Format time in human readable format
 */
function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSocialSystem(system: SocialSystem): void {
  system.cleanup();
}
