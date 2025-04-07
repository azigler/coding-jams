import { BaseScene } from "./BaseScene"
import { Desktop } from "../components/Desktop"
import { PenaltyTracker } from "../effects/PenaltyTracker"
import { LevelManager } from "../managers/LevelManager"

export class GameScene extends BaseScene {
  private desktop: Desktop | null = null
  private penaltyTracker: PenaltyTracker | null = null
  private timerText: Phaser.GameObjects.Text | null = null
  private updateHandler: (() => void) | null = null
  private levelManager: LevelManager | null = null

  constructor() {
    super({ key: "game" })
  }

  init(data?: any): void {
    // Clear any existing update handler
    if (this.updateHandler) {
      this.events.off("update", this.updateHandler)
      this.updateHandler = null
    }

    // Initialize level manager if not already done
    if (!this.levelManager) {
      this.levelManager = new LevelManager(this)
    }

    // Set level if provided
    if (data?.level) {
      this.levelManager.setLevel(data.level)
    }
  }

  create(): void {
    super.create()

    const currentLevel = this.levelManager!.getCurrentLevel()

    // Create desktop environment
    this.desktop = new Desktop(this, {
      minTargetDepth: currentLevel.minDepth,
      maxTargetDepth: currentLevel.maxDepth,
      movingFolders: currentLevel.movingFolders,
    })

    // Initialize penalty tracker
    this.penaltyTracker = new PenaltyTracker(this, currentLevel.timeLimit)

    // Create timer display
    this.timerText = this.add.text(
      this.cameras.main.width - 10,
      10,
      currentLevel.timeLimit.toString(),
      {
        font: "32px monospace",
        color: "#ffffff",
      }
    )
    this.timerText.setOrigin(1, 0)

    // Create level display
    const levelText = this.add.text(
      10,
      10,
      `Level ${this.levelManager!.getCurrentLevelNumber()}`,
      {
        font: "32px monospace",
        color: "#ffffff",
      }
    )

    // Set up penalty tracking
    if (this.desktop && this.penaltyTracker) {
      this.desktop.setPenaltyTracker(this.penaltyTracker)
    }

    // Create update handler
    this.updateHandler = () => {
      if (this.penaltyTracker && this.timerText && this.timerText.active) {
        this.penaltyTracker.update()
        const timeLeft = this.penaltyTracker.getTimeRemaining()
        this.timerText.setText(Math.ceil(timeLeft).toString())

        if (timeLeft <= 10) {
          this.timerText.setColor("#ff0000")
        }
      }
    }

    // Register update handler
    this.events.on("update", this.updateHandler)

    // Listen for game completion
    this.events.on("gameComplete", this.handleGameComplete, this)
  }

  private handleGameComplete(success: boolean): void {
    // Remove update handler before restarting scene
    if (this.updateHandler) {
      this.events.off("update", this.updateHandler)
      this.updateHandler = null
    }

    const completed = success && this.levelManager!.isLastLevel()

    // If player won the game (completed last level), show winning screen
    if (completed) {
      this.scene.start("end", {
        success: true,
        completed: true,
        finalScore: this.levelManager!.getCurrentLevelNumber(),
      })
    }
    // If player won the level but not the game, show level complete screen
    else if (success) {
      this.scene.start("end", { success: true, completed: false })
    }
    // If player lost, show failure screen
    else {
      this.scene.start("end", { success: false, completed: false })
    }
  }

  destroy(): void {
    // Clean up event listeners
    this.events.off("gameComplete", this.handleGameComplete, this)
    if (this.updateHandler) {
      this.events.off("update", this.updateHandler)
      this.updateHandler = null
    }

    // Clean up game objects
    if (this.desktop) {
      this.desktop.destroy()
      this.desktop = null
    }

    if (this.penaltyTracker) {
      this.penaltyTracker = null
    }

    if (this.timerText) {
      this.timerText.destroy()
      this.timerText = null
    }
  }
}
