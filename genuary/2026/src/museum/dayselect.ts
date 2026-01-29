/**
 * Day Selector Popup
 *
 * Quick access popup to jump directly to any day's exhibit.
 */

// ============================================================================
// Types
// ============================================================================

export interface DaySelector {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  onDaySelected: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Day Selector Creation
// ============================================================================

/**
 * Create the day selector
 */
export function createDaySelector(container: HTMLElement): DaySelector {
  const selector: DaySelector = {
    container,
    popup: null,
    isOpen: false,
    onDaySelected: null,
    cleanup: () => {},
  };

  // G key to open day selector (G for "Go to day")
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyG' && !event.repeat) {
      event.preventDefault();
      if (selector.isOpen) {
        closeDaySelector(selector);
      } else {
        openDaySelector(selector);
      }
    }
    // Escape to close
    if (event.code === 'Escape' && selector.isOpen) {
      closeDaySelector(selector);
    }
  };
  document.addEventListener('keydown', keyHandler);

  selector.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    closeDaySelector(selector);
  };

  return selector;
}

/**
 * Open the day selector popup
 */
function openDaySelector(selector: DaySelector): void {
  if (selector.isOpen) return;

  const popup = document.createElement('div');
  popup.id = 'day-selector';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    font-family: system-ui, sans-serif;
    z-index: 300;
    max-width: 400px;
    animation: popup-fade-in 0.2s ease-out;
  `;

  // Create grid of day buttons
  let gridHtml = `
    <div style="color: white; font-size: 16px; font-weight: bold; margin-bottom: 15px; text-align: center;">
      Go to Day
    </div>
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
  `;

  for (let day = 1; day <= 31; day++) {
    gridHtml += `
      <button class="day-btn" data-day="${day}" style="
        width: 40px;
        height: 40px;
        border: 1px solid rgba(100, 150, 255, 0.3);
        border-radius: 8px;
        background: rgba(60, 70, 90, 0.5);
        color: white;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.15s;
      ">${day}</button>
    `;
  }

  gridHtml += `
    </div>
    <div style="color: #666; font-size: 11px; text-align: center; margin-top: 12px;">
      Click a day or press G again to close
    </div>
  `;

  popup.innerHTML = gridHtml;

  // Add animation style
  const style = document.createElement('style');
  style.id = 'day-selector-style';
  style.textContent = `
    @keyframes popup-fade-in {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .day-btn:hover {
      background: rgba(74, 158, 255, 0.4) !important;
      border-color: rgba(74, 158, 255, 0.6) !important;
    }
  `;
  document.head.appendChild(style);

  // Add click handlers to buttons
  popup.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = parseInt((btn as HTMLElement).dataset.day || '1', 10);
      selector.onDaySelected?.(day);
      closeDaySelector(selector);
    });
  });

  // Close on outside click
  const outsideClickHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      closeDaySelector(selector);
    }
  };
  setTimeout(() => document.addEventListener('click', outsideClickHandler), 0);

  selector.container.appendChild(popup);
  selector.popup = popup;
  selector.isOpen = true;
}

/**
 * Close the day selector popup
 */
function closeDaySelector(selector: DaySelector): void {
  if (!selector.isOpen) return;

  if (selector.popup) {
    selector.popup.remove();
    selector.popup = null;
  }

  const style = document.getElementById('day-selector-style');
  if (style) style.remove();

  selector.isOpen = false;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose day selector
 */
export function disposeDaySelector(selector: DaySelector): void {
  selector.cleanup();
}
