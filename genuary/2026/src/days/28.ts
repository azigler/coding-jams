/**
 * Day 28: PANEL
 *
 * "No libraries, no canvas, only HTML elements." — Piero
 *
 * A control panel for nothing. Every switch flips. Every button clicks.
 * Every knob turns. Nothing is connected to anything.
 *
 * The satisfaction isn't in doing—it's in the response. The pleasure
 * of feedback without function.
 *
 * After the obsolete interfaces of NASA mission control and analog synthesizers.
 *
 * Medium: Pure HTML + CSS + vanilla JavaScript
 */

import type { DayConfig, HtmlContext, ControlState } from '../types';
import type { ControlConfig } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface PanelContext extends HtmlContext {
  panel: HTMLElement;
  controls: Map<string, HTMLElement>;
  animationId: number | null;
}

// ============================================================================
// STYLES
// ============================================================================

const PANEL_STYLES = `
  .day28-panel {
    width: 800px;
    max-width: 100%;
    aspect-ratio: 1;
    margin: 0 auto;
    background: linear-gradient(145deg, #3d3d42, #2a2a2f);
    border-radius: 20px;
    padding: 30px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 20px;
    box-shadow:
      0 25px 50px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.1),
      inset 0 -1px 0 rgba(0,0,0,0.3);
    font-family: 'Courier New', monospace;
    user-select: none;
  }

  /* Control Group Container */
  .day28-control-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .day28-label {
    font-size: 9px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  /* ========================================
     PUSH BUTTON
     ======================================== */
  .day28-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(145deg, #4a4a50, #38383d);
    border: none;
    box-shadow:
      0 6px 12px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.15),
      inset 0 -2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.08s ease-out;
    position: relative;
  }

  .day28-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(145deg, #55555b, #45454a);
    box-shadow:
      inset 0 2px 4px rgba(0,0,0,0.3),
      inset 0 -1px 2px rgba(255,255,255,0.1);
  }

  .day28-button:active,
  .day28-button.pressed {
    box-shadow:
      0 2px 4px rgba(0,0,0,0.4),
      inset 0 2px 4px rgba(0,0,0,0.3);
    transform: translateY(2px);
  }

  .day28-button:active::before,
  .day28-button.pressed::before {
    background: linear-gradient(145deg, #4a4a50, #40404a);
  }

  /* ========================================
     TOGGLE SWITCH
     ======================================== */
  .day28-switch {
    width: 50px;
    height: 80px;
    background: linear-gradient(180deg, #2a2a2f, #3a3a40);
    border-radius: 8px;
    position: relative;
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,0.5),
      0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
  }

  .day28-switch-lever {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 50px;
    background: linear-gradient(90deg, #5a5a62, #4a4a52, #5a5a62);
    border-radius: 4px;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 4px 8px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .day28-switch[data-state="off"] .day28-switch-lever {
    top: 5px;
  }

  .day28-switch[data-state="on"] .day28-switch-lever {
    top: 25px;
  }

  .day28-switch-lever::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 4px;
    background: #333;
    border-radius: 2px;
  }

  /* ========================================
     LED INDICATOR
     ======================================== */
  .day28-led {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2a2a2a;
    box-shadow:
      inset 0 1px 3px rgba(0,0,0,0.5),
      0 1px 0 rgba(255,255,255,0.1);
    transition: all 0.15s ease-out;
  }

  .day28-led.on {
    background: radial-gradient(circle at 30% 30%, #ffaa44, #ff6600);
    box-shadow:
      inset 0 1px 3px rgba(0,0,0,0.2),
      0 0 15px rgba(255, 150, 50, 0.6),
      0 0 30px rgba(255, 100, 0, 0.3);
  }

  .day28-led.green.on {
    background: radial-gradient(circle at 30% 30%, #66ff66, #00cc00);
    box-shadow:
      inset 0 1px 3px rgba(0,0,0,0.2),
      0 0 15px rgba(100, 255, 100, 0.6),
      0 0 30px rgba(0, 200, 0, 0.3);
  }

  .day28-led.red.on {
    background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000);
    box-shadow:
      inset 0 1px 3px rgba(0,0,0,0.2),
      0 0 15px rgba(255, 100, 100, 0.6),
      0 0 30px rgba(200, 0, 0, 0.3);
  }

  /* ========================================
     ROTARY KNOB
     ======================================== */
  .day28-knob-container {
    width: 70px;
    height: 70px;
    position: relative;
  }

  .day28-knob {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(145deg, #55555b, #3a3a40);
    box-shadow:
      0 6px 12px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.15);
    position: relative;
    cursor: grab;
    transition: box-shadow 0.1s ease-out;
  }

  .day28-knob:active {
    cursor: grabbing;
  }

  .day28-knob::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: conic-gradient(from 180deg, #3a3a40, #55555b, #3a3a40);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  }

  .day28-knob-indicator {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 15px;
    background: linear-gradient(180deg, #ff8844, #ff6600);
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(255, 100, 0, 0.5);
  }

  .day28-knob-ticks {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .day28-knob-tick {
    position: absolute;
    width: 2px;
    height: 6px;
    background: #555;
    border-radius: 1px;
    top: -2px;
    left: 50%;
    transform-origin: center 37px;
  }

  /* ========================================
     SLIDER
     ======================================== */
  .day28-slider-container {
    width: 40px;
    height: 100px;
    background: linear-gradient(180deg, #2a2a2f, #3a3a40);
    border-radius: 6px;
    position: relative;
    box-shadow:
      inset 0 2px 8px rgba(0,0,0,0.5),
      0 2px 4px rgba(0,0,0,0.3);
  }

  .day28-slider-track {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 10px;
    bottom: 10px;
    width: 4px;
    background: #222;
    border-radius: 2px;
  }

  .day28-slider-thumb {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 20px;
    background: linear-gradient(90deg, #5a5a62, #4a4a52, #5a5a62);
    border-radius: 4px;
    cursor: grab;
    box-shadow:
      0 3px 6px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.2);
    transition: box-shadow 0.1s ease-out;
  }

  .day28-slider-thumb:active {
    cursor: grabbing;
    box-shadow:
      0 1px 3px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .day28-slider-thumb::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 2px;
    background: #333;
    border-radius: 1px;
  }

  /* ========================================
     ROCKER SWITCH
     ======================================== */
  .day28-rocker {
    width: 60px;
    height: 30px;
    background: linear-gradient(180deg, #2a2a2f, #3a3a40);
    border-radius: 4px;
    position: relative;
    box-shadow:
      inset 0 2px 6px rgba(0,0,0,0.5),
      0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    overflow: hidden;
  }

  .day28-rocker-switch {
    position: absolute;
    top: 2px;
    width: 28px;
    height: 26px;
    background: linear-gradient(145deg, #5a5a62, #4a4a52);
    border-radius: 3px;
    transition: left 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 4px rgba(0,0,0,0.3),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .day28-rocker[data-state="off"] .day28-rocker-switch {
    left: 2px;
  }

  .day28-rocker[data-state="on"] .day28-rocker-switch {
    left: 30px;
  }

  /* ========================================
     METER / VU METER
     ======================================== */
  .day28-meter {
    width: 80px;
    height: 50px;
    background: linear-gradient(180deg, #1a1a1f, #2a2a30);
    border-radius: 4px;
    position: relative;
    box-shadow:
      inset 0 2px 6px rgba(0,0,0,0.5),
      0 2px 4px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  .day28-meter-scale {
    position: absolute;
    top: 8px;
    left: 10px;
    right: 10px;
    height: 20px;
    background: linear-gradient(90deg,
      #00cc00 0%, #00cc00 60%,
      #ffcc00 60%, #ffcc00 80%,
      #ff4400 80%, #ff4400 100%
    );
    opacity: 0.3;
    border-radius: 2px;
  }

  .day28-meter-needle {
    position: absolute;
    bottom: 8px;
    left: 10px;
    width: 3px;
    height: 30px;
    background: linear-gradient(180deg, #ff6644, #aa3322);
    transform-origin: bottom center;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 1px;
    box-shadow: 0 0 8px rgba(255, 100, 50, 0.5);
  }

  /* ========================================
     SEVEN SEGMENT DISPLAY
     ======================================== */
  .day28-display {
    width: 100px;
    height: 45px;
    background: #0a0a0a;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 2px 6px rgba(0,0,0,0.8),
      0 1px 0 rgba(255,255,255,0.1);
    font-family: 'Courier New', monospace;
    font-size: 24px;
    font-weight: bold;
    color: #ff4400;
    text-shadow: 0 0 10px rgba(255, 68, 0, 0.8);
    letter-spacing: 2px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .day28-panel {
      padding: 15px;
      gap: 10px;
    }

    .day28-button {
      width: 45px;
      height: 45px;
    }

    .day28-button::before {
      width: 30px;
      height: 30px;
    }

    .day28-knob-container,
    .day28-knob {
      width: 50px;
      height: 50px;
    }

    .day28-knob::before {
      width: 35px;
      height: 35px;
    }

    .day28-label {
      font-size: 7px;
    }
  }
`;

