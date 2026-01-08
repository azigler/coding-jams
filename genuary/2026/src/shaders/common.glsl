/**
 * Common GLSL utilities for Genuary 2026 shader days
 * Include this in your fragment shader for useful functions
 *
 * Note: WebGL doesn't support #include, so these functions
 * need to be copied into each shader that uses them, or
 * concatenated at build time.
 */

// ============================================
// CONSTANTS
// ============================================

#define PI 3.14159265359
#define TAU 6.28318530718
#define E 2.71828182846

// ============================================
// NOISE FUNCTIONS
// ============================================

// Simple hash function
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Hash for vec3
float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

// 2D value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // Smoothstep

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
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

// Simplex-like gradient noise
vec2 gradientNoise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = f * f * (3.0 - 2.0 * f);

  float n00 = hash(i) * 2.0 - 1.0;
  float n10 = hash(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
  float n01 = hash(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
  float n11 = hash(i + vec2(1.0, 1.0)) * 2.0 - 1.0;

  float nx = mix(n00, n10, u.x);
  float ny = mix(n01, n11, u.x);

  return vec2(mix(nx, ny, u.y), mix(n00 + n01, n10 + n11, u.x) * 0.5);
}

// ============================================
// SDF PRIMITIVES (2D)
// ============================================

// Circle
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// Box
float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Rounded box
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

// Line segment
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Equilateral triangle
float sdEquilateralTriangle(vec2 p, float r) {
  const float k = sqrt(3.0);
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

// Regular polygon
float sdPolygon(vec2 p, float r, int n) {
  float a = atan(p.x, p.y) + PI;
  float s = TAU / float(n);
  return cos(floor(0.5 + a / s) * s - a) * length(p) - r;
}

// ============================================
// SDF OPERATIONS
// ============================================

// Union
float opUnion(float d1, float d2) {
  return min(d1, d2);
}

// Subtraction
float opSubtraction(float d1, float d2) {
  return max(-d1, d2);
}

// Intersection
float opIntersection(float d1, float d2) {
  return max(d1, d2);
}

// Smooth union
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Smooth subtraction
float opSmoothSubtraction(float d1, float d2, float k) {
  float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
  return mix(d2, -d1, h) + k * h * (1.0 - h);
}

// ============================================
// COLOR UTILITIES
// ============================================

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Palette function (from Inigo Quilez)
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

// Rainbow palette
vec3 rainbow(float t) {
  return hsv2rgb(vec3(t, 0.8, 0.9));
}

// ============================================
// TRANSFORMATION UTILITIES
// ============================================

// Rotate 2D point
vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Scale 2D point
vec2 scale2D(vec2 p, vec2 s) {
  return p / s;
}

// Repeat space
vec2 repeat(vec2 p, vec2 c) {
  return mod(p + 0.5 * c, c) - 0.5 * c;
}

// Polar coordinates
vec2 toPolar(vec2 p) {
  return vec2(length(p), atan(p.y, p.x));
}

// Cartesian from polar
vec2 toCartesian(vec2 polar) {
  return vec2(polar.x * cos(polar.y), polar.x * sin(polar.y));
}

// ============================================
// EASING FUNCTIONS
// ============================================

float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return t * (2.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
}

float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  float t1 = t - 1.0;
  return t1 * t1 * t1 + 1.0;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
}

float easeInExpo(float t) {
  return t == 0.0 ? 0.0 : pow(2.0, 10.0 * (t - 1.0));
}

float easeOutExpo(float t) {
  return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Remap value from one range to another
float remap(float value, float low1, float high1, float low2, float high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

// Smooth minimum
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Step with smooth transition
float smoothEdge(float edge, float x, float smoothness) {
  return smoothstep(edge - smoothness, edge + smoothness, x);
}
