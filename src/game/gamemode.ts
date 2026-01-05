import Player from "./player";
import Flag from "@/entities/flag";
import Base from "@/entities/base";
import Hill from "@/entities/hill";
import { playSound } from "./effects";
import { SOUNDS } from "@/game/assets";
import type Game from "./game";
import type Team from "./team";
import { Settings } from "@/stores/settings";
import { store } from "@/stores/gamestore";
import type Coord from "@/entities/coord";

/**
 * Base class for game modes.
 */
export abstract class Gamemode {
  name: string = "defaultmode";
  /** Corresponding Game instance. */
  game: Game;
  /** Distance from base center to player spawn point (used in Player.spawn). */
  BaseSpawnDistance: number = 2;

  /**
   * Creates a new Gamemode.
   * @param game - The game instance.
   */
  constructor(game: Game) {
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
   * Updates player score.
   * @param player - The player.
   * @param val - The score value.
   */
  abstract giveScore(player: Player, val: number): void;

  /**
   * Adapts bot speed based on team balance.
   * @param team - The team to adjust for (usually the leading team gets harder bots?).
   * @param val - The adaptation intensity.
   */
  protected adaptBotSpeed(team: Team | null, val: number = 0.1): void {
    if (!Settings.AdaptiveBotSpeed || !team) {
      return;
    }

    const teamData = new Map<Team, { botCount: number }>();
    for (const player of store.players) {
      const data = teamData.get(player.team) ?? { botCount: 0 };
      if (player.isBot()) {
        data.botCount++;
      }
      teamData.set(player.team, data);
    }

    const teams = Array.from(teamData.keys());
    if (teams.length === 0) {
      return;
    }

    const avgBots = Array.from(teamData.values()).reduce((sum, d) => sum + d.botCount, 0) / teams.length;
    const currentTeamBots = teamData.get(team)?.botCount ?? 0;

    // Adjust global bot speed based on team composition balance
    Settings.BotSpeed += (avgBots - currentTeamBots) * val;
  }

  /**
   * Initializes bases for each team.
   * Ensures one base per team, placed far from each other.
   * @param onBaseCreated - Callback for additional base setup (e.g., adding flags).
   */
  protected initTeamBases(onBaseCreated?: (base: Base) => void): void {
    const game = this.game;
    if (!game.map) {
      return;
    }

    const bases: Base[] = [];
    const teamMap = new Map<Team, Base>();

    // identify unique teams
    const teams = new Set<Team>();
    for (const player of game.players) {
      if (player.team) {
        teams.add(player.team);
      }
    }

    // create base for each team
    for (const team of teams) {
      const avoidPoints: Coord[] = bases.map((b) => ({ x: b.x, y: b.y }));
      const pos = game.map.getFurthestSpawnPoint(avoidPoints);

      // We need a player owner for the base constructor, pick the first one from the team
      const owner = game.players.find((p) => p.team === team) || null;

      const base = new Base(game, owner, pos.x, pos.y);
      bases.push(base);
      teamMap.set(team, base);
      game.addObject(base);

      if (onBaseCreated) {
        onBaseCreated(base);
      }
    }

    // Assign bases to all players
    for (const player of game.players) {
      if (player.team && teamMap.has(player.team)) {
        player.base = teamMap.get(player.team);
      }
    }
  }

  protected handleMultiKill(player: Player): void {
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 === 0) {
      player.score += Math.floor(player.spree / 5);
      playSound(SOUNDS.killingspree);
    }
  }
}

/**
 * Deathmatch game mode.
 */
export class Deathmatch extends Gamemode {
  constructor(game: Game) {
    super(game);
    this.name = "Deathmatch";
  }

  override giveScore(player: Player, val: number = 1): void {
    player.score += val;
    this.handleMultiKill(player);
    this.adaptBotSpeed(player.team);
  }

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
  constructor(game: Game) {
    super(game);
    this.name = "TeamDeathmatch";
  }

  override giveScore(player: Player, val: number = 1): void {
    // Give score to all team members
    for (const p of this.game.players) {
      if (p.team === player.team) {
        p.score += val;
      }
    }
    this.handleMultiKill(player);
    this.adaptBotSpeed(player.team);
  }

  override newKill(player1: Player, player2: Player): void {
    if (player1.team === player2.team) {
      this.giveScore(player1, -1);
    } else {
      this.giveScore(player1, 1);
    }
  }

  override init(): void {
    this.initTeamBases();
  }
}

/**
 * Capture the Flag game mode.
 * @augments Gamemode
 */
export class CaptureTheFlag extends Gamemode {
  constructor(game: Game) {
    super(game);
    this.name = "CaptureTheFlag";
    this.BaseSpawnDistance = 7;
  }

  override giveScore(player: Player, val: number = 1): void {
    for (const p of this.game.players) {
      if (p.team === player.team) {
        p.score += val;
      }
    }
    this.adaptBotSpeed(player.team);
  }

  override newKill(player1: Player, player2: Player): void {
    if (player1.team !== player2.team) {
      this.handleMultiKill(player1);
    }
  }

  override init(): void {
    this.initTeamBases((base) => {
      base.flag = new Flag(this.game, base);
      base.flag.drop(base.x, base.y);
    });
  }
}

/**
 * King of the Hill game mode.
 * @augments Gamemode
 */
export class KingOfTheHill extends Gamemode {
  bases: Hill[] = [];
  private readonly SCORE_INTERVAL = 2000;

  constructor(game: Game) {
    super(game);
    this.name = "KingOfTheHill";
  }

  override giveScore(player: Player, val: number = 1): void {
    player.score += val;
  }

  override newKill(player1: Player, player2: Player): void {
    if (player1.team !== player2.team) {
      this.handleMultiKill(player1);
    }
  }

  override step(): void {
    // Score periodically if one team controls all hills (or just the active hill?)
    if (this.bases.length === 0) {
      return;
    }
    const firstTeam = this.bases[0].team;
    if (!firstTeam) {
      return;
    }
    const allSameTeam = this.bases.every((b) => b.team === firstTeam);

    if (allSameTeam && this.game.t % this.SCORE_INTERVAL === 0) {
      for (const p of this.game.players) {
        if (p.team === firstTeam) {
          this.giveScore(p, 1);
        }
      }
      this.adaptBotSpeed(firstTeam, 0.02);
    }
  }

  override init(): void {
    const game = this.game;
    if (!game.map) {
      return;
    }

    this.bases = [];
    // Create players.length - 1 hills
    const numHills = Math.max(1, game.players.length - 1);

    for (let i = 0; i < numHills; i++) {
      const avoidPoints: Coord[] = this.bases.map((b) => ({ x: b.x, y: b.y }));
      const pos = game.map.getFurthestSpawnPoint(avoidPoints);

      const hill = new Hill(game, pos.x, pos.y);
      this.bases.push(hill);
      game.addObject(hill);
    }
  }
}
