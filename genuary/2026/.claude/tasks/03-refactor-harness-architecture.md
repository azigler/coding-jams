# Task 3: Refactor Harness Architecture

**Priority:** Medium
**Complexity:** High
**Files to Modify:** `src/index.ts`, `src/utils/controls.ts`, `src/types.ts`

---

## Problem Statement

The current harness has grown organically and accumulated technical debt:

1. **285 lines of duplicate code** — Sketch creation with/without controls is nearly identical
2. **Callback hell** — Recording setup has 4 levels of nested `setTimeout` chains
3. **Type safety compromised** — Heavy use of `(p as any)._fieldName` casts
4. **Memory leaks** — Control configs never garbage collected between days
5. **Race conditions** — Page navigation during recording/loading causes errors
6. **No single source of truth** — Control state exists in 3+ places

---

## Requirements

### Structural
- Extract shared sketch initialization to single function
- Convert async operations to async/await
- Create proper TypeScript interfaces for all data structures
- Implement AbortController for cancellable operations

### Quality
- Zero `as any` casts (or explicitly justified)
- All state in predictable locations
- Cleanup functions that actually clean up
- Error boundaries that don't crash the page

---

## Technical Specification

### 1. Unified Day Module Interface

```typescript
// src/types.ts

export interface ControlConfig {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
  format?: (value: number) => string;  // Custom display formatting
}

export interface ControlState {
  [key: string]: number;
}

export interface DayModule {
  default: DayConfig;
  controlConfigs?: Record<string, ControlConfig>;
  defaultControls?: ControlState;
  getClaudesChoice?: () => Partial<ControlState>;
}

export interface DayConfig {
  day: number;
  prompt: string;
  creditName: string;
  creditUrl: string;
  mode?: 'p5' | 'glsl';
  recording?: RecordingConfig;

  // p5 mode
  setup?: (p: p5, controls: ControlState) => void;
  draw?: (p: p5, controls: ControlState) => void;
  renderFinal?: (p: p5, controls: ControlState) => void;
  windowResized?: (p: p5) => void;
  mousePressed?: (p: p5) => void;
  keyPressed?: (p: p5) => void;

  // GLSL mode
  fragmentShader?: string;
  vertexShader?: string;
  uniforms?: UniformConfig[];
}

export interface RecordingConfig {
  enabled: boolean;
  duration: number;
  filename: string;
}
```

### 2. State Management

Create a single source of truth for application state:

```typescript
// src/harness/state.ts

export interface AppState {
  currentDay: number;
  controls: ControlState;
  isRecording: boolean;
  abortController: AbortController | null;
}

const state: AppState = {
  currentDay: 1,
  controls: {},
  isRecording: false,
  abortController: null,
};

export function getState(): Readonly<AppState> {
  return state;
}

export function updateState(partial: Partial<AppState>): void {
  Object.assign(state, partial);
}

export function resetState(): void {
  state.abortController?.abort();
  state.controls = {};
  state.isRecording = false;
  state.abortController = null;
}
```

### 3. Day Loader Refactor

Extract the common sketch creation logic:

```typescript
// src/harness/day-loader.ts

export interface DayRenderer {
  start: () => void;
  stop: () => void;
  updateControls: (controls: ControlState) => void;
  getCanvas: () => HTMLCanvasElement;
}

export async function loadDay(
  dayNum: number,
  container: HTMLElement,
  onControlsChange: (controls: ControlState) => void
): Promise<DayRenderer> {
  // Dynamic import with proper typing
  const module = await import(`../days/${dayNum.toString().padStart(2, '0')}.ts`) as DayModule;
  const config = module.default;
  const controlConfigs = module.controlConfigs || {};
  const defaultControls = module.defaultControls || {};

  // Load persisted controls
  let controls = loadControls(dayNum, defaultControls);

  if (config.mode === 'glsl') {
    return createShaderRenderer(config, container, controls, onControlsChange);
  } else {
    return createP5Renderer(config, container, controls, onControlsChange);
  }
}

function createP5Renderer(
  config: DayConfig,
  container: HTMLElement,
  initialControls: ControlState,
  onControlsChange: (controls: ControlState) => void
): DayRenderer {
  let controls = { ...initialControls };
  let sketch: p5 | null = null;

  const sketchFn = (p: p5) => {
    p.setup = () => {
      config.setup?.(p, controls);
    };

    p.draw = () => {
      config.draw?.(p, controls);
    };

    // ... other handlers
  };

  return {
    start: () => {
      sketch = new p5(sketchFn, container);
    },
    stop: () => {
      sketch?.remove();
      sketch = null;
    },
    updateControls: (newControls: ControlState) => {
      controls = { ...newControls };
      sketch?.redraw();
    },
    getCanvas: () => sketch?.canvas as HTMLCanvasElement,
  };
}
```

### 4. Async Navigation

Replace callback chains with async/await:

