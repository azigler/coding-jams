/**
 * Day 15: "THERE"
 *
 * An invisible creature in a warm room, known only through:
 * - Its shadow on the wall (waving, hopping, peeking)
 * - Cookies vanishing from a plate
 * - Footprints appearing on the floor
 * - Dust motes swirling in the sunlight
 *
 * "How would Dr. Seuss solve this?"
 *
 * Warmth over wonder. Delight over awe.
 */

import type { DayConfig, p5 } from '../types';
import type { ControlConfig, ControlState } from '../utils/controls';

// ============================================================================
// TYPES
// ============================================================================

interface Shadow {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  headSize: number;
  bodyHeight: number;
  armAngle: number;
  armTarget: number;
  legOffset: number;
  state: 'idle' | 'waving' | 'hopping' | 'peeking' | 'curious';
  stateTime: number;
  hopY: number;
  squash: number;
  lookAngle: number;
}

interface Cookie {
  x: number;
  y: number;
  size: number;
  visible: boolean;
  fadeAlpha: number;
  biteAngle: number;
}

interface Footprint {
  x: number;
  y: number;
  alpha: number;
  rotation: number;
  isLeft: boolean;
}

interface DustMote {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  wobble: number;
}

interface ThereState {
  shadow: Shadow;
  cookies: Cookie[];
  footprints: Footprint[];
  dustMotes: DustMote[];
  nextCookieTime: number;
  nextFootprintTime: number;
  time: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  wallTop: [35, 25, 95],      // Warm cream
  wallBottom: [30, 30, 88],   // Slightly darker cream
  floor: [25, 40, 70],        // Warm wood
  floorDark: [25, 45, 55],    // Wood grain
  shadow: [250, 15, 25],      // Soft blue-gray shadow
  sunlight: [45, 60, 100],    // Golden sunlight
  cookie: [30, 70, 65],       // Cookie brown
  cookieChip: [25, 80, 30],   // Chocolate chips
  plate: [40, 5, 98],         // White plate
  dust: [45, 30, 100],        // Golden dust
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
}

function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    t -= 1.5 / 2.75;
    return 7.5625 * t * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    t -= 2.25 / 2.75;
    return 7.5625 * t * t + 0.9375;
  } else {
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  }
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ============================================================================
// SHADOW BEHAVIOR
// ============================================================================

function initShadow(canvasWidth: number, canvasHeight: number): Shadow {
  return {
    x: canvasWidth * 0.65,
    y: canvasHeight * 0.35,
    baseX: canvasWidth * 0.65,
    baseY: canvasHeight * 0.35,
    headSize: 45,
    bodyHeight: 120,
    armAngle: 0,
    armTarget: 0,
    legOffset: 0,
    state: 'idle',
    stateTime: 0,
    hopY: 0,
    squash: 1,
    lookAngle: 0,
  };
}

