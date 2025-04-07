import { BaseScene } from "./BaseScene"
import { LevelManager } from "../managers/LevelManager"

interface EndSceneData {
  success: boolean
  completed?: boolean
  finalScore?: number
}

export const EndScene = BaseScene.create("end")

EndScene.prototype.init = function (data: EndSceneData): void {
  // Store scene data
  this.sceneData = data
}

EndScene.prototype.create = function (
  this: Phaser.Scene & {
    scene: { settings: { data: EndSceneData } }
    sceneData: EndSceneData
  }
) {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  const { success, completed, finalScore } = this.sceneData

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
    // Get the existing level manager to maintain state
    const levelManager = new LevelManager(this)

    if (completed) {
      // Reset game and start from level 1
      levelManager.resetGame()
    } else if (success) {
      // Continue to next level - this will handle game completion
      levelManager.nextLevel()
    } else {
      // Retry current level
      const currentLevel = levelManager.getCurrentLevelNumber()
      this.scene.stop()
      this.scene.start("game", { level: currentLevel })
    }
  })

  // Add hover effect
  button.on("pointerover", () => button.setColor("#66b3ff"))
  button.on("pointerout", () => button.setColor("#4a90e2"))
}

EndScene.prototype.shutdown = function (): void {
  // Clean up all game objects
  this.children.removeAll(true)
}
