/**
 * Museum Breadcrumb Navigation
 *
 * Shows a trail of recently visited exhibits for easy backtracking.
 */

// ============================================================================
// Types
// ============================================================================

export interface Breadcrumb {
  dayNumber: number;
  timestamp: number;
}

export interface BreadcrumbTrail {
  container: HTMLElement;
  element: HTMLElement;
  trail: Breadcrumb[];
  maxLength: number;
  onNavigate: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BREADCRUMBS = 8;

// ============================================================================
// Breadcrumb Trail Creation
// ============================================================================

/**
 * Create the breadcrumb trail system
 */
export function createBreadcrumbTrail(container: HTMLElement): BreadcrumbTrail {
  const element = document.createElement('div');
  element.id = 'breadcrumb-trail';
  element.style.cssText = `
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 30, 0.8);
    border-radius: 20px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  `;

  // Label
  const label = document.createElement('span');
  label.style.cssText = `
    color: #666;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 4px;
  `;
  label.textContent = 'Recent:';
  element.appendChild(label);

  // Trail container
  const trailContainer = document.createElement('div');
  trailContainer.id = 'breadcrumb-items';
  trailContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    pointer-events: auto;
  `;
  element.appendChild(trailContainer);

  container.appendChild(element);

  const trail: BreadcrumbTrail = {
    container,
    element,
    trail: [],
    maxLength: MAX_BREADCRUMBS,
    onNavigate: null,
    cleanup: () => {
      element.remove();
    },
  };

  return trail;
}

/**
 * Add a breadcrumb to the trail
 */
export function addBreadcrumb(trail: BreadcrumbTrail, dayNumber: number): void {
  // Don't add duplicate consecutive entries
  if (trail.trail.length > 0 && trail.trail[trail.trail.length - 1].dayNumber === dayNumber) {
    return;
  }

  // Remove existing entry for this day (we'll re-add it at the end)
  trail.trail = trail.trail.filter(b => b.dayNumber !== dayNumber);

  // Add new breadcrumb
  trail.trail.push({
    dayNumber,
    timestamp: Date.now(),
  });

  // Limit trail length
  while (trail.trail.length > trail.maxLength) {
    trail.trail.shift();
  }

  // Update display
  updateBreadcrumbDisplay(trail);
}

/**
 * Update the breadcrumb display
 */
function updateBreadcrumbDisplay(trail: BreadcrumbTrail): void {
  const container = trail.element.querySelector('#breadcrumb-items');
  if (!container) return;

  // Clear existing items
  container.innerHTML = '';

  // Show trail if we have items
  if (trail.trail.length === 0) {
    trail.element.style.opacity = '0';
    trail.element.style.pointerEvents = 'none';
    return;
  }

  trail.element.style.opacity = '1';

  // Add breadcrumb items
  trail.trail.forEach((breadcrumb, index) => {
    if (index > 0) {
      // Add separator
      const sep = document.createElement('span');
      sep.style.cssText = 'color: #444;';
      sep.textContent = '›';
      container.appendChild(sep);
    }

    const item = document.createElement('button');
    item.style.cssText = `
      background: rgba(74, 158, 255, 0.2);
      border: none;
      border-radius: 10px;
      padding: 3px 8px;
      color: #4a9eff;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    item.textContent = `${breadcrumb.dayNumber}`;
    item.title = `Go to Day ${breadcrumb.dayNumber}`;

    item.onmouseenter = () => {
      item.style.background = 'rgba(74, 158, 255, 0.4)';
      item.style.color = 'white';
    };
    item.onmouseleave = () => {
      item.style.background = 'rgba(74, 158, 255, 0.2)';
      item.style.color = '#4a9eff';
    };

    item.onclick = () => {
      trail.onNavigate?.(breadcrumb.dayNumber);
    };

    container.appendChild(item);
  });
}

/**
 * Clear the breadcrumb trail
 */
export function clearBreadcrumbs(trail: BreadcrumbTrail): void {
  trail.trail = [];
  updateBreadcrumbDisplay(trail);
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Dispose breadcrumb trail
 */
export function disposeBreadcrumbTrail(trail: BreadcrumbTrail): void {
  trail.cleanup();
}
