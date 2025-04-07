import { BaseScene } from "./BaseScene"
import { LevelManager } from "../managers/LevelManager"

interface EndSceneData {
  success: boolean
  completed?: boolean
  finalScore?: number
}

export const EndScene = BaseScene.create("end")

EndScene.prototype.create = function (
  this: Phaser.Scene & { scene: { settings: { data: EndSceneData } } }
) {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  const { success, completed, finalScore } = this.scene.settings.data

  // Display result message
  let message
  if (completed) {
    message =
      `CONGRATULATIONS!\nYou've mastered all ${finalScore} levels!\n` +
      "You're promoted to Senior File Finder!\n\n" +
      "Final Score: Level " +
      finalScore
  } else if (success) {
    message =
      "LEVEL COMPLETE!\nYou found the file!\nReady for the next challenge?"
  } else {
    message = "TIME'S UP!\nThe client left in anger!\nBoss is not impressed..."
  }

  const text = this.add.text(400, 300, message, {
    font: "32px monospace",
    color: "#ffffff",
    align: "center",
  })
  text.setOrigin(0.5)

  // Play sound effect
  this.sound.play(success ? "success" : "fail")

  // Add appropriate button
  const buttonText = completed
    ? "Play Again"
    : success
    ? "Next Level"
    : "Try Again"
  const button = this.add.text(400, 400, buttonText, {
    font: "24px monospace",
    color: "#4a90e2",
  })
  button.setOrigin(0.5)
  button.setInteractive({ cursor: "pointer" })
  button.on("pointerdown", () => {
    if (completed) {
      // Reset game and start from level 1
      const levelManager = new LevelManager(this)
      levelManager.resetGame()
      this.scene.start("game", { level: 1 })
    } else {
      // Get the existing level manager to maintain state
      const levelManager = new LevelManager(this)
      const currentLevel = levelManager.getCurrentLevelNumber()
      if (success) {
        // Continue to next level
        levelManager.advanceLevel()
        this.scene.start("game", { level: currentLevel + 1 })
      } else {
        // Retry current level
        this.scene.start("game", { level: currentLevel })
      }
    }
  })

  // Add hover effect
  button.on("pointerover", () => button.setColor("#66b3ff"))
  button.on("pointerout", () => button.setColor("#4a90e2"))
}
