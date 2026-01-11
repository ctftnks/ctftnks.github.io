# Codebase Analysis & Refactoring Roadmap

**Last Updated:** 2026-01-03
**Scope:** `src/`, `tests/`

## Executive Summary

The codebase is a TypeScript-based game engine utilizing HTML5 Canvas for rendering. While it has transitioned to modern tooling (Vite, ESLint, Prettier, Vitest), significant legacy patterns persist. The primary challenges include tight coupling via a global state singleton, mixed concerns between game logic and DOM manipulation, and suboptimal performance in the core game loop and spatial partitioning.

---

## 1. Architecture & Coupling

- **Global Singleton Pattern:** The `store` singleton (`src/game/store.ts`) is heavily used across classes like `Player`, `Game`, and `Canvas`. This leads to state leakage between tests and makes dependency tracking difficult.
- **Circular Dependencies:** Modules like `Game`, `Player`, and `Tank` are structurally coupled, often leading to circular import patterns.

## 3. Code Quality & Standards

- **Inconsistent Time Units:** `GameFrequency` and `FrameFrequency` are used inconsistently. The engine should normalize on seconds (floating point) for all internal calculations (`dt`).

## 4. Correctness & Robustness

- **Timer Reasoning:** Mixed units (ms vs. rounded minutes) for timers like `RoundTime` make reasoning error-prone. Normalize calculations on seconds and only format for UI display.

## 5. UX & Accessibility

- **Keyboard Navigation:** Menus and dynamic UI elements need implementation of ARIA attributes and better focus management.
- **Audio Management:** Centralize audio controls to respect OS-level preferences (e.g., mute, reduced-motion).

---

## 6. Refactoring Roadmap

### Phase 1: Core Loop & Timing (High Priority)

**Introduce a Canonical `dt` API:**

- Replace raw frequency increments with delta-time based updates.

### Phase 2: Decoupling & Maintainability (Medium Priority)

**Dependency Injection:**

- Pass dependencies (Game, Map, Store) via constructors instead of importing global singletons.
