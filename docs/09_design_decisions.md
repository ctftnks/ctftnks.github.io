# 9. Design Decisions

## 9.1 Canvas vs. DOM

**Decision:** Use HTML5 Canvas for the game view instead of DOM elements.
**Reason:** Performance. Rendering hundreds of particles, projectiles, and tiles is significantly faster on Canvas than manipulating thousands of DOM nodes.

## 9.2 Vue.js for UI

**Decision:** Use Vue.js for menus and HUD.
**Reason:** declarative state management for UI is superior to manual DOM manipulation. It separates the "Game Loop" concerns from the "Application State" concerns.

## 9.3 Procedural Map Generation

**Decision:** Maps are generated procedurally (e.g., Recursive Division).
**Reason:** Provides infinite replayability and variety without needing manual level design for every match.
