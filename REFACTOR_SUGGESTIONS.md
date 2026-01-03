# Codebase Analysis & Refactoring Roadmap

**Last Updated:** 2026-01-03
**Scope:** `src/`, `tests/`

## Executive Summary

The codebase is a TypeScript-based game engine utilizing HTML5 Canvas for rendering. While it has transitioned to modern tooling (Vite, ESLint, Prettier, Vitest), significant legacy patterns persist. The primary challenges include tight coupling via a global state singleton, mixed concerns between game logic and DOM manipulation, and suboptimal performance in the core game loop and spatial partitioning.

---

## 1. Architecture & Coupling

- **Global Singleton Pattern:** The `store` singleton (`src/game/store.ts`) is heavily used across classes like `Player`, `Game`, and `Canvas`. This leads to state leakage between tests and makes dependency tracking difficult.
- **Circular Dependencies:** Modules like `Game`, `Player`, and `Tank` are structurally coupled, often leading to circular import patterns.
- **Mixed Concerns:** UI management (DOM) and game logic (Canvas/Simulation) are often interleaved.

## 2. Performance & Algorithmic Hotspots

- **Per-Tick Object Reclassification:** Every tick, the game clears and rebuilds the spatial map object lists (`map.clearObjectLists()` -> `map.addObject()`). This is an $O(N)$ operation that could be optimized with incremental updates or spatial hashing.
- **Frequent innerHTML/String Concatenation:** UI updates (e.g., `updateScores()`) rebuild HTML via string concatenation in loops, causing layout thrashing.
- **DOM/CSS Overhead:** High-frequency style changes outside of the Canvas should be minimized or driven by `requestAnimationFrame`.

## 3. Code Quality & Standards

- **Inconsistent Time Units:** `GameFrequency` and `FrameFrequency` are used inconsistently. The engine should normalize on seconds (floating point) for all internal calculations (`dt`).
- **Type Safety:** Residual usage of `any` exists (e.g., in `store.loadSettings()` and UI components) to bypass type checks or handle legacy data.
- **Documentation:** Many UI components and newer utility functions lack JSDoc comments.

## 4. Correctness & Robustness

- **Implicit Mutation while Iterating:** Removing objects by splicing during iteration (even backward) can be fragile if other systems rely on stable indices. A `deleted` flag with a dedicated cleanup pass is preferred.
- **Timer Reasoning:** Mixed units (ms vs. rounded minutes) for timers like `RoundTime` make reasoning error-prone. Normalize calculations on seconds and only format for UI display.

## 5. UX & Accessibility

- **Keyboard Navigation:** Menus and dynamic UI elements need implementation of ARIA attributes and better focus management.
- **Audio Management:** Centralize audio controls to respect OS-level preferences (e.g., mute, reduced-motion).

---

## 6. Refactoring Roadmap

### Phase 1: Core Loop & Timing (High Priority)

1. **Introduce a Canonical `dt` API:**
   - Update `Game.step()` and `GameObject.step()` to accept `dt` (seconds).
   - Replace raw frequency increments with delta-time based updates.
2. **Stabilize the Game Loop:**
   - Implement a robust fixed-step accumulator with a maximum iterations cap to prevent the "spiral of death."

### Phase 2: Decoupling & Maintainability (Medium Priority)

1. **Dependency Injection:**
   - Pass dependencies (Game, Map, Store) via constructors instead of importing global singletons.
2. **UI/Logic Separation:**
   - Move DOM-manipulating logic out of entity classes.
   - Use a template-based or reactive approach for UI updates to avoid `innerHTML` loops.

### Phase 3: Optimization & Polish (Low Priority)

1. **Optimize Spatial Partitioning:**
   - Only update objects in the spatial map when they move or are created/destroyed.
2. **Hardware Acceleration:**
   - Refactor visual effects to use CSS transforms or Canvas-level translations.
3. **Finalize Type Coverage:**
   - Eliminate remaining `any` types and strictly enforce JSDoc for public APIs.
