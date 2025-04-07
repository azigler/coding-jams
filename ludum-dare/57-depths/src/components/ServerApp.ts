import { FolderGen } from "../utils/FolderGen"

export class ServerApp extends Phaser.GameObjects.Container {
  private static readonly WIDTH = 400
  private static readonly HEIGHT = 500

  private currentPath: string[] = []
  private folderStructure: any

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)

    // Generate folder structure
    this.folderStructure = FolderGen.generate()

    // Create window background
    const bg = scene.add.rectangle(
      0,
      0,
      ServerApp.WIDTH,
      ServerApp.HEIGHT,
      0x34495e
    )
    bg.setOrigin(0)
    this.add(bg)

    // Create title bar
    const titleBg = scene.add.rectangle(0, 0, ServerApp.WIDTH, 30, 0x2c3e50)
    titleBg.setOrigin(0)
    const title = scene.add.text(10, 5, "Server", {
      font: "16px monospace",
      color: "#ffffff",
    })
    this.add([titleBg, title])

    // Create path display
    const pathText = scene.add.text(10, 40, "/", {
      font: "14px monospace",
      color: "#ffffff",
    })
    this.add(pathText)

    // Create back button
    const backBtn = scene.add.sprite(10, 70, "back")
    backBtn.setOrigin(0)
    backBtn.setInteractive()
    backBtn.on("pointerdown", () => this.navigateUp())
    this.add(backBtn)

    // Create content container
    const content = scene.add.container(10, 100)
    this.add(content)

    // Update display
    this.updateDisplay()
  }

  private updateDisplay(): void {
    // Clear current content
    const content = this.getAt(this.length - 1) as Phaser.GameObjects.Container
    content.removeAll()

    // Get current folder
    let currentFolder = this.folderStructure
    for (const folder of this.currentPath) {
      currentFolder = currentFolder[folder]
    }

    // Display items
    let y = 0
    Object.entries(currentFolder).forEach(([name, isFolder]) => {
      const sprite = this.scene.add.sprite(0, y, isFolder ? "folder" : "file")
      sprite.setOrigin(0)

      const text = this.scene.add.text(40, y + 8, name, {
        font: "14px monospace",
        color: "#ffffff",
      })

      if (isFolder) {
        sprite.setInteractive()
        sprite.on("pointerdown", () => this.navigateDown(name))
      }

      content.add([sprite, text])
      y += 40
    })
  }

  private navigateDown(folder: string): void {
    this.currentPath.push(folder)
    this.updateDisplay()
    this.scene.sound.play("click")
  }

  private navigateUp(): void {
    if (this.currentPath.length > 0) {
      this.currentPath.pop()
      this.updateDisplay()
      this.scene.sound.play("click")
    }
  }
}
