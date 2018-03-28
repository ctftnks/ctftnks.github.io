
# TODO:

## Bugs:
- Tanks spawn outside of Map and then get removed from game.objs by spatial sorting
- TerminatorBonus + GrenadeBonus creates a lot of Grenades ... forever!
- two players can pick up the same flag from one base simultaneously
- Invincible bug: let InvincibleBonus not go through walls, let Tank.invincible be a time instead of boolean, so it can expire/be prolonged easier. Let tanks not go through walls on startup

## Minor features
- introduce a Game.time
- Laser needs rework: accuracy
- Laser should show trajectory prior to shooting
- better spawn shield: 1 second at least
- reset the flag after some time

## Enhancement:
- Quick-Game buttons: 2v2, 3v3 (players vs bots? choose?)
- less white!
- stats at end of each map: how many kills, deaths does each player have? How much did each player move, shoot?
- different tank types (visually): write a class for that?
- music, especially when holding flag
- change body.background to #555 or similar
- adaptive bot difficulties: bots become harder/easier depending on scoreboard
- update README.md
- REFACTOR REFACTOR REFACTOR!!!

## Long term issues
- better UI
- better graphics: hand drawn vector graphics
- mobile support
- publishable sounds & sprites

## Wishes
- Powerup that creates Portals
- setting the difficulty per-bot
- button to change from player to bot
