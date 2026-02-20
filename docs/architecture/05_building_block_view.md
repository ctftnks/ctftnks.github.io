# Building Block View

## Level 1: White Box Overall System

The system is divided into three main layers:

```mermaid
graph TD
UI[UI Layer: Vue.js]
    Engine[Game Engine]
    Entities[Game Entities/Objects]
    Store[(GameStore)]

UI <--> Store
    Store <--> Engine
    Engine --> Entities
    Entities --> Engine
```

1. **UI Layer (Vue.js)**: Manages menus, settings, and the game HUD.
2. **Game Engine (TS)**: Manages the game loop, map generation, and collision detection.
3. **Game Entities/Objects (TS)**: Defines the behavior of Tanks, Bullets, Power-ups, and Weapons.

### Key Components

```mermaid
classDiagram
    class Game {
        +players: Player[]
        +objs: GameObject[]
        +map: GameMap
        +loop()
    }
    class Player {
        +tank: Tank
        +team: Team
    }
    class Tank {
        +weapon: Weapon
        +player: Player
    }
    class GameObject {
        +x, y: number
        +draw()
    }

    Game "1" *-- "many" Player
    Game "1" *-- "1" GameMap
    Player "1" *-- "1" Tank
    Tank --|> GameObject
    Game "1" *-- "many" GameObject
```

- `Game`: The central controller for a match.
- `GameMap`: Handles the grid, tiles, and spatial partitioning for objects.
- `Tank`: The primary actor, composed of a `Weapon` and controlled by a `Player` (Human or Bot).
- `Bot`: AI logic for controlling tanks.
