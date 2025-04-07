import { BootScene } from "./scenes/BootScene"
import { GameScene } from "./scenes/GameScene"
import { EndScene } from "./scenes/EndScene"

export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: process.env.DEBUG === "true",
      gravity: { y: 0 },
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: [BootScene, GameScene, EndScene],
  loader: {
    timeout: 10000,
  },
}
