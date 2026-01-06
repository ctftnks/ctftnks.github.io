# TODO

## Refactoring

- resolve all circular dependencies
- single way to access the game variable? not distributed accross all classes
- dependency analysis & improve loose coupling
- GameTimeout could be integrated into GameObject list (and use their step method)
- if step method has dt, GameTimeout could track their own time left, without relying on global time
- GameObject could have a "lifetime" or something, they will be deleted when the lifetime is over (this simplifies powerups and timeouts)
- check if player.invincible & player.spawnshield are well implemented
- check if for loops can be written more efficiently

## Bugs

## Bots reimplementation

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
