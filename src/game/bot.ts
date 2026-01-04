import Player from "./player";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";
import Tile from "./tile";
import { PowerUp } from "@/entities/powerup";
import Tank from "@/entities/tank";
import { Base, Flag, Hill } from "@/entities/ctf";
import Coord from "@/entities/coord";
import { Laser, Guided, WreckingBall, Slingshot } from "@/entities/weapons/weapons";
import { CaptureTheFlag, KingOfTheHill } from "./gamemode";
import { gameEvents, EVENTS } from "@/game/events";
import Team from "./team";
import type Game from "./game";

/** Options that are considered by the autopilot */
interface AutopilotOption {
  f: () => void; // an action function
  weight: number; // how strong the option is (higher weight = stronger option)
}

/**
 * A bot player that controls a tank automatically.
 * @augments Player
 */
export default class Bot extends Player {
  // keys are inherited from Player
  goto: Coord | null = null;
  fleeing: { from: Tile[] | null; condition: (() => boolean) | null } = { from: null, condition: null };
  lastChecked: number = 0;

  /**
   * Creates a new Bot.
   * @param id - The player ID.
   * @param name - The bot name.
   * @param team - The team of the bot.
   */
  constructor(id: number, name: string, team: Team) {
    super(id, name, team, []);
  }

  /**
   * Is the player a bot or a user?
   */
  isBot(): boolean {
    return true;
  }

  /**
   * Updates the bot's state.
   * @param tank - the tank to be steered
   */
  steer(tank: Tank): void {
    if (!this.game) {
      return;
    }
    this.autopilot(tank, this.game);
    this.performMovements(tank);
  }

  /**
   * Decides the next action for the bot.
   * @param tank The tank to be steered by the bot
   * @param game The game in which the tank lives
   */
  private autopilot(tank: Tank, game: Game): void {
    this.lastChecked += Settings.GameFrequency;
    if (this.lastChecked < 72000 / tank.speed) {
      return;
    }
    this.lastChecked = 0;

    const weapon = tank.weapon;
    const invincible = tank.invincible();
    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return;
    }

    const opts: AutopilotOption[] = [];

    const powerupPath = tile.xypathToObj((obj) => obj instanceof PowerUp && obj.attractsBots, 2);

    if (powerupPath) {
      opts.push({
        f: () => this.follow(powerupPath),
        weight: 100,
      });
    }

    const enemyPath = tile.xypathToObj((obj) => obj instanceof Tank && obj.player.team !== this.team);

    if (enemyPath) {
      const enemy = enemyPath[enemyPath.length - 1] as Tank;
      opts.push({
        f: () => this.follow(enemyPath),
        weight: 5,
      });

      if (weapon.isActive) {
        const aimbot = this.aimbot(tank, enemy, enemyPath);
        if (enemy.carriedFlag) {
          aimbot.weight *= 2;
        }
        if (aimbot.shouldShoot) {
          opts.push({
            f: () => this.shoot(tank, aimbot.target),
            weight: aimbot.weight,
          });
        }
      }
    }

    if (game.mode instanceof CaptureTheFlag) {
      const carriesFlag = tank.carriedFlag !== null;
      const flagInBase = this.base != undefined && this.base.hasFlag();
      const ctfPath = tile.xypathToObj((obj) => {
        if (!carriesFlag && obj instanceof Flag && obj.team !== this.team) {
          return true;
        }
        if (carriesFlag && obj instanceof Base && obj.hasFlag() && obj.team === this.team) {
          return true;
        }
        if (!flagInBase) {
          if (obj instanceof Flag && obj.team === this.team) {
            return true;
          }
          if (obj instanceof Tank && obj.carriedFlag && obj.carriedFlag.team === this.team) {
            return true;
          }
        }
        return false;
      });

      if (ctfPath) {
        const weight = invincible && carriesFlag && flagInBase ? 600 : carriesFlag || !flagInBase ? 300 : 50;
        opts.push({
          f: () => this.follow(ctfPath),
          weight,
        });
      }
    } else if (game.mode instanceof KingOfTheHill) {
      const basePath = tile.xypathToObj((obj) => obj instanceof Hill && obj.team !== this.team);
      if (basePath) {
        const weight = basePath.length < 6 ? 300 : 50;
        opts.push({
          f: () => this.follow(basePath),
          weight,
        });
      }
    }

    const fleePath = this.getFleePath(tank);
    if (fleePath) {
      const weight = invincible ? 1 : 400;
      opts.push({
        f: () => this.follow(fleePath),
        weight,
      });
    }

