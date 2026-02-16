# Adding New Power-ups

Power-ups are items that spawn on the map and provide bonuses to tanks.

1. **Create the Bonus Class**: Create a new file in `src/entities/powerups/`.
2. **Inherit from PowerUp**: Use the `PowerUp` base class.
3. **Define Effect**: Implement what happens when a tank collects the item.
4. **Register**: Add to `src/entities/powerups/index.ts` so it can be spawned by the `Game` instance.
