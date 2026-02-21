# Solution Strategy

The architecture of CTFTNKS is driven by the goals of high performance (60fps in browser) and high extensibility for new game mechanics.

## Mental Model: The Engine Pulse

To understand CTFTNKS, think of it as a **Simulation Heartbeat** with a **UI Observer**.

1.  **The Heartbeat (Engine)**: Every ~16ms, the game "ticks." It doesn't care about Vue or buttons; it only cares about physics, vectors, and entity states. It moves objects, checks for collisions, and updates variables.
2.  **The Bridge (Store)**: The engine writes its most important high-level data (like scores, player lists, and game status) into a reactive `GameStore`.
3.  **The Observer (Vue)**: The Vue UI simply "watches" the store. When a score changes in the engine, the UI updates automatically. This keeps the performance-heavy simulation code clean and "vanilla."

## Fundamental Decisions and Strategies

### 1. Decoupling of UI and Game Engine

To ensure that the heavy game simulation does not block the UI (and vice versa), the system is strictly split:

- **Game Engine**: A pure TypeScript simulation running on a fixed-step loop.
- **UI Layer**: A Vue.js application that overlays the game.
- **Bridge**: A custom reactive `GameStore` (ADR-003) that allows the UI to observe game state without direct coupling.

### 2. Custom Physics over Library

To maintain a small footprint and pixel-perfect control over tank behavior (like sliding along walls), we use a **Custom 2D Physics Engine** (ADR-001). This is optimized by **Grid-based Spatial Partitioning** (ADR-014), ensuring that collision checks remain O(N) even with many objects.

### 3. Procedural Map Generation

To provide infinite replayability, maps are generated at the start of each round using **Porous Recursive Division** (ADR-002). This ensures a balance between structured "rooms" and open tactical spaces. **Dijkstra Maps** (BFS) are used to strategically place bases and flags at maximal distances from each other.

### 4. Extensibility via Inheritance

New game elements (Weapons, Power-ups, Gamemodes) are implemented using a "plug-and-play" inheritance strategy. By extending base classes like `Weapon` or `Powerup`, new features can be added with minimal changes to the core `Game` loop.

### 5. Documentation-as-Code

We use **arc42** for structural documentation and **Mermaid.js** for diagrams, ensuring that the architecture documentation lives and evolves alongside the code in the git repository.
