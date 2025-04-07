# Implementation Plan: Consequences System

## Phase 1: Basic Penalties (2 hours)

### 1. Screen Effects (30 min)

```typescript
export class ScreenEffects {
  static shake(scene: Phaser.Scene, intensity = 0.5): void {
    scene.cameras.main.shake(250 * intensity);
  }
  
  static flash(scene: Phaser.Scene): void {
    scene.cameras.main.flash(250);
  }
}
```

### 2. Time Penalties (30 min)

```typescript
export class GameTimer {
  addPenalty(seconds: number): void {
    this.timeRemaining -= seconds;
    ScreenEffects.flash(this.scene);
  }
}
```

### 3. Basic Pop-ups (1 hour)

```typescript
export class PopupManager {
  static show(scene: Phaser.Scene, text: string): void {
    const popup = scene.add.container(400, 300);
    // Add background
    // Add text
    // Add close button
    return popup;
  }
}
```

## Phase 2: Accumulating Effects (2 hours)

### 1. Effect Tracking (30 min)

```typescript
export class PenaltyTracker {
  private mistakeCount: number = 0;
  
  trackMistake(): void {
    this.mistakeCount++;
    this.applyEffects();
  }
}
```

### 2. Escalating Messages (30 min)

- Create message pool
- Implement severity levels
- Add frustration progression

### 3. Visual Escalation (1 hour)

- Increase shake intensity
- Add multiple popups
- Implement screen effects

## Phase 3: Polish (1 hour)

### 1. Sound Effects

- Add error sounds
- Implement volume scaling
- Add popup sounds

### 2. Visual Polish

- Improve popup styling
- Add transition effects
- Polish screen effects

## Testing Checklist

- [ ] Penalties trigger correctly
- [ ] Effects scale with mistakes
- [ ] Performance remains stable
- [ ] Effects are noticeable but not frustrating
- [ ] Sound effects work correctly
- [ ] Visual effects are polished
