import Tank from "./tank.js";
import { Key, keymaps } from "../keybindings.js";
import { Cloud } from "./smoke.js";
import { store, Settings } from "../state.js";

// A class for a player.
// keeps the players score, color, name, keymap
// and the tank to be controlled

/**
 * Represents a Player in the game.
 */
export default class Player {
  /**
   * Creates a new Player.
   */
  constructor() {
    /** @type {number} Unique player ID. */
    this.id = store.nplayers;
    store.nplayers += 1;
    /** @type {string} Player name. */
    this.name = "Player " + (this.id + 1);
    /** @type {string} Player color. */
    this.color = store.playercolors[this.id % store.playercolors.length];
    /** @type {number|string} Team identifier. */
    this.team = this.id;
    /** @type {Game} Game instance. */
    this.game = undefined;
    /** @type {Base|undefined} Player's base. */
    this.base = undefined;
    /** @type {number} Current score. */
    this.score = 0;
    /** @type {number} Current kill streak. */
    this.spree = 0;
    /** @type {Array<string>} Key bindings (KeyboardEvent.code strings). */
    this.keys = keymaps[this.id] || keymaps[0].slice();
    /** @type {Tank} The tank controlled by the player. */
    this.tank = new Tank(this);
    /** @type {Object} Player statistics. */
    this.stats = { deaths: 0, kills: 0, miles: 0, shots: 0 };
    /** @type {boolean} Whether the player is a bot. */
    this.isBot = false;
  }

  /**
   * Timestep: check if keys pressed and act accordingly.
   */
  step() {
    if (Key.isDown(this.keys[0])) this.tank.move(1);
    if (Key.isDown(this.keys[1])) this.tank.turn(-1);
    if (Key.isDown(this.keys[2])) this.tank.move(-0.7);
    if (Key.isDown(this.keys[3])) this.tank.turn(1);
    if (Key.isDown(this.keys[4])) this.tank.shoot();
  }

  /**
   * Spawn at some point.
   */
  spawn() {
    this.tank = new Tank(this);
    this.tank.deleted = false;
    this.tank.map = this.game.map;
    let spos = this.game.map.spawnPoint();
    if (typeof this.base !== "undefined" && this.base.tile !== -1) {
      let spos2 = this.base.tile;
      while (spos2.id === this.base.tile.id)
        spos2 = spos2.randomWalk(Math.pow(this.game.mode.BaseSpawnDistance, 2) + Math.round(Math.random()));
      spos = { x: spos2.x + spos2.dx / 2, y: spos2.y + spos2.dy / 2 };
    }
    this.tank.x = spos.x;
    this.tank.y = spos.y;
    this.game.addObject(this.tank);
    this.game.n_playersAlive += 1;
    // this.game.addObject(new Smoke(this.x, this.y));
    const self = this;
    this.game.timeouts.push(
      setTimeout(function () {
        new Cloud(self.game, self.tank.x, self.tank.y, 4, 20, 2);
      }, 10),
    );
    // spawn shield
    this.tank.timers.spawnshield = this.game.t + Settings.SpawnShieldTime * 1000;
  }

  /**
   * Kill the player, called when tank is shot.
   * Check if game should end.
   */
  kill() {
    this.game.n_playersAlive -= 1;
    this.tank.weapon.active = false;
    this.game.nkills++;
    this.game.canvas.shake();
    this.spree = 0;
    this.stats.deaths += 1;
    const self = this;
    this.game.timeouts.push(
      setTimeout(function () {
        self.spawn();
      }, Settings.RespawnTime * 1000),
    );
  }

  /**
   * Change player color/team.
   */
  changeColor() {
    this.team += 1;
    this.team = this.team % store.playercolors.length;
    this.color = store.playercolors[this.team % store.playercolors.length];
  }

  /**
   * Reset stats dictionary to 0.
   */
  resetStats() {
    this.stats.deaths = 0;
    this.stats.kills = 0;
    this.stats.miles = 0;
    this.stats.shots = 0;
  }
}
