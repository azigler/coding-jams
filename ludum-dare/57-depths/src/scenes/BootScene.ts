import { BaseScene } from "./BaseScene"
import { AssetRegistry } from "../assets/AssetRegistry"

export const BootScene = BaseScene.create("boot")

BootScene.prototype.preload = function () {
  // Show loading progress
  const progressBar = this.add.graphics()
  const progressBox = this.add.graphics()
  progressBox.fillStyle(0x222222, 0.8)
  progressBox.fillRect(240, 270, 320, 50)

  const width = this.cameras.main.width
  const height = this.cameras.main.height
  const loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
    font: "20px monospace",
    color: "#ffffff",
  })
  loadingText.setOrigin(0.5, 0.5)

  // Loading progress events
  this.load.on("progress", (value: number) => {
    progressBar.clear()
    progressBar.fillStyle(0xffffff, 1)
    progressBar.fillRect(250, 280, 300 * value, 30)
  })

  this.load.on("complete", () => {
    progressBar.destroy()
    progressBox.destroy()
    loadingText.destroy()
    this.scene.start("game")
  })

  // Load assets
  Object.entries(AssetRegistry.sprites).forEach(([key, asset]) => {
    this.load.image(key, asset.path)
  })

  Object.entries(AssetRegistry.audio.sfx).forEach(([key, path]) => {
    this.load.audio(key, path)
  })
}