function updateShadow(
  shadow: Shadow,
  deltaTime: number,
  mouseX: number,
  mouseY: number,
  canvasWidth: number,
  canvasHeight: number,
  controls: ControlState
): void {
  const playfulness = controls.playfulness ?? 0.7;
  const shyness = controls.shyness ?? 0.5;

  shadow.stateTime += deltaTime;

  // Check mouse proximity for curiosity/shyness
  const distToMouse = Math.sqrt(
    Math.pow(mouseX - shadow.x, 2) + Math.pow(mouseY - shadow.y, 2)
  );
  const mouseNear = distToMouse < 200;

  // State machine
  if (shadow.state === 'idle') {
    // Random state transitions
    if (shadow.stateTime > 2 + Math.random() * 3) {
      const rand = Math.random();
      if (mouseNear && rand < shyness) {
        shadow.state = 'peeking';
      } else if (rand < 0.3 * playfulness) {
        shadow.state = 'waving';
      } else if (rand < 0.5 * playfulness) {
        shadow.state = 'hopping';
      } else if (mouseNear && rand < 0.7) {
        shadow.state = 'curious';
      }
      shadow.stateTime = 0;
    }

    // Gentle idle sway
    shadow.x = lerp(shadow.x, shadow.baseX + Math.sin(shadow.stateTime * 0.5) * 10, 0.05);
    shadow.armAngle = lerp(shadow.armAngle, Math.sin(shadow.stateTime * 0.8) * 0.1, 0.05);
    shadow.legOffset = Math.sin(shadow.stateTime * 0.6) * 3;

  } else if (shadow.state === 'waving') {
    // Wave arm enthusiastically
    const waveProgress = shadow.stateTime / 2.5;
    if (waveProgress < 1) {
      shadow.armTarget = Math.sin(shadow.stateTime * 8) * 0.8 + 0.5;
      shadow.armAngle = lerp(shadow.armAngle, shadow.armTarget, 0.3);
    } else {
      shadow.state = 'idle';
      shadow.stateTime = 0;
    }

  } else if (shadow.state === 'hopping') {
    const hopDuration = 0.6;
    const hopProgress = (shadow.stateTime % hopDuration) / hopDuration;

    // Squash before jump, stretch during, squash on land
    if (hopProgress < 0.2) {
      shadow.squash = lerp(shadow.squash, 0.7, 0.2);
      shadow.hopY = 0;
    } else if (hopProgress < 0.7) {
      const airProgress = (hopProgress - 0.2) / 0.5;
      shadow.squash = lerp(shadow.squash, 1.2, 0.3);
      shadow.hopY = -Math.sin(airProgress * Math.PI) * 40;
    } else {
      shadow.squash = lerp(shadow.squash, 0.8, 0.3);
      shadow.hopY = lerp(shadow.hopY, 0, 0.5);
    }

    // Do 2-3 hops
    if (shadow.stateTime > hopDuration * 3) {
      shadow.state = 'idle';
      shadow.stateTime = 0;
      shadow.squash = 1;
      shadow.hopY = 0;
    }

  } else if (shadow.state === 'peeking') {
    // Shy away toward edge
    const peekProgress = shadow.stateTime / 2;
    if (peekProgress < 1) {
      const targetX = canvasWidth * 0.85;
      shadow.x = lerp(shadow.x, targetX, 0.08);
      shadow.lookAngle = lerp(shadow.lookAngle, -0.3, 0.1);
    } else {
      // Slowly come back
      shadow.x = lerp(shadow.x, shadow.baseX, 0.03);
      shadow.lookAngle = lerp(shadow.lookAngle, 0, 0.05);
      if (shadow.stateTime > 4) {
        shadow.state = 'idle';
        shadow.stateTime = 0;
      }
    }

  } else if (shadow.state === 'curious') {
    // Lean toward mouse
    const dx = mouseX - shadow.x;
    shadow.lookAngle = lerp(shadow.lookAngle, Math.sign(dx) * 0.2, 0.05);
    shadow.x = lerp(shadow.x, shadow.baseX + dx * 0.15, 0.03);

    if (shadow.stateTime > 3 || !mouseNear) {
      shadow.state = 'idle';
      shadow.stateTime = 0;
    }
  }

  // Always return squash toward 1
  if (shadow.state !== 'hopping') {
    shadow.squash = lerp(shadow.squash, 1, 0.1);
  }
}

function drawShadow(p: p5, shadow: Shadow): void {
  p.push();
  p.translate(shadow.x, shadow.y + shadow.hopY);
  p.rotate(shadow.lookAngle);
  p.scale(1, shadow.squash);

  p.noStroke();
  p.fill(COLORS.shadow[0], COLORS.shadow[1], COLORS.shadow[2], 0.6);

  // Head (slightly squished oval)
  const headW = shadow.headSize * 1.1;
  const headH = shadow.headSize * 0.95;
  p.ellipse(0, 0, headW, headH);

  // Little ear bumps (Seussian!)
  p.ellipse(-headW * 0.35, -headH * 0.3, 15, 20);
  p.ellipse(headW * 0.35, -headH * 0.3, 15, 20);

  // Body (rounded blob)
  p.beginShape();
  const bodyW = 35;
  const bodyH = shadow.bodyHeight;
  for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const r = a < Math.PI ? bodyW : bodyW * 0.8;
    const stretch = a > Math.PI * 0.3 && a < Math.PI * 0.7 ? 1.1 : 1;
    const x = Math.sin(a) * r * stretch;
    const y = Math.cos(a) * bodyH * 0.5 + bodyH * 0.5 + headH * 0.3;
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);

  // Arms
  p.push();
  p.translate(-bodyW * 0.8, bodyH * 0.3);
  p.rotate(-0.3 + shadow.armAngle * 0.5);
  p.ellipse(0, 20, 12, 40);
  p.pop();

  p.push();
  p.translate(bodyW * 0.8, bodyH * 0.3);
  p.rotate(0.3 + shadow.armAngle);
  p.ellipse(0, 20, 12, 40);
  // Little hand wave
  if (shadow.state === 'waving') {
    p.ellipse(5, 38, 18, 14);
  }
  p.pop();

  // Legs (stubby)
  p.ellipse(-15 + shadow.legOffset, bodyH + headH * 0.3, 20, 30);
  p.ellipse(15 - shadow.legOffset, bodyH + headH * 0.3, 20, 30);

  p.pop();
}

