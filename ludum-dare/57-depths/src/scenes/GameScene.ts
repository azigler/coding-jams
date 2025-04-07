import { BaseScene } from "./BaseScene"
import { Desktop } from "../components/Desktop"

export const GameScene = BaseScene.create("game")

GameScene.prototype.create = function () {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  // Create desktop environment
  const desktop = new Desktop(this)
  this.add.existing(desktop)

  // Start game timer (60 seconds)
  const timerText = this.add.text(10, 10, "60", {
    font: "32px monospace",
    color: "#ffffff",
  })

  let timeLeft = 60
  this.time.addEvent({
    delay: 1000,
    callback: () => {
      timeLeft--
      timerText.setText(timeLeft.toString())

      if (timeLeft <= 0) {
        this.scene.start("end", { success: false })
      }
    },
    repeat: timeLeft - 1,
  })
}
