# 8. Cross-cutting Concepts

## 8.1 Event Handling

The system uses an `EventBus` (`src/game/events.ts`) to decouple disparate parts of the system.

- **Usage:** Used for notifying the UI of game state changes (e.g., score updates, game over) or Game Modes of specific events (e.g., `TANK_KILLED`).

## 8.2 Asset Management

Assets (images, sounds) are managed via `src/game/assets.ts`.

- **Loading:** Assets are typically loaded on startup or lazily.
- **Access:** Global constants or singletons provide access to resources like `SOUNDS`.

## 8.3 Coordinate System

- **World Coordinates:** Floating point numbers representing position in pixels (or logical units).
- **Grid Coordinates:** Integer indices `(i, j)` for the `GameMap` tiles.
- Conversion methods exist to map between World `(x, y)` and Grid `(i, j)`.

## 8.4 Persistence

- `Settings` store uses `localStorage` to persist user preferences (volume, keybinds) across sessions.
