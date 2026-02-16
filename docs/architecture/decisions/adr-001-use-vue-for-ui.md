# ADR-001: Use Vue.js for UI and HUD Overlay

- **Status**: Accepted
- **Date**: 2026-02-16 (Documented retrospectively)

## Context and Problem Statement

Originally, the game used Vanilla JavaScript to manually manipulate the DOM for menus, settings, and the HUD. As the game grew (adding player configuration, key mapping, and multiple game modes), the manual DOM manipulation became brittle, hard to test, and difficult to maintain. We needed a reactive way to synchronize the Game Engine state with the UI.

## Decision Drivers

- **State Synchronization**: The need to reflect complex game settings (e.g., bot speed, keymaps) in the UI automatically.
- **Developer Experience**: Improving the ability to build complex nested menus (like the Players menu).
- **Separation of Concerns**: Keeping game logic (Canvas) separate from UI logic (HTML/CSS).

## Considered Options

1. **Vanilla JS**: Continue with manual `document.createElement` and `innerHTML`.
2. **React**: A popular alternative, but often requires more boilerplate for simple reactive stores.
3. **Vue.js**: Offers a lightweight reactivity system and SFCs (Single File Components) which fit well with the existing project structure.

## Decision Outcome

Chosen option: **Vue.js**, because its reactivity system (via `reactive` and `ref`) allowed for a very clean integration with the game's engine while the code within the Vue component feels quite vanilla. The "GameStore" acts as a bridge, where the engine updates values and the Vue UI reacts instantly without manual intervention.

### Consequences

- **Positive**: Significantly cleaner code in the menu and HUD components. Easier to implement features like the dynamic key-binding system.
- **Positive**: Better component organization using `.vue` files.
- **Negative**: Introduced a build step (Vite) and added to the project's bundle size (though negligible for a desktop-class browser game).
- **Neutral**: Developers need to understand the Vue 3 Composition API to work on the UI.
