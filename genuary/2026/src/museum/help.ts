/**
 * Museum Help Overlay
 *
 * Shows all keyboard shortcuts and controls in an organized overlay.
 */

// ============================================================================
// Types
// ============================================================================

export interface HelpSystem {
  container: HTMLElement;
  overlay: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { key: string; description: string }[];
}

// ============================================================================
// Constants
// ============================================================================

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Movement',
    shortcuts: [
      { key: 'W/↑', description: 'Move forward' },
      { key: 'S/↓', description: 'Move backward' },
      { key: 'A/←', description: 'Turn left' },
      { key: 'D/→', description: 'Turn right' },
      { key: 'Double-click', description: 'Teleport to floor location' },
      { key: '1-5', description: 'Teleport to gallery/wings' },
      { key: 'Q', description: 'Return to gallery center' },
    ],
  },
  {
    title: 'Viewing',
    shortcuts: [
      { key: 'Click exhibit', description: 'Zoom in to exhibit' },
      { key: 'Escape', description: 'Exit zoom mode' },
      { key: '[ / ]', description: 'Browse exhibits while zoomed' },
      { key: 'R', description: 'Jump to random exhibit' },
      { key: 'U', description: 'Jump to unvisited exhibit' },
      { key: 'G', description: 'Open go-to-day menu' },
    ],
  },
  {
    title: 'Features',
    shortcuts: [
      { key: 'F (walking)', description: 'Toggle fullscreen' },
      { key: 'F (zoomed)', description: 'Toggle favorite' },
      { key: 'J', description: 'Jump between favorites' },
      { key: 'T', description: 'Start guided tour' },
      { key: 'P', description: 'Take screenshot' },
      { key: 'Shift+P', description: 'Toggle photo mode (hide UI)' },
      { key: 'S', description: 'Copy shareable link' },
    ],
  },
  {
    title: 'Interface',
    shortcuts: [
      { key: 'H / ?', description: 'Toggle this help' },
      { key: 'A', description: 'Open achievements' },
      { key: 'C', description: 'Open credits' },
      { key: 'M', description: 'Toggle mute' },
    ],
  },
  {
    title: 'Easter Eggs',
    shortcuts: [
      { key: '`', description: 'Matrix mode' },
      { key: 'N', description: 'Invert colors' },
      { key: 'Shift+B', description: 'Grayscale mode' },
      { key: 'X', description: 'Random filter' },
      { key: '↑↑↓↓←→←→BA', description: '???' },
    ],
  },
];

// ============================================================================
// Help System Creation
// ============================================================================

/**
 * Create the help system
 */
export function createHelpSystem(container: HTMLElement): HelpSystem {
  const system: HelpSystem = {
    container,
    overlay: null,
    isOpen: false,
    cleanup: () => {},
  };

  // Handle H/? keys for help
  const keyHandler = (event: KeyboardEvent) => {
    // H key or ? (Shift+/)
    if (
      (event.code === 'KeyH' && !event.ctrlKey && !event.metaKey) ||
      (event.key === '?' && event.shiftKey)
    ) {
      toggleHelp(system);
    }
  };
  document.addEventListener('keydown', keyHandler);

  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    if (system.overlay) {
      system.overlay.remove();
      system.overlay = null;
    }
  };

  return system;
}

/**
 * Toggle the help overlay
 */
export function toggleHelp(system: HelpSystem): void {
  if (system.isOpen) {
    closeHelp(system);
  } else {
    openHelp(system);
  }
}

/**
 * Open the help overlay
 */
function openHelp(system: HelpSystem): void {
  if (system.overlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'help-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 10, 20, 0.95);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 30px;
    font-family: system-ui, sans-serif;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 30px;
  `;
  header.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 10px;">⌨️</div>
    <h2 style="color: white; margin: 0 0 5px 0; font-size: 24px;">Keyboard Shortcuts</h2>
    <p style="color: #888; margin: 0; font-size: 14px;">Press H or ? to toggle this help</p>
  `;
  content.appendChild(header);

  // Shortcut groups grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
  `;

  SHORTCUT_GROUPS.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.style.cssText = `
      background: rgba(30, 30, 45, 0.8);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(100, 150, 255, 0.2);
    `;

    const title = document.createElement('h3');
    title.style.cssText = `
      color: #4a9eff;
      margin: 0 0 15px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    title.textContent = group.title;
    groupEl.appendChild(title);

    const list = document.createElement('div');
    list.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    group.shortcuts.forEach(shortcut => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      `;

      const key = document.createElement('kbd');
      key.style.cssText = `
        background: rgba(60, 60, 80, 0.8);
        color: #e0e0e0;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        white-space: nowrap;
        border: 1px solid rgba(100, 100, 120, 0.5);
      `;
      key.textContent = shortcut.key;

      const desc = document.createElement('span');
      desc.style.cssText = `
        color: #b0b0c0;
        font-size: 13px;
        text-align: right;
        flex: 1;
      `;
      desc.textContent = shortcut.description;

      row.appendChild(key);
      row.appendChild(desc);
      list.appendChild(row);
    });

    groupEl.appendChild(list);
    grid.appendChild(groupEl);
  });

  content.appendChild(grid);

  // Mouse controls section
  const mouseSection = document.createElement('div');
  mouseSection.style.cssText = `
    margin-top: 25px;
    padding: 20px;
    background: rgba(30, 30, 45, 0.8);
    border-radius: 12px;
    border: 1px solid rgba(100, 150, 255, 0.2);
  `;
  mouseSection.innerHTML = `
    <h3 style="color: #4a9eff; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
      Mouse Controls
    </h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; color: #b0b0c0; font-size: 13px;">
      <div><strong style="color: #e0e0e0;">Click + Drag</strong> — Look around</div>
      <div><strong style="color: #e0e0e0;">Click Exhibit</strong> — Zoom in</div>
      <div><strong style="color: #e0e0e0;">Double-click Floor</strong> — Teleport</div>
      <div><strong style="color: #e0e0e0;">Scroll</strong> — Zoom in/out (when zoomed)</div>
    </div>
  `;
  content.appendChild(mouseSection);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: background 0.2s;
  `;
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => closeHelp(system);
  closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
  closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';

  overlay.appendChild(content);
  overlay.appendChild(closeBtn);

  // Close on background click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeHelp(system);
    }
  };

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeHelp(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  system.container.appendChild(overlay);
  system.overlay = overlay;
  system.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
}

/**
 * Close the help overlay
 */
function closeHelp(system: HelpSystem): void {
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

/**
 * Dispose help system
 */
export function disposeHelpSystem(system: HelpSystem): void {
  system.cleanup();
}
