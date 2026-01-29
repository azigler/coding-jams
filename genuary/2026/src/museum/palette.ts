/**
 * Color Palette Viewer
 *
 * Shows the dominant colors used in each exhibit,
 * providing insight into the artist's color choices.
 */

// ============================================================================
// Types
// ============================================================================

export interface PaletteColor {
  hex: string;
  name: string;
  percentage: number;
}

export interface ExhibitPalette {
  dayNumber: number;
  colors: PaletteColor[];
  mood: string;
}

export interface PaletteSystem {
  container: HTMLElement;
  panel: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Color Database
// ============================================================================

// Pre-defined palettes for each day (since we can't sample in real-time)
const EXHIBIT_PALETTES: Record<number, ExhibitPalette> = {
  1: {
    dayNumber: 1,
    colors: [
      { hex: '#1a1a2e', name: 'Deep Navy', percentage: 40 },
      { hex: '#4a9eff', name: 'Electric Blue', percentage: 30 },
      { hex: '#ffffff', name: 'Pure White', percentage: 20 },
      { hex: '#0f0f1a', name: 'Midnight', percentage: 10 },
    ],
    mood: 'Contemplative',
  },
  3: {
    dayNumber: 3,
    colors: [
      { hex: '#ff6b6b', name: 'Coral Red', percentage: 25 },
      { hex: '#4ecdc4', name: 'Teal', percentage: 25 },
      { hex: '#45b7d1', name: 'Sky Blue', percentage: 25 },
      { hex: '#f9ca24', name: 'Sunflower', percentage: 25 },
    ],
    mood: 'Playful',
  },
  5: {
    dayNumber: 5,
    colors: [
      { hex: '#0f0f23', name: 'Space Black', percentage: 45 },
      { hex: '#6366f1', name: 'Indigo', percentage: 25 },
      { hex: '#a855f7', name: 'Purple', percentage: 20 },
      { hex: '#ec4899', name: 'Pink', percentage: 10 },
    ],
    mood: 'Mystical',
  },
  7: {
    dayNumber: 7,
    colors: [
      { hex: '#10b981', name: 'Emerald', percentage: 35 },
      { hex: '#3b82f6', name: 'Blue', percentage: 25 },
      { hex: '#f59e0b', name: 'Amber', percentage: 20 },
      { hex: '#1f2937', name: 'Charcoal', percentage: 20 },
    ],
    mood: 'Balanced',
  },
  10: {
    dayNumber: 10,
    colors: [
      { hex: '#2d5016', name: 'Forest', percentage: 40 },
      { hex: '#84cc16', name: 'Lime', percentage: 30 },
      { hex: '#365314', name: 'Pine', percentage: 20 },
      { hex: '#f0fdf4', name: 'Mint Cream', percentage: 10 },
    ],
    mood: 'Natural',
  },
  12: {
    dayNumber: 12,
    colors: [
      { hex: '#7c3aed', name: 'Violet', percentage: 30 },
      { hex: '#c4b5fd', name: 'Lavender', percentage: 25 },
      { hex: '#1e1b4b', name: 'Deep Purple', percentage: 25 },
      { hex: '#f5f3ff', name: 'Soft Violet', percentage: 20 },
    ],
    mood: 'Dreamlike',
  },
  15: {
    dayNumber: 15,
    colors: [
      { hex: '#dc2626', name: 'Red', percentage: 35 },
      { hex: '#fef08a', name: 'Yellow', percentage: 25 },
      { hex: '#fb923c', name: 'Orange', percentage: 25 },
      { hex: '#450a0a', name: 'Dark Red', percentage: 15 },
    ],
    mood: 'Energetic',
  },
  19: {
    dayNumber: 19,
    colors: [
      { hex: '#0ea5e9', name: 'Cyan', percentage: 35 },
      { hex: '#06b6d4', name: 'Teal', percentage: 30 },
      { hex: '#0f172a', name: 'Slate', percentage: 25 },
      { hex: '#f0f9ff', name: 'Ice', percentage: 10 },
    ],
    mood: 'Serene',
  },
  23: {
    dayNumber: 23,
    colors: [
      { hex: '#f43f5e', name: 'Rose', percentage: 25 },
      { hex: '#8b5cf6', name: 'Violet', percentage: 25 },
      { hex: '#06b6d4', name: 'Cyan', percentage: 25 },
      { hex: '#fbbf24', name: 'Gold', percentage: 25 },
    ],
    mood: 'Vibrant',
  },
  24: {
    dayNumber: 24,
    colors: [
      { hex: '#fafaf9', name: 'Warm White', percentage: 50 },
      { hex: '#78716c', name: 'Warm Gray', percentage: 30 },
      { hex: '#292524', name: 'Charcoal', percentage: 15 },
      { hex: '#d6d3d1', name: 'Stone', percentage: 5 },
    ],
    mood: 'Minimal',
  },
  26: {
    dayNumber: 26,
    colors: [
      { hex: '#fcd34d', name: 'Gold', percentage: 35 },
      { hex: '#fef3c7', name: 'Cream', percentage: 30 },
      { hex: '#92400e', name: 'Bronze', percentage: 20 },
      { hex: '#451a03', name: 'Brown', percentage: 15 },
    ],
    mood: 'Warm',
  },
  27: {
    dayNumber: 27,
    colors: [
      { hex: '#166534', name: 'Deep Green', percentage: 40 },
      { hex: '#4ade80', name: 'Bright Green', percentage: 30 },
      { hex: '#052e16', name: 'Forest Night', percentage: 20 },
      { hex: '#dcfce7', name: 'Pale Green', percentage: 10 },
    ],
    mood: 'Organic',
  },
};

// Default palette for days without specific entries
const DEFAULT_PALETTE: ExhibitPalette = {
  dayNumber: 0,
  colors: [
    { hex: '#4a9eff', name: 'Electric Blue', percentage: 30 },
    { hex: '#a855f7', name: 'Purple', percentage: 25 },
    { hex: '#1a1a2e', name: 'Deep Navy', percentage: 25 },
    { hex: '#ffffff', name: 'White', percentage: 20 },
  ],
  mood: 'Generative',
};

// ============================================================================
// Palette System Creation
// ============================================================================

/**
 * Create the palette system
 */
export function createPaletteSystem(container: HTMLElement): PaletteSystem {
  const system: PaletteSystem = {
    container,
    panel: null,
    isOpen: false,
    cleanup: () => {
      closePalette(system);
    },
  };

  return system;
}

/**
 * Show palette for an exhibit
 */
export function showPalette(system: PaletteSystem, dayNumber: number): void {
  closePalette(system);

  const palette = EXHIBIT_PALETTES[dayNumber] || { ...DEFAULT_PALETTE, dayNumber };
  system.isOpen = true;

  const panel = document.createElement('div');
  panel.id = 'palette-panel';
  panel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 180, 100, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="
      padding: 15px;
      border-bottom: 1px solid rgba(255, 180, 100, 0.2);
      background: linear-gradient(180deg, rgba(255, 180, 100, 0.1), transparent);
    ">
      <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">
        Color Palette
      </div>
      <div style="font-size: 14px; color: white; font-weight: bold;">
        Day ${dayNumber}
      </div>
      <div style="font-size: 11px; color: #ffb464; margin-top: 4px;">
        ${palette.mood}
      </div>
    </div>

    <div style="padding: 15px;">
      ${palette.colors.map(color => `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 36px;
            height: 36px;
            background: ${color.hex};
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="flex: 1;">
            <div style="font-size: 12px; color: white; margin-bottom: 2px;">
              ${color.name}
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="
                flex: 1;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
              ">
                <div style="
                  width: ${color.percentage}%;
                  height: 100%;
                  background: ${color.hex};
                  border-radius: 2px;
                "></div>
              </div>
              <span style="font-size: 10px; color: #888; width: 30px;">
                ${color.percentage}%
              </span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="
      padding: 12px 15px;
      border-top: 1px solid rgba(255, 180, 100, 0.1);
      background: rgba(255, 180, 100, 0.05);
    ">
      <div style="font-size: 10px; color: #888; margin-bottom: 6px;">
        Hex Codes
      </div>
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      ">
        ${palette.colors.map(color => `
          <button class="hex-copy" data-hex="${color.hex}" style="
            padding: 4px 8px;
            background: rgba(40, 40, 60, 0.5);
            border: 1px solid rgba(255, 180, 100, 0.2);
            border-radius: 4px;
            font-family: monospace;
            font-size: 10px;
            color: #ccc;
            cursor: pointer;
            transition: all 0.2s;
          ">${color.hex}</button>
        `).join('')}
      </div>
    </div>

    <div style="
      padding: 10px 15px;
      font-size: 10px;
      color: #666;
      text-align: center;
      border-top: 1px solid rgba(255, 180, 100, 0.1);
    ">
      Click hex to copy · Press K to close
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up hex copy buttons
  const hexButtons = panel.querySelectorAll('.hex-copy');
  hexButtons.forEach(btn => {
    (btn as HTMLElement).onclick = () => {
      const hex = (btn as HTMLElement).dataset.hex;
      if (hex) {
        navigator.clipboard.writeText(hex).then(() => {
          (btn as HTMLElement).textContent = 'Copied!';
          (btn as HTMLElement).style.background = 'rgba(100, 200, 100, 0.3)';
          setTimeout(() => {
            (btn as HTMLElement).textContent = hex;
            (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
          }, 1000);
        });
      }
    };

    (btn as HTMLElement).onmouseover = () => {
      (btn as HTMLElement).style.borderColor = 'rgba(255, 180, 100, 0.5)';
    };
    (btn as HTMLElement).onmouseout = () => {
      (btn as HTMLElement).style.borderColor = 'rgba(255, 180, 100, 0.2)';
    };
  });

  // Auto-close after 15 seconds
  setTimeout(() => {
    if (system.panel === panel) {
      closePalette(system);
    }
  }, 15000);
}

/**
 * Close palette panel
 */
export function closePalette(system: PaletteSystem): void {
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
 * Toggle palette panel
 */
export function togglePalette(system: PaletteSystem, dayNumber: number): void {
  if (system.isOpen) {
    closePalette(system);
  } else {
    showPalette(system, dayNumber);
  }
}

/**
 * Get palette for a day
 */
export function getPalette(dayNumber: number): ExhibitPalette {
  return EXHIBIT_PALETTES[dayNumber] || { ...DEFAULT_PALETTE, dayNumber };
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposePaletteSystem(system: PaletteSystem): void {
  system.cleanup();
}
