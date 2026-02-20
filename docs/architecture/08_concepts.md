# Cross-cutting Concepts

## Coordinate Systems

The game utilizes two primary coordinate systems:

1. **World Coordinates (Pixels)**: Used for precise positioning, movement, and collision detection of `GameObject` instances. (0,0) is the top-left of the canvas.
2. **Grid Coordinates (Tiles)**: The `GameMap` is divided into a grid. This is used for wall placement, pathfinding for bots, and spatial partitioning for collision optimization.

## Scaling and Resizing

The game world is designed for a target coordinate space but resizes dynamically to fit the browser window:

- **Virtual Canvas**: The internal coordinate system remains consistent regardless of window size.
- **Scaling Factor**: The `Canvas` manager calculates a `scale` factor during window resize events, ensuring that the game world is always fully visible while maintaining aspect ratio.
- **Input Scaling**: Mouse and touch inputs are scaled back to world coordinates before being processed.

## Collision Detection

- **Tanks vs. Walls**: Calculated using rotated bounding box checks against the grid tiles (ADR-001).
- **Bullets vs. Tanks**: Calculated using point-in-rectangle checks.
- **Spatial Optimization**: To avoid O(N²) checks, the `GameMap` uses **Grid-based Spatial Partitioning** (ADR-014), only checking objects in the same or adjacent tiles.

## Weapon and Power-up Hierarchy

To ensure the game is easy to extend, we use an **Inheritance-based Entity Hierarchy** (ADR-009):

- **`Weapon`**: Base class defining shooting logic, ammo management, and bot behavior hints (`shootingRange`, `fleeingDuration`).
- **`Powerup`**: Base class for all collectible items. It handles the collection logic and spawning, while subclasses (like `SpeedBonus` or `WeaponBonus`) implement the specific effect.
- **Registration**: New weapons and power-ups only need to be added to their respective `index.ts` files to be available in the game's spawning logic.

## Bot AI (Autopilot Strategy)

Bot behavior is managed by the `Autopilot` class (ADR-010), which uses a **Weight-based Decision System**:

1.  **Sense**: The bot scans the map (using BFS/Dijkstra) for nearby enemies, flags, and power-ups.
2.  **Evaluate**: Each possible action (flee, follow enemy, get flag, grab power-up) is assigned a weight based on the current state and game mode.
3.  **Act**: The action with the highest weight is selected, and a target coordinate (`goto`) is set for the tank's steering logic.

## Asset Management

Assets (images and sounds) are centrally defined in `src/game/assets.ts` (ADR-006).

- **Sounds**: Triggered via the `playSound()` utility in `src/game/effects.ts`.
- **Sprites**: Loaded as `HTMLImageElement` and passed to the `draw()` methods of entities.

## UI Integration

The UI (Menus, HUD) is built with Vue.js (ADR-008) and sits as an overlay on top of the `<canvas>` (ADR-013) element. Communication between the Game Engine and the UI happens through a centralized `GameStore` (ADR-003).
