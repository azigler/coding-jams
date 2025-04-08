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

  // Add button for next level or play again
  if (success && !completed) {
    const nextLevelButton = this.add
      .text(400, 400, "Next Level", {
        fontSize: "32px",
        color: "#00ff00",
      })
      .setOrigin(0.5)
      .setInteractive()

    nextLevelButton.on("pointerdown", () => {
      this.scene.stop()
      const levelManager = new LevelManager(this)
      levelManager.nextLevel()
    })

    // Add hover effect for next level button
    nextLevelButton.on("pointerover", () => nextLevelButton.setColor("#66b3ff"))
    nextLevelButton.on("pointerout", () => nextLevelButton.setColor("#00ff00"))
  } else {
    const playAgainButton = this.add
      .text(400, 400, completed ? "Play Again" : "Try Again", {
        fontSize: "32px",
        color: completed ? "#00ff00" : "#ff0000",
      })
      .setOrigin(0.5)
      .setInteractive()

    playAgainButton.on("pointerdown", () => {
      this.scene.stop()
      const levelManager = new LevelManager(this)
      levelManager.resetGame()
    })

    // Add hover effect for play again button
    playAgainButton.on("pointerover", () => playAgainButton.setColor("#66b3ff"))
    playAgainButton.on("pointerout", () =>
      playAgainButton.setColor(completed ? "#00ff00" : "#ff0000")
    )
  }
}

EndScene.prototype.shutdown = function (): void {
  // Clean up all game objects
  this.children.removeAll(true)

  // Remove all event listeners
  this.events.removeAllListeners()

  // Clear scene data
  this.sceneData = null
}

EndScene.prototype.cleanupAndDestroy = function (): void {
  // Call shutdown to clean up
  this.shutdown()

  // Call parent destroy
  BaseScene.prototype.cleanupAndDestroy.call(this)
}
