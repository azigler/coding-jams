import { BaseScene } from "./BaseScene"
import { Desktop } from "../components/Desktop"
import { PenaltyTracker } from "../effects/PenaltyTracker"
import { LevelManager } from "../managers/LevelManager"

interface GameSceneData {
  level?: number
}

export const GameScene = BaseScene.create("game")

GameScene.prototype.init = function (data: GameSceneData): void {
  // Call parent init method to handle cleanup
  BaseScene.prototype.init.call(this, data)

  // Initialize level manager with this scene
  this.levelManager = new LevelManager(this)

  // Set level if provided
  if (data.level) {
    this.levelManager.setLevel(data.level)
  }
}

GameScene.prototype.create = function (
  this: Phaser.Scene & {
    levelManager: LevelManager
    desktop: Desktop
    penaltyTracker: PenaltyTracker
    timerText: Phaser.GameObjects.Text
    levelText: Phaser.GameObjects.Text
  }
) {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  // Configure level settings
  const currentLevel = this.levelManager.getCurrentLevel()

  // Create desktop environment with level settings
  this.desktop = new Desktop(this, {
    minTargetDepth: currentLevel.minDepth,
    maxTargetDepth: currentLevel.maxDepth,
    movingFolders: currentLevel.movingFolders,
  })

  // Create penalty tracker with level time limit
  this.penaltyTracker = new PenaltyTracker(this, currentLevel.timeLimit)

  // Connect penalty tracker to desktop
  this.desktop.setPenaltyTracker(this.penaltyTracker)

  // Add level text
  this.levelText = this.add.text(
    16,
    16,
    `Level: ${this.levelManager.getCurrentLevelNumber()}`,
    {
      font: "32px monospace",
      color: "#ffffff",
    }
  )

  // Add timer text in top right corner
  this.timerText = this.add.text(
    this.cameras.main.width - 16,
    16,
    `Time: ${currentLevel.timeLimit}`,
    {
      font: "32px monospace",
      color: "#ffffff",
    }
  )
  this.timerText.setOrigin(1, 0) // Align right

  // Update handler for timer
  this.updateHandler = () => {
    // Get time from penalty tracker
    const seconds = Math.ceil(this.penaltyTracker.getTimeRemaining())

    // Update timer text
    if (this.timerText) {
      this.timerText.setText(`Time: ${seconds}`)
      // Change color to red when time is low
      if (seconds <= 10) {
        this.timerText.setColor("#ff0000")
      }
    }
  }

  // Register update handler
  this.events.on("update", this.updateHandler)

  // Listen for game complete event
  this.desktop.on("gameComplete", () => this.handleGameComplete(true))
}

GameScene.prototype.handleGameComplete = function (success: boolean) {
  // Stop update handler
  if (this.updateHandler) {
    this.events.off("update", this.updateHandler)
    this.updateHandler = null
  }

  // Stop current scene
  this.scene.stop()

  // Get current level number for final score
  const currentLevel = this.levelManager?.getCurrentLevelNumber() || 0
  const isLastLevel = this.levelManager?.isLastLevel() || false

  // Show appropriate end screen
  if (success && isLastLevel) {
    // Show winning screen with final score
    this.scene.start("end", {
      success: true,
      completed: true,
      finalScore: currentLevel,
    })
  } else if (success) {
    // Show level complete screen
    this.scene.start("end", { success: true })
  } else {
    // Show failure screen
    this.scene.start("end", { success: false })
  }
}

GameScene.prototype.shutdown = function () {
  // Call parent shutdown method
  BaseScene.prototype.shutdown.call(this)

  // Clean up desktop
  if (this.desktop) {
    this.desktop.destroy()
  }

  // Clean up penalty tracker
  if (this.penaltyTracker) {
    this.penaltyTracker.destroy()
  }

  // Clear references
  this.desktop = null
  this.penaltyTracker = null
  this.timerText = null
  this.levelText = null
}
