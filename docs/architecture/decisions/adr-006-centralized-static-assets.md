# ADR-006: Centralized Static Asset Management

- **Status**: Accepted
- **Date**: 2025-12-30
- **Deciders**: Simon

## Context and Problem Statement

The game uses numerous images and sounds (weapons, powerups, effects). Hardcoding these paths or managing them within individual classes is brittle and complicates bundling with modern tools like Vite.

## Decision Drivers

- **Asset Consistency**: A single source of truth for all asset paths.
- **Bundling Support**: Ease of use with Vite's asset handling.
- **Code Cleanliness**: Decoupling the business logic from asset path strings.

## Considered Options

1. **Inline Strings**: Reference `/public/img/gun.png` directly in each class.
2. **Centralized Asset Registry**: Define an object mapping logical names to paths (e.g., `src/game/assets.ts`).

## Decision Outcome

Chosen option: **Centralized Asset Registry** (implemented in commits `caa1a94` and `d50f3a1`), because it provides a clean interface for accessing assets and makes it easier to manage paths during development and production builds.

### Consequences

- **Positive**: Easier to update assets, type-safe asset names (when using TypeScript), and simplified asset preloading.
- **Negative**: Adds a small boilerplate file for asset definitions.
