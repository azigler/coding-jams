/**
 * Quick Actions Menu
 *
 * A radial menu for fast access to common museum actions.
 * Activated by holding a key or right-clicking.
 */

// ============================================================================
// Types
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
}

export interface QuickMenuSystem {
  container: HTMLElement;
  menu: HTMLElement | null;
  isOpen: boolean;
  selectedIndex: number;
  centerX: number;
  centerY: number;
  onAction: ((actionId: string) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Actions
// ============================================================================

const ACTIONS: QuickAction[] = [
  { id: 'screenshot', label: 'Screenshot', icon: '📸', shortcut: 'P' },
  { id: 'favorite', label: 'Favorite', icon: '❤️', shortcut: 'F' },
  { id: 'bookmark', label: 'Bookmark', icon: '🔖', shortcut: 'Ctrl+B' },
  { id: 'share', label: 'Share', icon: '📤', shortcut: 'S' },
  { id: 'journal', label: 'Journal', icon: '📓', shortcut: 'Ctrl+J' },
  { id: 'tour', label: 'Tour', icon: '🚶', shortcut: 'T' },
  { id: 'help', label: 'Help', icon: '❓', shortcut: 'H' },
  { id: 'focus', label: 'Focus', icon: '🎯', shortcut: 'Shift+F' },
];

// ============================================================================
// Quick Menu System Creation
// ============================================================================

/**
 * Create the quick menu system
 */
export function createQuickMenuSystem(container: HTMLElement): QuickMenuSystem {
  const system: QuickMenuSystem = {
    container,
    menu: null,
    isOpen: false,
    selectedIndex: -1,
    centerX: 0,
    centerY: 0,
    onAction: null,
    cleanup: () => {
      if (system.menu) {
        system.menu.remove();
        system.menu = null;
      }
    },
  };

  // Open with backtick (`) key hold
  let holdTimer: number | null = null;

  const keyDownHandler = (event: KeyboardEvent) => {
    if (event.code === 'Space' && event.shiftKey && !system.isOpen) {
      event.preventDefault();
      openQuickMenu(system, window.innerWidth / 2, window.innerHeight / 2);
    }
  };

  const keyUpHandler = (event: KeyboardEvent) => {
    if (event.code === 'Space' && system.isOpen) {
      event.preventDefault();
      executeSelectedAction(system);
      closeQuickMenu(system);
    }
  };

  // Also support right-click
  const contextHandler = (event: MouseEvent) => {
    event.preventDefault();
    if (system.isOpen) {
      closeQuickMenu(system);
    } else {
      openQuickMenu(system, event.clientX, event.clientY);
    }
  };

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  container.addEventListener('contextmenu', contextHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    container.removeEventListener('contextmenu', contextHandler);
    if (holdTimer) clearTimeout(holdTimer);
    originalCleanup();
  };

  return system;
}

/**
 * Open the quick menu
 */
export function openQuickMenu(system: QuickMenuSystem, x: number, y: number): void {
  if (system.menu) return;

  system.isOpen = true;
  system.selectedIndex = -1;
  system.centerX = x;
  system.centerY = y;

  const menu = document.createElement('div');
  menu.id = 'quick-menu';
  menu.style.cssText = `
    position: fixed;
    width: 200px;
    height: 200px;
    left: ${x - 100}px;
    top: ${y - 100}px;
    pointer-events: none;
    z-index: 2000;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease-out;
  `;

  // Create center indicator
  const center = document.createElement('div');
  center.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: rgba(15, 15, 25, 0.95);
    border: 2px solid rgba(100, 150, 255, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  `;
  center.textContent = '⊙';
  menu.appendChild(center);

  // Create action buttons in a circle
  const radius = 80;
  const angleStep = (2 * Math.PI) / ACTIONS.length;

  ACTIONS.forEach((action, index) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top
    const btnX = Math.cos(angle) * radius + 100;
    const btnY = Math.sin(angle) * radius + 100;

    const btn = document.createElement('div');
    btn.className = 'quick-action';
    btn.dataset.index = index.toString();
    btn.style.cssText = `
      position: absolute;
      left: ${btnX}px;
      top: ${btnY}px;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      background: rgba(30, 30, 45, 0.95);
      border: 1px solid rgba(100, 150, 255, 0.3);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s;
      font-family: system-ui, sans-serif;
    `;

    btn.innerHTML = `
      <span style="font-size: 18px;">${action.icon}</span>
    `;

    btn.onmouseover = () => {
      system.selectedIndex = index;
      updateSelection(system);
    };

    btn.onmouseout = () => {
      system.selectedIndex = -1;
      updateSelection(system);
    };

    btn.onclick = () => {
      system.selectedIndex = index;
      executeSelectedAction(system);
      closeQuickMenu(system);
    };

    menu.appendChild(btn);
  });

  // Create label
  const label = document.createElement('div');
  label.id = 'quick-menu-label';
  label.style.cssText = `
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    margin-top: 15px;
    background: rgba(15, 15, 25, 0.95);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: white;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  `;
  menu.appendChild(label);

  system.container.appendChild(menu);
  system.menu = menu;

  // Animate in
  requestAnimationFrame(() => {
    menu.style.opacity = '1';
    menu.style.transform = 'scale(1)';
  });

  // Track mouse for keyboard navigation
  const mouseMoveHandler = (e: MouseEvent) => {
    if (!system.isOpen) return;

    const dx = e.clientX - system.centerX;
    const dy = e.clientY - system.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 30) {
      system.selectedIndex = -1;
    } else {
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;
      system.selectedIndex = Math.floor(angle / angleStep) % ACTIONS.length;
    }

    updateSelection(system);
  };

  document.addEventListener('mousemove', mouseMoveHandler);

  // Store handler for cleanup
  (menu as unknown as Record<string, unknown>).mouseMoveHandler = mouseMoveHandler;
}

/**
 * Update selection visual
 */
function updateSelection(system: QuickMenuSystem): void {
  if (!system.menu) return;

  const buttons = system.menu.querySelectorAll('.quick-action');
  const label = document.getElementById('quick-menu-label');

  buttons.forEach((btn, index) => {
    const isSelected = index === system.selectedIndex;
    (btn as HTMLElement).style.background = isSelected ? 'rgba(74, 158, 255, 0.4)' : 'rgba(30, 30, 45, 0.95)';
    (btn as HTMLElement).style.borderColor = isSelected ? 'rgba(74, 158, 255, 0.8)' : 'rgba(100, 150, 255, 0.3)';
    (btn as HTMLElement).style.transform = isSelected ? 'translate(-50%, -50%) scale(1.15)' : 'translate(-50%, -50%) scale(1)';
  });

  if (label) {
    if (system.selectedIndex >= 0) {
      const action = ACTIONS[system.selectedIndex];
      label.innerHTML = `
        <span style="font-weight: bold;">${action.label}</span>
        ${action.shortcut ? `<span style="color: #888; margin-left: 8px;">${action.shortcut}</span>` : ''}
      `;
      label.style.opacity = '1';
    } else {
      label.style.opacity = '0';
    }
  }
}

/**
 * Execute the selected action
 */
function executeSelectedAction(system: QuickMenuSystem): void {
  if (system.selectedIndex < 0 || system.selectedIndex >= ACTIONS.length) return;

  const action = ACTIONS[system.selectedIndex];
  system.onAction?.(action.id);
}

/**
 * Close the quick menu
 */
export function closeQuickMenu(system: QuickMenuSystem): void {
  if (!system.menu) return;

  // Remove mouse handler
  const handler = (system.menu as unknown as Record<string, unknown>).mouseMoveHandler as (e: MouseEvent) => void;
  if (handler) {
    document.removeEventListener('mousemove', handler);
  }

  system.menu.style.opacity = '0';
  system.menu.style.transform = 'scale(0.8)';
  const menu = system.menu;

  setTimeout(() => {
    menu.remove();
    if (system.menu === menu) {
      system.menu = null;
    }
  }, 200);

  system.isOpen = false;
  system.selectedIndex = -1;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeQuickMenuSystem(system: QuickMenuSystem): void {
  system.cleanup();
}
