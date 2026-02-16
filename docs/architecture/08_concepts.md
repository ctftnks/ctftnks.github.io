# Cross-cutting Concepts

## Coordinate Systems

The game utilizes two primary coordinate systems:

1. **World Coordinates (Pixels)**: Used for precise positioning, movement, and collision detection of `GameObject` instances. (0,0) is the top-left of the canvas.
2. **Grid Coordinates (Tiles)**: The `GameMap` is divided into a grid. This is used for wall placement, pathfinding for bots, and spatial partitioning for collision optimization.

## Collision Detection

- **Tanks vs. Walls**: Calculated using rotated bounding box checks against the grid tiles.
- **Bullets vs. Tanks**: Calculated using point-in-rectangle checks.
- **Spatial Optimization**: To avoid O(N²) checks, the `GameMap` only checks collisions between objects in the same or adjacent grid cells.

## Asset Management

Assets (images and sounds) are centrally defined in `src/game/assets.ts`.

- **Sounds**: Triggered via the `playSound()` utility in `src/game/effects.ts`.
- **Sprites**: Loaded as `HTMLImageElement` and passed to the `draw()` methods of entities.

## UI Integration

The UI (Menus, HUD) is built with Vue.js and sits as an overlay on top of the `<canvas>` element. Communication between the Game Engine and the UI happens through a centralized `GameStore`.
