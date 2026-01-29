/**
 * Zoom
 *
 * Camera zoom controls for closer inspection
 * of exhibit details.
 */

// ============================================================================
// Types
// ============================================================================

export interface ZoomSystem {
  container: HTMLElement;
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  defaultFov: number;
  indicator: HTMLElement | null;
  cleanup: () => void;
}

// ============================================================================
// Zoom System Creation
// ============================================================================

/**
 * Create the zoom system
 */
export function createZoomSystem(container: HTMLElement): ZoomSystem {
  const system: ZoomSystem = {
    container,
    zoomLevel: 1,
    minZoom: 0.5,
    maxZoom: 3,
    defaultFov: 75,
    indicator: null,
    cleanup: () => {
      hideZoomIndicator(system);
    },
  };

  return system;
}

/**
 * Set zoom level
 */
export function setZoomLevel(system: ZoomSystem, level: number): number {
  system.zoomLevel = Math.max(system.minZoom, Math.min(system.maxZoom, level));

  if (system.zoomLevel !== 1) {
    showZoomIndicator(system);
  } else {
    hideZoomIndicator(system);
  }

  return system.zoomLevel;
}

/**
 * Zoom in by factor
 */
export function zoomIn(system: ZoomSystem, factor: number = 0.25): number {
  return setZoomLevel(system, system.zoomLevel + factor);
}

/**
 * Zoom out by factor
 */
export function zoomOut(system: ZoomSystem, factor: number = 0.25): number {
  return setZoomLevel(system, system.zoomLevel - factor);
}

/**
 * Reset zoom to default
 */
export function resetZoom(system: ZoomSystem): number {
  return setZoomLevel(system, 1);
}

/**
 * Get camera FOV for current zoom
 */
export function getZoomFov(system: ZoomSystem): number {
  // Higher zoom = lower FOV = more magnification
  return system.defaultFov / system.zoomLevel;
}

/**
 * Show zoom indicator
 */
function showZoomIndicator(system: ZoomSystem): void {
  if (system.indicator) {
    updateZoomIndicator(system);
    return;
  }

  const indicator = document.createElement('div');
  indicator.id = 'zoom-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 20px;
    padding: 8px 15px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: #64a0ff;
    z-index: 400;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  system.container.appendChild(indicator);
  system.indicator = indicator;
  updateZoomIndicator(system);
}

/**
 * Update zoom indicator content
 */
function updateZoomIndicator(system: ZoomSystem): void {
  if (!system.indicator) return;

  const zoomPercent = Math.round(system.zoomLevel * 100);
  const icon = system.zoomLevel > 1.5 ? '🔍' : system.zoomLevel > 1 ? '🔎' : '👁️';

  system.indicator.innerHTML = `
    <span>${icon}</span>
    <span>${zoomPercent}%</span>
    <div style="
      display: flex;
      gap: 5px;
    ">
      <button id="zoom-out" style="
        background: rgba(100, 150, 255, 0.2);
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        color: white;
        cursor: pointer;
        font-size: 14px;
      ">−</button>
      <button id="zoom-reset" style="
        background: rgba(100, 150, 255, 0.2);
        border: none;
        border-radius: 4px;
        padding: 0 8px;
        height: 24px;
        color: white;
        cursor: pointer;
        font-size: 10px;
      ">1×</button>
      <button id="zoom-in" style="
        background: rgba(100, 150, 255, 0.2);
        border: none;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        color: white;
        cursor: pointer;
        font-size: 14px;
      ">+</button>
    </div>
  `;

  // Wire up buttons
  const zoomOutBtn = system.indicator.querySelector('#zoom-out') as HTMLButtonElement;
  const zoomResetBtn = system.indicator.querySelector('#zoom-reset') as HTMLButtonElement;
  const zoomInBtn = system.indicator.querySelector('#zoom-in') as HTMLButtonElement;

  zoomOutBtn.onclick = () => zoomOut(system);
  zoomResetBtn.onclick = () => resetZoom(system);
  zoomInBtn.onclick = () => zoomIn(system);
}

/**
 * Hide zoom indicator
 */
function hideZoomIndicator(system: ZoomSystem): void {
  if (!system.indicator) return;

  system.indicator.style.opacity = '0';
  const indicator = system.indicator;

  setTimeout(() => {
    indicator.remove();
    if (system.indicator === indicator) {
      system.indicator = null;
    }
  }, 300);
}

/**
 * Handle scroll wheel for zoom
 */
export function handleZoomWheel(system: ZoomSystem, deltaY: number): number {
  const factor = deltaY > 0 ? -0.1 : 0.1;
  return setZoomLevel(system, system.zoomLevel + factor);
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeZoomSystem(system: ZoomSystem): void {
  system.cleanup();
}
