# 4. Solution Strategy

## 4.1 Core Decisions

- **Game Loop:** A custom game loop manages the update (`step`) and draw (`render`) cycles.
- **Canvas API:** The game world is rendered using the HTML5 Canvas API for performance and flexibility in 2D drawing.
- **Component-Based UI:** Vue.js is used for the "shell" of the application (menus, settings, HUD overlays) to manage DOM state efficiently, while the game logic manipulates the Canvas directly.
- **Entity-Component-System (Loose):** The game uses an inheritance-based entity system (`GameObject` -> `Tank`, `Bullet`) rather than a strict ECS, but separates Update logic from Rendering logic.
- **TypeScript:** Strict typing is enforced to manage the complexity of game state and interactions.
