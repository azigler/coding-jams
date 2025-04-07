import "phaser"

export class ScreenEffects {
  static shake(scene: Phaser.Scene, intensity = 0.5): void {
    scene.cameras.main.shake(250 * intensity)
  }

  static flash(scene: Phaser.Scene, color = 0xff0000): void {
    scene.cameras.main.flash(
      250,
      color >> 16,
      (color >> 8) & 0xff,
      color & 0xff
    )
  }

  static dim(scene: Phaser.Scene, intensity = 0.5): void {
    const overlay = scene.add.rectangle(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      intensity
    )
    overlay.setOrigin(0)
    overlay.setDepth(1000)

    scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 500,
      onComplete: () => overlay.destroy(),
    })
  }
}
