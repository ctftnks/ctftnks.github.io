# ADR-005: Testing Strategy with Vitest

- **Status**: Accepted
- **Date**: 2025-12-30
- **Deciders**: Simon

## Context and Problem Statement

As the game's logic grew more complex (physics, collisions, state management), manual testing became insufficient. A structured unit testing approach was needed to ensure the reliability and correctness of the game engine.

## Decision Drivers

- **Speed**: Fast test execution for rapid development.
- **Integration**: Must work seamlessly with Vite (ADR-004) and TypeScript (ADR-007).
- **Features**: Built-in support for mocking, coverage, and assertion libraries.

## Considered Options

1. **Jest**: Popular but potentially slower and more complex to integrate with Vite.
2. **Mocha/Chai**: Traditional but requires more configuration.
3. **Vitest**: Modern testing framework built on Vite.

## Decision Outcome

Chosen option: **Vitest** (implemented in commit `88ead1b`), because it provides a near-zero configuration for Vite-based projects and offers excellent performance and developer experience.

### Consequences

- **Positive**: Extremely fast tests, easy mocking, and built-in coverage reporting.
- **Negative**: Adds a dependency and requires writing/maintaining test files.
