# Assets Specification

## Visual Assets

1. **Icons**
   - Folder icon (32x32px)
   - File icon (32x32px)
   - Mail icon (32x32px)
   - Server icon (32x32px)
   - Back button (24x24px)

2. **Window Elements**
   - Window frame (9-slice)
   - Minimize/maximize buttons
   - Window title bar
   - Scrollbar elements

3. **UI Elements**
   - Clock display
   - Selection highlight
   - Hover effect overlay
   - Success/failure screens

## Audio Assets

1. **Interface Sounds**
   - Click feedback (< 100ms)
   - Window drag start/end
   - Folder open/close
   - Error beep

2. **Game Sounds**
   - Timer tick (last 10 seconds)
   - Success jingle (2s)
   - Failure sound (1s)
   - Background ambience

## Asset Style

1. **Visual Theme**
   - Retro computer interface
   - Simple pixel art style
   - Limited color palette
   - Clear silhouettes

2. **Audio Theme**
   - 8-bit style sounds
   - Short, punchy effects
   - Clear feedback
   - Non-intrusive volume

## Asset Organization

```plaintext
assets/
  sprites/
    icons/        # Game icons
    windows/      # Window elements
    ui/           # Interface elements
  audio/
    sfx/         # Sound effects
    ambient/     # Background sounds
```

## Technical Requirements

- PNG format for sprites
- WebM format for audio
- Maximum 32x32 for icons
- 9-slice for windows (3px border)
