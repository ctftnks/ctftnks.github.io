import { gameEvents, EVENTS } from "@/game/events";
import GameMap from "./gamemap";
import MapGenerator from "./mapGenerator";
import { getRandomPowerUp } from "@/entities/powerup";
import { playSound, stopMusic, clearEffects } from "./effects";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";
import { SOUNDS } from "@/game/assets";
import Canvas from "./canvas";
import Player from "./player";
import GameObject from "@/entities/gameobject";
import { Gamemode, Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill } from "./gamemode";
import { openPage } from "@/stores/ui";
import Tank from "@/entities/tank";

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
  loop?: number;
  /** Number of players alive. */
  nPlayersAlive: number = 0;
  /** Game time counter. */
  t: number = 0;
  /** Timestamp of the last frame. */
  lastTime: number = 0;
  /** Accumulated time for fixed-step updates. */
  accumulator: number = 0;
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
   * @param canvas - The canvas manager.
   * @param map - The map object or null to generate a new one.
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
  }

  /**
   * Adds a player to the game.
   * @param player - The player to add.
   */
  addPlayer(player: Player): void {
    this.players.push(player);
    player.game = this;
  }

  /**
   * Adds an object to the game.
   * @param object - The object to add.
   */
  addObject(object: GameObject): void {
    this.objs.push(object);
  }

  /**
   * Fetches a list of all tanks in the game
   * @returns list of tanks
   */
  getTanks(): Tank[] {
    return this.objs.filter((o) => o instanceof Tank);
  }

  /**
   * Starts the game loop.
   */
  start(): void {
    this.mode.init();
    this.players.forEach((player) => player.spawn(this));

    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop = requestAnimationFrame((t) => this.gameLoop(t));

    playSound(SOUNDS.gamestart);
    if (Settings.bgmusic) {
      // playMusic(SOUNDS.bgmusic);
    }
    gameEvents.emit(EVENTS.SCORE_UPDATED);
  }

  /**
   * Main game loop driven by requestAnimationFrame.
   * Uses an accumulator to ensure fixed-timestep updates.
   * @param timestamp - The current time.
   */
  gameLoop(timestamp: number): void {
    if (!this.loop) {
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.paused) {
      this.accumulator += deltaTime;
      // Cap accumulator to avoid spiral of death (max 200ms)
      this.accumulator = Math.min(this.accumulator, 200);

      while (this.accumulator >= Settings.GameFrequency) {
        this.step();
        this.accumulator -= Settings.GameFrequency;
      }
    }

    this.loop = requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * A single step of the game loop.
   */
  step(): void {
    this.t += Settings.GameFrequency;
    if (!this.map) {
      return;
    }
    // remove deleted objects and
    // initiate spatial sorting of objects within the map class
    this.map.clearObjectLists();
    this.objs = this.objs.filter((obj) => {
      if (!obj.deleted) {
        this.map.addObject(obj);
        return true;
      }
      return false;
    });

    // call step() function for every object in order for it to move/etc.
    for (const obj of this.objs) {
      obj.step();
    }

    // do gamemode calculations
    this.mode.step();

    // add random PowerUp
    if (this.isTrueEvery(1000 * Settings.PowerUpRate)) {
      const p = getRandomPowerUp();
      const pos = this.map.spawnPoint();
      p.x = pos.x;
      p.y = pos.y;
      this.addObject(p);
      this.timeouts.push(window.setTimeout(() => p.delete(), 1000 * Settings.PowerUpRate * Settings.MaxPowerUps));
    }
    // update the timer in the sidebar
    if (this.isTrueEvery(1000)) {
      const dt = Math.max(0, Settings.RoundTime * 60 - (this.t - Settings.GameFrequency) / 1000);
      gameEvents.emit(EVENTS.TIME_UPDATED, dt);
    }
    // end the game when the round time is over
    if (this.t > Settings.RoundTime * 60000) {
      this.end();
    }
  }

  /**
   * This method returns true every X milliseconds, otherwise false
   * @param ms the distance between 'true' signals in milliseconds
   */
  private isTrueEvery(ms: number): boolean {
    return this.t % ms < Settings.GameFrequency;
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
      cancelAnimationFrame(this.loop);
      this.loop = undefined;
    }
    this.intvls.forEach((id) => window.clearInterval(id));
    this.timeouts.forEach((id) => window.clearTimeout(id));
    this.intvls = [];
    this.timeouts = [];

    clearEffects();
    stopMusic();
    this.players.forEach((player) => (player.base = undefined));
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
    for (const tank of this.getTanks()) {
      tank.timers.invincible = 0;
      tank.timers.spawnshield = 0;
    }
  }
}

// start a new round
export function newGame(map: GameMap | null = null): Game {
  if (store.game) {
    store.game.stop();
  }

  store.GameID++;
  const game = new Game(store.canvas!, map);

  const modeMap: Record<string, new (game: Game) => Gamemode> = {
    DM: Deathmatch,
    TDM: TeamDeathmatch,
    CTF: CaptureTheFlag,
    KOTH: KingOfTheHill,
  };

  const ModeClass = modeMap[Settings.GameMode] || CaptureTheFlag;
  game.mode = new ModeClass(game);

  store.players.forEach((player) => game.addPlayer(player as Player));

  game.start();
  store.canvas?.sync();

  if (Settings.ResetStatsEachGame) {
    game.players.forEach((player) => player.resetStats());
  }

  store.game = game;
  return game;
}
