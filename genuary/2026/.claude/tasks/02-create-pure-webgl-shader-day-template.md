# Task 2: Create Pure WebGL/Shader Day Template

**Priority:** Medium
**Complexity:** High
**Files to Create:** `src/harness/gl.ts`, `src/days/template-shader/`, shader utilities

---

## Problem Statement

The current harness only supports p5.js-based days. While p5.js is excellent for prototyping, it's:

1. **Slow for pixel-intensive work** — `loadPixels()`/`updatePixels()` is CPU-bound
2. **Abstracting too much** — Hides the actual graphics pipeline
3. **Large bundle** — 500KB+ for the p5.js library
4. **Not idiomatic for Genuary** — Day 31 is literally "GLSL day"

A pure WebGL/GLSL approach would be faster, more educational, and more aligned with the creative coding ethos.

---

## Requirements

### Functional
- New day mode: `'glsl'` alongside existing `'p5'`
- Days can be defined with just a fragment shader
- Automatic uniform binding for common values (time, resolution, mouse)
- Controls automatically bound to shader uniforms
- Hot-reloading of shaders during development (nice-to-have)

### Non-Functional
- Zero additional dependencies (raw WebGL)
- TypeScript types for shader programs
- Graceful fallback if WebGL unavailable
- Same control system works for both p5 and shader days

---

## Technical Specification

### 1. Day Config Extension

Extend the DayConfig interface to support shader mode:

```typescript
// src/types.ts

interface DayConfig {
  day: number;
  prompt: string;
  creditName: string;
  creditUrl: string;

  // Existing p5 mode
  mode?: 'p5' | 'glsl';  // Default: 'p5'
  setup?: (p: p5) => void;
  draw?: (p: p5) => void;

  // New GLSL mode
  fragmentShader?: string;
  vertexShader?: string;  // Optional, use default fullscreen quad
  uniforms?: UniformConfig[];
}

interface UniformConfig {
  name: string;
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'bool';
  controlKey?: string;  // Links to control slider
  defaultValue?: number | number[];
}
```

### 2. WebGL Context Manager

```typescript
// src/harness/gl.ts

export interface GLContext {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation>;
  destroy: () => void;
}

export function createGLContext(
  container: HTMLElement,
  width: number,
  height: number
): GLContext | null {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('WebGL2 not supported');
    return null;
  }

  // ... setup
  return { canvas, gl, program, uniforms, destroy };
}

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
```

### 3. Default Vertex Shader

For most Genuary days, we just need a fullscreen quad:

```glsl
// src/shaders/fullscreen.vert

#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

### 4. Common Shader Utilities

```glsl
// src/shaders/common.glsl

// Noise functions
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < octaves; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// SDF primitives
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Color utilities
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
```

### 5. Shader Day Template

```typescript
// src/days/template-shader/config.ts

import type { DayConfig } from '../../types';
import fragmentShader from './shader.frag?raw';

const controlConfigs = {
  complexity: {
    label: 'Complexity',
    min: 0.1,
    max: 2.0,
    defaultValue: 1.0,
    step: 0.1,
  },
  speed: {
    label: 'Speed',
    min: 0.0,
    max: 2.0,
    defaultValue: 0.5,
    step: 0.1,
  },
};

const defaultControls = {
  complexity: 1.0,
  speed: 0.5,
};

const config: DayConfig = {
  day: 99,  // Template
  prompt: 'Shader template',
  creditName: 'You',
  creditUrl: '#',

  mode: 'glsl',
  fragmentShader,

  uniforms: [
    { name: 'u_complexity', type: 'float', controlKey: 'complexity' },
    { name: 'u_speed', type: 'float', controlKey: 'speed' },
  ],
};

export { controlConfigs, defaultControls };
export default config;
```

```glsl
// src/days/template-shader/shader.frag

#version 300 es
precision highp float;

// Auto-bound uniforms
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Control-bound uniforms
uniform float u_complexity;
uniform float u_speed;

in vec2 v_uv;
out vec4 fragColor;

#include "../shaders/common.glsl"

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * u_speed;

  // Your shader code here
  float n = fbm(p * u_complexity + t, 4);
  vec3 color = hsv2rgb(vec3(n + t * 0.1, 0.8, 0.9));

  fragColor = vec4(color, 1.0);
}
```

### 6. Render Loop for Shader Days

```typescript
// src/harness/shader-renderer.ts