// ============================================================================
// COOKIES
// ============================================================================

function initCookies(canvasWidth: number, canvasHeight: number): Cookie[] {
  const plateX = canvasWidth * 0.25;
  const plateY = canvasHeight * 0.75;

  return [
    { x: plateX - 20, y: plateY - 8, size: 28, visible: true, fadeAlpha: 1, biteAngle: Math.random() * Math.PI * 2 },
    { x: plateX + 15, y: plateY - 5, size: 25, visible: true, fadeAlpha: 1, biteAngle: Math.random() * Math.PI * 2 },
    { x: plateX - 5, y: plateY + 10, size: 26, visible: true, fadeAlpha: 1, biteAngle: Math.random() * Math.PI * 2 },
  ];
}

function drawCookies(p: p5, cookies: Cookie[], plateX: number, plateY: number): void {
  // Draw plate
  p.noStroke();
  p.fill(COLORS.plate[0], COLORS.plate[1], COLORS.plate[2]);
  p.ellipse(plateX, plateY, 100, 30);
  p.fill(COLORS.plate[0], COLORS.plate[1], COLORS.plate[2] - 5);
  p.ellipse(plateX, plateY + 3, 90, 25);

  // Draw cookies
  for (const cookie of cookies) {
    if (cookie.fadeAlpha <= 0) continue;

    p.push();
    p.translate(cookie.x, cookie.y);

    // Cookie body
    p.fill(COLORS.cookie[0], COLORS.cookie[1], COLORS.cookie[2], cookie.fadeAlpha);

    if (cookie.visible) {
      p.ellipse(0, 0, cookie.size, cookie.size * 0.9);
    } else {
      // Cookie with bite taken out
      p.beginShape();
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        let r = cookie.size * 0.5;
        // Bite notch
        const biteSize = 0.8;
        const biteDist = Math.abs(a - cookie.biteAngle);
        if (biteDist < biteSize || biteDist > Math.PI * 2 - biteSize) {
          r *= 0.5;
        }
        p.vertex(Math.cos(a) * r, Math.sin(a) * r * 0.9);
      }
      p.endShape(p.CLOSE);
    }

    // Chocolate chips
    p.fill(COLORS.cookieChip[0], COLORS.cookieChip[1], COLORS.cookieChip[2], cookie.fadeAlpha);
    const chipSeed = cookie.x * 100;
    for (let i = 0; i < 5; i++) {
      const chipAngle = (chipSeed + i * 1.3) % (Math.PI * 2);
      const chipDist = ((chipSeed * i) % 8) + 3;
      const chipX = Math.cos(chipAngle) * chipDist;
      const chipY = Math.sin(chipAngle) * chipDist * 0.9;
      p.ellipse(chipX, chipY, 5, 4);
    }

    p.pop();
  }
}

// ============================================================================
// FOOTPRINTS
// ============================================================================

function addFootprint(footprints: Footprint[], x: number, y: number, isLeft: boolean, angle: number): void {
  footprints.push({
    x,
    y,
    alpha: 0.5,
    rotation: angle,
    isLeft,
  });

  // Keep only recent footprints
  if (footprints.length > 8) {
    footprints.shift();
  }
}

function updateFootprints(footprints: Footprint[], deltaTime: number): void {
  for (const fp of footprints) {
    fp.alpha -= deltaTime * 0.15;
  }
}

function drawFootprints(p: p5, footprints: Footprint[]): void {
  for (const fp of footprints) {
    if (fp.alpha <= 0) continue;

    p.push();
    p.translate(fp.x, fp.y);
    p.rotate(fp.rotation);
    if (!fp.isLeft) p.scale(-1, 1);

    p.noStroke();
    p.fill(COLORS.floorDark[0], COLORS.floorDark[1], COLORS.floorDark[2] - 15, fp.alpha * 0.4);

    // Cute oval foot shape
    p.ellipse(0, 0, 25, 35);
    // Toes
    p.ellipse(-8, -15, 8, 10);
    p.ellipse(0, -18, 8, 10);
    p.ellipse(8, -15, 8, 10);

    p.pop();
  }
}

// ============================================================================
// DUST MOTES
// ============================================================================

function initDustMotes(count: number, canvasWidth: number, canvasHeight: number): DustMote[] {
  const motes: DustMote[] = [];
  // Dust in the sunlight beam area
  const beamX = canvasWidth * 0.4;
  const beamWidth = canvasWidth * 0.3;

  for (let i = 0; i < count; i++) {
    motes.push({
      x: beamX + Math.random() * beamWidth,
      y: Math.random() * canvasHeight * 0.8,
      size: 2 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      wobble: Math.random() * Math.PI * 2,
    });
  }
  return motes;
}

