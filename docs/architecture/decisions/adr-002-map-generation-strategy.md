# ADR-002: Map Generation Strategy: Maze Algorithms & Dijkstra Maps

- **Status**: Accepted
- **Date**: 2018-02-06
- **Deciders**: Simon

## Context and Problem Statement

The game requires diverse and balanced maps that support tactical movement and strategic placement of objectives (bases, flags). Manually designing maps is time-consuming and limits variety. We need a way to generate maps procedurally while ensuring they are playable and fair.

## Decision Drivers

- **Variety**: Support for different map styles (mazes, open spaces, corridors).
- **Playability**: Ensure all parts of the map are reachable and objectives are well-placed. Avoid maps that are "too tight" or frustratingly complex.
- **Performance**: Generation must be fast enough to happen at the start of each round.

## Considered Options

1. **Static Maps**: Hand-crafted maps stored as data.
2. **Procedural Generation (Prim's Algorithm)**: Creates perfect mazes (every point reachable, no loops).
3. **Procedural Generation (Recursive Division)**: Creates room-like structures with corridors.
4. **Porous Recursive Division**: A variation of recursive division that creates more holes in the walls, leading to more open and tactical maps.
5. **Dijkstra Maps (BFS)**: Used for objective placement (e.g., finding the furthest spawn point).

## Decision Outcome

Chosen option: **Hybrid Procedural Generation** (implemented in `src/game/mapGenerator.ts` and `src/game/gamemap.ts`). While several algorithms were implemented (including Prim's for perfect mazes), the **Porous Recursive Division** was selected as the default for the game (as seen in `src/game/game.ts`). It provides a better balance between interesting structures and fluid gameplay. Strategic objective placement (like bases and flags) is handled using **BFS-based Dijkstra maps**.

### Consequences

- **Positive**: High replayability due to unique maps, guaranteed reachability, and balanced objective placement.
- **Positive**: Porous Recursive Division prevents the game from becoming a "perfect maze" simulator, allowing for more dynamic combat.
- **Negative**: Procedural generation can occasionally produce maps that feel repetitive or have awkward bottlenecks despite the "porous" nature.
