/**
 * Controls utility for managing slider-based controls with localStorage persistence
 *
 * Refactored to use class-based ControlsManager pattern with proper cleanup.
 */

import type {
  ControlConfig,
  ControlState,
  ControlsManager,
  ControlChangeHandler,
} from '../types';

// Re-export types for backwards compatibility
export type { ControlConfig, ControlState, ControlsManager };

// ============================================================================
// Global Type Declarations
// ============================================================================

declare global {
  interface Window {
    setGenuaryControls?: (day: number, values: Partial<ControlState>) => void;
    setGenuaryControlsDebug?: () => void;
  }
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Get localStorage key for a day's controls
 */
function getStorageKey(day: number): string {
  return `genuary-2026-day-${day}-controls`;
}

/**
 * Load control values from localStorage for a specific day
 */
export function loadControls(day: number, defaults: ControlState): ControlState {
  try {
    const stored = localStorage.getItem(getStorageKey(day));
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new controls
      return { ...defaults, ...parsed };
    }
  } catch (error) {
    console.error('Error loading controls:', error);
  }
  return { ...defaults };
}

/**
 * Save control values to localStorage for a specific day
 */
export function saveControls(day: number, values: ControlState): void {
  try {
    localStorage.setItem(getStorageKey(day), JSON.stringify(values));
  } catch (error) {
    console.error('Error saving controls:', error);
  }
}

/**
 * Reset controls to defaults for a specific day
 */
export function resetControls(day: number): void {
  try {
    localStorage.removeItem(getStorageKey(day));
  } catch (error) {
    console.error('Error resetting controls:', error);
  }
}

// ============================================================================
// Value Mapping
// ============================================================================

/**
 * Map a value from min-max range to 0-100 slider range
 */
