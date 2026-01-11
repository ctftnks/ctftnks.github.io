import Player from "./player";
import Flag from "@/entities/flag";
import Base, { Hill } from "@/entities/base";
import { playSound } from "./effects";
import { SOUNDS } from "@/game/assets";
import type Game from "./game";
import type Team from "./team";
import { Settings } from "@/stores/settings";
import type Coord from "@/entities/coord";

/**
 * Base class for game modes.
 */
export abstract class Gamemode {
  name: string = "defaultmode";
  /** Distance from base center to player spawn point (used in Player.spawn). */
  BaseSpawnDistance: number = 2;

  /**
   * Creates a new Gamemode.
   * @param game - The game instance.
   */
  constructor(public game: Game) {}

  /**
   * Called every game step.
   * @param _dt - The time elapsed since the last frame in milliseconds.
   */
  step(_dt: number): void {}

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
   * @param players - The list of players including the bots of whom to adapt the speed
   * @param team - The team to adjust for (usually the leading team gets harder bots?).
   * @param val - The adaptation intensity.
   */
  protected adaptBotSpeed(players: Player[], team: Team | null, val: number = 0.1): void {
    if (!Settings.AdaptiveBotSpeed || !team) {
      return;
    }

    const teamData = new Map<Team, { botCount: number }>();
    for (const player of players) {
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
   */
  protected initTeamBases(): Base[] {
    const game = this.game;
    const bases: Base[] = [];
    if (!game.map) {
      return bases;
    }
    // get set of unique teams
    const teams: Set<Team> = new Set(game.players.map((p) => p.team));
    // create base for each team
    for (const team of teams) {
      const avoidPoints: Coord[] = bases.length > 0 ? bases.slice() : [game.map.getFurthestSpawnPoint([])];
      const pos = game.map.getFurthestSpawnPoint(avoidPoints);
      const base = new Base(game, pos.x, pos.y, team);
      bases.push(base);
      game.addObject(base);
      // Assign base to all players of the corresponding team
      for (const player of game.players.filter((p) => p.team === team)) {
        player.base = base;
      }
    }
    return bases;
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
    this.adaptBotSpeed(this.game.players, player.team);
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
    this.adaptBotSpeed(this.game.players, player.team);
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
    this.adaptBotSpeed(this.game.players, player.team);
  }

  override newKill(player1: Player, player2: Player): void {
    if (player1.team !== player2.team) {
      this.handleMultiKill(player1);
    }
  }

  override init(): void {
    const bases = this.initTeamBases();
    // Add flags to bases
    for (const base of bases) {
      base.flag = new Flag(this.game, base);
      base.flag.drop(base.x, base.y);
    }
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

  override step(_dt: number): void {
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
      this.adaptBotSpeed(this.game.players, firstTeam, 0.02);
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
