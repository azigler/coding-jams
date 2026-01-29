/**
 * Exhibit Search
 *
 * Quick search through exhibit titles and prompts.
 */

// ============================================================================
// Types
// ============================================================================

export interface SearchResult {
  dayNumber: number;
  title: string;
  prompt: string;
  matchType: 'title' | 'prompt' | 'day';
}

export interface SearchSystem {
  container: HTMLElement;
  isOpen: boolean;
  popup: HTMLElement | null;
  onSelect: ((dayNumber: number) => void) | null;
  cleanup: () => void;
}

// ============================================================================
// Exhibit Data
// ============================================================================

const EXHIBITS: Array<{ day: number; title: string; prompt: string }> = [
  { day: 1, title: 'Vertical or Horizontal Lines', prompt: 'Vertical or horizontal lines only' },
  { day: 2, title: 'Layers Upon Layers', prompt: 'Layers upon layers upon layers' },
  { day: 3, title: 'Exactly 42 Lines', prompt: 'Exactly 42 lines of code' },
  { day: 4, title: 'Black on Black', prompt: 'Black on black' },
  { day: 5, title: 'Isometric Art', prompt: 'Isometric art no rotation' },
  { day: 6, title: 'Make a Landscape', prompt: 'Make a landscape using only primitive shapes' },
  { day: 7, title: 'Use the Digit 7', prompt: 'Use the digit 7 in your code' },
  { day: 8, title: 'Draw One Million', prompt: 'Draw one million of something' },
  { day: 9, title: 'The Textile Arts', prompt: 'The textile arts weaving knitting embroidery' },
  { day: 10, title: 'You Can Only Use TAU', prompt: 'You can only use TAU in your code' },
  { day: 11, title: 'Impossible Day', prompt: 'Impossible day can you satisfice all prompts' },
  { day: 12, title: 'Subdivision', prompt: 'Subdivision' },
  { day: 13, title: 'Triangles Only', prompt: 'Triangles and only triangles' },
  { day: 14, title: 'Pure Black and White', prompt: 'Pure black and white no gray' },
  { day: 15, title: 'Design a Rug', prompt: 'Design a rug' },
  { day: 16, title: 'Movie Palette', prompt: 'Palette from your favorite movie' },
  { day: 17, title: 'What Does Wind Look Like', prompt: 'What does wind look like' },
  { day: 18, title: 'The Opposite', prompt: 'What does the opposite mean to you' },
  { day: 19, title: 'Op Art', prompt: 'Op art' },
  { day: 20, title: 'Generative Typography', prompt: 'Generative typography' },
  { day: 21, title: 'Collision Detection', prompt: 'Create a collision detection system and use it' },
  { day: 22, title: 'Gradients Only', prompt: 'Gradients only' },
  { day: 23, title: 'More Than 5 Colors', prompt: 'More than 5 colors' },
  { day: 24, title: 'Geometric Abstraction', prompt: 'Geometric abstraction' },
  { day: 25, title: 'One Extremely Long Line', prompt: 'One line that is extremely long' },
  { day: 26, title: 'Symmetry', prompt: 'Symmetry' },
  { day: 27, title: 'No Randomness', prompt: 'Make something interesting with no randomness or noise' },
  { day: 28, title: 'Infinite Scroll', prompt: 'Infinite scroll' },
  { day: 29, title: 'Grid-Based', prompt: 'Grid-based' },
  { day: 30, title: 'Abstract Emotion', prompt: 'Abstract emotion' },
  { day: 31, title: 'Celebrate', prompt: 'Celebrate' },
];

// ============================================================================
// Search System Creation
// ============================================================================

/**
 * Create the search system
 */
