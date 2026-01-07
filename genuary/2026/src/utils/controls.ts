/**
 * Controls utility for managing slider-based controls with localStorage persistence
 */

// Ensure window is available for TypeScript
declare global {
  interface Window {
    setGenuaryControls?: (day: number, values: Partial<ControlState>) => void;
    setGenuaryControlsDebug?: () => void;
  }
}

export interface ControlConfig {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
}

export interface ControlState {
  [key: string]: number;
}

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
export function resetControls(day: number, defaults: ControlState): void {
  try {
    localStorage.removeItem(getStorageKey(day));
  } catch (error) {
    console.error('Error resetting controls:', error);
  }
}

// Store control configs and callbacks for programmatic access
const controlConfigsStore: Map<number, { configs: { [key: string]: ControlConfig }, callback: (values: ControlState) => void }> = new Map();

/**
 * Create a controls container with sliders
 */
export function createControlsContainer(
  day: number,
  controls: { [key: string]: ControlConfig },
  onUpdate: (values: ControlState) => void,
  getClaudesChoice?: () => Partial<ControlState>
): HTMLElement {
  // Store configs and callback for programmatic access
  controlConfigsStore.set(day, { configs: controls, callback: onUpdate });
  
  const container = document.createElement('div');
  container.id = `controls-day-${day}`;
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

  // Build default values object
  const defaults: ControlState = {};
  Object.keys(controls).forEach((key) => {
    defaults[key] = controls[key].defaultValue;
  });

  // Load saved values
  const values = loadControls(day, defaults);

  // Create slider for each control
  const sliders: { [key: string]: HTMLInputElement } = {};
  
  Object.entries(controls).forEach(([key, config]) => {
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    `;

    const label = document.createElement('label');
    label.textContent = config.label;
    label.style.cssText = `
      color: #e0e0e0;
      font-size: 0.9rem;
      font-weight: 500;
    `;

    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.step = config.step ? (100 / ((config.max - config.min) / config.step)).toString() : '1';
    slider.value = mapToSliderValue(values[key], config.min, config.max).toString();
    slider.style.cssText = `
      flex: 1;
      height: 6px;
      background: #444;
      outline: none;
      border-radius: 3px;
      -webkit-appearance: none;
      cursor: pointer;
    `;

    // Style the slider thumb
    slider.addEventListener('input', () => {
      slider.style.background = `linear-gradient(to right, #4a9eff 0%, #4a9eff ${slider.value}%, #444 ${slider.value}%, #444 100%)`;
    });
    slider.dispatchEvent(new Event('input'));

    // Webkit thumb styling (only add once)
    if (!document.getElementById('controls-slider-styles')) {
      slider.style.setProperty('--webkit-slider-thumb-size', '16px');
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
    }

    const valueDisplay = document.createElement('span');
    valueDisplay.style.cssText = `
      color: #e0e0e0;
      font-size: 0.85rem;
      min-width: 60px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    `;
    valueDisplay.textContent = formatValue(values[key], config);

    slider.addEventListener('input', () => {
      const sliderVal = parseFloat(slider.value);
      const actualValue = mapFromSliderValue(sliderVal, config.min, config.max);
      values[key] = actualValue;
      valueDisplay.textContent = formatValue(actualValue, config);
      saveControls(day, values);
      onUpdate(values);
    });

    sliders[key] = slider;

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    controlDiv.appendChild(label);
    controlDiv.appendChild(sliderContainer);
    grid.appendChild(controlDiv);
  });

  // Add button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.5rem;
  `;

  // Add reset button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset Controls';
  resetBtn.style.cssText = `
    padding: 0.5rem 1rem;
    background: #2a2a2a;
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  `;
  resetBtn.addEventListener('mouseenter', () => {
    resetBtn.style.background = '#3a3a3a';
  });
  resetBtn.addEventListener('mouseleave', () => {
    resetBtn.style.background = '#2a2a2a';
  });
  resetBtn.addEventListener('click', () => {
    resetControls(day, defaults);
    // Reload defaults
    Object.keys(controls).forEach((key) => {
      values[key] = controls[key].defaultValue;
      const slider = sliders[key];
      if (slider) {
        slider.value = mapToSliderValue(values[key], controls[key].min, controls[key].max).toString();
        slider.dispatchEvent(new Event('input'));
      }
    });
    onUpdate(values);
  });

  // Add Opus 4.5's Choice button
  const claudeBtn = document.createElement('button');
  claudeBtn.textContent = "🎨 Opus 4.5's Choice";
  claudeBtn.style.cssText = `
    padding: 0.5rem 1rem;
    background: #4a9eff;
    color: #fff;
    border: 1px solid #5aafff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  `;
  claudeBtn.addEventListener('mouseenter', () => {
    claudeBtn.style.background = '#5aafff';
  });
  claudeBtn.addEventListener('mouseleave', () => {
    claudeBtn.style.background = '#4a9eff';
  });
  claudeBtn.addEventListener('click', () => {
    // Apply recommended settings
    let claudesChoice: Partial<ControlState>;
    
    if (getClaudesChoice) {
      // Use day-specific choice if provided
      claudesChoice = getClaudesChoice();
    } else {
      // Fallback to day 1 defaults (for backwards compatibility)
      claudesChoice = {
        numTriangles: 220,
        orbitVelocity: 0.20,
        rotationVelocity: 0.50,
      };
    }
    
    // Use the programmatic API
    setControlsProgrammatically(day, claudesChoice);
  });

  buttonContainer.appendChild(resetBtn);
  buttonContainer.appendChild(claudeBtn);

  container.appendChild(grid);
  container.appendChild(buttonContainer);

  // Ensure the global function is exposed
  if (typeof window !== 'undefined') {
    (window as any).setGenuaryControls = setControlsProgrammatically;
    console.log(`🎛️ setGenuaryControls function exposed for day ${day}`);
  }

  return container;
}

