import Player from "./player.js";
import { Flag, Base, Hill } from "./ctf.js";
import { playSound } from "../effects.js";
import { adaptBotSpeed } from "./bot.js";
import { keymaps } from "../keybindings.js";
import { playercolors } from "../constants.js";
import { WallBuilder } from "./weapons.js";
import { Settings } from "../state.js";
import { SOUNDS } from "../assets.js";

/**
 * Base class for game modes.
 */
export class Gamemode {
  /**
   * Creates a new Gamemode.
   * @param {Game} game - The game instance.
   */
  constructor(game) {
    /** @type {string} Name of the game mode. */
    this.name = "defaultmode";
    /** @type {Game} Game instance. */
    this.game = game;
    /** @type {number} Distance for base spawning. */
    this.BaseSpawnDistance = 2;
  }
  /**
   * Called every game step.
   */
  step() {}
  /**
   * Initializes the game mode.
   */
  init() {}
}

/**
 * Deathmatch game mode.
 * @extends Gamemode
 */
export class Deathmatch extends Gamemode {
  /**
   * Creates a new Deathmatch mode.
   * @param {Game} game - The game instance.
   */
  constructor(game) {
    super(game);
    this.name = "Deathmatch";
  }

  /**
   * Updates player score.
   * @param {Player} player - The player to give score to.
   * @param {number} val - The score value.
   */
  giveScore(player, val = 1) {
    player.score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    if (window.updateScores) window.updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1, player2) {
    if (player1.team === player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }
}

/**
 * Team Deathmatch game mode.
 * @extends Gamemode
 */
export class TeamDeathmatch extends Gamemode {
  /**
   * Creates a new TeamDeathmatch mode.
   * @param {Game} game - The game instance.
   */
  constructor(game) {
    super(game);
    this.name = "TeamDeathmatch";
    this.initiated = false;
    this.BaseSpawnDistance = 2;
  }

