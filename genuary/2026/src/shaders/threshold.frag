#version 300 es
precision highp float;

// Standard uniforms
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Control uniforms
uniform float u_boundaryPos;      // Boundary center position (0-1)
uniform float u_boundaryWidth;    // Width of threshold zone
uniform float u_boundaryWarp;     // How much the boundary warps
uniform float u_orderScale;       // Scale of ordered pattern
uniform float u_disorderScale;    // Scale of disordered pattern
uniform float u_animSpeed;        // Animation speed
uniform float u_colorIntensity;   // Color saturation/intensity

in vec2 v_uv;
out vec4 fragColor;

// ============================================
// CONSTANTS
// ============================================

#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================
// NOISE FUNCTIONS
// ============================================

// Hash functions
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

// Value noise
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

// Fractal Brownian Motion
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}

// Domain warping
vec2 warp(vec2 p, float time) {
    float n1 = fbm(p + time * 0.1, 4);
    float n2 = fbm(p + vec2(5.2, 1.3) + time * 0.12, 4);
    return vec2(n1, n2) * 2.0 - 1.0;
}

// ============================================
// ORDERED PATTERN: Hexagonal Voronoi
// ============================================

// Hexagonal grid helper
vec2 hexCenter(vec2 p) {
    vec2 s = vec2(1.0, 1.732050808);
    vec2 a = mod(p, s) - s * 0.5;
    vec2 b = mod(p - s * 0.5, s) - s * 0.5;
    return dot(a, a) < dot(b, b) ? a : b;
}

float orderedPattern(vec2 p, float time, float scale) {
    p *= scale;

    // Hexagonal tiling
    vec2 hex = hexCenter(p);
    float d = length(hex);

    // Cell ID for color variation
    vec2 cellId = floor(p);
    float cellHash = hash(cellId);

    // Concentric hexagonal rings within each cell
    float rings = sin(d * 12.0 - time * 0.5 + cellHash * TAU) * 0.5 + 0.5;

    // Sharp geometric edges
    float edge = smoothstep(0.45, 0.48, d);

    // Crystalline facets
    float angle = atan(hex.y, hex.x);
    float facets = sin(angle * 6.0) * 0.5 + 0.5;

    return mix(rings, facets, 0.3) * (1.0 - edge * 0.5);
}

// ============================================
// DISORDERED PATTERN: Turbulent Flow
// ============================================

float disorderedPattern(vec2 p, float time, float scale) {
    p *= scale;

    // Multiple layers of domain-warped noise
    vec2 q = warp(p, time);
    vec2 r = warp(p + q * 0.8, time * 1.1);

    // Turbulent fbm
    float n1 = fbm(p + q * 2.0, 5);
    float n2 = fbm(p + r * 1.5 + time * 0.05, 4);
    float n3 = fbm(p * 2.0 + vec2(n1, n2), 3);

    // Combine for swirling turbulence
    float turbulence = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Add some sharp ridges
    float ridges = abs(sin(turbulence * 8.0 + time * 0.3));

    return mix(turbulence, ridges, 0.4);
}

// ============================================
// BOUNDARY/THRESHOLD ZONE
// ============================================

float boundaryMask(vec2 uv, float time, float pos, float width, float warpAmount) {
    // Base boundary is vertical
    float boundary = uv.x;

    // Warp the boundary with noise
    float warpNoise = fbm(uv * 3.0 + time * 0.2, 4) * 2.0 - 1.0;
    float warpNoise2 = fbm(uv * 5.0 - time * 0.15 + vec2(3.7, 2.1), 3) * 2.0 - 1.0;

    // Add slow undulation
    float wave = sin(uv.y * 4.0 + time * 0.4) * 0.15;
    float wave2 = sin(uv.y * 7.0 - time * 0.3) * 0.08;

    // Combine warping effects
    boundary += (warpNoise * 0.6 + warpNoise2 * 0.4 + wave + wave2) * warpAmount;

    // Create soft gradient across boundary
    float dist = boundary - pos;

    // Return value: -1 (full order) to +1 (full disorder), 0 at threshold
    return clamp(dist / max(width, 0.01), -1.0, 1.0);
}

// ============================================
// COLOR PALETTES
// ============================================

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 orderColor(float value, float time, float intensity) {
    // Cool crystalline colors: cyan, blue, white
    float hue = 0.55 + value * 0.1 + sin(time * 0.2) * 0.02; // Blue-cyan range
    float sat = 0.4 + value * 0.3;
    float val = 0.7 + value * 0.25;

    vec3 col = hsv2rgb(vec3(hue, sat * intensity, val));

    // Add crystalline highlights
    col += pow(value, 4.0) * vec3(0.3, 0.4, 0.5) * intensity;

    return col;
}

vec3 disorderColor(float value, float time, float intensity) {
    // Warm turbulent colors: orange, red, amber
    float hue = 0.05 + value * 0.08 + sin(time * 0.3 + value * 3.0) * 0.03; // Orange-red range
    float sat = 0.6 + value * 0.3;
    float val = 0.6 + value * 0.35;

    vec3 col = hsv2rgb(vec3(hue, sat * intensity, val));

    // Add ember glow
    col += pow(value, 3.0) * vec3(0.4, 0.15, 0.05) * intensity;

    return col;
}

vec3 thresholdColor(vec3 orderCol, vec3 disorderCol, float orderVal, float disorderVal, float t, float intensity) {
    // t is -1 to 1, with 0 being exact threshold
    // In the threshold zone, create interference patterns

    float blendFactor = t * 0.5 + 0.5; // 0 to 1

    // Interference: patterns interact
    float interference = sin((orderVal - disorderVal) * 15.0) * 0.5 + 0.5;

    // Color mixing with interference
    vec3 baseBlend = mix(orderCol, disorderCol, blendFactor);

    // Add threshold-specific color (purple where systems meet)
    vec3 thresholdTint = hsv2rgb(vec3(0.78, 0.5 * intensity, 0.8)); // Violet

    // Blend based on how close to exact threshold
    float thresholdProximity = 1.0 - abs(t);
    thresholdProximity = pow(thresholdProximity, 2.0); // Sharpen

    vec3 col = mix(baseBlend, thresholdTint, thresholdProximity * 0.4 * interference);

    // Add luminance variations at the interface
    col += vec3(interference * thresholdProximity * 0.15);

    return col;
}

// ============================================
// MAIN
// ============================================

void main() {
    vec2 uv = v_uv;
    float time = u_time * u_animSpeed;

    // Calculate boundary mask
    float mask = boundaryMask(uv, time, u_boundaryPos, u_boundaryWidth, u_boundaryWarp);

    // Generate both patterns everywhere (needed for threshold zone)
    float orderVal = orderedPattern(uv, time, u_orderScale);
    float disorderVal = disorderedPattern(uv, time, u_disorderScale);

    // Color each pattern
    vec3 orderCol = orderColor(orderVal, time, u_colorIntensity);
    vec3 disorderCol = disorderColor(disorderVal, time, u_colorIntensity);

    // Final color based on mask
    vec3 col;

    if (mask < -0.95) {
        // Pure order zone
        col = orderCol;
    } else if (mask > 0.95) {
        // Pure disorder zone
        col = disorderCol;
    } else {
        // Threshold zone - the interesting part
        col = thresholdColor(orderCol, disorderCol, orderVal, disorderVal, mask, u_colorIntensity);
    }

    // Subtle vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    col *= vignette;

    // Output
    fragColor = vec4(col, 1.0);
}