/**
 * Remove controls container
 */
export function removeControlsContainer(day: number): void {
  const container = document.getElementById(`controls-day-${day}`);
  if (container) {
    container.remove();
  }
}

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
  // Special handling for Color Style (colorMutation)
  if (config.label === "Color Style") {
    if (value > 0.05) {
      return `Pastel ${value.toFixed(2)}`;
    } else if (value < -0.05) {
      return `Glitchy ${Math.abs(value).toFixed(2)}`;
    } else {
      return "Normal";
    }
  }
  
  // Special handling for Mode toggle
  if (config.label === "Mode") {
    return value === 0 ? "Spiral" : "Wave";
  }

  // Special handling for Boolean Operation (Day 7)
  if (config.label === "Boolean Operation") {
    const ops = ["AND", "OR", "XOR", "¬A", "¬B", "De Morgan"];
    const idx = Math.round(value);
    return ops[Math.min(idx, ops.length - 1)] || "XOR";
  }

  // If step is defined and is an integer step, show as integer
  if (config.step && config.step >= 1 && Number.isInteger(value)) {
    return Math.round(value).toString();
  }
  // Otherwise show with 2 decimal places
  return value.toFixed(2);
}

/**
 * Programmatically set control values from external code (e.g., browser console)
 * Exposed globally for easy access
 */
