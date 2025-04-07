import "phaser"
import { FolderGen } from "../utils/FolderGen"

export class ServerApp extends Phaser.GameObjects.Container {
  public static readonly WIDTH = 400
  public static readonly HEIGHT = 500
  public declare scene: Phaser.Scene
  private static readonly TARGET_FILE = "important-client-file.txt"

  private currentPath: string[] = []
  private folderStructure: any
  private pathText: Phaser.GameObjects.Text
  private contentContainer: Phaser.GameObjects.Container

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
    this.pathText = scene.add.text(10, 40, "/", {
      font: "14px monospace",
      color: "#ffffff",
    })
    this.add(this.pathText)

    // Create back button
    const backBtn = scene.add.sprite(10, 70, "back")
    backBtn.setOrigin(0)
    backBtn.setInteractive({ cursor: "pointer" })
    backBtn.on("pointerdown", () => this.navigateUp())
    backBtn.on("pointerover", () => backBtn.setTint(0xdddddd))
    backBtn.on("pointerout", () => backBtn.clearTint())
    this.add(backBtn)

    // Create content container
    this.contentContainer = scene.add.container(10, 100)
    this.add(this.contentContainer)

    // Add this container to the scene
    scene.add.existing(this)

    // Update display
    this.updateDisplay()
  }

  private updateDisplay(): void {
    // Destroy all existing content
    this.contentContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Container) {
        child.each((grandChild: Phaser.GameObjects.GameObject) =>
          grandChild.destroy()
        )
      }
      child.destroy()
    })
    this.contentContainer.removeAll()

    // Update path display
    this.pathText.setText("/" + this.currentPath.join("/"))

    // Get current folder
    let currentFolder = this.folderStructure
    for (const folder of this.currentPath) {
      currentFolder = currentFolder[folder]
    }

    // Display items
    let y = 0
    Object.entries(currentFolder).forEach(([name, isFolder]) => {
      const itemContainer = this.scene.add.container(0, y)

      // Create background for hover effect
      const bg = this.scene.add.rectangle(
        0,
        0,
        ServerApp.WIDTH - 20,
        32,
        0x2c3e50
      )
      bg.setOrigin(0)
      bg.setAlpha(0)

      const sprite = this.scene.add.sprite(0, 0, isFolder ? "folder" : "file")
      sprite.setOrigin(0)

      const text = this.scene.add.text(40, 8, name, {
        font: "14px monospace",
        color: "#ffffff",
      })

      itemContainer.add([bg, sprite, text])

      if (isFolder) {
        // Make both the sprite and background clickable for folders
        sprite.setInteractive({ cursor: "pointer" })
        sprite.on("pointerdown", () => this.navigateDown(name))
        sprite.on("pointerover", () => {
          bg.setAlpha(0.3)
          sprite.setTint(0xdddddd)
        })
        sprite.on("pointerout", () => {
          bg.setAlpha(0)
          sprite.clearTint()
        })

        bg.setInteractive({ cursor: "pointer" })
        bg.on("pointerdown", () => this.navigateDown(name))
        bg.on("pointerover", () => {
          bg.setAlpha(0.3)
          sprite.setTint(0xdddddd)
        })
        bg.on("pointerout", () => {
          bg.setAlpha(0)
          sprite.clearTint()
        })

        // Make the text clickable too
        text.setInteractive({ cursor: "pointer" })
        text.on("pointerdown", () => this.navigateDown(name))
        text.on("pointerover", () => {
          bg.setAlpha(0.3)
          sprite.setTint(0xdddddd)
        })
        text.on("pointerout", () => {
          bg.setAlpha(0)
          sprite.clearTint()
        })
      } else if (name === ServerApp.TARGET_FILE) {
        // Make target file clickable
        sprite.setInteractive({ cursor: "pointer" })
        sprite.on("pointerdown", () =>
          this.scene.scene.start("end", { success: true })
        )
        sprite.on("pointerover", () => {
          bg.setAlpha(0.3)
          sprite.setTint(0xdddddd)
        })
        sprite.on("pointerout", () => {
          bg.setAlpha(0)
          sprite.clearTint()
        })

        // Make text clickable too
        text.setInteractive({ cursor: "pointer" })
        text.on("pointerdown", () =>
          this.scene.scene.start("end", { success: true })
        )
        text.on("pointerover", () => {
          bg.setAlpha(0.3)
          sprite.setTint(0xdddddd)
        })
        text.on("pointerout", () => {
          bg.setAlpha(0)
          sprite.clearTint()
        })
      }

      this.contentContainer.add(itemContainer)
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