function mapToSliderValue(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

/**
 * Map a slider value (0-100) to min-max range
 */
function mapFromSliderValue(sliderValue: number, min: number, max: number): number {
  return min + (sliderValue / 100) * (max - min);
}

/**
 * Format a value for display
 */
function formatValue(value: number, config: ControlConfig): string {
  // Use custom formatter if provided
  if (config.format) {
    return config.format(value);
  }

  // Special handling for known control types by label
  if (config.label === 'Color Style') {
    if (value > 0.05) {
      return `Pastel ${value.toFixed(2)}`;
    } else if (value < -0.05) {
      return `Glitchy ${Math.abs(value).toFixed(2)}`;
    } else {
      return 'Normal';
    }
  }

  if (config.label === 'Mode') {
    return value === 0 ? 'Spiral' : 'Wave';
  }

  if (config.label === 'Boolean Operation') {
    const ops = ['AND', 'OR', 'XOR', '¬A', '¬B', 'De Morgan'];
    const idx = Math.round(value);
    return ops[Math.min(idx, ops.length - 1)] || 'XOR';
  }

  // If step is defined and is an integer step, show as integer
  if (config.step && config.step >= 1 && Number.isInteger(value)) {
    return Math.round(value).toString();
  }

  // Otherwise show with 2 decimal places
  return value.toFixed(2);
}

// ============================================================================
// Slider Styles
// ============================================================================

let stylesInjected = false;

function injectSliderStyles(): void {
  if (stylesInjected) return;

  const style = document.createElement('style');
  style.id = 'controls-slider-styles';
  style.textContent = `
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #4a9eff;
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #4a9eff;
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ============================================================================
// ControlsManager Implementation
// ============================================================================

// Active managers registry (for programmatic access)
const activeManagers = new Map<number, ControlsManagerImpl>();

class ControlsManagerImpl implements ControlsManager {
  readonly container: HTMLElement;
  private readonly day: number;
  private readonly configs: Record<string, ControlConfig>;
  private readonly onChange: ControlChangeHandler;
  private readonly getClaudesChoice?: () => Partial<ControlState>;

  private values: ControlState;
  private sliders = new Map<string, HTMLInputElement>();
  private displays = new Map<string, HTMLSpanElement>();
  private destroyed = false;

  constructor(
    day: number,
    configs: Record<string, ControlConfig>,
    defaults: ControlState,
    onChange: ControlChangeHandler,
    getClaudesChoice?: () => Partial<ControlState>
  ) {
    this.day = day;
    this.configs = configs;
    this.onChange = onChange;
    this.getClaudesChoice = getClaudesChoice;

    // Load saved values
    this.values = loadControls(day, defaults);

    // Create container
    this.container = this.createContainer();

    // Register for programmatic access
    activeManagers.set(day, this);
  }

  getValue(key: string): number {
    return this.values[key] ?? 0;
  }

  setValue(key: string, value: number): void {
    if (this.destroyed) return;

    this.values[key] = value;
    this.updateSlider(key);
    saveControls(this.day, this.values);
    this.onChange(this.values);
  }

  setAll(newValues: Partial<ControlState>): void {
    if (this.destroyed) return;

    Object.assign(this.values, newValues);
    this.updateAllSliders();
    saveControls(this.day, this.values);
    this.onChange(this.values);
  }

  getAll(): ControlState {
    return { ...this.values };
  }

  destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;
    this.container.remove();
    this.sliders.clear();
    this.displays.clear();
    activeManagers.delete(this.day);
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  private createContainer(): HTMLElement {
    injectSliderStyles();

    const container = document.createElement('div');
    container.id = `controls-day-${this.day}`;
    container.style.cssText = `
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(10px);
      border-top: 1px solid #333;
      padding: 1rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
    `;

    // Create controls grid
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      align-items: center;
    `;

    // Create slider for each control
    for (const [key, config] of Object.entries(this.configs)) {
      const controlDiv = this.createSliderControl(key, config);
      grid.appendChild(controlDiv);
    }

    // Create button container
    const buttonContainer = this.createButtons();

    container.appendChild(grid);
    container.appendChild(buttonContainer);

    return container;
  }

  private createSliderControl(key: string, config: ControlConfig): HTMLElement {
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    `;

    // Label
    const label = document.createElement('label');
    label.textContent = config.label;
    label.style.cssText = `
      color: #e0e0e0;
      font-size: 0.9rem;
      font-weight: 500;
    `;

    // Slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;

    // Slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.step = config.step
      ? (100 / ((config.max - config.min) / config.step)).toString()
      : '1';
    slider.value = mapToSliderValue(this.values[key], config.min, config.max).toString();
    slider.dataset.key = key; // Store key for easy lookup
    slider.style.cssText = `
      flex: 1;
      height: 6px;
      background: #444;
      outline: none;
      border-radius: 3px;
      -webkit-appearance: none;
      cursor: pointer;
    `;

    // Value display
    const valueDisplay = document.createElement('span');
    valueDisplay.style.cssText = `
      color: #e0e0e0;
      font-size: 0.85rem;
      min-width: 60px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    `;
    valueDisplay.textContent = formatValue(this.values[key], config);

    // Store references
    this.sliders.set(key, slider);
    this.displays.set(key, valueDisplay);

    // Update slider background
    this.updateSliderBackground(slider);

    // Event handler
    slider.addEventListener('input', () => {
      const sliderVal = parseFloat(slider.value);
      const actualValue = mapFromSliderValue(sliderVal, config.min, config.max);
      this.values[key] = actualValue;
      valueDisplay.textContent = formatValue(actualValue, config);
      this.updateSliderBackground(slider);
      saveControls(this.day, this.values);
      this.onChange(this.values);
    });

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    controlDiv.appendChild(label);
    controlDiv.appendChild(sliderContainer);

    return controlDiv;
  }

  private createButtons(): HTMLElement {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
    `;

    // Reset button
    const resetBtn = this.createButton('Reset Controls', '#2a2a2a', '#3a3a3a');
    resetBtn.addEventListener('click', () => this.resetToDefaults());

    // Claude's Choice button
    const claudeBtn = this.createButton("🎨 Opus 4.5's Choice", '#4a9eff', '#5aafff');
    claudeBtn.style.fontWeight = '500';
    claudeBtn.addEventListener('click', () => this.applyClaudesChoice());

    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(claudeBtn);

    return buttonContainer;
  }

  private createButton(text: string, bgColor: string, hoverColor: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      padding: 0.5rem 1rem;
      background: ${bgColor};
      color: ${bgColor === '#4a9eff' ? '#fff' : '#e0e0e0'};
      border: 1px solid ${bgColor === '#4a9eff' ? '#5aafff' : '#444'};
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = hoverColor;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = bgColor;
    });
    return btn;
  }

  private resetToDefaults(): void {
    resetControls(this.day);
    for (const [key, config] of Object.entries(this.configs)) {
      this.values[key] = config.defaultValue;
    }
    this.updateAllSliders();
    this.onChange(this.values);
  }

  private applyClaudesChoice(): void {
    let choice: Partial<ControlState>;

    if (this.getClaudesChoice) {
      choice = this.getClaudesChoice();
    } else {
      // Fallback defaults for backwards compatibility
      choice = {
        numTriangles: 220,
        orbitVelocity: 0.2,
        rotationVelocity: 0.5,
      };
    }

    this.setAll(choice);
  }

  private updateSlider(key: string): void {
    const slider = this.sliders.get(key);
    const display = this.displays.get(key);
    const config = this.configs[key];

    if (!slider || !display || !config) return;

    slider.value = mapToSliderValue(this.values[key], config.min, config.max).toString();
    display.textContent = formatValue(this.values[key], config);
    this.updateSliderBackground(slider);
  }

  private updateAllSliders(): void {
    for (const key of Object.keys(this.configs)) {
      this.updateSlider(key);
    }
  }

  private updateSliderBackground(slider: HTMLInputElement): void {
    const value = parseFloat(slider.value);
    slider.style.background = `linear-gradient(to right, #4a9eff 0%, #4a9eff ${value}%, #444 ${value}%, #444 100%)`;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a controls manager for a day
 * Returns a ControlsManager that can be used to interact with the controls
 */
export function createControls(
  day: number,
  configs: Record<string, ControlConfig>,
  defaults: ControlState,
  onChange: ControlChangeHandler,
  getClaudesChoice?: () => Partial<ControlState>
): ControlsManager {
  return new ControlsManagerImpl(day, configs, defaults, onChange, getClaudesChoice);
}

// ============================================================================
// Legacy API (Backwards Compatibility)
// ============================================================================

/**
 * Create a controls container with sliders
 * @deprecated Use createControls() instead
 */
export function createControlsContainer(
  day: number,
  controls: Record<string, ControlConfig>,
  onUpdate: ControlChangeHandler,
  getClaudesChoice?: () => Partial<ControlState>
): HTMLElement {
  // Build defaults from configs
  const defaults: ControlState = {};
  for (const [key, config] of Object.entries(controls)) {
    defaults[key] = config.defaultValue;
  }

  const manager = createControls(day, controls, defaults, onUpdate, getClaudesChoice);
  return manager.container;
}

/**
 * Remove controls container
 * @deprecated Managers clean up automatically
 */
export function removeControlsContainer(day: number): void {
  const manager = activeManagers.get(day);
  if (manager) {
    manager.destroy();
  }
}

/**
 * Programmatically set control values from external code (e.g., browser console)
 */
export function setControlsProgrammatically(day: number, values: Partial<ControlState>): void {
  try {
    console.log(`🎛️ setGenuaryControls(${day}, ${JSON.stringify(values)})`);

    const manager = activeManagers.get(day);
    if (!manager) {
      console.error(
        `❌ Controls manager for day ${day} not found. Available days:`,
        Array.from(activeManagers.keys())
      );
      return;
    }

    manager.setAll(values);
    console.log(`✅ Controls updated for day ${day}`);
  } catch (error) {
    console.error('❌ Error in setControlsProgrammatically:', error);
    throw error;
  }
}

// ============================================================================
// Global API Exposure
// ============================================================================

if (typeof window !== 'undefined') {
  window.setGenuaryControls = setControlsProgrammatically;

  window.setGenuaryControlsDebug = () => {
    console.log('🔍 Controls Debug Info:');
    console.log('  Active days:', Array.from(activeManagers.keys()));
    for (const [day, manager] of activeManagers) {
      console.log(`  Day ${day} values:`, manager.getAll());
    }
  };

  console.log('🎛️ Controls module loaded');
  console.log('   setGenuaryControls(day, values) - Set control values');
  console.log('   setGenuaryControlsDebug() - Show debug info');
}
