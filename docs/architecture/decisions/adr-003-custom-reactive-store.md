# ADR-003: Custom Reactive Store with Vue's `reactive` API

- **Status**: Accepted
- **Date**: 2025-12-29
- **Deciders**: Simon

## Context and Problem Statement

The project needed a way to manage global state (players, settings, game instances) that is accessible across different components and game logic. Initially, state was likely fragmented or passed around manually.

## Decision Drivers

- **Simplicity**: Avoid the overhead of external state management libraries like Pinia or Vuex for a relatively small project.
- **Reactivity**: Leverage Vue 3's built-in reactivity system.
- **Integration**: The store needs to be easily accessible from both Vue components and pure TypeScript game logic.

## Considered Options

1. **Pinia**: The standard state management library for Vue 3.
2. **Vuex**: The older state management library for Vue.
3. **Custom Reactive Object**: Using Vue's `reactive()` API with a singleton class.

## Decision Outcome

Chosen option: **Custom Reactive Object** (implemented in commit `d61a0c8`), because it provides a lightweight, type-safe, and highly integrated way to manage state without adding external dependencies. By using a class and exporting a reactive instance, we get both the benefits of OOP and Vue's reactivity.

### Consequences

- **Positive**: No additional dependencies, full control over the store's logic, and easy to use in non-component code.
- **Negative**: Missing some of the devtools integration and structured patterns (actions/getters) that Pinia provides.
