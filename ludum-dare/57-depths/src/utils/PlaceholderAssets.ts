export class PlaceholderAssets {
  static createColoredBox(
    scene: Phaser.Scene,
    width: number,
    height: number,
    color: number
  ): void {
    const rt = scene.add.renderTexture(0, 0, width, height)
    const graphics = scene.add.graphics()
    graphics.fillStyle(color)
    graphics.fillRect(0, 0, width, height)
    rt.draw(graphics)
    const textureKey = crypto.randomUUID()
    rt.saveTexture(textureKey)
    rt.destroy()
    graphics.destroy()
  }

  static createEmptyAudio(scene: Phaser.Scene, key: string): void {
    // Create a silent audio buffer
    const audioManager = scene.game.sound
    if (audioManager instanceof Phaser.Sound.WebAudioSoundManager) {
      const buffer = audioManager.context.createBuffer(1, 44100, 44100)
      const source = audioManager.context.createBufferSource()
      source.buffer = buffer

      // Add it to the cache
      scene.cache.audio.add(key, buffer)
    }
  }

  static generatePlaceholders(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      // Generate placeholder sprites
      const sprites = [
        { key: "file", color: 0x4a90e2 },
        { key: "folder", color: 0xf1c40f },
        { key: "window", color: 0x2ecc71 },
        { key: "back", color: 0xe74c3c },
      ]

      let loadedCount = 0
      const totalSprites = sprites.length

      sprites.forEach(({ key, color }) => {
        // Create a temporary canvas
        const canvas = document.createElement("canvas")
        canvas.width = 32
        canvas.height = 32
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`
          ctx.fillRect(0, 0, 32, 32)

          // Create an image from the canvas
          const image = new Image()
          image.onload = () => {
            scene.textures.addImage(key, image)
            loadedCount++
            if (loadedCount === totalSprites) {
              // Generate placeholder audio
              const audioKeys = ["fail", "success", "tick", "click"]
              audioKeys.forEach((key) => this.createEmptyAudio(scene, key))
              resolve()
            }
          }
          image.src = canvas.toDataURL()
        }
      })
    })
  }
}
