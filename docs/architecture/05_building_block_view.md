# Building Block View

## Level 1: White Box Overall System

The system is divided into three main layers, clearly separated by their responsibility and technology:

```mermaid
graph TD
    subgraph UI [Presentation Layer]
        Vue[Vue.js Components]
        Style[CSS / HUD]
    end

    subgraph State [Reactive Bridge]
        Store[(GameStore)]
        Settings[Settings Store]
    end

    subgraph Engine [Simulation Engine]
        Loop[Game Loop]
        Map[GameMap / Tiles]
        Physics[Geometry Utils]
    end

    subgraph Objects [Game Entities]
        Tanks[Tanks]
        Weapons[Weapons]
        Powerups[Powerups]
    end

    Vue <--> Store
    Store <--> Loop
    Loop --> Map
    Loop --> Objects
    Objects --> Physics

    %% Styling
    style UI fill:#e1f5fe,stroke:#01579b
    style State fill:#fff9c4,stroke:#fbc02d
    style Engine fill:#f1f8e9,stroke:#33691e
    style Objects fill:#f3e5f5,stroke:#4a148c
```

1.  **Presentation Layer (Blue)**: Purely visual. It reacts to changes in the Store and triggers commands (like "Start Game").
2.  **Reactive Bridge (Yellow)**: The single source of truth for the UI. It holds the "current state" of players and settings.
3.  **Simulation Engine (Green)**: The math-heavy core. It runs at a fixed frequency and drives the logic.
4.  **Game Entities (Purple)**: The "Actors" within the simulation. They hold the behavior for specific game elements.

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
- `Bot`: AI logic for controlling tanks via the `Autopilot` strategy.
