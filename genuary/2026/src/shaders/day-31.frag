#version 300 es
precision highp float;

// Auto-bound uniforms
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Control-bound uniforms
uniform float u_complexity;
uniform float u_speed;
uniform float u_colorIntensity;
uniform float u_warpAmount;

in vec2 v_uv;
out vec4 fragColor;

// ============================================
// CONSTANTS & UTILITIES
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

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Smooth minimum for blending shapes
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// ============================================
// MAIN SHADER - "Generative Aurora"
// A mesmerizing aurora borealis effect for GLSL Day
// ============================================

void main() {
  // Normalized coordinates with aspect ratio
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  // Time with speed control
  float t = u_time * u_speed * 0.3;

  // Domain warping for organic movement
  vec2 warpedP = p;
  float warpScale = u_warpAmount * 0.5;
  warpedP += warpScale * vec2(
    fbm(p * 2.0 + t * 0.5, 4) - 0.5,
    fbm(p * 2.0 + t * 0.3 + 100.0, 4) - 0.5
  );

  // Multiple layered aurora bands
  float aurora = 0.0;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float offset = fi * 0.3;
    float freq = 1.0 + fi * 0.5;

    // Vertical wave pattern
    float wave = sin(warpedP.x * freq * u_complexity + t + offset);
    wave += 0.5 * sin(warpedP.x * freq * 2.0 * u_complexity - t * 1.3 + offset);
    wave *= 0.5;

    // Position in y relative to wave
    float bandY = -0.3 + fi * 0.15 + wave * 0.3;
    float dist = abs(warpedP.y - bandY);

    // Create glow effect
    float glow = 0.02 / (dist + 0.02);
    glow *= smoothstep(0.5, 0.0, dist);

    // Add noise variation
    float noiseVal = fbm(warpedP * 3.0 * u_complexity + vec2(t * 0.2, fi * 10.0), 3);
    glow *= 0.5 + noiseVal * 0.5;

    aurora += glow * (1.0 - fi * 0.15);
  }

  // Color gradient - aurora colors (green, cyan, magenta)
  vec3 color1 = hsv2rgb(vec3(0.35, 0.8, 0.9)); // Green
  vec3 color2 = hsv2rgb(vec3(0.55, 0.7, 0.95)); // Cyan
  vec3 color3 = hsv2rgb(vec3(0.85, 0.6, 0.85)); // Magenta

  float colorMix = fbm(warpedP * u_complexity + t * 0.1, 3);
  vec3 auroraColor;
  if (colorMix < 0.33) {
    auroraColor = mix(color1, color2, colorMix * 3.0);
  } else if (colorMix < 0.66) {
    auroraColor = mix(color2, color3, (colorMix - 0.33) * 3.0);
  } else {
    auroraColor = mix(color3, color1, (colorMix - 0.66) * 3.0);
  }

  // Mouse interaction - creates a bright point
  vec2 mousePos = (u_mouse - 0.5) * 2.0;
  mousePos.x *= u_resolution.x / u_resolution.y;
  float mouseDist = length(p - mousePos);
  float mouseGlow = smoothstep(0.4, 0.0, mouseDist) * 0.5;
  aurora += mouseGlow;

  // Final color composition
  vec3 bgColor = vec3(0.02, 0.02, 0.05); // Deep night sky
  vec3 finalColor = bgColor + auroraColor * aurora * u_colorIntensity;

  // Add subtle stars
  float stars = step(0.998, hash(floor(uv * u_resolution.xy * 0.1)));
  float starTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(floor(uv * u_resolution.xy * 0.1)) * TAU);
  finalColor += vec3(1.0, 0.95, 0.9) * stars * starTwinkle * 0.5;

  // Vignette
  float vignette = 1.0 - length(p) * 0.3;
  finalColor *= vignette;

  // Tone mapping and gamma
  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(0.9));

  fragColor = vec4(finalColor, 1.0);
}
