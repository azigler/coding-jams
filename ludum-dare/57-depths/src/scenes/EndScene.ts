import { BaseScene } from "./BaseScene"

interface EndSceneData {
  success: boolean
}

export const EndScene = BaseScene.create("end")

EndScene.prototype.create = function (
  this: Phaser.Scene & { scene: { settings: { data: EndSceneData } } }
) {
  // Call parent create method
  BaseScene.prototype.create.call(this)

  const { success } = this.scene.settings.data

  // Display result message
  const message = success
    ? "YOU DID IT!\nCrisis averted! Boss is happy!\nThe client probably won't fire us now!"
    : "TIME'S UP!\nThe client left in anger!\nBoss is not impressed..."

  const text = this.add.text(400, 300, message, {
    font: "32px monospace",
    color: "#ffffff",
    align: "center",
  })
  text.setOrigin(0.5)

  // Play sound effect
  this.sound.play(success ? "success" : "fail")

  // Add restart button
  const button = this.add.text(400, 400, "Try Again", {
    font: "24px monospace",
    color: "#4a90e2",
  })
  button.setOrigin(0.5)
  button.setInteractive()
  button.on("pointerdown", () => {
    this.scene.start("game")
  })
}
