import { PlaceholderAssets } from "../utils/PlaceholderAssets"

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "boot" })
  }

  async create(): Promise<void> {
    // Generate placeholder assets
    await PlaceholderAssets.generatePlaceholders(this)

    // Start the game
    this.scene.start("game")
  }
}