// ============================================================================
// CONTROL CREATION HELPERS
// ============================================================================

function createPushButton(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const led = document.createElement('div');
  led.className = 'day28-led';
  led.id = `${id}-led`;

  const button = document.createElement('button');
  button.className = 'day28-button';
  button.id = id;

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  // Momentary press behavior
  button.addEventListener('mousedown', () => {
    button.classList.add('pressed');
    led.classList.add('on');
  });

  button.addEventListener('mouseup', () => {
    button.classList.remove('pressed');
    setTimeout(() => led.classList.remove('on'), 100);
  });

  button.addEventListener('mouseleave', () => {
    button.classList.remove('pressed');
    led.classList.remove('on');
  });

  // Touch support
  button.addEventListener('touchstart', (e) => {
    e.preventDefault();
    button.classList.add('pressed');
    led.classList.add('on');
  });

  button.addEventListener('touchend', () => {
    button.classList.remove('pressed');
    setTimeout(() => led.classList.remove('on'), 100);
  });

  group.appendChild(led);
  group.appendChild(button);
  group.appendChild(labelEl);

  return group;
}

function createToggleSwitch(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const switchEl = document.createElement('div');
  switchEl.className = 'day28-switch';
  switchEl.id = id;
  switchEl.setAttribute('data-state', 'off');

  const lever = document.createElement('div');
  lever.className = 'day28-switch-lever';

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  switchEl.appendChild(lever);

  switchEl.addEventListener('click', () => {
    const isOn = switchEl.getAttribute('data-state') === 'on';
    switchEl.setAttribute('data-state', isOn ? 'off' : 'on');
  });

  group.appendChild(switchEl);
  group.appendChild(labelEl);

  return group;
}

