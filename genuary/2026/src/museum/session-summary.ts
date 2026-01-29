/**
 * Session Summary
 *
 * Shows a summary of your museum visit when leaving or after extended time.
 */

// ============================================================================
// Types
// ============================================================================

export interface SessionSummary {
  container: HTMLElement;
  sessionStart: number;
  exhibitsViewed: Set<number>;
  distanceWalked: number;
  screenshotsTaken: number;
  favoritesAdded: number;
  isShowing: boolean;
  popup: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Session Summary Creation
// ============================================================================

/**
 * Create the session summary system
 */
export function createSessionSummary(container: HTMLElement): SessionSummary {
  const summary: SessionSummary = {
    container,
    sessionStart: Date.now(),
    exhibitsViewed: new Set(),
    distanceWalked: 0,
    screenshotsTaken: 0,
    favoritesAdded: 0,
    isShowing: false,
    popup: null,
    cleanup: () => {
      if (summary.popup) {
        summary.popup.remove();
        summary.popup = null;
      }
    },
  };

  // Show summary before page unload
  const beforeUnloadHandler = () => {
    // Can't show popup on unload, but we can log stats
    const duration = Math.round((Date.now() - summary.sessionStart) / 1000 / 60);
    if (duration > 0) {
      console.log(`Session summary: ${duration} min, ${summary.exhibitsViewed.size} exhibits viewed`);
    }
  };
  window.addEventListener('beforeunload', beforeUnloadHandler);

  // Handle Escape to potentially show summary
  const escHandler = (event: KeyboardEvent) => {
    // Shift+Escape to show summary
    if (event.key === 'Escape' && event.shiftKey) {
      event.preventDefault();
      showSessionSummary(summary);
    }
  };
  document.addEventListener('keydown', escHandler);

  const originalCleanup = summary.cleanup;
  summary.cleanup = () => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    document.removeEventListener('keydown', escHandler);
    originalCleanup();
  };

  return summary;
}

/**
 * Record an exhibit view
 */
export function recordExhibitViewed(summary: SessionSummary, dayNumber: number): void {
  summary.exhibitsViewed.add(dayNumber);
}

/**
 * Record distance walked
 */
export function recordDistance(summary: SessionSummary, distance: number): void {
  summary.distanceWalked += distance;
}

/**
 * Record screenshot taken
 */
export function recordScreenshotTaken(summary: SessionSummary): void {
  summary.screenshotsTaken++;
}

/**
 * Record favorite added
 */
export function recordFavoriteAdded(summary: SessionSummary): void {
  summary.favoritesAdded++;
}

/**
 * Show the session summary popup
 */
export function showSessionSummary(summary: SessionSummary): void {
  if (summary.isShowing) {
    closeSessionSummary(summary);
    return;
  }

  const popup = document.createElement('div');
  popup.id = 'session-summary-popup';
  popup.style.cssText = `
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
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  // Calculate session stats
  const durationMs = Date.now() - summary.sessionStart;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  const timeStr = durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`;

  // Header
  popup.innerHTML = `
    <div style="
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(168, 85, 247, 0.2));
      border-bottom: 1px solid rgba(100, 150, 255, 0.2);
    ">
      <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
      <h2 style="margin: 0; font-size: 18px; color: white;">Your Visit Summary</h2>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">
        Session started ${formatTimeAgo(summary.sessionStart)}
      </p>
    </div>

    <div style="padding: 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        ${createStatCard('⏱️', 'Time Spent', timeStr)}
        ${createStatCard('🎨', 'Exhibits Viewed', `${summary.exhibitsViewed.size}/31`)}
        ${createStatCard('📷', 'Screenshots', summary.screenshotsTaken.toString())}
        ${createStatCard('❤️', 'Favorites', summary.favoritesAdded.toString())}
      </div>

      ${summary.exhibitsViewed.size > 0 ? `
        <div style="margin-top: 15px;">
          <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Exhibits you visited:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${Array.from(summary.exhibitsViewed).sort((a, b) => a - b).map(day => `
              <span style="
                background: rgba(74, 158, 255, 0.3);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                color: #4a9eff;
              ">${day}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${getEncouragement(summary)}
    </div>

    <div style="
      padding: 15px 20px;
      border-top: 1px solid rgba(100, 150, 255, 0.2);
      display: flex;
      justify-content: center;
    ">
      <button id="summary-close-btn" style="
        background: linear-gradient(135deg, #4a9eff, #a855f7);
        border: none;
        border-radius: 8px;
        padding: 10px 30px;
        color: white;
        font-size: 14px;
        cursor: pointer;
      ">Continue Exploring</button>
    </div>
  `;

  // Wire up close button
  setTimeout(() => {
    const closeBtn = document.getElementById('summary-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => closeSessionSummary(summary);
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSessionSummary(summary);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  summary.container.appendChild(popup);
  summary.popup = popup;
  summary.isShowing = true;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });
}

/**
 * Close the session summary
 */
function closeSessionSummary(summary: SessionSummary): void {
  if (!summary.popup) return;

  summary.popup.style.opacity = '0';
  const popup = summary.popup;

  setTimeout(() => {
    popup.remove();
    if (summary.popup === popup) {
      summary.popup = null;
    }
  }, 300);

  summary.isShowing = false;
}

// ============================================================================
// Helpers
// ============================================================================

function createStatCard(icon: string, label: string, value: string): string {
  return `
    <div style="
      background: rgba(40, 40, 60, 0.5);
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    ">
      <div style="font-size: 20px; margin-bottom: 5px;">${icon}</div>
      <div style="font-size: 18px; font-weight: bold; color: white;">${value}</div>
      <div style="font-size: 11px; color: #888;">${label}</div>
    </div>
  `;
}

function formatTimeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

function getEncouragement(summary: SessionSummary): string {
  const viewed = summary.exhibitsViewed.size;

  if (viewed === 0) {
    return `
      <div style="margin-top: 15px; padding: 12px; background: rgba(245, 158, 11, 0.2); border-radius: 8px; font-size: 12px;">
        💡 <strong>Tip:</strong> Click on any exhibit to view it up close, or press R for a random exhibit!
      </div>
    `;
  } else if (viewed < 10) {
    return `
      <div style="margin-top: 15px; padding: 12px; background: rgba(74, 158, 255, 0.2); border-radius: 8px; font-size: 12px;">
        🌟 Great start! There are ${31 - viewed} more exhibits waiting to be discovered.
      </div>
    `;
  } else if (viewed < 20) {
    return `
      <div style="margin-top: 15px; padding: 12px; background: rgba(16, 185, 129, 0.2); border-radius: 8px; font-size: 12px;">
        🎯 You're making great progress! Keep exploring to see them all.
      </div>
    `;
  } else if (viewed < 31) {
    return `
      <div style="margin-top: 15px; padding: 12px; background: rgba(168, 85, 247, 0.2); border-radius: 8px; font-size: 12px;">
        ⭐ Almost there! Just ${31 - viewed} more to complete your collection.
      </div>
    `;
  } else {
    return `
      <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3)); border-radius: 8px; font-size: 12px;">
        🏆 <strong>Congratulations!</strong> You've viewed all 31 exhibits! You're a true art connoisseur.
      </div>
    `;
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSessionSummary(summary: SessionSummary): void {
  summary.cleanup();
}
