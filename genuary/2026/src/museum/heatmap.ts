/**
 * Heatmap
 *
 * Visual overlay showing exhibit popularity
 * based on view counts and time spent.
 */

// ============================================================================
// Types
// ============================================================================

export interface HeatmapData {
  dayNumber: number;
  views: number;
  timeSpent: number;
  intensity: number;
}

export interface HeatmapSystem {
  container: HTMLElement;
  isVisible: boolean;
  overlay: HTMLElement | null;
  data: Map<number, HeatmapData>;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-heatmap';

// ============================================================================
// Heatmap System Creation
// ============================================================================

/**
 * Create the heatmap system
 */
export function createHeatmapSystem(container: HTMLElement): HeatmapSystem {
  const saved = loadHeatmapData();

  const system: HeatmapSystem = {
    container,
    isVisible: false,
    overlay: null,
    data: saved,
    cleanup: () => {
      hideHeatmap(system);
    },
  };

  return system;
}

/**
 * Record a view for an exhibit
 */
export function recordHeatmapView(system: HeatmapSystem, dayNumber: number): void {
  const existing = system.data.get(dayNumber) || {
    dayNumber,
    views: 0,
    timeSpent: 0,
    intensity: 0,
  };

  existing.views++;
  existing.intensity = calculateIntensity(existing);
  system.data.set(dayNumber, existing);
  saveHeatmapData(system.data);
}

/**
 * Record time spent viewing
 */
export function recordHeatmapTime(system: HeatmapSystem, dayNumber: number, seconds: number): void {
  const existing = system.data.get(dayNumber) || {
    dayNumber,
    views: 0,
    timeSpent: 0,
    intensity: 0,
  };

  existing.timeSpent += seconds;
  existing.intensity = calculateIntensity(existing);
  system.data.set(dayNumber, existing);
  saveHeatmapData(system.data);
}

/**
 * Calculate intensity (0-1) based on views and time
 */
function calculateIntensity(data: HeatmapData): number {
  // Weight: 60% time, 40% views
  const viewScore = Math.min(data.views / 10, 1);
  const timeScore = Math.min(data.timeSpent / 300, 1); // 5 minutes max
  return viewScore * 0.4 + timeScore * 0.6;
}

/**
 * Toggle heatmap visibility
 */
export function toggleHeatmap(system: HeatmapSystem): void {
  if (system.isVisible) {
    hideHeatmap(system);
  } else {
    showHeatmap(system);
  }
}

/**
 * Show heatmap overlay
 */
export function showHeatmap(system: HeatmapSystem): void {
  if (system.overlay) return;

  system.isVisible = true;

  const overlay = document.createElement('div');
  overlay.id = 'heatmap-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 100, 50, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  // Sort by intensity
  const sorted = Array.from(system.data.values())
    .sort((a, b) => b.intensity - a.intensity);

  // Get top 10
  const top10 = sorted.slice(0, 10);

  overlay.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 100, 50, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          🔥 Popularity Heatmap
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Your most engaged exhibits
        </div>
      </div>
      <button id="heatmap-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <div style="padding: 15px;">
      <!-- Legend -->
      <div style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(255, 100, 50, 0.1);
        border-radius: 8px;
      ">
        <span style="font-size: 10px; color: #888;">Cold</span>
        <div style="
          flex: 1;
          margin: 0 10px;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right,
            rgba(50, 100, 255, 0.8),
            rgba(100, 200, 100, 0.8),
            rgba(255, 200, 50, 0.8),
            rgba(255, 100, 50, 0.8),
            rgba(255, 50, 50, 0.8)
          );
        "></div>
        <span style="font-size: 10px; color: #888;">Hot</span>
      </div>

      <!-- Top exhibits -->
      ${top10.length === 0 ? `
        <div style="
          text-align: center;
          padding: 30px;
          color: #666;
          font-size: 12px;
        ">
          Start exploring to see your heatmap!
        </div>
      ` : top10.map((data, index) => {
        const hue = 40 - (data.intensity * 40); // Orange to red
        const color = `hsl(${hue}, 80%, 50%)`;
        return `
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            margin-bottom: 8px;
            background: rgba(255, 100, 50, ${0.05 + data.intensity * 0.15});
            border-left: 4px solid ${color};
            border-radius: 4px;
          ">
            <div style="
              font-size: 16px;
              font-weight: bold;
              color: ${color};
              width: 24px;
            ">#${index + 1}</div>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: bold; color: white;">
                Day ${data.dayNumber}
              </div>
              <div style="font-size: 10px; color: #888; margin-top: 2px;">
                ${data.views} views · ${formatTime(data.timeSpent)} viewing time
              </div>
            </div>
            <div style="
              width: 50px;
              height: 8px;
              background: rgba(100, 100, 100, 0.3);
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                width: ${data.intensity * 100}%;
                height: 100%;
                background: ${color};
              "></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="
      padding: 12px 20px;
      border-top: 1px solid rgba(255, 100, 50, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">
      Based on ${system.data.size} visited exhibits
    </div>
  `;

  system.container.appendChild(overlay);
  system.overlay = overlay;

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = overlay.querySelector('#heatmap-close') as HTMLButtonElement;
  closeBtn.onclick = () => hideHeatmap(system);

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideHeatmap(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Format time in seconds to readable string
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

/**
 * Hide heatmap overlay
 */
export function hideHeatmap(system: HeatmapSystem): void {
  if (!system.overlay) return;

  system.overlay.style.opacity = '0';
  const overlay = system.overlay;

  setTimeout(() => {
    overlay.remove();
    if (system.overlay === overlay) {
      system.overlay = null;
    }
  }, 300);

  system.isVisible = false;
}

/**
 * Get heatmap data for a day
 */
export function getHeatmapData(system: HeatmapSystem, dayNumber: number): HeatmapData | undefined {
  return system.data.get(dayNumber);
}

/**
 * Get top N hottest exhibits
 */
export function getHottestExhibits(system: HeatmapSystem, count: number = 5): HeatmapData[] {
  return Array.from(system.data.values())
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, count);
}

// ============================================================================
// Persistence
// ============================================================================

function loadHeatmapData(): Map<number, HeatmapData> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const arr = JSON.parse(saved) as HeatmapData[];
      return new Map(arr.map(d => [d.dayNumber, d]));
    }
  } catch {
    // Ignore
  }
  return new Map();
}

function saveHeatmapData(data: Map<number, HeatmapData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(data.values())));
  } catch {
    // Ignore
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeHeatmapSystem(system: HeatmapSystem): void {
  system.cleanup();
}