function createLedWithLabel(id: string, label: string, color: string = ''): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const led = document.createElement('div');
  led.className = `day28-led ${color}`;
  led.id = id;

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  group.appendChild(led);
  group.appendChild(labelEl);

  return group;
}

function createRotaryKnob(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const container = document.createElement('div');
  container.className = 'day28-knob-container';

  const knob = document.createElement('div');
  knob.className = 'day28-knob';
  knob.id = id;

  const indicator = document.createElement('div');
  indicator.className = 'day28-knob-indicator';

  // Add tick marks
  const ticks = document.createElement('div');
  ticks.className = 'day28-knob-ticks';
  for (let i = 0; i < 11; i++) {
    const tick = document.createElement('div');
    tick.className = 'day28-knob-tick';
    tick.style.transform = `translateX(-50%) rotate(${-135 + i * 27}deg)`;
    ticks.appendChild(tick);
  }

  knob.appendChild(indicator);
  container.appendChild(ticks);
  container.appendChild(knob);

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  // Rotation state
  let rotation = 0;
  let isDragging = false;
  let startY = 0;
  let startRotation = 0;

  knob.style.transform = `rotate(${rotation}deg)`;

  const handleStart = (clientY: number) => {
    isDragging = true;
    startY = clientY;
    startRotation = rotation;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const delta = (startY - clientY) * 1.5;
    rotation = Math.max(-135, Math.min(135, startRotation + delta));
    knob.style.transform = `rotate(${rotation}deg)`;
  };

  const handleEnd = () => {
    isDragging = false;
  };

  knob.addEventListener('mousedown', (e) => handleStart(e.clientY));
  document.addEventListener('mousemove', (e) => handleMove(e.clientY));
  document.addEventListener('mouseup', handleEnd);

  knob.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) handleMove(e.touches[0].clientY);
  });
  document.addEventListener('touchend', handleEnd);

  group.appendChild(container);
  group.appendChild(labelEl);

  return group;
}

