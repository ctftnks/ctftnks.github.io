# ADR-007: Migration to TypeScript

- **Status**: Accepted
- **Date**: 2026-01-02
- **Deciders**: Simon

## Context and Problem Statement

The project initially used vanilla JavaScript (ES6 modules). As the game logic became more complex (physics, collisions, state management), the lack of type safety led to more frequent runtime errors and harder refactorings.

## Decision Drivers

- **Type Safety**: Capture potential bugs at compile-time.
- **Maintainability**: Easier navigation and documentation of the codebase.
- **Refactoring**: Significant refactorings are much safer with a type system.

## Considered Options

1. **Vanilla JavaScript (ES6)**: No changes, stick with dynamic types.
2. **TypeScript**: Strongly typed superset of JavaScript.
3. **JSDoc (TS-Check)**: Use JSDoc comments for type-checking without the full TS build step.

## Decision Outcome

Chosen option: **TypeScript** (implemented in commit `64e1518`), because it provides the most robust type system and excellent IDE support, which is critical for a game with complex entity relationships and physics logic.

### Consequences

- **Positive**: More reliable code, easier to maintain, and better developer experience.
- **Negative**: Adds a build step and initial boilerplate for type definitions.
- **Integration**: Requires Vite to handle the TypeScript compilation (ADR-004).
