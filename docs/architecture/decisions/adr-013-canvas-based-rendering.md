# ADR-013: Canvas-based Rendering for Game World

- **Status**: Accepted
- **Date**: 2026-01-11
- **Deciders**: Simon

## Context and Problem Statement

Initially, some game elements might have used DOM elements (e.g., HTML images or divs) for rendering. As the number of objects (bullets, effects, smoke) increased, DOM manipulation became a performance bottleneck and complicated the drawing logic.

## Decision Drivers

- **Performance**: Ability to draw thousands of objects efficiently.
- **Consistency**: Unified way to draw all game entities and special effects.
- **Control**: Pixel-perfect control over rendering and transparency.

## Considered Options

1. **DOM Elements**: Using Vue or vanilla JS to manage HTML elements for game objects.
2. **SVG**: Scalable vector graphics, but potentially slow for many objects.
3. **HTML5 Canvas**: Low-level 2D drawing API.

## Decision Outcome

Chosen option: **HTML5 Canvas** (implemented in commits `15f8ddc` and `ee5b6db`), because it provides the performance needed for a fast-paced game with many dynamic elements and offers a consistent API for both static and animated rendering.

### Consequences

- **Positive**: High-performance rendering, centralized drawing logic, and easier effect implementation.
- **Negative**: Harder to implement accessibility (A11y) compared to DOM-based UI.