function createSlider(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const container = document.createElement('div');
  container.className = 'day28-slider-container';
  container.id = id;

  const track = document.createElement('div');
  track.className = 'day28-slider-track';

  const thumb = document.createElement('div');
  thumb.className = 'day28-slider-thumb';

  container.appendChild(track);
  container.appendChild(thumb);

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  // Slider state
  let value = 0.5;
  let isDragging = false;

  const updateThumb = () => {
    const range = 80 - 20; // container height minus padding
    thumb.style.top = `${10 + (1 - value) * range}px`;
  };
  updateThumb();

  const handleStart = () => {
    isDragging = true;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const relY = clientY - rect.top;
    value = 1 - Math.max(0, Math.min(1, (relY - 10) / 60));
    updateThumb();
  };

  const handleEnd = () => {
    isDragging = false;
  };

  thumb.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', (e) => handleMove(e.clientY));
  document.addEventListener('mouseup', handleEnd);

  thumb.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleStart();
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) handleMove(e.touches[0].clientY);
  });
  document.addEventListener('touchend', handleEnd);

  group.appendChild(container);
  group.appendChild(labelEl);

  return group;
}

function createRockerSwitch(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const rocker = document.createElement('div');
  rocker.className = 'day28-rocker';
  rocker.id = id;
  rocker.setAttribute('data-state', 'off');

  const switchEl = document.createElement('div');
  switchEl.className = 'day28-rocker-switch';

  rocker.appendChild(switchEl);

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  rocker.addEventListener('click', () => {
    const isOn = rocker.getAttribute('data-state') === 'on';
    rocker.setAttribute('data-state', isOn ? 'off' : 'on');
  });

  group.appendChild(rocker);
  group.appendChild(labelEl);

  return group;
}

function createMeter(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const meter = document.createElement('div');
  meter.className = 'day28-meter';
  meter.id = id;

  const scale = document.createElement('div');
  scale.className = 'day28-meter-scale';

  const needle = document.createElement('div');
  needle.className = 'day28-meter-needle';

  meter.appendChild(scale);
  meter.appendChild(needle);

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  // Animate needle randomly
  let targetPos = 30;
  const animateNeedle = () => {
    targetPos = 10 + Math.random() * 50;
    needle.style.left = `${targetPos}px`;
  };
  setInterval(animateNeedle, 800 + Math.random() * 400);
  animateNeedle();

  group.appendChild(meter);
  group.appendChild(labelEl);

  return group;
}

function createDisplay(id: string, label: string): HTMLElement {
  const group = document.createElement('div');
  group.className = 'day28-control-group';

  const display = document.createElement('div');
  display.className = 'day28-display';
  display.id = id;
  display.textContent = '0000';

  const labelEl = document.createElement('div');
  labelEl.className = 'day28-label';
  labelEl.textContent = label;

  // Animate display
  let value = 0;
  setInterval(() => {
    value = (value + Math.floor(Math.random() * 10)) % 10000;
    display.textContent = value.toString().padStart(4, '0');
  }, 150);

  group.appendChild(display);
  group.appendChild(labelEl);

  return group;
}

// ============================================================================
// HTML MODE SETUP
// ============================================================================

