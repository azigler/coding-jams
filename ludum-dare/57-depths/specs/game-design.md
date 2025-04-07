# Game Design Specification

## Core Loop

1. Player receives urgent email with file request
2. Player must navigate folder structure
3. Player finds file or time runs out
4. Game ends with success/failure message

## Game Rules

- **Time Limit**: 60 seconds
- **Victory Condition**: Find the specified file
- **Failure Condition**: Time runs out
- **Navigation**: Click to open folders/files
- **Backtracking**: "Back" button in file explorer

## Gameplay Elements

1. **Email Application**
   - Single email from boss
   - Contains file name to find
   - Stays open for reference

2. **Server Application**
   - Nested folder structure
   - Folders with silly names
   - File icons and names
   - Navigation breadcrumb

3. **Desktop Environment**
   - Two application windows
   - Clock showing remaining time
   - Simple window management

## Difficulty Design

- Target file is 5-8 folders deep
- Misleading folder names
- Similar file names to create confusion
- No search function (intentional)

## Progression

- Single level design
- Randomized folder structure
- Fixed time limit
- No difficulty scaling

## Feedback Systems

- Timer countdown
- Click sounds
- Success/failure jingles
- Simple window animations
