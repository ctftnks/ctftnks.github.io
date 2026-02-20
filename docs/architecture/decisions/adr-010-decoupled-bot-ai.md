# ADR-010: Decoupled Bot AI (Autopilot Strategy)

- **Status**: Accepted
- **Date**: 2026-01-06
- **Deciders**: Simon

## Context and Problem Statement

Initially, bot logic (pathfinding, targeting, decision-making) might have been tightly coupled with the `Bot` or `Tank` class. This made the logic hard to reuse, difficult to test, and complicated the core entity code.

## Decision Drivers

- **Modularity**: Separation of AI behavior from entity logic.
- **Testability**: Independent testing of pathfinding and decision-making.
- **Extensibility**: Easier to add or swap different AI strategies.

## Considered Options

1. **Embedded AI**: Bot logic stays inside the `Bot` or `Tank` class.
2. **Autopilot Class (Strategy Pattern)**: A specialized class that handles AI decisions and provides inputs (up, down, left, right, fire).
3. **State Machine**: A more formal state machine for bot behavior.

## Decision Outcome

Chosen option: **Autopilot Class (Strategy Pattern)** (implemented in commit `1839288`), because it decouples the "brain" (decisions) from the "body" (actions) and allows for more sophisticated AI logic without cluttering the entity classes.

### Consequences

- **Positive**: Clean separation of concerns, easier bot testing, and improved AI behavior (e.g., pathfinding).
- **Negative**: Adds a layer of abstraction and requires careful interface design.
- **Integration**: Works with dependency injection (ADR-012) to access the game state.
