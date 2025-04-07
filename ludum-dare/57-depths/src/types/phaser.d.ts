/// <reference types="phaser" />

declare namespace Phaser {
  interface Scene {
    add: Phaser.GameObjects.GameObjectFactory
    cameras: Phaser.Cameras.Scene2D.CameraManager
    input: Phaser.Input.InputPlugin
    load: Phaser.Loader.LoaderPlugin
    make: Phaser.GameObjects.GameObjectCreator
    physics: Phaser.Physics.Arcade.ArcadePhysics
    scale: Phaser.Scale.ScaleManager
    sound: Phaser.Sound.BaseSoundManager
    sys: Phaser.Scenes.Systems
    time: Phaser.Time.Clock
    tweens: Phaser.Tweens.TweenManager
  }

  namespace GameObjects {
    interface Container extends Phaser.GameObjects.GameObject {
      add(
        child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]
      ): this
      getAt(index: number): Phaser.GameObjects.GameObject
      length: number
    }
  }
}

declare module "phaser" {
  export = Phaser
  export as namespace Phaser
}
