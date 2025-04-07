# Technical Specification

## Development Stack

- **Runtime**: Bun 1.0+
- **Framework**: Phaser 3.60+
- **Build Tool**: Vite 5.0+
- **Language**: TypeScript 5.0+

## Project Structure

```plaintext
src/
  scenes/
    BootScene.ts     # Asset loading and game initialization
    GameScene.ts     # Main gameplay scene
    EndScene.ts      # Win/lose screen
  components/
    Desktop.ts       # Desktop environment
    MailApp.ts       # Email application
    ServerApp.ts     # File server application
  utils/
    FolderGen.ts     # Folder structure generator
  assets/
    sprites/         # UI elements and icons
    audio/           # Sound effects
  config.ts          # Game configuration
  main.ts           # Entry point
```

## Core Systems

1. **Scene Management**
   - Minimal scene transitions
   - Single game scene with overlays
   - Simple state persistence

2. **Input Handling**
   - Mouse-only interaction
   - Click and double-click support
   - Basic drag support for windows

3. **UI System**
   - Window management
   - Folder navigation
   - Simple animations

4. **Asset Loading**
   - On-demand asset loading
   - Minimal preloading
   - Basic progress tracking

## Performance Considerations

- Limit folder depth to 10 levels
- Maximum 50 items per folder
- Simple sprite-based UI
- Minimal particle effects
