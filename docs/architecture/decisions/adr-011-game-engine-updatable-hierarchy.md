# ADR-011: Game Engine: Updatable Hierarchy & Frame-Rate Independence

- **Status**: Accepted
- **Date**: 2026-01-07
- **Deciders**: Simon

## Context and Problem Statement

The initial game engine used simple loops and manual updates for each entity type. This made it difficult to manage complex lifetimes and ensure consistent behavior across different frame rates (Hz).

## Decision Drivers

- **Structure**: Consistent interface for all objects that need to be updated.
- **Consistency**: Game physics should behave the same regardless of frame rate (Delta Time).
- **Efficiency**: Centralized management of object lifetimes and cleanup.

## Considered Options

1. **Explicit Entity Updates**: Each entity type has its own update loop in `game.ts`.
2. **Updatable Base Class & Delta Time (dt)**: All entities extend `Updatable` and receive `dt` in their `step()` method.
3. **Reactive Game State**: Use Vue's reactivity system for all game updates.

## Decision Outcome

Chosen option: **Updatable Base Class & Delta Time (dt)** (implemented in commits `0b1c072`, `7b89c28`, and `dcdfbce`), because it provides a scalable way to manage entities and ensures frame-rate independence by injecting the time elapsed since the last frame into the physics logic.

### Consequences

- **Positive**: More predictable physics, easier entity lifecycle management, and a cleaner game loop.
- **Negative**: Requires careful passing of `dt` through all update methods.
- **Integration**: Works in tandem with dependency injection (ADR-012).
