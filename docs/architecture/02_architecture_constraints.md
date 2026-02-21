# Architecture Constraints

This section describes the technical and organizational constraints that limit the architectural freedom.

## Technical Constraints

- **Browser-based**: The application must run in modern web browsers (Chrome, Firefox, Safari, Edge) without requiring any plugins or local installations.
- **Static Hosting**: The game must be deployable as a static site (e.g., GitHub/GitLab Pages). There is no dedicated backend or database; all game state is local to the client.
- **Performance**: The game simulation must maintain a stable 60 FPS (approx. 16.6ms per frame) to ensure smooth gameplay, even on average hardware.
- **Toolchain**: Development is strictly tied to the TypeScript and Vite ecosystem to ensure modern bundling, type safety, and fast development cycles.

## Organizational Constraints

- **Open Source**: The project is licensed under the GNU General Public License v3.0 and managed as an open-source repository on GitHub, requiring clear documentation (arc42) and a clean contribution process.
- **Local-First**: Multiplayer features are currently limited to local/same-device play and bot integration, avoiding the complexity of real-time network synchronization for now.
