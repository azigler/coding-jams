/**
 * Share Card
 *
 * Generate shareable social media cards
 * summarizing a museum visit.
 */

// ============================================================================
// Types
// ============================================================================

export interface ShareCardData {
  exhibitsViewed: number;
  favoritesCount: number;
  timeSpent: number; // seconds
  topExhibit?: number;
  screenshotsTaken: number;
}

export interface ShareCardSystem {
  container: HTMLElement;
  panel: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Share Card System Creation
// ============================================================================

/**
 * Create the share card system
 */
export function createShareCardSystem(container: HTMLElement): ShareCardSystem {
  const system: ShareCardSystem = {
    container,
    panel: null,
    isOpen: false,
    cleanup: () => {
      closeShareCard(system);
    },
  };

  return system;
}

/**
 * Show the share card panel
 */
export function showShareCard(system: ShareCardSystem, data: ShareCardData): void {
  closeShareCard(system);

  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'sharecard-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const minutes = Math.floor(data.timeSpent / 60);
  const progress = Math.round((data.exhibitsViewed / 31) * 100);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 16px; font-weight: bold; color: white;">
        Share Your Visit
      </div>
      <button id="sharecard-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Card Preview -->
    <div id="sharecard-preview" style="
      margin: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border-radius: 12px;
      border: 1px solid rgba(100, 150, 255, 0.2);
    ">
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 24px; font-weight: bold; color: white;">
          GENUARY 2026
        </div>
        <div style="font-size: 11px; color: #888;">Virtual Museum Visit</div>
      </div>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 15px;
      ">
        <div style="text-align: center; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #4a9eff;">${data.exhibitsViewed}</div>
          <div style="font-size: 10px; color: #888;">Exhibits</div>
        </div>
        <div style="text-align: center; padding: 10px; background: rgba(255, 100, 100, 0.1); border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #ff6b6b;">${data.favoritesCount}</div>
          <div style="font-size: 10px; color: #888;">Favorites</div>
        </div>
      </div>

      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        border-top: 1px solid rgba(100, 150, 255, 0.1);
      ">
        <div style="font-size: 11px; color: #666;">
          ${minutes} min · ${progress}% complete
        </div>
        <div style="font-size: 11px; color: #666;">
          ${data.screenshotsTaken} photos
        </div>
      </div>
    </div>

    <!-- Share Buttons -->
    <div style="
      padding: 15px 20px;
      border-top: 1px solid rgba(100, 150, 255, 0.1);
      display: flex;
      gap: 10px;
    ">
      <button id="sharecard-copy" style="
        flex: 1;
        padding: 10px;
        background: rgba(100, 150, 255, 0.2);
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      ">Copy Stats</button>
      <button id="sharecard-download" style="
        flex: 1;
        padding: 10px;
        background: rgba(100, 200, 100, 0.2);
        border: 1px solid rgba(100, 200, 100, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      ">Download Card</button>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up interactions
  const closeBtn = panel.querySelector('#sharecard-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeShareCard(system);

  const copyBtn = panel.querySelector('#sharecard-copy') as HTMLButtonElement;
  copyBtn.onclick = () => {
    const text = generateShareText(data);
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Stats';
      }, 2000);
    });
  };

  const downloadBtn = panel.querySelector('#sharecard-download') as HTMLButtonElement;
  downloadBtn.onclick = () => {
    const preview = panel.querySelector('#sharecard-preview') as HTMLElement;
    downloadCard(preview);
  };
}

/**
 * Generate share text
 */
function generateShareText(data: ShareCardData): string {
  const progress = Math.round((data.exhibitsViewed / 31) * 100);
  const minutes = Math.floor(data.timeSpent / 60);

  return `I explored the Genuary 2026 Virtual Museum!

🖼️ ${data.exhibitsViewed}/31 exhibits (${progress}%)
❤️ ${data.favoritesCount} favorites
📸 ${data.screenshotsTaken} photos
⏱️ ${minutes} minutes

Check it out: https://azigler.github.io/coding-jams/genuary-2026/#museum`;
}

/**
 * Download card as image
 */
function downloadCard(element: HTMLElement): void {
  // Use html2canvas-like approach with canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 400, 300);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 300);

  // Draw border
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.roundRect(10, 10, 380, 280, 12);
  ctx.stroke();

  // Draw title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('GENUARY 2026', 200, 60);

  ctx.fillStyle = '#888';
  ctx.font = '12px system-ui';
  ctx.fillText('Virtual Museum Visit', 200, 80);

  // Draw stats
  ctx.fillStyle = '#4a9eff';
  ctx.font = 'bold 36px system-ui';
  ctx.fillText(element.querySelector('div[style*="4a9eff"]')?.textContent || '0', 100, 160);
  ctx.fillStyle = '#888';
  ctx.font = '11px system-ui';
  ctx.fillText('Exhibits', 100, 180);

  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 36px system-ui';
  ctx.fillText(element.querySelector('div[style*="ff6b6b"]')?.textContent || '0', 300, 160);
  ctx.fillStyle = '#888';
  ctx.font = '11px system-ui';
  ctx.fillText('Favorites', 300, 180);

  // Draw footer
  ctx.fillStyle = '#666';
  ctx.font = '10px system-ui';
  ctx.fillText('azigler.github.io/coding-jams/genuary-2026', 200, 260);

  // Download
  const link = document.createElement('a');
  link.download = 'genuary-2026-visit.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Close the share card
 */
export function closeShareCard(system: ShareCardSystem): void {
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
 * Toggle share card
 */
export function toggleShareCard(system: ShareCardSystem, data: ShareCardData): void {
  if (system.isOpen) {
    closeShareCard(system);
  } else {
    showShareCard(system, data);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeShareCardSystem(system: ShareCardSystem): void {
  system.cleanup();
}
