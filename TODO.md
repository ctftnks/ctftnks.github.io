# TODO

- If a class attribute has a default value in the class definition, the same value does not need to be redefined in the class constructor
- if a child class declares the same attribute that a parent class already has, remove the declaration in the child
- prefer arrow functions for inlined (anonymous) functions
- make sure functions returning nothing have type void declared
- make sure boolean attributes have format "isX" not just "x"

## Refactoring

- do not use -1 for missing values
- use arrow functions
- more tests
- add JSDoc
- remove occurrences of "any"
- stricter TypeScript compiler rules
- move every class to its own file (and create package folders)
- resolve all circular dependencies

## Bugs

## Bots reimplementation

- Bots can get stuck onto each other
- Guided Missile spins randomly when there is no target
- improve Bot's laser aiming

## Minor features

- own flags could be required to be brought home in CTF

## Enhancement

- Weapon queue
- different tank types (visually): write a class for that?
- music, especially when holding flag
- update README.md
- let bots pick up powerups on intention

## Long term issues

- better graphics: hand drawn vector graphics
- publishable sounds & sprites

## Wishes

- Powerup that creates Portals
- Powerup that lets tank go through walls
- setting the difficulty per-bot
- button to change from player to bot
- Network functionality