export function createShaderRenderer(
  config: DayConfig,
  container: HTMLElement,
  controls: ControlState
): { update: () => void; destroy: () => void } {
  const ctx = createGLContext(container, 800, 800);
  if (!ctx) throw new Error('WebGL not available');

  const { gl, program, canvas } = ctx;

  // Setup fullscreen quad
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Get uniform locations
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  const controlUniforms = new Map<string, WebGLUniformLocation>();
  for (const u of config.uniforms || []) {
    const loc = gl.getUniformLocation(program, u.name);
    if (loc) controlUniforms.set(u.controlKey || u.name, loc);
  }

  let startTime = performance.now();
  let mouseX = 0, mouseY = 0;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = 1 - (e.clientY - rect.top) / rect.height;
  });

  function update() {
    const time = (performance.now() - startTime) / 1000;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);

    // Auto uniforms
    gl.uniform1f(uTime, time);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);

    // Control uniforms
    for (const [key, loc] of controlUniforms) {
      if (controls[key] !== undefined) {
        gl.uniform1f(loc, controls[key]);
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  return {
    update,
    destroy: () => ctx.destroy(),
  };
}
```

---

## Integration with Main Harness

In `src/index.ts`, add mode detection:

```typescript
async function loadDay(dayNum: number) {
  // ... cleanup

  const dayModule = await import(`./days/${dayNum.toString().padStart(2, '0')}.ts`);
  const config = dayModule.default;

  if (config.mode === 'glsl') {
    // Use shader renderer
    const renderer = createShaderRenderer(config, canvasContainer, controls);

    function animate() {
      renderer.update();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Store for cleanup
    currentRenderer = renderer;
  } else {
    // Use p5.js renderer (existing code)
    currentSketch = new p5(/* ... */);
  }
}
```

---

## Example: Day 7 as a Shader

For comparison, here's how Day 7 "De Morgan's Mirror" could look as a pure shader:

```glsl
#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_complexity;
uniform float u_phase_offset;
uniform float u_threshold;
uniform float u_operation;  // 0=AND, 1=OR, 2=XOR, 3=NOT_A, 4=NOT_B, 5=DE_MORGAN

in vec2 v_uv;
out vec4 fragColor;

float fieldA(vec2 p, float t) {
  // Fractal noise + circular wave
  float n = fbm(p * 3.0 * u_complexity, 4);
  float d = length(p - vec2(0.3, 0.4));
  float wave = sin(d * 8.0 + t * 0.5) * 0.15;
  return n + wave;
}

float fieldB(vec2 p, float t) {
  vec2 offset = vec2(cos(u_phase_offset), sin(u_phase_offset)) * 0.5;
  float n = fbm((p + offset) * 3.0 * u_complexity + 100.0, 4);
  float d = length(p - vec2(0.7, 0.6));
  float wave = sin(d * 6.0 - t * 0.4 + u_phase_offset) * 0.15;
  return n + wave;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.5;

  float a = fieldA(uv, t);
  float b = fieldB(uv, t);

  bool boolA = a > u_threshold;
  bool boolB = b > u_threshold;

  bool result;
  int op = int(u_operation);

  if (op == 0) result = boolA && boolB;           // AND
  else if (op == 1) result = boolA || boolB;      // OR
  else if (op == 2) result = boolA != boolB;      // XOR
  else if (op == 3) result = !boolA;              // NOT A
  else if (op == 4) result = !boolB;              // NOT B
  else {
    // De Morgan split screen
    bool left = uv.x < 0.5;
    if (left) result = !(boolA && boolB);         // NOT(A AND B)
    else result = (!boolA) || (!boolB);           // (NOT A) OR (NOT B)
  }

  vec3 color = result
    ? hsv2rgb(vec3(0.1, 0.75, 0.85))  // Amber
    : vec3(0.05, 0.05, 0.08);          // Dark

  fragColor = vec4(color, 1.0);
}
```

This would run at 60fps with zero CPU overhead.

---

## Files to Create

| File | Description |
|------|-------------|
| `src/types.ts` | Extend DayConfig for GLSL mode |
| `src/harness/gl.ts` | WebGL context management |
| `src/harness/shader-renderer.ts` | Shader day render loop |
| `src/shaders/fullscreen.vert` | Default vertex shader |
| `src/shaders/common.glsl` | Shared GLSL utilities |
| `src/days/template-shader/` | Example shader day |

---

## Testing Checklist

- [ ] Shader day loads and renders
- [ ] Time uniform advances correctly
- [ ] Mouse uniform tracks cursor
- [ ] Control sliders bind to uniforms
- [ ] Shader compilation errors shown clearly
- [ ] Fallback message if WebGL unavailable
- [ ] Recording works with shader days
- [ ] Hot reload works in dev mode (stretch)
