export const AssetRegistry = {
  sprites: {
    // UI elements
    window: {
      path: "sprites/window.png",
    },
    folder: {
      path: "sprites/folder.png",
    },
    file: {
      path: "sprites/file.png",
    },
    back: {
      path: "sprites/back.png",
    },
  },
  audio: {
    sfx: {
      click: "audio/sfx/click.mp3",
      success: "audio/sfx/success.mp3",
      fail: "audio/sfx/fail.mp3",
      tick: "audio/sfx/tick.mp3",
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
export type AudioKey =
  | keyof typeof AssetRegistry.audio.sfx
  | keyof typeof AssetRegistry.audio.music