function updateDustMotes(motes: DustMote[], deltaTime: number, time: number): void {
  for (const mote of motes) {
    mote.wobble += deltaTime * 2;
    mote.x += mote.vx + Math.sin(mote.wobble) * 0.3;
    mote.y += mote.vy + Math.cos(mote.wobble * 0.7) * 0.2;

    // Gentle drift
    mote.vx += (Math.random() - 0.5) * 0.02;
    mote.vy += (Math.random() - 0.5) * 0.02;
    mote.vx *= 0.99;
    mote.vy *= 0.99;
  }
}

function drawDustMotes(p: p5, motes: DustMote[]): void {
  p.noStroke();
  for (const mote of motes) {
    p.fill(COLORS.dust[0], COLORS.dust[1], COLORS.dust[2], mote.alpha);
    p.ellipse(mote.x, mote.y, mote.size, mote.size);
  }
}

// Swirl dust when invisible creature passes
function swirlDust(motes: DustMote[], x: number, y: number, radius: number): void {
  for (const mote of motes) {
    const dx = mote.x - x;
    const dy = mote.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius && dist > 0) {
      const force = (radius - dist) / radius;
      const angle = Math.atan2(dy, dx) + Math.PI * 0.5; // Swirl perpendicular
      mote.vx += Math.cos(angle) * force * 2;
      mote.vy += Math.sin(angle) * force * 2;
    }
  }
}

// ============================================================================
// SCENE DRAWING
// ============================================================================

