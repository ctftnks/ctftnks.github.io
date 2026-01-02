import Tank from "./tank";
import { Key } from "../key";
import { generateCloud } from "./smoke";
import { store, Settings } from "../store";
import type Game from "./game";
import type { Base } from "./ctf";

/**
 * Represents a Player in the game.
 * Keeps the players score, color, name, keymap
 * and the tank to be controlled
 */
export default class Player {
  id: number;
  name: string;
  color: string;
  team: number;
  game: Game | undefined;
  base: Base | undefined;
  score: number = 0;
  spree: number = 0;
  keys: string[];
  tank: Tank;
  stats: { deaths: number; kills: number; miles: number; shots: number } = { deaths: 0, kills: 0, miles: 0, shots: 0 };

  /**
   * Creates a new Player.
   */
  constructor() {
    this.id = store.nplayers;
    store.nplayers += 1;
    this.name = "Player " + (this.id + 1);
    this.color = store.playercolors[this.id % store.playercolors.length];
    this.team = this.id;
    this.keys = store.keymaps[this.id] || store.keymaps[0].slice();
    this.tank = new Tank(this);
  }

  /**
   * Timestep: check if keys pressed and act accordingly.
   */
  step(): void {
    if (Key.isDown(this.keys[0])) this.tank.move(1);
    if (Key.isDown(this.keys[1])) this.tank.turn(-1);
    if (Key.isDown(this.keys[2])) this.tank.move(-0.7);
    if (Key.isDown(this.keys[3])) this.tank.turn(1);
    if (Key.isDown(this.keys[4])) this.tank.shoot();
  }

  /**
   * Spawn at some point.
   */
  spawn(): void {
    this.tank = new Tank(this);
    this.tank.deleted = false;
    this.tank.map = this.game!.map;
    let spos = this.game!.map.spawnPoint();

    if (typeof this.base !== "undefined" && this.base.tile !== -1) {
      let spos2 = this.base.tile;
      while (spos2.id === this.base.tile.id)
        spos2 = spos2.randomWalk(Math.pow(this.game!.mode.BaseSpawnDistance, 2) + Math.round(Math.random()));
      spos = { x: spos2.x + spos2.dx / 2, y: spos2.y + spos2.dy / 2 };
    }
    this.tank.x = spos.x;
    this.tank.y = spos.y;
    this.game!.addObject(this.tank);
    this.game!.nPlayersAlive += 1;

    this.game!.timeouts.push(
      setTimeout(() => {
        generateCloud(this.game!, this.tank.x, this.tank.y, 4, 20, 2);
      }, 10),
    );
    // spawn shield
    this.tank.timers.spawnshield = this.game!.t + Settings.SpawnShieldTime * 1000;
  }

  /**
   * Kill the player, called when tank is shot.
   * Check if game should end.
   */
  kill(): void {
    this.game!.nPlayersAlive -= 1;
    this.tank.weapon.isActive = false;
    this.game!.nkills++;
    this.game!.canvas.shake();
    this.spree = 0;
    this.stats.deaths += 1;
    this.game!.timeouts.push(
      setTimeout(() => {
        this.spawn();
      }, Settings.RespawnTime * 1000),
    );
  }

  /**
   * Change player color/team.
   */
  changeColor(): void {
    this.team += 1;
    this.team = this.team % store.playercolors.length;
    this.color = store.playercolors[this.team % store.playercolors.length];
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
