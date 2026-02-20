# ADR-001: Custom 2D Physics Engine

- **Status**: Accepted
- **Date**: 2018-02-05
- **Deciders**: Simon

## Context and Problem Statement

The game requires collision detection for tanks, bullets, and walls, along with basic physics for movement and rotation. Using a full-featured physics engine like Matter.js or P2.js might be overkill and introduce unnecessary complexity and bundle size.

## Decision Drivers

- **Simplicity**: The game logic is primarily grid-based with simple shapes (circles, rectangles).
- **Performance**: A lightweight, targeted implementation is more efficient than a general-purpose engine.
- **Control**: Complete control over collision responses (e.g., bullet bounces, tank wall sliding).

## Considered Options

1. **Third-party Physics Engine (Matter.js / P2.js)**: Robust but heavy.
2. **Custom Geometry Utils**: Implement targeted math for circle/rectangle and point/rectangle collisions.

## Decision Outcome

Chosen option: **Custom Geometry Utils** (formalized in `src/utils/geometry.ts`), because it provides exactly what is needed for the game's mechanics without the overhead of an external library.

### Consequences

- **Positive**: Zero external dependencies for physics, extremely fast execution, and easy to tweak specific behaviors.
- **Negative**: Requires manual implementation of more complex geometry or physics if needed in the future.
