import { BaseScene } from "./BaseScene"
import { Desktop } from "../components/Desktop"
import { PenaltyTracker } from "../effects/PenaltyTracker"

export const GameScene = BaseScene.create("game")

GameScene.prototype.create = function () {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  // Create desktop environment
  const desktop = new Desktop(this)
  this.add.existing(desktop)

  // Initialize penalty tracker with 60 seconds
  const penaltyTracker = new PenaltyTracker(this, 60)

  // Create timer display
  const timerText = this.add.text(10, 10, "60", {
    font: "32px monospace",
    color: "#ffffff",
  })

  // Update timer every frame
  this.events.on("update", () => {
    penaltyTracker.update()
    const timeLeft = penaltyTracker.getTimeRemaining()
    timerText.setText(Math.ceil(timeLeft).toString())

    // Flash red when low on time
    if (timeLeft <= 10) {
      timerText.setColor("#ff0000")
    }
  })

  // Share penalty tracker with desktop for wrong clicks
  desktop.setPenaltyTracker(penaltyTracker)
}
