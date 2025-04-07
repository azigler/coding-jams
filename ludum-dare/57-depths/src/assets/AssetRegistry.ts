export const AssetRegistry = {
  sprites: {
    file: {
      path: "sprites/file.png",
      frameWidth: 32,
      frameHeight: 32,
    },
    folder: {
      path: "sprites/folder.png",
      frameWidth: 32,
      frameHeight: 32,
    },
    window: {
      path: "sprites/window.png",
      frameWidth: 32,
      frameHeight: 32,
    },
    back: {
      path: "sprites/back.png",
      frameWidth: 32,
      frameHeight: 32,
    },
  },
  audio: {
    sfx: {
      fail: "audio/sfx/fail.mp3",
      success: "audio/sfx/success.mp3",
      tick: "audio/sfx/tick.mp3",
      click: "audio/sfx/click.mp3",
    },
    music: {
      theme: "audio/music/theme.ogg",
    },
  },
  fonts: {
    default: "fonts/monospace.ttf",
  },
} as const

export type AssetKey = keyof typeof AssetRegistry
export type SpriteKey = keyof typeof AssetRegistry.sprites
export type AudioKey = keyof typeof AssetRegistry.audio.sfx
