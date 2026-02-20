# Risks and Technical Debt

This section acknowledges known limitations and potential future challenges.

## Technical Risks

- **Physics Tunneling**: At very high speeds (e.g., high `BotSpeed` or fast bullets), objects might "tunnel" through thin walls because the collision check is discrete per frame.
  - _Mitigation_: Cap maximum speeds; use smaller `DT` if necessary; consider raycasting for bullets.
- **AI Performance**: If many bots are added to a very large map, the BFS/Dijkstra pathfinding might impact the frame budget.
  - _Mitigation_: Cache pathfinding results; use a tiered "thinking" interval (implemented in `Autopilot.timeSinceLastUpdate`).
- **Browser Resource Limits**: Playing many sounds or rendering complex effects (smoke particles) can lead to audio stuttering or frame drops in some browsers.
  - _Mitigation_: Object pooling for particles; limit concurrent sound channels.

## Technical Debt

- **Legacy Type Casts**: Some parts of the engine still use `any` or explicit casts after the JS -> TS migration.
  - _Impact_: Reduced type safety and harder refactoring.
  - _Planned Action_: Gradually refine types and interfaces to eliminate `as any`.
- **Inheritance Depth**: The reliance on deep inheritance (`GameObject` -> `Tank`) can make behavior overrides complex.
  - _Impact_: High coupling between base classes and subclasses.
  - _Planned Action_: Consider moving towards more composition for specific capabilities in the future.
- **Grid Limitations**: The AI pathfinding is strictly tied to the tile grid, making it difficult for bots to navigate around dynamic obstacles (like other tanks) within a tile.
  - _Impact_: Less "intelligent" bot movement in crowded areas.
  - _Planned Action_: Enhance the `Autopilot` logic with local steering behaviors (Boids/Avoidance).
- **Missing Multiplayer**: The local-only architecture makes adding real-time online multiplayer a significant future refactoring effort.
  - _Impact_: Project is limited to local-play and bots.
  - _Planned Action_: Acknowledge as a current project scope limitation.