  /**
   * Updates team score.
   * @param {Player} player - The player involved (to identify team).
   * @param {number} val - The score value.
   */
  giveScore(player, val = 1) {
    for (let i = 0; i < this.game.players.length; i++) if (this.game.players[i].team === player.team) this.game.players[i].score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    if (window.updateScores) window.updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1, player2) {
    if (player1.team === player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }

  /**
   * Initialize bases and spawn players.
   */
  init() {
    const bases = [];
    const game = this.game;

    // create single base for each team
    for (let i = 0; i < game.players.length; i++) {
      let baseExists = false;
      const player = game.players[i];
      for (let j = 0; j < bases.length; j++)
        if (player.team === bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        let maxLength = -1;
        let maxPos = game.map.spawnPoint();
        for (let k = 0; k < 100; k++) {
          const pos = game.map.spawnPoint();
          const tile = game.map.getTileByPos(pos.x, pos.y);
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            bases.push(game.map.spawnPoint());
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            const path = tile.pathTo(function (destination) {
              return destination.id === stile.id;
            });
            if (path !== -1) length += path.length * path.length;
          }
          if (initfirst) bases.pop();
          for (let j = 0; j < bases.length; j++) if (bases[j].x === pos.x && bases[j].y === pos.y) length = -1;
          if (length > maxLength) {
            maxLength = length;
            maxPos = pos;
          }
        }
        const b = new Base(game, player, maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        let spawnPoint = b.tile;
        while (spawnPoint.id === b.tile.id)
          spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

/**
 * Capture the Flag game mode.
 * @extends Gamemode
 */
export class CaptureTheFlag extends Gamemode {
  /**
   * Creates a new CaptureTheFlag mode.
   * @param {Game} game - The game instance.
   */
  constructor(game) {
    super(game);
    this.name = "CaptureTheFlag";
    this.initiated = false;
    this.BaseSpawnDistance = 7;
  }

  /**
   * Updates team score.
   * @param {Player} player - The player involved.
   * @param {number} val - The score value.
   */
  giveScore(player, val = 1) {
    for (let i = 0; i < this.game.players.length; i++) if (this.game.players[i].team === player.team) this.game.players[i].score += val;
    if (window.updateScores) window.updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1, player2) {
    if (player1.team != player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }
      if (window.updateScores) window.updateScores();
    }
  }

  /**
   * Initialize bases and spawn players.
   */
  init() {
    const bases = [];
    const game = this.game;

    // create single base for each team
    for (let i = 0; i < game.players.length; i++) {
      let baseExists = false;
      const player = game.players[i];
      for (let j = 0; j < bases.length; j++)
        if (player.team === bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        let maxLength = -1;
        let maxPos = game.map.spawnPoint();
        for (let k = 0; k < 100; k++) {
          const pos = game.map.spawnPoint();
          const tile = game.map.getTileByPos(pos.x, pos.y);
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            bases.push(game.map.spawnPoint());
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            const path = tile.pathTo(function (destination) {
              return destination.id === stile.id;
            });
            if (path !== -1) length += path.length * path.length;
          }
          if (initfirst) bases.pop();
          for (let j = 0; j < bases.length; j++) if (bases[j].x === pos.x && bases[j].y === pos.y) length = -1;
          if (length > maxLength) {
            maxLength = length;
            maxPos = pos;
          }
        }
        const b = new Base(game, player, maxPos.x, maxPos.y);
        b.flag = new Flag(game, b);
        b.flag.drop(maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        let spawnPoint = b.tile;
        while (spawnPoint.id === b.tile.id)
          spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

/**
 * Map Editor game mode.
 * @extends Gamemode
 */
export class MapEditor extends Gamemode {
  /**
   * Creates a new MapEditor mode.
   * @param {Game} game - The game instance.
   * @param {boolean} clearmap - Whether to clear the map on init.
   */
  constructor(game, clearmap = true) {
    super(game);
    this.clearmap = clearmap;
  }

  /**
   * Initializes the map editor.
   */
  init() {
    const map = this.game.map;
    if (this.clearmap) {
      // Start with a grid with no walls
      for (let i = 0; i < map.Nx * map.Ny; i++) map.tiles[i].walls = [false, false, false, false];
      // border walls
      for (let i = 0; i < map.Nx; i++) {
        map.getTileByIndex(i, 0).walls[0] = true;
        map.getTileByIndex(i, map.Ny - 1).walls[2] = true;
      }
      for (let i = 0; i < map.Ny; i++) {
        map.getTileByIndex(0, i).walls[1] = true;
        map.getTileByIndex(map.Nx - 1, i).walls[3] = true;
      }
    }
    // add single player
    this.game.players = [];
    const p = new Player();
    this.game.addPlayer(p);
    p.keys = keymaps[0];
    p.color = playercolors[0];
  }

  /**
   * Logic step for map editor.
   */
  step() {
    const t = this.game.players[0].tank;
    if (t.weapon.name !== "WallBuilder") {
      t.weapon = new WallBuilder(t);
      t.defaultWeapon = function () {
        t.weapon = new WallBuilder(t);
      };
      t.checkWallCollision = function () {
        return false;
      };
    }
  }
}

/**
 * King of the Hill game mode.
 * @extends Gamemode
 */
export class KingOfTheHill extends Gamemode {
  /**
   * Creates a new KingOfTheHill mode.
   * @param {Game} game - The game instance.
   */
  constructor(game) {
    super(game);
    this.name = "KingOfTheHill";
    this.bases = [];
  }

  /**
   * Updates player score.
   * @param {Player} player - The player.
   * @param {number} val - Score value.
   */
  giveScore(player, val = 1) {
    player.score += val;
    if (window.updateScores) window.updateScores();
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1, player2) {
    if (player1.team !== player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }
      if (window.updateScores) window.updateScores();
    }
  }

  /**
   * Updates game state, checking hill control.
   */
  step() {
    // if all bases same color: score in intervals for team
    const scoreevery = 2000;
    let equal = true;
    if (this.bases.length > 0) {
      for (let i = 0; i < this.bases.length; i++) {
        if (this.bases[i].team !== this.bases[0].team) {
          equal = false;
          break;
        }
      }
      const team = this.bases[0].team;
      if (equal && team !== "#555" && this.game.t % scoreevery === 0) {
        for (let i = 0; i < this.game.players.length; i++) if (this.game.players[i].team === team) this.giveScore(this.game.players[i], 1);
        adaptBotSpeed(team, 0.02);
      }
    }
  }

  /**
   * Initializes hills and spawn points.
   */
  init() {
    const bases = [];
    const game = this.game;

    // create players.length-1 bases
    for (let ni = 0; ni < game.players.length - 1; ni++) {
      // find spawnPoint that is far away from existing bases
      let maxLength = -1;
      let maxPos = game.map.spawnPoint();
      for (let k = 0; k < 100; k++) {
        const pos = game.map.spawnPoint();
        const tile = game.map.getTileByPos(pos.x, pos.y);
        let length = 0;
        let initfirst = false;
        if (bases.length === 0) {
          bases.push(game.map.spawnPoint());
          initfirst = true;
        }
        for (let j = 0; j < bases.length; j++) {
          const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
          const path = tile.pathTo(function (destination) {
            return destination.id === stile.id;
          });
          if (path !== -1) length += path.length * path.length;
        }
        if (initfirst) bases.pop();
        for (let j = 0; j < bases.length; j++) if (bases[j].x === pos.x && bases[j].y === pos.y) length = -1;
        if (length > maxLength) {
          maxLength = length;
          maxPos = pos;
        }
      }
      const b = new Hill(game, maxPos.x, maxPos.y);
      bases.push(b);
      game.addObject(b);
    }
    this.bases = bases;
  }
}