export function setControlsProgrammatically(day: number, values: Partial<ControlState>): void {
  try {
    console.log(`🎛️ ========== setGenuaryControls CALLED ==========`);
    console.log(`   Day: ${day}`);
    console.log(`   Values:`, values);
    console.log(`   Function exists:`, typeof setControlsProgrammatically);
    
    if (!day || typeof day !== 'number') {
      throw new Error(`Invalid day parameter: ${day}`);
    }
    
    if (!values || typeof values !== 'object') {
      throw new Error(`Invalid values parameter: ${values}`);
    }
    
    const container = document.getElementById(`controls-day-${day}`);
  if (!container) {
    console.error(`❌ Controls container for day ${day} not found. Available containers:`, 
      Array.from(document.querySelectorAll('[id^="controls-day-"]')).map(el => el.id));
    return;
  }
  console.log(`✅ Found controls container for day ${day}`);
  
  // Get stored configs and callback
  const stored = controlConfigsStore.get(day);
  if (!stored) {
    console.error(`❌ Control configs for day ${day} not found. Available days:`, 
      Array.from(controlConfigsStore.keys()));
    return;
  }
  console.log(`✅ Found control configs for day ${day}`);
  
  const { configs, callback } = stored;
  
  // Get current values (either from localStorage or defaults)
  const defaults: ControlState = {} as ControlState;
  Object.keys(configs).forEach(key => {
    defaults[key as keyof ControlState] = configs[key].defaultValue;
  });
  const currentValues = loadControls(day, defaults);
  
  // Update with new values
  const updatedValues = { ...currentValues, ...values };
  
  // Update each slider by matching to control keys
  const sliders = container.querySelectorAll('input[type="range"]');
  
  sliders.forEach((slider) => {
    // Find the label for this slider to match it to a control key
    const sliderContainer = slider.closest('div[style*="flex-direction: column"]');
    const label = sliderContainer?.querySelector('label');
    
    if (!label) return;
    
    const labelText = label.textContent || '';
    
    // Match label to control key
    let controlKey: string | null = null;
    for (const key of Object.keys(configs)) {
      if (configs[key].label === labelText) {
        controlKey = key;
        break;
      }
    }
    
    if (controlKey && updatedValues[controlKey as keyof ControlState] !== undefined) {
      const config = configs[controlKey];
      const newValue = updatedValues[controlKey as keyof ControlState];
      if (newValue !== undefined) {
        const sliderEl = slider as HTMLInputElement;
        const sliderValue = mapToSliderValue(newValue, config.min, config.max);
        sliderEl.value = sliderValue.toString();
        
        // Trigger input event to update display and save
        sliderEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      }
    }
  });
  
    // Filter out undefined values before saving
    const validValues: ControlState = {} as ControlState;
    for (const key in updatedValues) {
      if (updatedValues[key] !== undefined) {
        validValues[key] = updatedValues[key]!;
      }
    }
  
    // Save and trigger callback
    saveControls(day, validValues);
    console.log(`🔄 Calling update callback...`);
    try {
      callback(validValues);
      console.log(`✅ Controls updated for day ${day}:`, updatedValues);
    } catch (error) {
      console.error(`❌ Error calling update callback:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`❌ ERROR in setControlsProgrammatically:`, error);
    console.error(`   Stack:`, (error as Error).stack);
    throw error; // Re-throw so caller knows it failed
  }
}

// Expose globally for browser console access - called at module load
if (typeof window !== 'undefined') {
  window.setGenuaryControls = setControlsProgrammatically;
  window.setGenuaryControlsDebug = () => {
    console.log('🔍 Debug Info:');
    console.log('  Available days:', Array.from(controlConfigsStore.keys()));
    controlConfigsStore.forEach((value, key) => {
      console.log(`  Day ${key} controls:`, Object.keys(value.configs));
    });
    const containers = Array.from(document.querySelectorAll('[id^="controls-day-"]'));
    console.log('  DOM containers:', containers.map(el => el.id));
    console.log('  Function available?', typeof window.setGenuaryControls);
  };
  
  // Verify it's on window
  if (typeof window.setGenuaryControls === 'function') {
    console.log('✅ setGenuaryControls successfully exposed on window');
  } else {
    console.error('❌ FAILED to expose setGenuaryControls on window!');
  }
  
  // Test that it's accessible
  console.log('🎛️ Controls module loaded');
  console.log('   Try: window.setGenuaryControls(1, { numTriangles: 220, orbitVelocity: 0.20, rotationVelocity: 0.50 })');
  console.log('   Debug: window.setGenuaryControlsDebug()');
}
