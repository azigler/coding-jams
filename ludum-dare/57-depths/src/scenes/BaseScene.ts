export abstract class BaseScene extends Phaser.Scene {
  static create(key: string): typeof BaseScene {
    return class extends BaseScene {
      constructor() {
        super({ key })
      }
    }
  }

  init(data?: any): void {
    // Optional data from previous scene
  }

  create(): void {
    if (process.env.DEBUG) {
      this.add.text(10, 10, this.scene.key, { color: "#fff" })
    }
  }
}
