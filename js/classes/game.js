import Map from "./map.js";
import MapGenerator from "./mapGenerator.js";
import { Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill, MapEditor } from "./gamemode.js";
import { getRandomPowerUp } from "./powerup.js";
import { GameFrequency } from "../constants.js";
import { Key } from "../keybindings.js";
import { playSound, playMusic, stopMusic, clearEffects } from "../effects.js";
import { store, Settings } from "../state.js";
import { SOUNDS } from "../assets.js";

// A class for a single game round with a single map
// contains a list of players, list of objects in the game
// contains a loop mechanism for time-iteration

/**
 * Manages the game state, loop, and objects.
 */
export default class Game {
  /**
   * Creates a new Game instance.
   * @param {Canvas} canvas - The canvas manager.
   * @param {Map|number} map - The map object or -1 to generate a new one.
   */
  constructor(canvas, map = -1) {
    // pass canvas class to game, for size / resolution
    /** @type {Canvas} The canvas manager. */
    this.canvas = canvas;
    this.canvas.game = this;
    // create new random map
    /** @type {Map} The game map. */
    if (map === -1) {
      this.map = new Map(this.canvas);
      // MapGenerator.algorithms[Math.floor(Math.random()*MapGenerator.algorithms.length)](this.map);
      // MapGenerator.primsMaze(this.map);
      // MapGenerator.recursiveDivision(this.map);
      MapGenerator.porousRecursiveDivision(this.map);
    } else {
      this.map = map;
    }
    this.map.resize();
    /** @type {Array<Player>} List of players. */
    this.players = [];
    /** @type {Array<GameObject>} List of game objects. */
    this.objs = [];
    /** @type {boolean} Whether the game is paused. */
    this.paused = false;
    /** @type {number|undefined} Interval ID for the game loop. */
    this.loop = undefined;
    /** @type {number} Number of players alive. */
    this.n_playersAlive = 0;
    /** @type {number} Game time counter. */
    this.t = 0;
    /** @type {Array<number>} List of interval IDs to clear on stop. */
    this.intvls = [];
    /** @type {Array<number>} List of timeout IDs to clear on stop. */
    this.timeouts = [];
    /** @type {number} Total kills in the game. */
    this.nkills = 0;
    /** @type {Gamemode} The current game mode. */
    this.mode = new Deathmatch(this);
    store.GameID++;
  }

  /**
   * Adds a player to the game.
   * @param {Player} player - The player to add.
   */
  addPlayer(player) {
    this.players.push(player);
    player.game = this;
  }

  /**
   * Adds an object to the game.
   * @param {GameObject} object - The object to add.
   */
  addObject(object) {
    this.objs.push(object);
  }

  /**
   * Starts the game loop.
   */
  start() {
    const self = this;
    this.mode.init();
    for (let i = 0; i < this.players.length; i++) this.players[i].spawn();
    this.loop = setInterval(function () {
      self.step();
    }, GameFrequency);
    playSound(SOUNDS.gamestart);
    if (Settings.bgmusic) {
        // playMusic(SOUNDS.bgmusic);
    }
    if (window.updateScores) window.updateScores();
  }

  /**
   * A single step of the game loop.
   */
  step() {
    if (!this.paused) {
      this.t += GameFrequency;
      // remove deleted objects and
      // initiate spatial sorting of objects within the map class
      this.map.clearObjectLists();
      for (let i = this.objs.length - 1; i >= 0; i--)
        if (!this.objs[i].deleted) this.map.addObject(this.objs[i]);
        else this.objs.splice(i, 1);
      // call step() function for every object in order for it to move/etc.
      for (let i = 0; i < this.objs.length; i++) this.objs[i].step();
      // do gamemode calculations
      this.mode.step();
      // add random PowerUp
      if (this.t % (1000 * Settings.PowerUpRate) === 0 && Settings.GameMode !== "MapEditor") {
        const p = getRandomPowerUp();
        const pos = this.map.spawnPoint();
        p.x = pos.x;
        p.y = pos.y;
        this.addObject(p);
        this.timeouts.push(
          setTimeout(
            function () {
              p.delete();
            },
            1000 * Settings.PowerUpRate * Settings.MaxPowerUps,
          ),
        );
      }
      if (Key.isDown("Escape")) {
        if (window.openPage) window.openPage("menu");
        this.pause();
      }
      if (this.t % 1000 === GameFrequency) {
        let dt = Settings.RoundTime * 60 - (this.t - GameFrequency) / 1000;
        dt = dt < 0 ? 0 : dt;
        let dtm = Math.floor(dt / 60);
        let dts = Math.floor(dt - dtm * 60);
        dtm = "" + dtm;
        while (dtm.length < 2) dtm = "0" + dtm;
        dts = "" + dts;
        while (dts.length < 2) dts = "0" + dts;
        const timerElem = document.getElementById("GameTimer");
        if (timerElem) timerElem.innerHTML = dtm + ":" + dts;
      }
      if (this.t > Settings.RoundTime * 60000) this.end();
    }
  }

  /**
   * Pauses or unpauses the game.
   */
  pause() {
    this.paused = !this.paused;
    stopMusic(); // prevent 'invincible' sound from playing all over
  }

  /**
   * Stops the game loop and clears intervals/timeouts.
   */
  stop() {
    this.paused = true;
    clearInterval(this.loop);
    for (let i = 0; i < this.intvls.length; i++) clearInterval(this.intvls[i]);
    for (let i = 0; i < this.timeouts.length; i++) clearTimeout(this.timeouts[i]);
    clearEffects();
    stopMusic();
    for (let i = 0; i < this.players.length; i++) this.players[i].base = undefined;
  }

  /**
   * Ends the game and shows the leaderboard.
   */
  end() {
    this.paused = true;
    if (window.openPage) {
      window.openPage("leaderboard");
    }
    this.stop();
  }

  /**
   * Resets the game time and player timers.
   */
  resetTime() {
    this.t = 0;
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].tank.timers.invincible = -1;
      this.players[i].tank.timers.spawnshield = -1;
    }
  }
}