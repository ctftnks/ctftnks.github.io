# Runtime View

## Game Loop (The "Tick")

The game operates on a fixed-step update loop followed by a variable-rate render call:

1. **Input Processing**: `Player` objects (Human or Bot) update their intended actions (steering, shooting).
2. **Physics & Movement**:
   - `Tank` objects update their position based on speed and angle.
   - Collision detection is checked against `GameMap` tiles and other `GameObject` instances.
3. **Entity Logic**:
   - `Bullet` trajectories are calculated.
   - `PowerUp` timers and effects are updated.
   - `Smoke` and other particle effects are stepped.
4. **Spatial Partitioning**: Objects are re-indexed in the `GameMap` grid to ensure efficient collision checks for the next frame.
5. **Rendering**: The `Canvas` manager clears the screen and calls `draw()` on the map and all active game objects.

## Power-up Spawning

Power-ups are spawned at random intervals by the `Game` controller at valid (empty) map locations, ensuring the game state remains dynamic.
