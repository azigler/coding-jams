import { MailApp } from "./MailApp"
import { ServerApp } from "./ServerApp"

export class Desktop extends Phaser.GameObjects.Container {
  private mailApp: MailApp
  private serverApp: ServerApp

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)

    // Create desktop background
    const bg = scene.add.rectangle(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
      0x2c3e50
    )
    bg.setOrigin(0)
    this.add(bg)

    // Create applications
    this.mailApp = new MailApp(scene)
    this.serverApp = new ServerApp(scene)

    // Position windows
    this.mailApp.setPosition(50, 50)
    this.serverApp.setPosition(scene.scale.width / 2 + 50, 50)

    // Add to container
    this.add([this.mailApp, this.serverApp])

    // Make windows draggable
    this.makeWindowDraggable(this.mailApp)
    this.makeWindowDraggable(this.serverApp)
  }

  private makeWindowDraggable(window: Phaser.GameObjects.Container): void {
    window.setInteractive()
    this.scene.input.setDraggable(window)

    this.scene.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Container,
        dragX: number,
        dragY: number
      ) => {
        if (gameObject === window) {
          gameObject.x = dragX
          gameObject.y = dragY
        }
      }
    )
  }
}
