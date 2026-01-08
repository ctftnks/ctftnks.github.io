import Tank from "@/entities/tank";
import { Key } from "@/game/key";
import { generateCloud } from "@/entities/smoke";
import { Settings } from "@/stores/settings";
import type Game from "./game";
import Base from "@/entities/base";
import type Team from "./team";

/**
 * Represents a Player in the game.
 * Keeps the players score, color, name, keymap
 * and the tank to be controlled
 */
export default class Player {
  game?: Game;
  base?: Base;
  score: number = 0;
  spree: number = 0;
  stats: { deaths: number; kills: number; miles: number; shots: number } = { deaths: 0, kills: 0, miles: 0, shots: 0 };

  /**
   * Creates a new Player.
   * @param id - The player ID.
   * @param name - The player name.
   * @param team - The team of the player
   * @param keys - The key mapping.
   */
  constructor(
    public id: number,
    public name: string,
    public team: Team,
    public keys: string[],
  ) {}

  /**
   * Steer a tank: check if keys pressed and act accordingly.
   * @param tank - the tank to be steered by the player
   * @param dt - the time elapsed since the last frame in milliseconds
   */
  steer(tank: Tank, dt: number): void {
    if (Key.isDown(this.keys[0])) {
      tank.move(1, dt);
    }
    if (Key.isDown(this.keys[1])) {
      tank.turn(-1, dt);
    }
    if (Key.isDown(this.keys[2])) {
      tank.move(-0.7, dt);
    }
    if (Key.isDown(this.keys[3])) {
      tank.turn(1, dt);
    }
    if (Key.isDown(this.keys[4])) {
      tank.shoot(dt);
    }
  }

  /**
   * Spawn at some point.
   * @param game - the game in which the tank should spawn
   */
  spawn(game: Game): void {
    const tank = new Tank(this, game);
    let spos = game.map.spawnPoint();
    if (this.base?.tile) {
      let spos2 = this.base.tile;
      while (spos2.id === this.base.tile.id) {
        spos2 = spos2.randomWalk(game.mode.BaseSpawnDistance ** 2 + Math.round(Math.random()));
      }
      spos = { x: spos2.x + spos2.dx / 2, y: spos2.y + spos2.dy / 2 };
    }
    tank.setPosition(spos);
    game.addObject(tank);
    game.nPlayersAlive += 1;
    game.addTimeout(() => {
      generateCloud(game, tank.x, tank.y, 4, 20, 2);
    }, 10);
  }

  /**
   * Kill the player, called when tank is shot.
   */
  kill(): void {
    if (!this.game) {
      return;
    }
    const game = this.game;
    this.game.nPlayersAlive -= 1;
    this.game.nkills++;
    this.game.canvas.shake();
    this.spree = 0;
    this.stats.deaths += 1;
    this.game.addTimeout(() => {
      this.spawn(game);
    }, Settings.RespawnTime * 1000);
  }

  /**
   * Reset stats dictionary to 0.
   */
  resetStats(): void {
    this.stats.deaths = 0;
    this.stats.kills = 0;
    this.stats.miles = 0;
    this.stats.shots = 0;
  }

  /**
   * Is the player a bot or a user?
   */
  isBot(): boolean {
    return false;
  }
}