export function createSearchSystem(container: HTMLElement): SearchSystem {
  const system: SearchSystem = {
    container,
    isOpen: false,
    popup: null,
    onSelect: null,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Handle / key for search
  const keyHandler = (event: KeyboardEvent) => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
      // Don't trigger if already in an input
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      event.preventDefault();
      toggleSearch(system);
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
 * Toggle search visibility
 */
export function toggleSearch(system: SearchSystem): void {
  if (system.isOpen) {
    closeSearch(system);
  } else {
    openSearch(system);
  }
}

/**
 * Open the search popup
 */
function openSearch(system: SearchSystem): void {
  if (system.popup) return;

  const popup = document.createElement('div');
  popup.id = 'search-popup';
  popup.style.cssText = `
    position: fixed;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.2s;
  `;

  // Search input
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `
    padding: 15px;
    border-bottom: 1px solid rgba(100, 150, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  inputWrapper.innerHTML = `
    <span style="color: #4a9eff; font-size: 16px;">🔍</span>
    <input type="text" id="search-input" placeholder="Search exhibits..." style="
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-size: 15px;
    ">
    <kbd style="
      background: rgba(60, 60, 80, 0.5);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      color: #888;
    ">Esc</kbd>
  `;
  popup.appendChild(inputWrapper);

  // Results container
  const results = document.createElement('div');
  results.id = 'search-results';
  results.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
  `;
  popup.appendChild(results);

  // Search logic
  const input = inputWrapper.querySelector('input') as HTMLInputElement;
  let selectedIndex = 0;

  function updateResults(query: string) {
    const matches = search(query);
    selectedIndex = 0;
    renderResults(results, matches, selectedIndex, (dayNumber) => {
      system.onSelect?.(dayNumber);
      closeSearch(system);
    });
  }

  input.oninput = () => {
    updateResults(input.value);
  };

  input.onkeydown = (e) => {
    const items = results.querySelectorAll('.search-result-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateHighlight(results, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateHighlight(results, selectedIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[selectedIndex] as HTMLElement | undefined;
      if (selected) {
        selected.click();
      }
    } else if (e.key === 'Escape') {
      closeSearch(system);
    }
  };

  // Show initial results (all exhibits)
  updateResults('');

  system.container.appendChild(popup);
  system.popup = popup;
  system.isOpen = true;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    input.focus();
  });
}

/**
 * Close the search popup
 */
function closeSearch(system: SearchSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 200);

  system.isOpen = false;
}

/**
 * Search exhibits
 */
function search(query: string): SearchResult[] {
  if (!query.trim()) {
    // Return all exhibits
    return EXHIBITS.map(e => ({
      dayNumber: e.day,
      title: e.title,
      prompt: e.prompt,
      matchType: 'title' as const,
    }));
  }

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Check for day number search
  const dayMatch = q.match(/^day\s*(\d+)$|^(\d+)$/);
  if (dayMatch) {
    const dayNum = parseInt(dayMatch[1] || dayMatch[2], 10);
    const exhibit = EXHIBITS.find(e => e.day === dayNum);
    if (exhibit) {
      return [{
        dayNumber: exhibit.day,
        title: exhibit.title,
        prompt: exhibit.prompt,
        matchType: 'day',
      }];
    }
  }

  // Search title and prompt
  for (const exhibit of EXHIBITS) {
    const titleMatch = exhibit.title.toLowerCase().includes(q);
    const promptMatch = exhibit.prompt.toLowerCase().includes(q);

    if (titleMatch || promptMatch) {
      results.push({
        dayNumber: exhibit.day,
        title: exhibit.title,
        prompt: exhibit.prompt,
        matchType: titleMatch ? 'title' : 'prompt',
      });
    }
  }

  return results;
}

/**
 * Render search results
 */
function renderResults(
  container: HTMLElement,
  results: SearchResult[],
  selectedIndex: number,
  onSelect: (dayNumber: number) => void
): void {
  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #666;">
        No exhibits found
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  results.forEach((result, index) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.style.cssText = `
      padding: 12px 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      background: ${index === selectedIndex ? 'rgba(74, 158, 255, 0.2)' : 'transparent'};
      border-bottom: 1px solid rgba(100, 150, 255, 0.1);
    `;

    item.innerHTML = `
      <span style="
        min-width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #4a9eff, #a855f7);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      ">${result.dayNumber}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 13px; color: white; font-weight: 500;">${result.title}</div>
        <div style="font-size: 11px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${result.prompt}
        </div>
      </div>
    `;

    item.onmouseenter = () => {
      container.querySelectorAll('.search-result-item').forEach((el, i) => {
        (el as HTMLElement).style.background = i === index ? 'rgba(74, 158, 255, 0.2)' : 'transparent';
      });
    };

    item.onclick = () => onSelect(result.dayNumber);

    container.appendChild(item);
  });
}

/**
 * Update highlight for keyboard navigation
 */
function updateHighlight(container: HTMLElement, selectedIndex: number): void {
  container.querySelectorAll('.search-result-item').forEach((el, i) => {
    (el as HTMLElement).style.background = i === selectedIndex ? 'rgba(74, 158, 255, 0.2)' : 'transparent';
  });

  // Scroll into view if needed
  const items = container.querySelectorAll('.search-result-item');
  const selected = items[selectedIndex] as HTMLElement | undefined;
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeSearchSystem(system: SearchSystem): void {
  system.cleanup();
}
