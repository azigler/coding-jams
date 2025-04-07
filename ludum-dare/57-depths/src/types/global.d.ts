declare namespace NodeJS {
  interface ProcessEnv {
    DEBUG?: string
  }
}

declare module "*.png" {
  const content: string
  export default content
}

declare module "*.mp3" {
  const content: string
  export default content
}

declare module "*.ogg" {
  const content: string
  export default content
}

declare module "*.ttf" {
  const content: string
  export default content
}
