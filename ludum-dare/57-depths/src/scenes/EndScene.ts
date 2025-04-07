import { BaseScene } from "./BaseScene"
import { LevelManager } from "../managers/LevelManager"

interface EndSceneData {
  success: boolean
  completed?: boolean
  finalScore?: number
}

export const EndScene = BaseScene.create("end")

EndScene.prototype.init = function (data: EndSceneData): void {
  // Call parent init method to handle cleanup
  BaseScene.prototype.init.call(this, data)
  this.sceneData = data
  this.levelManager = new LevelManager(this)
}

EndScene.prototype.create = function (
  this: Phaser.Scene & {
    sceneData: EndSceneData
    levelManager: LevelManager | null
  }
) {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  const { width, height } = this.scale

  const message = this.sceneData?.success
    ? this.sceneData.completed
      ? `Congratulations!\nYou've mastered all ${this.sceneData.finalScore} levels!\nYou're promoted to Senior File Finder!`
      : "Level Complete!"
    : "Level Failed!"

  this.add
    .text(width / 2, height / 2 - 50, message, {
      fontSize: "32px",
      color: this.sceneData?.success ? "#00ff00" : "#ff0000",
      align: "center",
    })
    .setOrigin(0.5)

  if (this.sceneData?.success && !this.sceneData?.completed) {
    const nextButton = this.add
      .text(width / 2, height / 2 + 50, "Next Level", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    nextButton.on("pointerdown", () => {
      nextButton.removeInteractive()
      this.levelManager?.nextLevel()
    })
  } else {
    const restartButton = this.add
      .text(
        width / 2,
        height / 2 + 50,
        this.sceneData?.completed ? "Play Again" : "Try Again",
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    restartButton.on("pointerdown", () => {
      restartButton.removeInteractive()
      this.levelManager?.resetGame()
    })
  }
}

EndScene.prototype.shutdown = function (): void {
  // Clean up all game objects and event listeners
  this.children.removeAll(true)
  this.events.removeAllListeners()
  this.sceneData = null
  this.levelManager = null
}
