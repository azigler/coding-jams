import "phaser"

// Ensure process.env.DEBUG is properly typed
declare const process: {
  env: {
    DEBUG: boolean
  }
}

export abstract class BaseScene extends Phaser.Scene {
  public declare add: Phaser.GameObjects.GameObjectFactory
  public declare scene: Phaser.Scenes.ScenePlugin
  public declare time: Phaser.Time.Clock
  public declare cameras: Phaser.Cameras.Scene2D.CameraManager
  public declare sound: Phaser.Sound.BaseSoundManager
  public declare load: Phaser.Loader.LoaderPlugin

  static create(key: string): typeof BaseScene {
    return class extends BaseScene {
      constructor() {
        super({ key })
      }
    }
  }

  init(_data?: any): void {
    // Optional data from previous scene
  }

  create(): void {
    if (process.env.DEBUG) {
      this.add.text(10, 10, this.scene.key, { color: "#fff" })
    }
  }
}