```typescript
// src/harness/navigation.ts

let currentRenderer: DayRenderer | null = null;
let loadingAbort: AbortController | null = null;

export async function navigateToDay(dayNum: number): Promise<void> {
  // Abort any pending load
  loadingAbort?.abort();
  loadingAbort = new AbortController();

  // Stop current day
  currentRenderer?.stop();
  currentRenderer = null;

  // Clear containers
  clearContainer('p5-canvas-container');
  clearControls();

  try {
    // Show loading state
    showLoading(dayNum);

    // Load new day
    currentRenderer = await loadDay(
      dayNum,
      document.getElementById('p5-canvas-container')!,
      handleControlsChange
    );

    // Check if aborted during load
    if (loadingAbort.signal.aborted) {
      currentRenderer.stop();
      return;
    }

    // Start rendering
    currentRenderer.start();

    // Setup controls UI
    setupControls(dayNum);

    // Update URL
    window.location.hash = `#day${dayNum}`;

  } catch (error) {
    if (error.name !== 'AbortError') {
      showError(dayNum, error);
    }
  }
}
```

### 5. Controls Refactor

Remove label-based matching and global state:

```typescript
// src/utils/controls.ts

export interface ControlsManager {
  container: HTMLElement;
  getValue: (key: string) => number;
  setValue: (key: string, value: number) => void;
  setAll: (values: Partial<ControlState>) => void;
  destroy: () => void;
}

export function createControls(
  day: number,
  configs: Record<string, ControlConfig>,
  defaults: ControlState,
  claudesChoice: (() => Partial<ControlState>) | undefined,
  onChange: (values: ControlState) => void
): ControlsManager {
  const container = document.createElement('div');
  container.id = `controls-day-${day}`;

  // Load from localStorage
  const values = loadControls(day, defaults);

  // Map of key -> slider element
  const sliders = new Map<string, HTMLInputElement>();
  const displays = new Map<string, HTMLSpanElement>();

  // Create sliders
  for (const [key, config] of Object.entries(configs)) {
    const { slider, display } = createSlider(key, config, values[key], (newValue) => {
      values[key] = newValue;
      saveControls(day, values);
      onChange(values);
    });
    sliders.set(key, slider);
    displays.set(key, display);
  }

  // Add buttons
  createResetButton(container, () => {
    // Reset to defaults
    Object.assign(values, defaults);
    updateAllSliders();
    saveControls(day, values);
    onChange(values);
  });

  if (claudesChoice) {
    createChoiceButton(container, () => {
      const choice = claudesChoice();
      Object.assign(values, choice);
      updateAllSliders();
      saveControls(day, values);
      onChange(values);
    });
  }

  function updateAllSliders() {
    for (const [key, slider] of sliders) {
      const config = configs[key];
      slider.value = mapToSliderValue(values[key], config.min, config.max).toString();
      displays.get(key)!.textContent = formatValue(values[key], config);
    }
  }

  return {
    container,
    getValue: (key) => values[key],
    setValue: (key, value) => {
      values[key] = value;
      updateAllSliders();
      onChange(values);
    },
    setAll: (newValues) => {
      Object.assign(values, newValues);
      updateAllSliders();
      onChange(values);
    },
    destroy: () => {
      container.remove();
      sliders.clear();
      displays.clear();
    },
  };
}
```

### 6. Cleanup Registry

Ensure all async operations can be cancelled:

```typescript
// src/harness/cleanup.ts

type CleanupFn = () => void;

const cleanupRegistry = new Set<CleanupFn>();

export function registerCleanup(fn: CleanupFn): void {
  cleanupRegistry.add(fn);
}

export function unregisterCleanup(fn: CleanupFn): void {
  cleanupRegistry.delete(fn);
}

export function runAllCleanups(): void {
  for (const fn of cleanupRegistry) {
    try {
      fn();
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  }
  cleanupRegistry.clear();
}

// Usage in index.ts
window.addEventListener('beforeunload', runAllCleanups);
```

---

## Migration Strategy

### Phase 1: Types First
1. Add new interfaces to `types.ts`
2. Update day modules to export properly typed configs
3. Keep existing runtime behavior

### Phase 2: State Management
1. Create `state.ts` with centralized state
2. Migrate state access point by point
3. Remove `(p as any)._controls` pattern

### Phase 3: Day Loader
1. Extract `createP5Renderer` function
2. Test with existing days
3. Remove duplicate code paths

### Phase 4: Controls
1. Create new `ControlsManager` class
2. Migrate one day at a time
3. Remove global `controlConfigsStore`

### Phase 5: Async Operations
1. Convert recording to async/await
2. Add AbortController to navigation
3. Remove setTimeout chains

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types.ts` | Add interfaces, extend DayConfig |
| `src/harness/state.ts` | Create (new file) |
| `src/harness/day-loader.ts` | Create (new file) |
| `src/harness/navigation.ts` | Create (new file) |
| `src/harness/cleanup.ts` | Create (new file) |
| `src/utils/controls.ts` | Refactor to class-based |
| `src/index.ts` | Thin shell that wires everything |
| `src/days/*.ts` | Update exports to match new interface |

---

## Testing Checklist

- [ ] All 31 days still load and render
- [ ] Controls persist across page reloads
- [ ] Navigating rapidly doesn't cause errors
- [ ] Recording works without race conditions
- [ ] Memory usage stable after loading many days
- [ ] No TypeScript `any` errors (or justified)
- [ ] Mobile layout still works
- [ ] "Opus 4.5's Choice" button works

---

## Success Metrics

- Lines of code in `index.ts`: < 200 (down from ~800)
- TypeScript `any` casts: 0 (or documented exceptions)
- Duplicate code blocks: 0
- Global mutable state: 1 (AppState)
- Average day load time: < 100ms
