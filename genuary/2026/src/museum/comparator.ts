/**
 * Exhibit Comparator
 *
 * Allows visitors to compare two exhibits side by side.
 * Useful for exploring artistic similarities and differences.
 */

// ============================================================================
// Types
// ============================================================================

export interface ComparatorSystem {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  leftDay: number | null;
  rightDay: number | null;
  onSelectExhibit: ((slot: 'left' | 'right', dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Comparator System Creation
// ============================================================================

/**
 * Create the comparator system
 */
export function createComparatorSystem(container: HTMLElement): ComparatorSystem {
  const system: ComparatorSystem = {
    container,
    popup: null,
    isOpen: false,
    leftDay: null,
    rightDay: null,
    onSelectExhibit: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Open with Shift+X (for eXamine)
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyX' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeComparator(system);
      } else {
        openComparator(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return system;
}

/**
 * Open the comparator
 */
export function openComparator(system: ComparatorSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  const popup = document.createElement('div');
  popup.id = 'comparator-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
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
        <h2 style="margin: 0; font-size: 18px; color: white;">⚖️ Compare Exhibits</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
          Select two exhibits to view side by side
        </p>
      </div>
      <button id="comparator-close" style="
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

    <div style="
      padding: 20px;
      display: flex;
      gap: 20px;
    ">
      <!-- Left slot -->
      <div style="flex: 1;">
        <div style="font-size: 12px; color: #888; margin-bottom: 10px;">Exhibit A</div>
        <div id="comparator-left" class="comparator-slot" style="
          height: 200px;
          background: rgba(40, 40, 60, 0.5);
          border: 2px dashed rgba(100, 150, 255, 0.3);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ${system.leftDay ? renderSlotContent(system.leftDay) : renderEmptySlot()}
        </div>
      </div>

      <!-- VS divider -->
      <div style="
        display: flex;
        align-items: center;
        font-size: 20px;
        color: #666;
      ">VS</div>

      <!-- Right slot -->
      <div style="flex: 1;">
        <div style="font-size: 12px; color: #888; margin-bottom: 10px;">Exhibit B</div>
        <div id="comparator-right" class="comparator-slot" style="
          height: 200px;
          background: rgba(40, 40, 60, 0.5);
          border: 2px dashed rgba(100, 150, 255, 0.3);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ${system.rightDay ? renderSlotContent(system.rightDay) : renderEmptySlot()}
        </div>
      </div>
    </div>

    <!-- Day selector grid -->
    <div style="padding: 0 20px 20px;">
      <div style="font-size: 12px; color: #888; margin-bottom: 10px;">Click an exhibit to add:</div>
      <div id="comparator-days" style="
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 6px;
      ">
        ${Array.from({ length: 31 }, (_, i) => i + 1).map(day => `
          <button class="day-btn" data-day="${day}" style="
            width: 100%;
            aspect-ratio: 1;
            background: ${day === system.leftDay || day === system.rightDay ? 'rgba(74, 158, 255, 0.3)' : 'rgba(40, 40, 60, 0.5)'};
            border: 1px solid ${day === system.leftDay || day === system.rightDay ? 'rgba(74, 158, 255, 0.5)' : 'rgba(60, 60, 80, 0.5)'};
            border-radius: 6px;
            color: white;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
          ">${day}</button>
        `).join('')}
      </div>
    </div>

    ${system.leftDay && system.rightDay ? `
      <div style="
        padding: 15px 20px;
        border-top: 1px solid rgba(100, 150, 255, 0.2);
        display: flex;
        justify-content: center;
      ">
        <button id="comparator-view" style="
          background: linear-gradient(135deg, #4a9eff, #a855f7);
          border: none;
          border-radius: 8px;
          padding: 12px 30px;
          color: white;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        ">View Comparison</button>
      </div>
    ` : ''}
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up interactions
  wireUpComparator(system);
}

/**
 * Render empty slot content
 */
function renderEmptySlot(): string {
  return `
    <div style="font-size: 32px; opacity: 0.3; margin-bottom: 10px;">📷</div>
    <div style="font-size: 12px; color: #666;">Click to select</div>
  `;
}

/**
 * Render slot with day content
 */
function renderSlotContent(day: number): string {
  return `
    <div style="
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4a9eff, #a855f7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 10px;
    ">${day}</div>
    <div style="font-size: 14px; color: white;">Day ${day}</div>
    <div style="font-size: 10px; color: #666; margin-top: 4px;">Click to change</div>
  `;
}

/**
 * Wire up comparator interactions
 */
function wireUpComparator(system: ComparatorSystem): void {
  if (!system.popup) return;

  setTimeout(() => {
    const closeBtn = document.getElementById('comparator-close');
    if (closeBtn) {
      closeBtn.onclick = () => closeComparator(system);
    }

    const leftSlot = document.getElementById('comparator-left');
    const rightSlot = document.getElementById('comparator-right');

    // Track which slot is being selected
    let selectingSlot: 'left' | 'right' | null = null;

    if (leftSlot) {
      leftSlot.onmouseover = () => {
        leftSlot.style.borderColor = 'rgba(100, 150, 255, 0.6)';
        leftSlot.style.background = 'rgba(60, 60, 80, 0.5)';
      };
      leftSlot.onmouseout = () => {
        leftSlot.style.borderColor = 'rgba(100, 150, 255, 0.3)';
        leftSlot.style.background = 'rgba(40, 40, 60, 0.5)';
      };
      leftSlot.onclick = () => {
        selectingSlot = 'left';
        highlightSlot(system, 'left');
      };
    }

    if (rightSlot) {
      rightSlot.onmouseover = () => {
        rightSlot.style.borderColor = 'rgba(100, 150, 255, 0.6)';
        rightSlot.style.background = 'rgba(60, 60, 80, 0.5)';
      };
      rightSlot.onmouseout = () => {
        rightSlot.style.borderColor = 'rgba(100, 150, 255, 0.3)';
        rightSlot.style.background = 'rgba(40, 40, 60, 0.5)';
      };
      rightSlot.onclick = () => {
        selectingSlot = 'right';
        highlightSlot(system, 'right');
      };
    }

    // Day buttons
    const dayBtns = system.popup?.querySelectorAll('.day-btn');
    dayBtns?.forEach(btn => {
      (btn as HTMLElement).onmouseover = () => {
        const day = parseInt((btn as HTMLElement).dataset.day || '0', 10);
        if (day !== system.leftDay && day !== system.rightDay) {
          (btn as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
        }
      };
      (btn as HTMLElement).onmouseout = () => {
        const day = parseInt((btn as HTMLElement).dataset.day || '0', 10);
        if (day !== system.leftDay && day !== system.rightDay) {
          (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
        }
      };
      (btn as HTMLElement).onclick = () => {
        const day = parseInt((btn as HTMLElement).dataset.day || '0', 10);
        if (day > 0) {
          // Auto-select slot if none selected
          if (!selectingSlot) {
            selectingSlot = !system.leftDay ? 'left' : !system.rightDay ? 'right' : 'left';
          }

          // Prevent same day in both slots
          if (selectingSlot === 'left' && day === system.rightDay) {
            selectingSlot = 'right';
          } else if (selectingSlot === 'right' && day === system.leftDay) {
            selectingSlot = 'left';
          }

          if (selectingSlot === 'left') {
            system.leftDay = day;
          } else {
            system.rightDay = day;
          }

          system.onSelectExhibit?.(selectingSlot, day);
          selectingSlot = null;

          // Refresh popup
          closeComparator(system);
          openComparator(system);
        }
      };
    });

    // View comparison button
    const viewBtn = document.getElementById('comparator-view');
    if (viewBtn) {
      viewBtn.onclick = () => {
        if (system.leftDay && system.rightDay) {
          showComparison(system);
        }
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeComparator(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Highlight the selected slot
 */
function highlightSlot(system: ComparatorSystem, slot: 'left' | 'right'): void {
  const leftSlot = document.getElementById('comparator-left');
  const rightSlot = document.getElementById('comparator-right');

  if (leftSlot) {
    leftSlot.style.borderColor = slot === 'left' ? 'rgba(74, 222, 128, 0.6)' : 'rgba(100, 150, 255, 0.3)';
    leftSlot.style.borderStyle = slot === 'left' ? 'solid' : 'dashed';
  }

  if (rightSlot) {
    rightSlot.style.borderColor = slot === 'right' ? 'rgba(74, 222, 128, 0.6)' : 'rgba(100, 150, 255, 0.3)';
    rightSlot.style.borderStyle = slot === 'right' ? 'solid' : 'dashed';
  }
}

/**
 * Show the comparison view
 */
function showComparison(system: ComparatorSystem): void {
  if (!system.leftDay || !system.rightDay) return;

  closeComparator(system);

  const overlay = document.createElement('div');
  overlay.id = 'comparison-view';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 15, 0.98);
    display: flex;
    flex-direction: column;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.5s;
  `;

  overlay.innerHTML = `
    <div style="
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
    ">
      <div style="font-family: system-ui, sans-serif; color: white; font-size: 16px;">
        ⚖️ Comparing Day ${system.leftDay} vs Day ${system.rightDay}
      </div>
      <button id="comparison-close" style="
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

    <div style="
      flex: 1;
      display: flex;
      gap: 4px;
      padding: 20px;
    ">
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 14px;
          color: #888;
          margin-bottom: 15px;
        ">Day ${system.leftDay}</div>
        <div id="comparison-left-frame" style="
          flex: 1;
          width: 100%;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(100, 150, 255, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            font-family: system-ui, sans-serif;
            font-size: 60px;
            color: #333;
          ">${system.leftDay}</div>
        </div>
      </div>

      <div style="
        width: 4px;
        background: linear-gradient(180deg, transparent, rgba(100, 150, 255, 0.3), transparent);
      "></div>

      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 14px;
          color: #888;
          margin-bottom: 15px;
        ">Day ${system.rightDay}</div>
        <div id="comparison-right-frame" style="
          flex: 1;
          width: 100%;
          background: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(100, 150, 255, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            font-family: system-ui, sans-serif;
            font-size: 60px;
            color: #333;
          ">${system.rightDay}</div>
        </div>
      </div>
    </div>

    <div style="
      padding: 15px 20px;
      border-top: 1px solid rgba(100, 150, 255, 0.2);
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: #666;
      text-align: center;
    ">
      Press Escape or click × to close
    </div>
  `;

  system.container.appendChild(overlay);

  // Fade in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // Wire up close
  setTimeout(() => {
    const closeBtn = document.getElementById('comparison-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close the comparator
 */
export function closeComparator(system: ComparatorSystem): void {
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
 * Set the left exhibit for comparison
 */
export function setLeftExhibit(system: ComparatorSystem, dayNumber: number): void {
  system.leftDay = dayNumber;
}

/**
 * Set the right exhibit for comparison
 */
export function setRightExhibit(system: ComparatorSystem, dayNumber: number): void {
  system.rightDay = dayNumber;
}

/**
 * Clear the comparison
 */
export function clearComparison(system: ComparatorSystem): void {
  system.leftDay = null;
  system.rightDay = null;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeComparatorSystem(system: ComparatorSystem): void {
  system.cleanup();
}