function htmlSetup(container: HTMLElement, _controls: ControlState): PanelContext {
  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.id = 'day28-styles';
  styleEl.textContent = PANEL_STYLES;
  document.head.appendChild(styleEl);

  // Create main panel
  const panel = document.createElement('div');
  panel.className = 'day28-panel';

  // Create control elements
  const controlElements = new Map<string, HTMLElement>();

  // Row 1: Buttons and LEDs
  const btn1 = createPushButton('btn-arm', 'ARM');
  const btn2 = createPushButton('btn-fire', 'FIRE');
  const led1 = createLedWithLabel('led-status', 'STATUS', 'green');
  const led2 = createLedWithLabel('led-warn', 'WARN', 'red');

  // Row 2: Toggle switches and rocker
  const sw1 = createToggleSwitch('sw-power', 'POWER');
  const sw2 = createToggleSwitch('sw-aux', 'AUX');
  const rocker1 = createRockerSwitch('rock-mode', 'MODE');
  const rocker2 = createRockerSwitch('rock-ch', 'CH');

  // Row 3: Knobs
  const knob1 = createRotaryKnob('knob-freq', 'FREQ');
  const knob2 = createRotaryKnob('knob-gain', 'GAIN');
  const knob3 = createRotaryKnob('knob-pan', 'PAN');
  const knob4 = createRotaryKnob('knob-mix', 'MIX');

  // Row 4: Sliders, meter, display
  const slider1 = createSlider('slider-vol', 'VOL');
  const slider2 = createSlider('slider-tone', 'TONE');
  const meter = createMeter('meter-vu', 'VU');
  const display = createDisplay('display-main', 'COUNTER');

  // Add all controls to panel in order
  panel.appendChild(btn1);
  panel.appendChild(btn2);
  panel.appendChild(led1);
  panel.appendChild(led2);

  panel.appendChild(sw1);
  panel.appendChild(sw2);
  panel.appendChild(rocker1);
  panel.appendChild(rocker2);

  panel.appendChild(knob1);
  panel.appendChild(knob2);
  panel.appendChild(knob3);
  panel.appendChild(knob4);

  panel.appendChild(slider1);
  panel.appendChild(slider2);
  panel.appendChild(meter);
  panel.appendChild(display);

  container.appendChild(panel);

  // Store references
  controlElements.set('btn-arm', btn1);
  controlElements.set('btn-fire', btn2);
  controlElements.set('led-status', led1);
  controlElements.set('led-warn', led2);
  controlElements.set('sw-power', sw1);
  controlElements.set('sw-aux', sw2);

  // Set up random LED blinking
  const statusLed = led1.querySelector('.day28-led') as HTMLElement;
  const warnLed = led2.querySelector('.day28-led') as HTMLElement;

  // Status LED blinks periodically
  setInterval(() => {
    statusLed.classList.toggle('on');
  }, 1500);

  // Warn LED blinks when power is on
  setInterval(() => {
    const powerSwitch = panel.querySelector('#sw-power');
    if (powerSwitch?.getAttribute('data-state') === 'on') {
      warnLed.classList.add('on');
      setTimeout(() => warnLed.classList.remove('on'), 200);
    }
  }, 3000);

  return {
    container,
    panel,
    controls: controlElements,
    animationId: null,
  };
}

function htmlUpdate(_ctx: HtmlContext, _controls: ControlState): void {
  // Controls don't affect the panel directly
  // The panel is purely interactive
}

function htmlCleanup(ctx: HtmlContext): void {
  const panelCtx = ctx as PanelContext;
  // Remove styles
  const styleEl = document.getElementById('day28-styles');
  if (styleEl) {
    styleEl.remove();
  }

  // Clear animation
  if (panelCtx.animationId) {
    cancelAnimationFrame(panelCtx.animationId);
  }
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  // No real controls needed - the piece is self-contained
  // But we provide a placeholder for the harness
  brightness: 1,
};

const controlConfigs: Record<string, ControlConfig> = {
  brightness: {
    label: 'LED Brightness',
    min: 0.5,
    max: 1.5,
    defaultValue: 1,
    step: 0.1,
    format: (v: number) => `${Math.round(v * 100)}%`,
  },
};

// ============================================================================
// MUSEUM METADATA
// ============================================================================

export const museumMetadata = {
  displayType: 'interactive' as const,
  viewingDistance: 0.8,
  dimensions: { width: 0.8, height: 0.6, depth: 0.15 },
  animated: true,
  suggestedZone: 'Main Gallery',
  canBecomeArchitecture: true,
  placard: `A control panel for nothing. Every switch flips. Every button clicks. Every knob turns. Nothing is connected to anything. The satisfaction isn't in doing—it's in the response. The pleasure of feedback without function. After the obsolete interfaces of NASA mission control and analog synthesizers. Made entirely of HTML elements. No canvas, no libraries, only divs.`,
};

// ============================================================================
// CONFIG
// ============================================================================

const config: DayConfig = {
  day: 28,
  prompt: 'No libraries, no canvas, only HTML elements.',
  creditName: 'Piero',
  creditUrl: 'https://pifragile.com/',
  mode: 'html',
  htmlSetup,
  htmlUpdate,
  htmlCleanup,
  recording: {
    enabled: false, // HTML mode doesn't support GIF recording
    duration: 10,
    filename: 'genuary-2026-day-28',
  },
};

// Claude's Choice
export function getClaudesChoice(): Partial<ControlState> {
  return {
    brightness: 1,
  };
}

export { controlConfigs, defaultControls };
export default config;
