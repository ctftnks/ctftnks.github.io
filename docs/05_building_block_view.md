# 5. Building Block View

## 5.1 Whitebox Overall System

The system can be decomposed into three main layers:

1.  **UI Layer (Vue):** Handles menus, settings, and initializing the game.
2.  **Game Core:** Manages the simulation, state, and rules.
3.  **Rendering/IO:** Handles drawing to the canvas and capturing input.

### Level 1 Decomposition

- **`App.vue` / `main.ts`**: Entry point, bootstraps Vue and the Game.
- **`Game` Class (`src/game/game.ts`)**: The central hub. It holds the `GameMap`, `Player` list, and `GameObject` list. It orchestrates the loop.
- **`GameMap` (`src/game/gamemap.ts`)**: Represents the grid world. Contains `Tile`s.
- **`Entities` (`src/entities/`)**: Contains game objects like `Tank`, `Bullet`, `PowerUp`.
- **`Renderer` (`src/game/renderer.ts`)**: Pure class responsible for drawing entities onto the `Canvas`.
- **`Gamemode` (`src/game/gamemode.ts`)**: Abstract class defining rules for different modes (e.g., win conditions, scoring).

## 5.2 Important Components

### Game Class

- **Responsibilities:** Main loop, object management, collision resolution orchestration (high-level).
- **Collaborators:** `Canvas`, `GameMap`, `Renderer`, `Gamemode`.

### Tank Class

- **Responsibilities:** Movement physics, weapon handling, health management, AI hooks.
- **Inheritance:** Extends `GameObject`.

### Gamemode Class

- **Responsibilities:** Score tracking, respawn logic, match termination.
- **Subclasses:** `Deathmatch`, `CaptureTheFlag`, `TeamDeathmatch`, `KingOfTheHill`.