function drawRoom(p: p5, canvasWidth: number, canvasHeight: number): void {
  // Wall gradient
  const wallHeight = canvasHeight * 0.6;
  for (let y = 0; y < wallHeight; y++) {
    const t = y / wallHeight;
    const h = lerp(COLORS.wallTop[0], COLORS.wallBottom[0], t);
    const s = lerp(COLORS.wallTop[1], COLORS.wallBottom[1], t);
    const b = lerp(COLORS.wallTop[2], COLORS.wallBottom[2], t);
    p.stroke(h, s, b);
    p.line(0, y, canvasWidth, y);
  }

  // Floor
  p.noStroke();
  p.fill(COLORS.floor[0], COLORS.floor[1], COLORS.floor[2]);
  p.rect(0, wallHeight, canvasWidth, canvasHeight - wallHeight);

  // Floor boards suggestion
  p.stroke(COLORS.floorDark[0], COLORS.floorDark[1], COLORS.floorDark[2], 0.3);
  p.strokeWeight(1);
  for (let x = 0; x < canvasWidth; x += 80) {
    p.line(x, wallHeight, x - 40, canvasHeight);
  }

  // Sunlight beam
  p.noStroke();
  p.fill(COLORS.sunlight[0], COLORS.sunlight[1], COLORS.sunlight[2], 0.08);
  p.beginShape();
  p.vertex(canvasWidth * 0.3, 0);
  p.vertex(canvasWidth * 0.6, 0);
  p.vertex(canvasWidth * 0.7, canvasHeight);
  p.vertex(canvasWidth * 0.2, canvasHeight);
  p.endShape(p.CLOSE);

  // Window suggestion (top)
  p.fill(COLORS.sunlight[0], COLORS.sunlight[1], 100, 0.15);
  p.rect(canvasWidth * 0.35, 0, canvasWidth * 0.2, 20);
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function initState(canvasWidth: number, canvasHeight: number): ThereState {
  return {
    shadow: initShadow(canvasWidth, canvasHeight),
    cookies: initCookies(canvasWidth, canvasHeight),
    footprints: [],
    dustMotes: initDustMotes(40, canvasWidth, canvasHeight),
    nextCookieTime: 5 + Math.random() * 5,
    nextFootprintTime: 2,
    time: 0,
  };
}

// ============================================================================
// CONTROLS
// ============================================================================

const defaultControls: ControlState = {
  playfulness: 0.7,
  shyness: 0.5,
  dustDensity: 1.0,
  cookieSpeed: 1.0,
};

const controlConfigs: { [key: string]: ControlConfig } = {
  playfulness: {
    label: 'Playfulness',
    min: 0.2,
    max: 1.0,
    defaultValue: 0.7,
    step: 0.1,
  },
  shyness: {
    label: 'Shyness',
    min: 0.0,
    max: 1.0,
    defaultValue: 0.5,
    step: 0.1,
  },
  dustDensity: {
    label: 'Dust Density',
    min: 0.3,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  cookieSpeed: {
    label: 'Cookie Appetite',
    min: 0.3,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
};

// ============================================================================
// MAIN CONFIG
// ============================================================================

const config: DayConfig = {
  day: 15,
  prompt: 'Create an invisible object where only the shadows can be seen.',
  creditName: 'P1xelboy',
  creditUrl: 'https://linktr.ee/p1x3lboy',
  recording: {
    enabled: true,
    duration: 15,
    filename: 'genuary-2026-day-15',
  },

  setup: (p: p5) => {
    p.createCanvas(800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 1);

    const state = initState(800, 800);
    (p as any)._thereState = state;
    (p as any)._lastTime = p.millis();

    p.loop();
  },

  draw: (p: p5) => {
    const controls: ControlState = (p as any)._controls || { ...defaultControls };

    // Calculate delta time
    const currentTime = p.millis();
    const deltaTime = (currentTime - ((p as any)._lastTime || currentTime)) / 1000;
    (p as any)._lastTime = currentTime;

    const state: ThereState = (p as any)._thereState;
    state.time += deltaTime;

    // Update shadow
    updateShadow(
      state.shadow,
      deltaTime,
      p.mouseX,
      p.mouseY,
      p.width,
      p.height,
      controls
    );

    // Cookie eating
    const cookieSpeed = controls.cookieSpeed ?? 1.0;
    if (state.time > state.nextCookieTime) {
      const visibleCookies = state.cookies.filter(c => c.visible);
      if (visibleCookies.length > 0) {
        const cookie = visibleCookies[Math.floor(Math.random() * visibleCookies.length)];
        cookie.visible = false;

        // Swirl dust near cookie
        swirlDust(state.dustMotes, cookie.x, cookie.y, 100);
      }
      state.nextCookieTime = state.time + (4 + Math.random() * 6) / cookieSpeed;
    }

    // Fade out eaten cookies
    for (const cookie of state.cookies) {
      if (!cookie.visible && cookie.fadeAlpha > 0) {
        cookie.fadeAlpha -= deltaTime * 0.5;
      }
    }

    // Reset cookies when all eaten
    if (state.cookies.every(c => c.fadeAlpha <= 0)) {
      state.cookies = initCookies(p.width, p.height);
    }

    // Footprints
    if (state.time > state.nextFootprintTime) {
      const fpX = p.width * 0.3 + Math.random() * p.width * 0.4;
      const fpY = p.height * 0.65 + Math.random() * p.height * 0.25;
      const isLeft = state.footprints.length % 2 === 0;
      addFootprint(state.footprints, fpX, fpY, isLeft, (Math.random() - 0.5) * 0.5);

      // Swirl dust near footprint
      swirlDust(state.dustMotes, fpX, fpY, 60);

      state.nextFootprintTime = state.time + 1.5 + Math.random() * 2;
    }
    updateFootprints(state.footprints, deltaTime);

    // Dust motes
    updateDustMotes(state.dustMotes, deltaTime, state.time);

    // Occasionally swirl dust near shadow (creature moving)
    if (Math.random() < 0.02) {
      const swirlX = state.shadow.x + (Math.random() - 0.5) * 100;
      const swirlY = state.shadow.y + state.shadow.bodyHeight * 0.5;
      swirlDust(state.dustMotes, swirlX, p.height * 0.5, 80);
    }

    // ========== DRAWING ==========

    // Background room
    drawRoom(p, p.width, p.height);

    // Footprints (on floor)
    drawFootprints(p, state.footprints);

    // Shadow (on wall)
    drawShadow(p, state.shadow);

    // Cookies
    drawCookies(p, state.cookies, p.width * 0.25, p.height * 0.75);

    // Dust motes (in front of everything)
    drawDustMotes(p, state.dustMotes);
  },

  renderFinal: (p: p5) => {
    const state = initState(p.width, p.height);

    // Set shadow to waving pose
    state.shadow.armAngle = 0.7;
    state.shadow.state = 'waving';

    drawRoom(p, p.width, p.height);
    drawShadow(p, state.shadow);
    drawCookies(p, state.cookies, p.width * 0.25, p.height * 0.75);
    drawDustMotes(p, state.dustMotes);
  },
};

// Claude's Choice — friendly and curious settings
export function getClaudesChoice(): Partial<ControlState> {
  return {
    playfulness: 0.8,
    shyness: 0.4,
    dustDensity: 1.2,
    cookieSpeed: 0.8,
  };
}

export { controlConfigs, defaultControls };
export default config;
