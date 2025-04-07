import { BaseScene } from "./BaseScene"
import { LevelManager } from "../managers/LevelManager"

interface EndSceneData {
  success: boolean
  completed?: boolean
}

export class EndScene extends BaseScene {
  private sceneData: EndSceneData | null = null
  private levelManager: LevelManager | null = null

  init(data: EndSceneData): void {
    this.sceneData = data
    this.levelManager = new LevelManager(this)
  }

  create(): void {
    const { width, height } = this.scale

    const message = this.sceneData?.success
      ? this.sceneData.completed
        ? "Congratulations! You've completed all levels!"
        : "Level Complete!"
      : "Level Failed!"

    this.add
      .text(width / 2, height / 2 - 50, message, {
        fontSize: "32px",
        color: this.sceneData?.success ? "#00ff00" : "#ff0000",
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

  shutdown(): void {
    // Clean up all game objects and event listeners
    this.children.removeAll(true)
    this.events.removeAllListeners()
    this.sceneData = null
    this.levelManager = null
  }
}
