import GameMap from "./gamemap";
import MapGenerator from "./mapGenerator";
import { getRandomPowerUp, type PowerUp } from "@/entities/powerup";
import { Key } from "@/key";
import { playSound, stopMusic, clearEffects } from "@/effects";
import { store, Settings } from "@/store";
import { SOUNDS } from "@/assets";
import Canvas from "./canvas";
import Player from "./player";
import GameObject from "@/entities/gameobject";
import { Gamemode, Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill } from "./gamemode";
import { openPage } from "@/ui/pages";
import { updateScores } from "@/ui/ui";

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
  map: GameMap;
  /** List of players. */
  players: Player[] = [];
  /** List of game objects. */
  objs: GameObject[] = [];
  /** Whether the game is paused. */
  paused: boolean = false;
  /** Interval ID for the game loop. */
  loop: number | undefined;
  /** Number of players alive. */
  nPlayersAlive: number = 0;
  /** Game time counter. */
  t: number = 0;
  /** List of interval IDs to clear on stop. */
  intvls: number[] = [];
  /** List of timeout IDs to clear on stop. */
  timeouts: number[] = [];
  /** Total kills in the game. */
  nkills: number = 0;
  /** The current game mode. */
  mode: Gamemode;

  /**
   * Creates a new Game instance.
   * @param {Canvas} canvas - The canvas manager.
   * @param {GameMap|null} map - The map object or null to generate a new one.
   */
  constructor(canvas: Canvas, map: GameMap | null = null) {
    this.canvas = canvas;
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
    this.mode = new Deathmatch(this);
    store.GameID++;
  }

  /**
   * Adds a player to the game.
   * @param {Player} player - The player to add.
   */
  addPlayer(player: Player): void {
    this.players.push(player);
    player.game = this;
  }

  /**
   * Adds an object to the game.
   * @param {GameObject} object - The object to add.
   */
  addObject(object: GameObject): void {
    this.objs.push(object);
  }

  /**
   * Starts the game loop.
   */
  start(): void {
    this.mode.init();
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].spawn();
    }

    this.loop = window.setInterval(() => {
      this.step();
    }, Settings.GameFrequency);
    playSound(SOUNDS.gamestart);
    if (Settings.bgmusic) {
      // playMusic(SOUNDS.bgmusic);
    }
    updateScores();
  }

  /**
   * A single step of the game loop.
   */
  step(): void {
    if (!this.paused) {
      this.t += Settings.GameFrequency;
      if (!this.map) {
        return;
      }
      // remove deleted objects and
      // initiate spatial sorting of objects within the map class
      this.map.clearObjectLists();
      for (let i = this.objs.length - 1; i >= 0; i--) {
        if (!this.objs[i].deleted) {
          this.map.addObject(this.objs[i]);
        } else {
          this.objs.splice(i, 1);
        }
      }

      // call step() function for every object in order for it to move/etc.
      for (let i = 0; i < this.objs.length; i++) {
        this.objs[i].step();
      }
      // do gamemode calculations
      this.mode.step();
      // add random PowerUp
      if (this.t % (1000 * Settings.PowerUpRate) === 0) {
        const p: PowerUp = getRandomPowerUp();
        const pos = this.map.spawnPoint();
        p.x = pos.x;
        p.y = pos.y;
        this.addObject(p);
        this.timeouts.push(
          window.setTimeout(
            () => {
              p.delete();
            },
            1000 * Settings.PowerUpRate * Settings.MaxPowerUps,
          ),
        );
      }
      if (Key.isDown("Escape")) {
        openPage("menu");
        this.pause();
      }
      if (this.t % 1000 === Settings.GameFrequency) {
        let dt = Settings.RoundTime * 60 - (this.t - Settings.GameFrequency) / 1000;
        dt = dt < 0 ? 0 : dt;
        const dtm: number = Math.floor(dt / 60);
        const dts: number = Math.floor(dt - dtm * 60);
        const timerElem = document.getElementById("GameTimer");
        if (timerElem) {
          timerElem.innerHTML = `${String(dtm).padStart(2, "0")}:${String(dts).padStart(2, "0")}`;
        }
      }
      if (this.t > Settings.RoundTime * 60000) {
        this.end();
      }
    }
  }

  /**
   * Pauses or unpauses the game.
   */
  pause(): void {
    this.paused = !this.paused;
    stopMusic(); // prevent 'invincible' sound from playing all over
  }

  /**
   * Stops the game loop and clears intervals/timeouts.
   */
  stop(): void {
    this.paused = true;
    if (this.loop) {
      window.clearInterval(this.loop);
    }
    for (let i = 0; i < this.intvls.length; i++) {
      window.clearInterval(this.intvls[i]);
    }
    for (let i = 0; i < this.timeouts.length; i++) {
      window.clearTimeout(this.timeouts[i]);
    }
    clearEffects();
    stopMusic();
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].base = undefined;
    }
  }

  /**
   * Ends the game and shows the leaderboard.
   */
  end(): void {
    this.paused = true;
    openPage("leaderboard");
    this.stop();
  }

  /**
   * Resets the game time and player timers.
   */
  resetTime(): void {
    this.t = 0;
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].tank.timers.invincible = 0;
      this.players[i].tank.timers.spawnshield = 0;
    }
  }
}

// start a new round
export function newGame(map: GameMap | null = null): Game {
  if (store.game) {
    store.game.stop();
  }

  store.game = new Game(store.canvas!, map);

  if (Settings.GameMode === "DM") {
    store.game.mode = new Deathmatch(store.game);
  }

  if (Settings.GameMode === "TDM") {
    store.game.mode = new TeamDeathmatch(store.game);
  }

  if (Settings.GameMode === "CTF") {
    store.game.mode = new CaptureTheFlag(store.game);
  }

  if (Settings.GameMode === "KOTH") {
    store.game.mode = new KingOfTheHill(store.game);
  }

  for (let i = 0; i < store.players.length; i++) {
    store.game.addPlayer(store.players[i]);
  }

  store.game.start();
  store.canvas?.sync();
  if (Settings.ResetStatsEachGame) {
    for (let i = 0; i < store.game.players.length; i++) {
      store.game.players[i].resetStats();
    }
  }

  return store.game;
}
