import { Settings } from "@/stores/settings";
import Tile from "./tile";
import { PowerUp } from "@/entities/powerup";
import Tank from "@/entities/tank";
import { Base, Flag, Hill } from "@/entities/ctf";
import Coord from "@/entities/coord";
import { Laser, Guided, WreckingBall, Slingshot } from "@/entities/weapons/weapons";
import { CaptureTheFlag, KingOfTheHill } from "./gamemode";
import type Game from "./game";

/** Options that are considered by the autopilot */
interface AutopilotOption {
  f: () => void; // an action function
  weight: number; // how strong the option is (higher weight = stronger option)
}

/**
 * Handles the automatic steering logic for a bot player.
 */
export default class Autopilot {
  goto: Coord | null = null;
  private lastChecked: number = 0;
  private fleeing: { from: Tile[] | null; condition: (() => boolean) | null } = { from: null, condition: null };

  /**
   * Creates a new Autopilot.
   */
  constructor() {}

  /**
   * Decides and performs the next action for the bot.
   * @param tank - The tank to be steered.
   * @param game - The game in which the tank lives.
   */
  step(tank: Tank, game: Game): void {
    this.autopilot(tank, game);
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

    const bot = tank.player;
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

    const enemyPath = tile.xypathToObj((obj) => obj instanceof Tank && obj.player.team !== bot.team);

    if (enemyPath) {
      const enemy = enemyPath[enemyPath.length - 1] as Tank;
      opts.push({
        f: () => this.follow(enemyPath),
        weight: 5,
      });

      if (weapon.isActive) {
        const aimbot = this.aimbot(tank, enemy, enemyPath, game);
        if (enemy.carriedFlag) {
          aimbot.weight *= 2;
        }
        if (aimbot.shouldShoot) {
          opts.push({
            f: () => this.shoot(tank, aimbot.target, game),
            weight: aimbot.weight,
          });
        }
      }
    }

    if (game.mode instanceof CaptureTheFlag) {
      const carriesFlag = tank.carriedFlag !== null;
      const flagInBase = bot.base != undefined && bot.base.hasFlag();
      const ctfPath = tile.xypathToObj((obj) => {
        if (!carriesFlag && obj instanceof Flag && obj.team !== bot.team) {
          return true;
        }
        if (carriesFlag && obj instanceof Base && obj.hasFlag() && obj.team === bot.team) {
          return true;
        }
        if (!flagInBase) {
          if (obj instanceof Flag && obj.team === bot.team) {
            return true;
          }
          if (obj instanceof Tank && obj.carriedFlag && obj.carriedFlag.team === bot.team) {
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
      const basePath = tile.xypathToObj((obj) => obj instanceof Hill && obj.team !== bot.team);
      if (basePath) {
        const weight = basePath.length < 6 ? 300 : 50;
        opts.push({
          f: () => this.follow(basePath),
          weight,
        });
      }
    }

    const fleePath = this.getFleePath(tank, game);
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
   * @param tank - The tank that shoots.
   * @param target - The target to shoot at.
   * @param game - The current game.
   */
  private shoot(tank: Tank, target: Tank, game: Game): void {
    this.goto = null;
    const distx = target.x - tank.x;
    const disty = target.y - tank.y;
    tank.angle = Math.atan2(-distx, disty) + Math.PI;
    if (target.player?.isBot()) {
      window.setTimeout(() => tank.shoot(), 180 * Math.random());
    } else {
      tank.shoot();
    }
    this.flee(tank, game);
  }

  /**
   * Evaluates whether it is a good idea to shoot.
   * @param tank - The bot's tank.
   * @param enemy - The enemy tank.
   * @param path - Path to the enemy.
   * @param game - The current game.
   * @returns Result with shouldShoot, target, and weight.
   */
  private aimbot(tank: Tank, enemy: Tank, path: Coord[] | null = null, game: Game): { shouldShoot: boolean; target: Tank; weight: number } {
    const result = { shouldShoot: false, target: enemy, weight: 500 };
    const weapon = tank.weapon;

    if (!path && game.map) {
      const tile = game.map.getTileByPos(tank.x, tank.y);
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
      result.shouldShoot = weapon.trajectory.targets.some((t) => t.player.team !== tank.player.team && !enemy.invincible());
    } else if (weapon instanceof Guided || weapon instanceof WreckingBall) {
      result.shouldShoot = false;
      result.weight = 200;
      const tile = game.map.getTileByPos(tank.x, tank.y);
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
   * @param tank - The bot's tank.
   * @param game - The current game.
   * @returns The flee path or null if no path found.
   */
  private getFleePath(tank: Tank, game: Game): Coord[] | null {
    if (!this.fleeing.from || !this.fleeing.condition || !this.fleeing.condition()) {
      return null;
    }
    if (!tank.weapon.bot.fleeIfActive && tank.weapon.isActive) {
      return null;
    }

    const tile = game.map?.getTileByPos(tank.x, tank.y);
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
   * @param tank - The bot's tank.
   * @param game - The current game.
   */
  private flee(tank: Tank, game: Game): void {
    if (tank.weapon.bot.fleeingDuration <= 0 || !game.map) {
      return;
    }
    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return;
    }

    const nextTile = game.map.getTileByPos(tank.x + tile.dx * Math.sin(tank.angle), tank.y - tile.dy * Math.cos(tank.angle));
    this.fleeing.from = nextTile ? [nextTile, tile] : [tile];

    const weapon = tank.weapon;
    const fleeUntil = game.t + weapon.bot.fleeingDuration;
    this.fleeing.condition = () => game != undefined && game.t < fleeUntil && (!weapon.bot.fleeIfActive || weapon.isActive);
  }
}
