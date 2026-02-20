# ADR-014: Grid-based Spatial Partitioning

- **Status**: Accepted
- **Date**: 2026-01-11
- **Deciders**: Simon

## Context and Problem Statement

As the number of game objects (tanks, bullets, powerups, effects) grows, collision detection becomes more expensive. Each object would potentially have to check against every other object (O(n²)).

## Decision Drivers

- **Performance**: Ability to handle many dynamic objects without frame drops.
- **Simplicity**: Easy to implement for a grid-based map.
- **Efficiency**: Only check collisions for objects in the same or neighboring tiles.

## Considered Options

1. **Brute Force Collision Detection (O(n²))**: Check every object against every other object.
2. **Grid-based Spatial Partitioning**: Divide the map into tiles (`Nx * Ny`) and store objects in their respective tiles.
3. **Quadtrees**: A more sophisticated tree-based spatial partitioning.

## Decision Outcome

Chosen option: **Grid-based Spatial Partitioning** (see e.g. commit `5cd68e4`), because it's a natural fit for the game's grid-based map design and provides the necessary performance optimization for collision detection.

### Consequences

- **Positive**: Significantly reduced collision detection overhead, easier object lookups, and improved map generation performance.
- **Negative**: Adds some complexity to object movement logic (must update tile references).
