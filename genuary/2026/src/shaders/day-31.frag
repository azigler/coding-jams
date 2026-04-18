#version 300 es
precision highp float;

// ============================================================================
// TERMINUS — Day 31: The End of the Corridor
//
// A raymarched infinite hallway. Pure GLSL—no geometry, no mesh.
// Every pixel calculated from signed distance functions.
// The corridor stretches to infinity. A door is visible at the vanishing point.
// Walk forward. Keep walking. You'll never get there.
//
// After Inigo Quilez (raymarching SDFs) and The Book of Shaders.
// ============================================================================

// Standard uniforms
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Control uniforms
uniform float u_walkSpeed;
uniform float u_fogDensity;
uniform float u_textureScale;
uniform float u_lightWarmth;
uniform float u_animSpeed;

in vec2 v_uv;
out vec4 fragColor;

// ============================================================================
// CONSTANTS
// ============================================================================

#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define CORRIDOR_WIDTH 3.0
#define CORRIDOR_HEIGHT 4.0

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = i.x + i.y * 157.0 + 113.0 * i.z;
    return mix(
        mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
            mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y),
        f.z);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise3(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// ============================================================================
// SDF PRIMITIVES
// ============================================================================

float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

// Infinite corridor: inside a box that extends infinitely in Z
float sdCorridor(vec3 p) {
    // Corridor is centered on origin, extends infinitely in Z
    // We compute distance to walls, floor, ceiling
    float halfW = CORRIDOR_WIDTH * 0.5;
    float halfH = CORRIDOR_HEIGHT * 0.5;

    // Distance to each surface
    float dLeft = p.x + halfW;
    float dRight = halfW - p.x;
    float dFloor = p.y + halfH;
    float dCeiling = halfH - p.y;

    // Interior distance (negative inside)
    float d = min(min(dLeft, dRight), min(dFloor, dCeiling));
    return -d;  // Negative inside the corridor
}

// Door frame at a specific Z position
float sdDoorFrame(vec3 p, float doorZ) {
    vec3 doorP = p - vec3(0.0, -0.5, doorZ);

    // Door opening: 1.2m wide, 2.5m tall
    float doorWidth = 1.2;
    float doorHeight = 2.5;

    // The frame is the corridor walls minus the door opening
    float opening = sdBox(doorP, vec3(doorWidth * 0.5, doorHeight * 0.5, 0.15));

    return opening;
}

// Light sconce on wall
float sdSconce(vec3 p, vec3 pos) {
    vec3 sp = p - pos;
    // Simple hemisphere
    float d = length(sp) - 0.15;
    return d;
}

// ============================================================================
// SCENE SDF
// ============================================================================

float sceneSDF(vec3 p) {
    float d = sdCorridor(p);

    // Add wall texture displacement (subtle)
    float wallNoise = fbm3(p * u_textureScale) * 0.02;
    d -= wallNoise;

    return d;
}

// ============================================================================
// RAYMARCHING
// ============================================================================

float rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = sceneSDF(p);

        if (abs(d) < SURF_DIST) break;
        if (t > MAX_DIST) break;

        t += d * 0.8;  // Slightly conservative stepping
    }

    return t;
}

// ============================================================================
// NORMALS
// ============================================================================

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
        sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
        sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
    ));
}

// ============================================================================
// LIGHTING
// ============================================================================

vec3 getSconceLightPos(float z, float side) {
    return vec3(side * (CORRIDOR_WIDTH * 0.5 - 0.2), 0.8, z);
}

float getSconceLighting(vec3 p, vec3 n, vec3 lightPos, float intensity) {
    vec3 toLight = lightPos - p;
    float dist = length(toLight);
    vec3 lightDir = toLight / dist;

    // Diffuse
    float diff = max(dot(n, lightDir), 0.0);

    // Attenuation
    float atten = intensity / (1.0 + dist * 0.3 + dist * dist * 0.05);

    return diff * atten;
}

// ============================================================================
// WALL TEXTURE
// ============================================================================

