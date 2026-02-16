# Glossary

| Term           | Definition                                                                            |
| :------------- | :------------------------------------------------------------------------------------ |
| **Tank**       | The primary player-controlled or bot-controlled entity.                               |
| **Player**     | A logical actor (Human or AI) that owns a Tank and manages its input.                 |
| **Bot**        | An AI-controlled Player.                                                              |
| **GameObject** | The base class for everything that has a position on the map (Tanks, Bullets, Flags). |
| **Updatable**  | An interface for objects that need to perform logic every frame (e.g., Smoke).        |
| **Game Mode**  | A set of rules (CTF, DM, KOTH) that determines win conditions and spawning logic.     |
| **Tile**       | A single square unit of the map grid, which can be empty or a wall.                   |
| **Power-up**   | A temporary bonus or weapon upgrade collected on the map.                             |
| **Weapon**     | An object attached to a Tank that defines its firing behavior (e.g., Gun, Laser, MG). |
