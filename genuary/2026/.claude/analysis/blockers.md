# Known Blockers & Solutions

This document tracks issues encountered during museum development and their resolutions.

---

## Active Blockers

*Currently blocking progress. Need resolution.*

None yet.

---

## Resolved Blockers

*Previously blocking, now solved. Keep for reference.*

None yet.

---

## Common Issues & Fixes

### Three.js

**Issue**: Scene renders black
**Cause**: Usually missing lights or camera not pointing at objects
**Fix**: Add ambient light, verify camera position and lookAt

**Issue**: Objects not visible
**Cause**: Often scale issues (objects too small or too large)
**Fix**: Log object bounding boxes, ensure camera frustum includes them

**Issue**: Textures not loading
**Cause**: Path issues or CORS in dev
**Fix**: Use Vite's asset import, ensure textures are in public/

### Navigation

**Issue**: Camera clips through walls
**Cause**: Missing collision detection
**Fix**: Implement raycasting or simple AABB collision

**Issue**: Movement feels floaty
**Cause**: No damping or smoothing
**Fix**: Add velocity damping, consider acceleration curves

### Performance

**Issue**: FPS drops in certain areas
**Cause**: Usually too many draw calls or unculled geometry
**Fix**: Implement frustum culling, merge static geometry, use instancing

**Issue**: Memory grows over time
**Cause**: Unreleased textures, geometries, or materials
**Fix**: Dispose of unused resources, implement proper cleanup

### Testing

**Issue**: Headless capture shows black screen
**Cause**: WebGL context not ready or SwiftShader issues
**Fix**: Wait for first frame, use --use-gl=swiftshader

**Issue**: Screenshots don't match browser
**Cause**: Viewport size differences
**Fix**: Set explicit viewport in Playwright context

---

## Patterns That Work

### Scene Setup
```typescript
// Always add these basics
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(new THREE.DirectionalLight(0xffffff, 0.8));
camera.position.set(0, 1.6, 5); // Human eye height
```

### Clean Resource Management
```typescript
// Track everything you create
const resources = { geometries: [], materials: [], textures: [] };

// Dispose on cleanup
function cleanup() {
  resources.geometries.forEach(g => g.dispose());
  resources.materials.forEach(m => m.dispose());
  resources.textures.forEach(t => t.dispose());
}
```

### Responsive Canvas
```typescript
function onResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', onResize);
```
