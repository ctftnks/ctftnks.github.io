# ADR-009: Inheritance-based Entity Hierarchy

- **Status**: Accepted
- **Date**: 2026-01-04
- **Deciders**: Simon

## Context and Problem Statement

The game features multiple types of entities (tanks, bullets, powerups, weapons). We need a consistent way to manage their common attributes (position, velocity, drawing) and unique behaviors.

## Decision Drivers

- **Modularity**: Separation of entity logic into reusable base classes.
- **Type Safety**: Leveraging TypeScript's class system for clear hierarchies.
- **Simplicity**: For a project of this scale, inheritance is more intuitive than a full ECS (Entity Component System).

## Considered Options

1. **Entity Component System (ECS)**: Composition-based, highly flexible, but can be overly complex for smaller games.
2. **Inheritance (Classes)**: Traditional OOP approach with base classes like `GameObject`, `Weapon`, and `Powerup`.
3. **Flat Structures**: Manage entities as simple data objects with a central processing logic.

## Decision Outcome

Chosen option: **Inheritance (Classes)** (implemented in commit `e8e3a80`), because it provides a clear and intuitive structure for the game's entities, matching the project's complexity and development style.

### Consequences

- **Positive**: Easy to implement and reason about, good IDE support for methods and attributes.
- **Negative**: Deep inheritance hierarchies can sometimes become brittle (mitigated by using separate hierarchies for `Weapon`, `Powerup`, and `GameObject`).
