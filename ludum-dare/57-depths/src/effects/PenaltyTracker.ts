import "phaser"
import { ScreenEffects } from "./ScreenEffects"
import { PopupManager } from "./PopupManager"

interface PenaltyConfig {
  timePenalty: number
  shakeIntensity: number
  messageColor: number
  message: string
}

export class PenaltyTracker {
  private static readonly PENALTY_LEVELS: PenaltyConfig[] = [
    {
      timePenalty: 2,
      shakeIntensity: 0.3,
      messageColor: 0xffa500,
      message: "Wrong folder! -2 seconds",
    },
    {
      timePenalty: 3,
      shakeIntensity: 0.5,
      messageColor: 0xff6b6b,
      message: "Getting warmer... -3 seconds",
    },
    {
      timePenalty: 5,
      shakeIntensity: 0.7,
      messageColor: 0xff0000,
      message: "Boss is watching! -5 seconds",
    },
    {
      timePenalty: 7,
      shakeIntensity: 1.0,
      messageColor: 0xff0000,
      message: "Client is furious! -7 seconds",
    },
  ]

  private scene: Phaser.Scene
  private mistakeCount: number = 0
  private timeRemaining: number
  private lastUpdateTime: number

  constructor(scene: Phaser.Scene, initialTime: number) {
    this.scene = scene
    this.timeRemaining = initialTime
    this.lastUpdateTime = scene.time.now
  }

  update(): void {
    const currentTime = this.scene.time.now
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000 // Convert to seconds
    this.lastUpdateTime = currentTime

    // Update time remaining
    this.timeRemaining = Math.max(0, this.timeRemaining - deltaTime)

    // End game if time runs out
    if (this.timeRemaining <= 0) {
      this.scene.scene.start("end", { success: false })
    }
  }

  trackMistake(): void {
    this.mistakeCount++
    this.applyEffects()
  }

  private applyEffects(): void {
    // Get penalty level based on mistake count
    const level = Math.min(
      this.mistakeCount - 1,
      PenaltyTracker.PENALTY_LEVELS.length - 1
    )
    const penalty = PenaltyTracker.PENALTY_LEVELS[level]

    // Apply time penalty
    this.timeRemaining = Math.max(0, this.timeRemaining - penalty.timePenalty)

    // Apply visual effects
    ScreenEffects.shake(this.scene, penalty.shakeIntensity)
    ScreenEffects.flash(this.scene, penalty.messageColor)
    ScreenEffects.dim(this.scene, 0.3)

    // Show popup
    PopupManager.show(this.scene, {
      text: penalty.message,
      color: penalty.messageColor,
      duration: 1500,
    })

    // Play sound effect
    this.scene.sound.play("error", {
      volume: 0.3 + penalty.shakeIntensity * 0.7,
    })

    // End game if time runs out
    if (this.timeRemaining <= 0) {
      this.scene.scene.start("end", { success: false })
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining
  }

  getMistakeCount(): number {
    return this.mistakeCount
  }
}
