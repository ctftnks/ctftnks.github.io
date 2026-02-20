# ADR-008: Migrate from Web Components to Vue 3

- **Status**: Accepted
- **Date**: 2026-01-04
- **Deciders**: Simon

## Context and Problem Statement

Initially, the project explored the use of custom Web Components for its UI. However, as the complexity of the UI grew, managing reactivity and component structure became difficult. We needed a reactive way to synchronize the Game Engine state with the UI.

## Decision Drivers

- **Developer Productivity**: Vue 3's Single File Components (SFCs) provide a better DX.
- **Reactivity**: Built-in reactivity is more powerful than manual DOM manipulation.
- **State Synchronization**: The need to reflect complex game settings (e.g., bot speed, keymaps) in the UI automatically.

## Considered Options

1. **Web Components**: Standard browser components, no extra framework.
2. **Vue 3**: Modern framework with a strong focus on reactivity and ease of use.
3. **React**: Popular framework, but Vue's reactivity model was preferred for this project.
4. **Svelte**: Popular framework, much like Vue but smaller ecosystem.

## Decision Outcome

Chosen option: **Vue 3** in Composition API style (implemented in commit `80e7c13`), because its reactivity system (via `reactive` and `ref`) allowed for a very clean integration with the game's engine. The "GameStore" (ADR-003) acts as a bridge, where the engine updates values and the Vue UI reacts instantly.

### Consequences

- **Positive**: More maintainable UI code, easier state integration, and access to the Vite-Vue ecosystem.
- **Negative**: Adds a framework dependency and requires a build step (ADR-004).
- **Neutral**: Developers need to understand the Vue 3 Composition API to work on the UI.
