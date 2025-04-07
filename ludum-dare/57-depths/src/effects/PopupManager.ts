import "phaser"

export interface PopupOptions {
  title?: string
  text: string
  duration?: number
  color?: number
  width?: number
  height?: number
  x?: number
  y?: number
}

export class PopupManager {
  static show(
    scene: Phaser.Scene,
    options: PopupOptions
  ): Phaser.GameObjects.Container {
    const {
      title,
      text,
      duration = 2000,
      color = 0xff0000,
      width = 300,
      height = 150,
      x = scene.scale.width / 2,
      y = scene.scale.height / 2,
    } = options

    // Create container
    const popup = scene.add.container(x, y)
    popup.setDepth(1001) // Above screen effects

    // Add background
    const bg = scene.add.rectangle(0, 0, width, height, 0x000000, 0.9)
    bg.setStrokeStyle(2, color)
    popup.add(bg)

    // Add title if provided
    if (title) {
      const titleText = scene.add.text(0, -height / 2 + 20, title, {
        font: "bold 20px monospace",
        color: "#ffffff",
        align: "center",
      })
      titleText.setOrigin(0.5)
      popup.add(titleText)
    }

    // Add message
    const message = scene.add.text(0, 0, text, {
      font: "16px monospace",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: width - 40 },
    })
    message.setOrigin(0.5)
    popup.add(message)

    // Add close button
    const closeBtn = scene.add.text(width / 2 - 30, -height / 2 + 10, "×", {
      font: "bold 24px monospace",
      color: "#ffffff",
    })
    closeBtn.setInteractive({ cursor: "pointer" })
    closeBtn.on("pointerdown", () => {
      scene.tweens.add({
        targets: popup,
        alpha: 0,
        y: y - 50,
        duration: 200,
        onComplete: () => popup.destroy(),
      })
    })
    popup.add(closeBtn)

    // Animate in
    popup.setAlpha(0)
    popup.y += 50
    scene.tweens.add({
      targets: popup,
      alpha: 1,
      y: y,
      duration: 200,
    })

    // Auto close after duration if specified
    if (duration > 0) {
      scene.time.delayedCall(duration, () => {
        if (popup.active) {
          scene.tweens.add({
            targets: popup,
            alpha: 0,
            y: y - 50,
            duration: 200,
            onComplete: () => popup.destroy(),
          })
        }
      })
    }

    return popup
  }
}
