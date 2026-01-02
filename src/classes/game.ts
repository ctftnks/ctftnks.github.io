import GameMap from "./map";
import MapGenerator from "./mapGenerator";
import { Deathmatch, Gamemode } from "./gamemode";
import { getRandomPowerUp } from "./powerup";
import { Key } from "../keybindings";
import { playSound, playMusic, stopMusic, clearEffects } from "../effects";
import { store, Settings } from "../state";
import { SOUNDS } from "../assets";
import Canvas from "./canvas";
import Player from "./player";
import GameObject from "./object";
import { PowerUp } from "./powerup";

/**
 * Manages the game state, loop, and objects.
 *
 * A class for a single game round with a single map
 * contains a list of players, list of objects in the game
 * contains a loop mechanism for time-iteration
 */
export default class Game {
  /** The canvas manager, used for size/resolution. */
  canvas: Canvas;
  /** The game map. */
  map: GameMap | undefined;
  /** List of players. */
  players: Player[] = [];
  /** List of game objects. */
  objs: GameObject[] = [];
  /** Whether the game is paused. */
  paused: boolean = false;
  /** Interval ID for the game loop. */
  loop: any;
  /** Number of players alive. */
  n_playersAlive: number = 0;
  /** Game time counter. */
  t: number = 0;
  /** List of interval IDs to clear on stop. */
  intvls: any[] = [];
  /** List of timeout IDs to clear on stop. */
  timeouts: any[] = [];
  /** Total kills in the game. */
  nkills: number = 0;
  /** The current game mode. */
  mode: Gamemode;

  /**
   * Creates a new Game instance.
   * @param {Canvas} canvas - The canvas manager.
   * @param {GameMap|number} map - The map object or -1 to generate a new one.
   */
  constructor(canvas: Canvas, map: GameMap | null = null) {
    this.canvas = canvas;
    this.canvas.game = this;
    // create new random map
    if (!map) {
      this.map = new GameMap(this.canvas);
      // MapGenerator.algorithms[Math.floor(Math.random()*MapGenerator.algorithms.length)](this.map);
      // MapGenerator.primsMaze(this.map);
      // MapGenerator.recursiveDivision(this.map);
      MapGenerator.porousRecursiveDivision(this.map);
    } else {
      this.map = map as GameMap;
    }

    this.map.resize();
    this.players = [];
    this.objs = [];
    this.paused = false;
    this.loop = undefined;
    this.n_playersAlive = 0;
    this.t = 0;
    this.intvls = [];
    this.timeouts = [];
    this.nkills = 0;
    this.mode = new Deathmatch(this);
    store.GameID++;
  }

  /**
   * Adds a player to the game.
   * @param {Player} player - The player to add.
   */
  addPlayer(player: Player) {
    this.players.push(player);
    player.game = this;
  }

  /**
   * Adds an object to the game.
   * @param {GameObject} object - The object to add.
   */
  addObject(object: GameObject) {
    this.objs.push(object);
  }

  /**
   * Starts the game loop.
   */
  start() {
    this.mode.init();
    for (let i = 0; i < this.players.length; i++) this.players[i].spawn();

    this.loop = setInterval(() => {
      this.step();
    }, Settings.GameFrequency);
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
      this.t += Settings.GameFrequency;
      if (!this.map) return;
      // remove deleted objects and
      // initiate spatial sorting of objects within the map class
      this.map.clearObjectLists();
      for (let i = this.objs.length - 1; i >= 0; i--) {
        if (!this.objs[i].deleted) this.map.addObject(this.objs[i]);
        else this.objs.splice(i, 1);
      }
      // call step() function for every object in order for it to move/etc.
      for (let i = 0; i < this.objs.length; i++) this.objs[i].step();
      // do gamemode calculations
      this.mode.step();
      // add random PowerUp
      if (this.t % (1000 * Settings.PowerUpRate) === 0 && Settings.GameMode !== "MapEditor") {
        const p: PowerUp = getRandomPowerUp();
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
      if (this.t % 1000 === Settings.GameFrequency) {
        let dt = Settings.RoundTime * 60 - (this.t - Settings.GameFrequency) / 1000;
        dt = dt < 0 ? 0 : dt;
        const dtm: number = Math.floor(dt / 60);
        const dts: number = Math.floor(dt - dtm * 60);
        const timerElem = document.getElementById("GameTimer");
        if (timerElem) timerElem.innerHTML = `${String(dtm).padStart(2, "0")}:${String(dts).padStart(2, "0")}`;
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
    if (this.loop) clearInterval(this.loop);
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
