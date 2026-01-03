import Player from "./player";
import { Flag, Base, Hill } from "@/entities/ctf";
import { playSound } from "./effects";
import { adaptBotSpeed } from "./bot";
import { SOUNDS } from "@/game/assets";
import type Game from "./game";
import Tile from "./tile";
import { gameEvents, EVENTS } from "@/game/events";

/**
 * Base class for game modes.
 */
export abstract class Gamemode {
  name: string = "defaultmode";
  game: Game;
  BaseSpawnDistance: number = 2;

  /**
   * Creates a new Gamemode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    /** Corresponding Game instance. */
    this.game = game;
  }
  /**
   * Called every game step.
   */
  step(): void {}
  /**
   * Initializes the game mode.
   */
  init(): void {}

  /**
   * Handle a new kill event.
   * @param player1 - The killer.
   * @param player2 - The victim.
   */
  abstract newKill(player1: Player, player2: Player): void;

  /**
   * Updates player score (Default implementation)
   * @param player
   * @param val
   */
  abstract giveScore(player: Player, val: number): void;
}

/**
 * Deathmatch game mode.
 * @augments Gamemode
 */
export class Deathmatch extends Gamemode {
  /**
   * Creates a new Deathmatch mode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "Deathmatch";
  }

  /**
   * Updates player score.
   * @param player - The player to give score to.
   * @param val - The score value.
   */
  override giveScore(player: Player, val: number = 1): void {
    player.score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    gameEvents.emit(EVENTS.SCORE_UPDATED);
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param player1 - The killer.
   * @param player2 - The victim.
   */
  override newKill(player1: Player, player2: Player): void {
    if (player1.team === player2.team) {
      this.giveScore(player1, -1);
    } else {
      this.giveScore(player1, 1);
    }
  }
}

/**
 * Team Deathmatch game mode.
 * @augments Gamemode
 */
export class TeamDeathmatch extends Gamemode {
  /**
   * Creates a new TeamDeathmatch mode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "TeamDeathmatch";
  }

  /**
   * Updates team score.
   * @param player - The player involved (to identify team).
   * @param val - The score value.
   */
  override giveScore(player: Player, val: number = 1): void {
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i].team === player.team) {
        this.game.players[i].score += val;
      }
    }
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
    gameEvents.emit(EVENTS.SCORE_UPDATED);
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param player1 - The killer.
   * @param player2 - The victim.
   */
  override newKill(player1: Player, player2: Player): void {
    if (player1.team === player2.team) {
      this.giveScore(player1, -1);
    } else {
      this.giveScore(player1, 1);
    }
  }

  /**
   * Initialize bases and spawn players.
   */
  override init(): void {
    const bases: Base[] = [];
    const game = this.game;
    if (!game.map) {
      return;
    }

    // create single base for each team
    for (let i = 0; i < game.players.length; i++) {
      let baseExists = false;
      const player = game.players[i];
      for (let j = 0; j < bases.length; j++) {
        if (player.team === bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        let maxLength = 0;
        let maxPos = game.map.spawnPoint();
        for (let k = 0; k < 100; k++) {
          const pos = game.map.spawnPoint();
          const tile = game.map.getTileByPos(pos.x, pos.y);
          if (tile === null) {
            continue;
          }
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            // Using spawnPoint directly as base placeholder for dist calc
            const sp = game.map.spawnPoint();
            bases.push(new Base(game, player, sp.x, sp.y));
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            if (stile === null) {
              continue;
            }
            const path = (tile as Tile).pathTo((destination) => {
              return destination.id === stile.id;
            });
            if (path !== null) {
              length += path.length * path.length;
            }
          }
          if (initfirst) {
            bases.pop();
          }
          for (let j = 0; j < bases.length; j++) {
            if (bases[j].x === pos.x && bases[j].y === pos.y) {
              length = -1;
            }
          }
          if (length > maxLength) {
            maxLength = length;
            maxPos = pos;
          }
        }
        const b = new Base(game, player, maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        let spawnPoint: Tile = b.tile!;
        while (spawnPoint.id === b.tile!.id) {
          spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        }
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

/**
 * Capture the Flag game mode.
 * @augments Gamemode
 */
export class CaptureTheFlag extends Gamemode {
  /**
   * Creates a new CaptureTheFlag mode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "CaptureTheFlag";
    this.BaseSpawnDistance = 7;
  }

  /**
   * Updates team score.
   * @param player - The player involved.
   * @param val - The score value.
   */
  override giveScore(player: Player, val: number = 1): void {
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i].team === player.team) {
        this.game.players[i].score += val;
      }
    }
    gameEvents.emit(EVENTS.SCORE_UPDATED);
    adaptBotSpeed(player.team);
  }

  /**
   * Handle a new kill event.
   * @param player1 - The killer.
   * @param player2 - The victim.
   */
  override newKill(player1: Player, player2: Player): void {
    if (player1.team != player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }

      gameEvents.emit(EVENTS.SCORE_UPDATED);
    }
  }

  /**
   * Initialize bases and spawn players.
   */
  override init(): void {
    const bases: Base[] = [];
    const game = this.game;
    if (!game.map) {
      return;
    }

    // create single base for each team
    for (let i = 0; i < game.players.length; i++) {
      let baseExists = false;
      const player = game.players[i];
      for (let j = 0; j < bases.length; j++) {
        if (player.team === bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        let maxLength = -1;
        let maxPos = game.map.spawnPoint();
        for (let k = 0; k < 100; k++) {
          const pos = game.map.spawnPoint();
          const tile = game.map.getTileByPos(pos.x, pos.y);
          if (tile === null) {
            continue;
          }
          let length = 0;
          let initfirst = false;
          if (bases.length === 0) {
            const sp = game.map.spawnPoint();
            bases.push(new Base(game, player, sp.x, sp.y));
            initfirst = true;
          }
          for (let j = 0; j < bases.length; j++) {
            const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            if (stile === null) {
              continue;
            }
            const path = (tile as Tile).pathTo((destination) => {
              return destination.id === stile.id;
            });
            if (path !== null) {
              length += path.length * path.length;
            }
          }
          if (initfirst) {
            bases.pop();
          }
          for (let j = 0; j < bases.length; j++) {
            if (bases[j].x === pos.x && bases[j].y === pos.y) {
              length = -1;
            }
          }
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
        let spawnPoint: Tile = b.tile!;
        while (spawnPoint.id === b.tile!.id) {
          spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        }
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

/**
 * King of the Hill game mode.
 * @augments Gamemode
 */
export class KingOfTheHill extends Gamemode {
  bases: Hill[] = [];

  /**
   * Creates a new KingOfTheHill mode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.name = "KingOfTheHill";
  }

  /**
   * Updates player score.
   * @param player - The player.
   * @param val - Score value.
   */
  override giveScore(player: Player, val: number = 1): void {
    player.score += val;
    gameEvents.emit(EVENTS.SCORE_UPDATED);
  }

  /**
   * Handle a new kill event.
   * @param player1 - The killer.
   * @param player2 - The victim.
   */
  override newKill(player1: Player, player2: Player): void {
    if (player1.team !== player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 === 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound(SOUNDS.killingspree);
      }

      gameEvents.emit(EVENTS.SCORE_UPDATED);
    }
  }

  /**
   * Updates game state, checking hill control.
   */
  override step(): void {
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
      if (equal && team !== null && this.game.t % scoreevery === 0) {
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i].team === team) {
            this.giveScore(this.game.players[i], 1);
          }
        }
        adaptBotSpeed(team, 0.02);
      }
    }
  }

  /**
   * Initializes hills and spawn points.
   */
  override init(): void {
    const bases: Hill[] = [];
    const game = this.game;
    if (!game.map) {
      return;
    }

    // create players.length-1 bases
    for (let ni = 0; ni < game.players.length - 1; ni++) {
      // find spawnPoint that is far away from existing bases
      let maxLength = 0;
      let maxPos = game.map.spawnPoint();
      for (let k = 0; k < 100; k++) {
        const pos = game.map.spawnPoint();
        const tile = game.map.getTileByPos(pos.x, pos.y);
        if (tile === null) {
          continue;
        }
        let length = 0;
        let initfirst = false;
        if (bases.length === 0) {
          const sp = game.map.spawnPoint();
          bases.push(new Base(game, null, sp.x, sp.y));
          initfirst = true;
        }
        for (let j = 0; j < bases.length; j++) {
          const stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
          if (stile === null) {
            continue;
          }
          const path = (tile as Tile).pathTo((destination) => {
            return destination.id === stile.id;
          });
          if (path !== null) {
            length += path.length * path.length;
          }
        }
        if (initfirst) {
          bases.pop();
        }
        for (let j = 0; j < bases.length; j++) {
          if (bases[j].x === pos.x && bases[j].y === pos.y) {
            length = -1;
          }
        }
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
