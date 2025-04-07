import "phaser"

export interface LevelConfig {
  timeLimit: number
  minDepth: number
  maxDepth: number
  enablePenalties: boolean
  movingFolders: boolean
}

const LEVELS: Record<number, LevelConfig> = {
  1: {
    timeLimit: 60,
    minDepth: 3,
    maxDepth: 5,
    enablePenalties: true,
    movingFolders: false,
  },
  2: {
    timeLimit: 55,
    minDepth: 4,
    maxDepth: 6,
    enablePenalties: true,
    movingFolders: false,
  },
  3: {
    timeLimit: 50,
    minDepth: 5,
    maxDepth: 7,
    enablePenalties: true,
    movingFolders: true,
  },
  4: {
    timeLimit: 45,
    minDepth: 6,
    maxDepth: 8,
    enablePenalties: true,
    movingFolders: true,
  },
  5: {
    timeLimit: 40,
    minDepth: 7,
    maxDepth: 10,
    enablePenalties: true,
    movingFolders: true,
  },
}

export class LevelManager {
  private static instance: LevelManager | null = null
  private currentLevel: number = 1
  private scene: Phaser.Scene | null = null

  constructor(scene?: Phaser.Scene) {
    if (LevelManager.instance) {
      return LevelManager.instance
    }

    if (scene) {
      this.scene = scene
    }
    LevelManager.instance = this
  }

  getCurrentLevel(): LevelConfig {
    return LEVELS[this.currentLevel]
  }

  getCurrentLevelNumber(): number {
    return this.currentLevel
  }

  advanceLevel(): void {
    if (!this.isLastLevel()) {
      this.currentLevel++
    }
  }

  isLastLevel(): boolean {
    return this.currentLevel === Object.keys(LEVELS).length
  }

  setLevel(level: number): void {
    if (level >= 1 && level <= Object.keys(LEVELS).length) {
      this.currentLevel = level
    }
  }

  nextLevel(): void {
    if (this.currentLevel < Object.keys(LEVELS).length) {
      this.currentLevel++
      if (this.scene) {
        this.scene.scene.stop()
        this.loadLevel(this.currentLevel)
      }
    } else if (this.scene) {
      // Game completed!
      this.scene.scene.stop()
      this.scene.scene.start("end", { success: true, completed: true })
    }
  }

  loadLevel(level: number): void {
    if (level < 1 || level > Object.keys(LEVELS).length) {
      throw new Error(`Invalid level number: ${level}`)
    }
    this.currentLevel = level
    if (this.scene) {
      this.scene.scene.stop()
      this.scene.scene.start("game", { level })
    }
  }

  resetGame(): void {
    this.currentLevel = 1
    if (this.scene) {
      this.scene.scene.stop()
      this.loadLevel(1)
    }
  }
}
