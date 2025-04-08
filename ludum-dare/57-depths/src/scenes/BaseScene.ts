import Phaser from "phaser"
import { LevelManager } from "../managers/LevelManager"
import { Desktop } from "../components/Desktop"
import { PenaltyTracker } from "../effects/PenaltyTracker"

// Ensure process.env.DEBUG is properly typed
declare const process: {
  env: {
    DEBUG: boolean
  }
}

export class BaseScene extends Phaser.Scene {
  public declare add: Phaser.GameObjects.GameObjectFactory
  public declare scene: Phaser.Scenes.ScenePlugin
  public declare time: Phaser.Time.Clock
  public declare cameras: Phaser.Cameras.Scene2D.CameraManager
  public declare sound: Phaser.Sound.BaseSoundManager
  public declare load: Phaser.Loader.LoaderPlugin

  protected updateHandler: (() => void) | null = null
  protected sceneData: any = null
  protected levelManager: LevelManager | null = null
  protected desktop: Desktop | null = null
  protected penaltyTracker: PenaltyTracker | null = null
  protected timerText: Phaser.GameObjects.Text | null = null
  protected levelText: Phaser.GameObjects.Text | null = null

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config)
  }

  init(data?: any): void {
    // Clear any existing update handler
    if (this.updateHandler) {
      this.events.off("update", this.updateHandler)
      this.updateHandler = null
    }
    // Store scene data
    this.sceneData = data || null
  }

  create(): void {
    if (process.env.DEBUG) {
      this.add.text(10, 10, this.scene.key, { color: "#fff" })
    }
  }

  shutdown(): void {
    // Clean up event listeners
    if (this.updateHandler) {
      this.events.off("update", this.updateHandler)
      this.updateHandler = null
    }
    // Clean up game objects
    this.children.removeAll(true)
  }

  cleanupAndDestroy(): void {
    this.shutdown()
  }

  static create(key: string): typeof BaseScene {
    return class extends BaseScene {
      constructor() {
        super(key)
      }
    }
  }

  public handleGameComplete(_success: boolean): void {
    // Base implementation - should be overridden by child scenes
  }
}
