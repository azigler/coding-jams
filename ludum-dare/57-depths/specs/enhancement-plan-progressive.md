# Implementation Plan: Progressive Difficulty

## Phase 1: Level System (1.5 hours)

### 1. Level Configuration (30 min)

```typescript
export interface LevelConfig {
  timeLimit: number;
  minDepth: number;
  maxDepth: number;
  penaltiesEnabled: boolean;
  movingFoldersEnabled: boolean;
}

export const LEVELS: Record<number, LevelConfig> = {
  1: {
    timeLimit: 60,
    minDepth: 3,
    maxDepth: 5,
    penaltiesEnabled: false,
    movingFoldersEnabled: false
  },
  2: {
    timeLimit: 55,
    minDepth: 4,
    maxDepth: 7,
    penaltiesEnabled: true,
    movingFoldersEnabled: false
  }
  // ... more levels
};
```

### 2. Level Manager (30 min)

```typescript
export class LevelManager {
  private currentLevel: number = 1;
  
  loadLevel(level: number): void {
    const config = LEVELS[level];
    // Apply configuration
    // Generate appropriate folder structure
  }
  
  nextLevel(): void {
    this.currentLevel++;
    this.loadLevel(this.currentLevel);
  }
}
```

### 3. Level Transitions (30 min)

- Add level complete screen
- Show stats and next level preview
- Implement smooth scene transitions

## Phase 2: Power-ups (2 hours)

### 1. Power-up System (45 min)

```typescript
export class PowerUpManager {
  static readonly TYPES = {
    TIME_FREEZE: 'timeFreeze',
    QUICK_SEARCH: 'quickSearch',
    FOLDER_MAP: 'folderMap',
    UNDO: 'undo'
  } as const;
  
  activatePowerUp(type: keyof typeof PowerUpManager.TYPES): void {
    // Apply power-up effect
    // Start cooldown
  }
}
```

### 2. Time Freeze (30 min)

- Pause timer
- Visual freeze effect
- Cooldown system

### 3. Quick Search (45 min)

- Highlight potential paths
- Limited use counter
- Visual search effect

## Phase 3: Progress System (1.5 hours)

### 1. Save System (45 min)

```typescript
export class ProgressManager {
  saveProgress(): void {
    localStorage.setItem('gameProgress', JSON.stringify({
      level: this.currentLevel,
      unlockedPowerUps: this.unlockedPowerUps,
      highScores: this.highScores
    }));
  }
}
```

### 2. Unlockables (45 min)

- Power-up unlock conditions
- Level-based rewards
- Achievement tracking

## Testing Checklist

- [ ] Level progression works smoothly
- [ ] Power-ups function correctly
- [ ] Progress saves properly
- [ ] Difficulty curve feels right
- [ ] Power-ups are balanced
- [ ] Transitions are smooth