    if (opts.length > 0) {
      opts.sort((a, b) => b.weight - a.weight);
      opts[0].f();
    } else {
      this.goto = null;
    }
  }

  /**
   * Sets a goto target from a path.
   * @param path - The path to follow.
   */
  private follow(path: Coord[]): void {
    this.goto = path.length < 2 ? path[0] : path[1];
  }

  /**
   * Performs movements towards the goto target.
   * @param tank The tank to be steered by the bot
   */
  private performMovements(tank: Tank): void {
    if (!this.goto) {
      return;
    }
    const distx = this.goto.x - tank.x;
    const disty = this.goto.y - tank.y;

    let newangle = (Math.atan2(-distx, disty) + Math.PI) % (2 * Math.PI);
    if (newangle < 0) {
      newangle += 2 * Math.PI;
    }

    tank.angle = ((tank.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const diff = Math.abs(tank.angle - newangle);
    if (diff < 0.6 || Math.abs(diff - Math.PI * 2) < 0.6) {
      tank.move(Settings.BotSpeed);
    }

    if (diff < 0.1) {
      tank.angle = newangle;
    } else if (tank.angle < newangle) {
      tank.turn(diff < Math.PI ? 2 * Settings.BotSpeed : -2 * Settings.BotSpeed);
    } else {
      tank.turn(diff < Math.PI ? -2 * Settings.BotSpeed : 2 * Settings.BotSpeed);
    }
  }

  /**
   * Handles shooting logic.
   * @param target - The target to shoot at.
   */
  private shoot(tank: Tank, target: Tank): void {
    this.goto = null;
    const distx = target.x - tank.x;
    const disty = target.y - tank.y;
    tank.angle = Math.atan2(-distx, disty) + Math.PI;
    if (target.player?.isBot()) {
      window.setTimeout(() => tank.shoot(), 180 * Math.random());
    } else {
      tank.shoot();
    }
    this.flee(tank);
  }

  /**
   * Evaluates whether it is a good idea to shoot.
   * @param enemy - The enemy tank.
   * @param path - Path to the enemy.
   * @returns Result with shouldShoot, target, and weight.
   */
  private aimbot(tank: Tank, enemy: Tank, path: Coord[] | null = null): { shouldShoot: boolean; target: Tank; weight: number } {
    const result = { shouldShoot: false, target: enemy, weight: 500 };
    if (!tank) {
      return result;
    }
    const weapon = tank.weapon;

    if (!path && this.game?.map) {
      const tile = this.game.map.getTileByPos(tank.x, tank.y);
      if (tile) {
        path = tile.xypathToObj((obj) => obj === enemy);
      }
    }

    if (!path) {
      return result;
    }

    const r = Math.random() > 0.6 ? 2 : 1;
    if (path.length <= weapon.bot.shootingRange + r && !enemy.invincible()) {
      result.shouldShoot = true;
    }

    if (weapon instanceof Laser) {
      result.shouldShoot = weapon.trajectory.targets.some((t) => t.player.team !== this.team && !enemy.invincible());
    } else if (weapon instanceof Guided || weapon instanceof WreckingBall) {
      result.shouldShoot = false;
      result.weight = 200;
      const tile = this.game?.map.getTileByPos(tank.x, tank.y);
      if (tile) {
        for (let i = 0; i < 4; i++) {
          if (tile.walls[i] !== weapon instanceof Guided) {
            result.shouldShoot = true;
            const angle = (-Math.PI / 2) * i;
            result.target = { x: tank.x + Math.sin(angle), y: tank.y - Math.cos(angle) } as Tank;
          }
        }
      }
    } else if (weapon instanceof Slingshot) {
      result.weight = 1100;
      const dist = Math.hypot(tank.x - enemy.x, tank.y - enemy.y);
      result.shouldShoot = dist < 400 && !enemy.invincible();
    }
    return result;
  }

  /**
   * Calculates a path to flee from danger.
   * @returns The flee path or null if no path found.
   */
  private getFleePath(tank: Tank): Coord[] | null {
    if (!this.fleeing.from || !this.fleeing.condition || !this.fleeing.condition()) {
      return null;
    }
    if (!tank.weapon.bot.fleeIfActive && tank.weapon.isActive) {
      return null;
    }

    const tile = this.game?.map?.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return null;
    }

    if (!this.fleeing.from.includes(tile)) {
      this.fleeing.from.push(tile);
    }

    let nextTile: Tile = tile;
    for (let i = 0; i < 4; i++) {
      const ntile = tile.neighbors[i];
      if (!tile.walls[i] && ntile && !this.fleeing.from.includes(ntile)) {
        nextTile = ntile;
        break;
      }
    }

    return [tile, nextTile].map((t) => ({
      x: t.x + t.dx / 2,
      y: t.y + t.dy / 2,
    }));
  }

  /**
   * Initiates fleeing behavior.
   */
  private flee(tank: Tank): void {
    if (tank.weapon.bot.fleeingDuration <= 0 || !this.game?.map) {
      return;
    }
    const tile = this.game.map.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return;
    }

    const nextTile = this.game.map.getTileByPos(
      tank.x + tile.dx * Math.sin(tank.angle),
      tank.y - tile.dy * Math.cos(tank.angle),
    );
    this.fleeing.from = nextTile ? [nextTile, tile] : [tile];

    const weapon = tank.weapon;
    const fleeUntil = this.game.t + weapon.bot.fleeingDuration;
    this.fleeing.condition = () => this.game != undefined && this.game.t < fleeUntil && (!weapon.bot.fleeIfActive || weapon.isActive);
  }
}

/**
 * Adapts bot speed based on team balance.
 * @param team - The players team.
 * @param val - The adaptation value.
 * @returns The new bot speed.
 */
export function adaptBotSpeed(team: Team, val: number = 0.1): number | undefined {
  if (!Settings.AdaptiveBotSpeed) {
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
  const avgbots = Array.from(teamData.values()).reduce((sum, d) => sum + d.botCount, 0) / teams.length;
  const currentTeamBots = teamData.get(team)?.botCount ?? 0;
  Settings.BotSpeed += (avgbots - currentTeamBots) * val;

  gameEvents.emit(EVENTS.BOT_SPEED_UPDATED, Settings.BotSpeed);
  return Settings.BotSpeed;
}
