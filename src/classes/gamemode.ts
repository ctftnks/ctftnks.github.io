import Player from "./player";
import { Flag, Base, Hill } from "./ctf";
import { playSound } from "../effects";
import { adaptBotSpeed } from "./bot";
import { SOUNDS } from "../assets";
import Game from "./game";
import { Tile } from "./gamemap";
import { updateScores } from "../ui";

/**
 * Base class for game modes.
 */
export class Gamemode {
  name: string = "defaultmode";
  game: Game;
  BaseSpawnDistance: number = 2;

  /**
   * Creates a new Gamemode.
   * @param {Game} game - The game instance.
   */
  constructor(game: Game) {
    /** Corresponding Game instance. */
    this.game = game;
  }
  /**
   * Called every game step.
   */
  step() {}
  /**
   * Initializes the game mode.
   */
  init() {}

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1: Player, player2: Player) {}

  /**
   * Updates player score (Default implementation)
   */
  giveScore(player: Player, val: number = 1) {}
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
  constructor(game: Game) {
    super(game);
    this.name = "Deathmatch";
  }

  /**
   * Updates player score.
   * @param {Player} player - The player to give score to.
   * @param {number} val - The score value.
   */
  giveScore(player: Player, val: number = 1) {
    player.score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1: Player, player2: Player) {
    if (player1.team === player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }
}

/**
 * Team Deathmatch game mode.
 * @extends Gamemode
 */
export class TeamDeathmatch extends Gamemode {
  initiated: boolean = false;

  /**
   * Creates a new TeamDeathmatch mode.
   * @param {Game} game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "TeamDeathmatch";
  }

  /**
   * Updates team score.
   * @param {Player} player - The player involved (to identify team).
   * @param {number} val - The score value.
   */
  giveScore(player: Player, val: number = 1) {
    for (let i = 0; i < this.game.players.length; i++) if (this.game.players[i].team === player.team) this.game.players[i].score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1: Player, player2: Player) {
    if (player1.team === player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }

  /**
   * Initialize bases and spawn players.
   */
  init() {
    const bases: Base[] = [];
    const game = this.game;
    if (!game.map) return;

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
          if (tile === -1) continue;
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            bases.push(game.map.spawnPoint() as any); // Using spawnPoint directly as base placeholder for dist calc
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map!.getTileByPos(bases[j].x, bases[j].y);
            if (stile === -1) continue;
            const path = (tile as Tile).pathTo((destination) => {
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
        let spawnPoint: Tile = b.tile;
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
  initiated: boolean = false;

  /**
   * Creates a new CaptureTheFlag mode.
   * @param {Game} game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "CaptureTheFlag";
    this.BaseSpawnDistance = 7;
  }

  /**
   * Updates team score.
   * @param {Player} player - The player involved.
   * @param {number} val - The score value.
   */
  giveScore(player: Player, val: number = 1) {
    for (let i = 0; i < this.game.players.length; i++) if (this.game.players[i].team === player.team) this.game.players[i].score += val;
    updateScores();
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1: Player, player2: Player) {
    if (player1.team != player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }
      updateScores();
    }
  }

  /**
   * Initialize bases and spawn players.
   */
  init() {
    const bases: Base[] = [];
    const game = this.game;
    if (!game.map) return;

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
          if (tile === -1) continue;
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            bases.push(game.map.spawnPoint() as any);
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map!.getTileByPos(bases[j].x, bases[j].y);
            if (stile === -1) continue;
            const path = (tile as Tile).pathTo((destination) => {
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
        let spawnPoint: Tile = b.tile;
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
 * King of the Hill game mode.
 * @extends Gamemode
 */
export class KingOfTheHill extends Gamemode {
  bases: Hill[] = [];

  /**
   * Creates a new KingOfTheHill mode.
   * @param {Game} game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "KingOfTheHill";
  }

  /**
   * Updates player score.
   * @param {Player} player - The player.
   * @param {number} val - Score value.
   */
  giveScore(player: Player, val: number = 1) {
    player.score += val;
    updateScores();
  }

  /**
   * Handle a new kill event.
   * @param {Player} player1 - The killer.
   * @param {Player} player2 - The victim.
   */
  newKill(player1: Player, player2: Player) {
    if (player1.team !== player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }
      updateScores();
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
    const bases: Hill[] = [];
    const game = this.game;
    if (!game.map) return;

    // create players.length-1 bases
    for (let ni = 0; ni < game.players.length - 1; ni++) {
      // find spawnPoint that is far away from existing bases
      let maxLength = -1;
      let maxPos = game.map.spawnPoint();
      for (let k = 0; k < 100; k++) {
        const pos = game.map.spawnPoint();
        const tile = game.map.getTileByPos(pos.x, pos.y);
        if (tile === -1) continue;
        let length = 0;
        let initfirst = false;
        if (bases.length === 0) {
          bases.push(game.map.spawnPoint() as any);
          initfirst = true;
        }
        for (let j = 0; j < bases.length; j++) {
          const stile = this.game.map!.getTileByPos(bases[j].x, bases[j].y);
          if (stile === -1) continue;
          const path = (tile as Tile).pathTo((destination) => {
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