vec3 getWallTexture(vec3 p, vec3 n) {
    // Determine which surface we're on
    float scale = u_textureScale;
    vec2 uv;

    if (abs(n.x) > 0.5) {
        // Side walls
        uv = p.zy * scale;
    } else if (abs(n.y) > 0.5) {
        // Floor or ceiling
        uv = p.xz * scale;
    } else {
        uv = p.xy * scale;
    }

    // Wallpaper-like pattern
    float pattern = 0.0;

    // Base damask-like pattern
    vec2 cell = fract(uv * 2.0) - 0.5;
    float diamond = abs(cell.x) + abs(cell.y);
    pattern += smoothstep(0.4, 0.35, diamond) * 0.3;

    // Subtle noise overlay
    float n1 = fbm(uv * 3.0);
    pattern += n1 * 0.15;

    // Fine grain
    float grain = noise(uv * 20.0) * 0.05;

    // Base color: warm cream for walls, darker for floor
    vec3 baseColor;
    if (n.y > 0.5) {
        // Ceiling - slightly darker cream
        baseColor = vec3(0.85, 0.82, 0.78);
    } else if (n.y < -0.5) {
        // Floor - dark wood
        baseColor = vec3(0.25, 0.18, 0.12);
        pattern = fbm(uv * 4.0) * 0.3;  // Wood grain
    } else {
        // Walls - warm wallpaper cream
        baseColor = vec3(0.92, 0.88, 0.82);
    }

    return baseColor * (0.9 + pattern * 0.2 + grain);
}

// ============================================================================
// DOOR GLOW
// ============================================================================

float getDoorGlow(vec3 rd, float camZ) {
    // The door is always "far ahead"
    float doorZ = camZ + 50.0;  // Door appears 50 units ahead

    // Calculate where ray would hit the door plane
    float t = (doorZ - camZ) / max(rd.z, 0.001);

    if (t < 0.0 || t > MAX_DIST * 2.0) return 0.0;

    vec3 doorHit = vec3(0.0, -0.5, 0.0) + rd * t;

    // Door frame dimensions
    float doorWidth = 1.2;
    float doorHeight = 2.5;

    // Distance to door rectangle
    vec2 doorUV = vec2(doorHit.x, doorHit.y + 0.5);
    vec2 d = abs(doorUV) - vec2(doorWidth * 0.5, doorHeight * 0.5);
    float doorDist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

    // Glow around the door
    float glow = smoothstep(0.8, 0.0, doorDist) * 0.3;

    // Distance fade
    float distFade = 1.0 / (1.0 + t * 0.02);

    return glow * distFade;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
    vec2 uv = v_uv;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    float time = u_time * u_animSpeed;

    // Camera position - walking down the corridor automatically
    float camZ = time * u_walkSpeed * 2.0;  // Auto-walk forward
    vec3 ro = vec3(0.0, -0.5, camZ);  // Slightly below center (eye level)

    // Camera direction - looking forward with subtle sway
    float sway = sin(time * 0.5) * 0.02;
    vec3 forward = normalize(vec3(sway, 0.0, 1.0));
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    // Ray direction
    vec3 rd = normalize(p.x * right + p.y * up + 1.5 * forward);

    // Raymarch
    float t = rayMarch(ro, rd);

    vec3 col = vec3(0.0);

    if (t < MAX_DIST) {
        vec3 hitPos = ro + rd * t;
        vec3 n = getNormal(hitPos);

        // Base wall texture
        vec3 albedo = getWallTexture(hitPos, n);

        // Lighting from sconces
        float lighting = 0.15;  // Ambient

        // Add multiple sconces along the corridor
        for (int i = -2; i < 5; i++) {
            float sconceZ = floor(camZ / 8.0) * 8.0 + float(i) * 8.0;

            // Left sconce
            vec3 leftLight = getSconceLightPos(sconceZ, -1.0);
            lighting += getSconceLighting(hitPos, n, leftLight, 2.0);

            // Right sconce
            vec3 rightLight = getSconceLightPos(sconceZ, 1.0);
            lighting += getSconceLighting(hitPos, n, rightLight, 2.0);
        }

        // Apply lighting
        col = albedo * lighting;

        // Light warmth adjustment
        vec3 warmTint = mix(vec3(1.0), vec3(1.1, 0.95, 0.85), u_lightWarmth);
        col *= warmTint;

        // Fog
        float fogAmount = 1.0 - exp(-t * u_fogDensity * 0.02);
        vec3 fogColor = vec3(0.15, 0.12, 0.1);
        col = mix(col, fogColor, fogAmount);

    } else {
        // Hit nothing - dark fog
        col = vec3(0.05, 0.04, 0.03);
    }

    // Door glow at the end
    float doorGlow = getDoorGlow(rd, camZ);
    vec3 doorColor = vec3(1.0, 0.95, 0.8);  // Warm light through the door
    col += doorColor * doorGlow;

    // Vignette
    float vignette = 1.0 - length(p) * 0.3;
    col *= vignette;

    // Gamma correction
    col = pow(col, vec3(0.9));

    // Subtle film grain
    float grain = (hash2(uv * u_resolution.xy + time * 100.0) - 0.5) * 0.02;
    col += grain;

    fragColor = vec4(col, 1.0);
}
