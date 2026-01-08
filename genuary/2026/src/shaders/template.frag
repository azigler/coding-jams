#version 300 es
precision highp float;

// Auto-bound uniforms (set by shader renderer)
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Control-bound uniforms (linked to sliders)
uniform float u_complexity;
uniform float u_speed;
uniform float u_colorShift;

// UV coordinates from vertex shader
in vec2 v_uv;
out vec4 fragColor;

// ============================================
// UTILITY FUNCTIONS (from common.glsl)
// ============================================

#define PI 3.14159265359
#define TAU 6.28318530718

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
  float frequency = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// ============================================
// MAIN SHADER
// ============================================

void main() {
  // Normalize coordinates with aspect ratio correction
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  // Animate time with speed control
  float t = u_time * u_speed;

  // Generate fractal noise pattern
  float n = fbm(p * u_complexity + t * 0.3, 4);

  // Add some radial variation
  float d = length(p);
  n += sin(d * 5.0 - t) * 0.2;

  // Mouse interaction - creates a bright spot
  vec2 mousePos = (u_mouse - 0.5) * 2.0;
  mousePos.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(p - mousePos);
  float mouseGlow = smoothstep(0.5, 0.0, mouseDist) * 0.3;
  n += mouseGlow;

  // Color mapping with hue shift control
  float hue = fract(n * 0.5 + t * 0.05 + u_colorShift);
  vec3 color = hsv2rgb(vec3(hue, 0.75, 0.85));

  // Add subtle vignette
  float vignette = 1.0 - d * 0.3;
  color *= vignette;

  fragColor = vec4(color, 1.0);
}
