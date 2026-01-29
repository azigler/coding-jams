/**
 * Exhibit Annotations
 *
 * Allows visitors to add personal annotations to specific
 * points on exhibits, like sticky notes.
 */

// ============================================================================
// Types
// ============================================================================

export interface Annotation {
  id: string;
  dayNumber: number;
  x: number; // Screen position when created (0-1)
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export interface AnnotationsSystem {
  container: HTMLElement;
  annotations: Map<number, Annotation[]>;
  activeAnnotations: HTMLElement[];
  isAddMode: boolean;
  currentDay: number;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-annotations';
const MAX_ANNOTATIONS_PER_DAY = 5;
const NOTE_COLORS = ['#ffd93d', '#ff6b6b', '#4ecdc4', '#95e1d3', '#dda0dd'];

// ============================================================================
// Annotations System Creation
// ============================================================================

/**
 * Create the annotations system
 */
export function createAnnotationsSystem(container: HTMLElement): AnnotationsSystem {
  const saved = loadAnnotations();

  const system: AnnotationsSystem = {
    container,
    annotations: saved || new Map(),
    activeAnnotations: [],
    isAddMode: false,
    currentDay: 0,
    cleanup: () => {
      clearActiveAnnotations(system);
    },
  };

  return system;
}

/**
 * Show annotations for a day
 */
export function showAnnotations(system: AnnotationsSystem, dayNumber: number): void {
  clearActiveAnnotations(system);
  system.currentDay = dayNumber;

  const dayAnnotations = system.annotations.get(dayNumber);
  if (!dayAnnotations || dayAnnotations.length === 0) return;

  dayAnnotations.forEach(annotation => {
    createAnnotationElement(system, annotation);
  });
}

/**
 * Hide all annotations
 */
export function hideAnnotations(system: AnnotationsSystem): void {
  clearActiveAnnotations(system);
  system.currentDay = 0;
  system.isAddMode = false;
}

/**
 * Enter add mode
 */
export function enterAddMode(system: AnnotationsSystem, dayNumber: number): void {
  if (system.isAddMode) {
    exitAddMode(system);
    return;
  }

  system.isAddMode = true;
  system.currentDay = dayNumber;

  // Show add mode indicator
  const indicator = document.createElement('div');
  indicator.id = 'annotation-add-mode';
  indicator.style.cssText = `
    position: fixed;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 217, 61, 0.9);
    color: #1a1a2e;
    padding: 8px 16px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    font-weight: bold;
    z-index: 700;
    cursor: pointer;
  `;
  indicator.innerHTML = `📝 Click to add annotation · Press Shift+N to cancel`;
  indicator.onclick = () => exitAddMode(system);

  system.container.appendChild(indicator);

  // Change cursor
  system.container.style.cursor = 'crosshair';

  // Handle clicks
  const clickHandler = (event: MouseEvent) => {
    if (!system.isAddMode) {
      document.removeEventListener('click', clickHandler);
      return;
    }

    // Don't trigger on UI elements
    if ((event.target as HTMLElement).closest('#annotation-add-mode')) return;

    const rect = system.container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    showAnnotationInput(system, x, y, event.clientX, event.clientY);
  };

  document.addEventListener('click', clickHandler);
  (system as unknown as Record<string, unknown>).clickHandler = clickHandler;
}

/**
 * Exit add mode
 */
export function exitAddMode(system: AnnotationsSystem): void {
  system.isAddMode = false;
  system.container.style.cursor = '';

  const indicator = document.getElementById('annotation-add-mode');
  if (indicator) indicator.remove();

  const handler = (system as unknown as Record<string, unknown>).clickHandler as EventListener;
  if (handler) {
    document.removeEventListener('click', handler);
  }
}

/**
 * Show annotation input popup
 */
function showAnnotationInput(
  system: AnnotationsSystem,
  x: number,
  y: number,
  screenX: number,
  screenY: number
): void {
  exitAddMode(system);

  const popup = document.createElement('div');
  popup.id = 'annotation-input';
  popup.style.cssText = `
    position: fixed;
    left: ${screenX}px;
    top: ${screenY}px;
    transform: translate(-50%, -100%) translateY(-10px);
    width: 220px;
    background: rgba(20, 20, 30, 0.98);
    border: 1px solid rgba(255, 217, 61, 0.4);
    border-radius: 8px;
    padding: 12px;
    font-family: system-ui, sans-serif;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.2s;
  `;

  let selectedColor = NOTE_COLORS[0];

  popup.innerHTML = `
    <textarea id="annotation-text" placeholder="Add your note..."
      style="
        width: 100%;
        height: 60px;
        padding: 8px;
        background: rgba(40, 40, 60, 0.5);
        border: 1px solid rgba(255, 217, 61, 0.2);
        border-radius: 4px;
        color: white;
        font-size: 12px;
        resize: none;
        outline: none;
        font-family: inherit;
      "></textarea>
    <div style="display: flex; gap: 6px; margin: 10px 0;">
      ${NOTE_COLORS.map((color, i) => `
        <div class="color-pick" data-color="${color}" style="
          width: 20px;
          height: 20px;
          background: ${color};
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid ${i === 0 ? 'white' : 'transparent'};
        "></div>
      `).join('')}
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="annotation-cancel" style="
        flex: 1;
        padding: 6px;
        background: rgba(100, 100, 120, 0.3);
        border: none;
        border-radius: 4px;
        color: #aaa;
        font-size: 11px;
        cursor: pointer;
      ">Cancel</button>
      <button id="annotation-save" style="
        flex: 1;
        padding: 6px;
        background: rgba(255, 217, 61, 0.3);
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 11px;
        cursor: pointer;
      ">Save</button>
    </div>
  `;

  system.container.appendChild(popup);

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    const textInput = document.getElementById('annotation-text') as HTMLTextAreaElement;
    textInput?.focus();
  });

