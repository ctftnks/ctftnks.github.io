# Runtime View

## The "Life of a Frame": A Story of a Tick

Instead of a simple list of steps, let's walk through what happens in the ~16.6 milliseconds of a single game frame:

1. **"What do they want to do?" (Input)**: We check the `Key` state for humans and let the `Autopilot` think for the bots. This sets the _intended_ velocity and rotation for every tank.
2. **"Where would they be?" (Physics Simulation)**: The engine calculates the next position. It checks: _"If this tank moves 5 pixels, does it hit a wall?"_ If yes, the custom physics engine slides the tank along the wall or stops it.
3. **"Did something die?" (Collision Resolution)**: We check if any bullet is close enough to a tank to trigger a `kill()`. If so, scores are updated in the `GameStore`, and the tank is scheduled for respawn.
4. **"Clean up the mess" (Maintenance)**: We remove bullets that have lived too long and particles that have faded out. We re-sort everything into the Grid Tiles so the next frame's physics checks are fast.
5. **"Paint the result" (Rendering)**: Finally, the engine tells the `Canvas`: _"Everyone is in their final position for this frame. Show the user."_ The canvas clears, draws the map, and then draws each object.

## Power-up Spawning

Power-ups are spawned at random intervals by the `Game` controller at valid (empty) map locations, ensuring the game state remains dynamic.
