# 6. Runtime View

## 6.1 Game Loop

The game operates on a tick-based system.

1.  **Input Processing:** Key presses are recorded.
2.  **Update (`step(dt)`)**:
    - Calculate `dt` (delta time).
    - Iterate through all `GameObject`s and call their `step()`.
    - **Physics:** Update positions based on velocity and `dt`.
    - **Collisions:** Check interactions (Tank vs Wall, Bullet vs Tank).
    - **Game Mode:** Check for win conditions or scoring events.
    - **AI:** Bots calculate their next move.
3.  **Render (`render()`)**:
    - Clear Canvas.
    - Draw Background/Map.
    - Iterate through all `GameObject`s and call `renderer.render(obj)`.
    - Draw Particles/Effects.

## 6.2 Scenario: Shooting a Bullet

1.  User presses 'Space'.
2.  `Tank.step()` detects fire input.
3.  `Tank` calls `Weapon.fire()`.
4.  `Weapon` creates a new `Bullet` instance at the tank's position.
5.  `Bullet` is added to `Game.objs` list.
6.  In subsequent frames, `Bullet.step()` updates its position.
7.  If `Bullet` hits a target, it triggers `GameEvent.TANK_KILLED` (if fatal) or applies damage.
