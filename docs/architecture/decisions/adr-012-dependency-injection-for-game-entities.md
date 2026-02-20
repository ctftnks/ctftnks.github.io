# ADR-012: Dependency Injection for Game Entities

- **Status**: Accepted
- **Date**: 2026-01-08
- **Deciders**: Simon

## Context and Problem Statement

Initially, game entities might have relied on global variables or circular imports to access the game state (e.g., finding the closest target, spawning bullets). This led to fragile code and difficulties in testing and isolation.

## Decision Drivers

- **Testability**: Easier to mock the game instance for unit tests.
- **Modularity**: Entities are more self-contained and don't depend on global state.
- **Maintainability**: Reduced circular dependencies and cleaner structure.

## Considered Options

1. **Global Game Instance**: Use a global `window.game` or equivalent.
2. **Circular Imports**: Each entity imports `game.ts` and vice versa.
3. **Dependency Injection**: Pass the `Game` instance to the entity via constructor or a specialized method.

## Decision Outcome

Chosen option: **Dependency Injection** (implemented in commit `79531a9`), because it decouples entities from the global game state and makes them significantly easier to test and reason about in isolation.

### Consequences

- **Positive**: More robust entity management, better testability, and less fragile code.
- **Negative**: Increased complexity in entity creation and more parameters in constructors.
- **Integration**: Essential for the unit testing strategy (ADR-005).