  // Wire up color picker
  const colorPicks = popup.querySelectorAll('.color-pick');
  colorPicks.forEach(pick => {
    (pick as HTMLElement).onclick = (e) => {
      e.stopPropagation();
      colorPicks.forEach(p => (p as HTMLElement).style.borderColor = 'transparent');
      (pick as HTMLElement).style.borderColor = 'white';
      selectedColor = (pick as HTMLElement).dataset.color || NOTE_COLORS[0];
    };
  });

  // Cancel button
  const cancelBtn = document.getElementById('annotation-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = () => popup.remove();
  }

  // Save button
  const saveBtn = document.getElementById('annotation-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const textInput = document.getElementById('annotation-text') as HTMLTextAreaElement;
      const text = textInput?.value.trim();

      if (text) {
        addAnnotation(system, {
          id: `anno-${Date.now()}`,
          dayNumber: system.currentDay,
          x,
          y,
          text,
          color: selectedColor,
          createdAt: Date.now(),
        });

        // Show the new annotation
        showAnnotations(system, system.currentDay);
      }

      popup.remove();
    };
  }

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      popup.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Add an annotation
 */
function addAnnotation(system: AnnotationsSystem, annotation: Annotation): void {
  let dayAnnotations = system.annotations.get(annotation.dayNumber);
  if (!dayAnnotations) {
    dayAnnotations = [];
    system.annotations.set(annotation.dayNumber, dayAnnotations);
  }

  // Limit annotations per day
  if (dayAnnotations.length >= MAX_ANNOTATIONS_PER_DAY) {
    dayAnnotations.shift(); // Remove oldest
  }

  dayAnnotations.push(annotation);
  saveAnnotations(system);
}

/**
 * Create annotation element on screen
 */
function createAnnotationElement(system: AnnotationsSystem, annotation: Annotation): void {
  const rect = system.container.getBoundingClientRect();
  const screenX = rect.left + annotation.x * rect.width;
  const screenY = rect.top + annotation.y * rect.height;

  const element = document.createElement('div');
  element.className = 'museum-annotation';
  element.style.cssText = `
    position: fixed;
    left: ${screenX}px;
    top: ${screenY}px;
    transform: translate(-50%, -100%);
    max-width: 150px;
    background: ${annotation.color};
    color: #1a1a2e;
    padding: 8px 10px;
    border-radius: 4px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    line-height: 1.4;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 500;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  element.innerHTML = `
    <div style="word-wrap: break-word;">${annotation.text}</div>
    <div style="
      position: absolute;
      left: 50%;
      bottom: -6px;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid ${annotation.color};
    "></div>
  `;

  // Delete on click
  element.onclick = () => {
    if (confirm('Delete this annotation?')) {
      deleteAnnotation(system, annotation.id);
      element.remove();
    }
  };

  system.container.appendChild(element);
  system.activeAnnotations.push(element);

  requestAnimationFrame(() => {
    element.style.opacity = '1';
  });
}

/**
 * Delete an annotation
 */
function deleteAnnotation(system: AnnotationsSystem, annotationId: string): void {
  system.annotations.forEach((dayAnnotations, dayNumber) => {
    const index = dayAnnotations.findIndex(a => a.id === annotationId);
    if (index !== -1) {
      dayAnnotations.splice(index, 1);
      if (dayAnnotations.length === 0) {
        system.annotations.delete(dayNumber);
      }
    }
  });
  saveAnnotations(system);
}

/**
 * Clear all active annotation elements
 */
function clearActiveAnnotations(system: AnnotationsSystem): void {
  system.activeAnnotations.forEach(el => el.remove());
  system.activeAnnotations = [];
}

/**
 * Get annotation count for a day
 */
export function getAnnotationCount(system: AnnotationsSystem, dayNumber: number): number {
  return system.annotations.get(dayNumber)?.length || 0;
}

// ============================================================================
// Persistence
// ============================================================================

function loadAnnotations(): Map<number, Annotation[]> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved) as Array<[number, Annotation[]]>;
      return new Map(data);
    }
  } catch {
    // localStorage may not be available
  }
  return null;
}

function saveAnnotations(system: AnnotationsSystem): void {
  try {
    const data = Array.from(system.annotations.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeAnnotationsSystem(system: AnnotationsSystem): void {
  exitAddMode(system);
  system.cleanup();
}
