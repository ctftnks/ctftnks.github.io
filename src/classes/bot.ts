import Player from "./player";
import { store, Settings } from "../store";
import { Tile } from "./gamemap";
import { PowerUp } from "./powerup";
import Tank from "./tank";
import { Base, Flag, Hill } from "./ctf";

let NBots: number = 0;

/** Interface for anything that has (x, y) coordinates */
declare interface Coord {
  x: number;
  y: number;
}

/**
 * A bot player that controls a tank automatically.
 * @augments Player
 */
export default class Bot extends Player {
  // keys are inherited from Player
  goto: Coord | null = null;
  fleeing: { from: any; condition: any } = { from: null, condition: null };
  lastChecked: number = 0;

  /**
   * Creates a new Bot.
   */
  constructor() {
    super();
    this.name = "Bot " + (NBots + 1);
    this.keys = []; // Empty keys for bot
    NBots++;
  }

  /**
   * Is the player a bot or a user?
   */
  isBot(): boolean {
    return true;
  }

  /**
   * Updates the bot's state.
   */
  step(): void {
    this.autopilot();
    this.performMovements();
  }

  /**
   * Decides the next action for the bot.
   */
  autopilot(): void {
    this.lastChecked += Settings.GameFrequency;
    if (this.lastChecked < 72000 / this.tank.speed) {
      return;
    }
    this.lastChecked = 0;

    const game = this.game!;
    const tank = this.tank;

    if (!game.map) {
      return;
    }
    if (!tank.map) {
      return;
    }

    const weapon = tank.weapon;
    const invincible = tank.invincible();
    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (tile === null) {
      return;
    }

    const opts: any[] = [];

    const powerupPath = tile.xypathToObj((obj: any) => {
      return obj instanceof PowerUp && obj.attractsBots;
    }, 2);

    if (powerupPath !== null) {
      opts.push({
        f: () => {
          this.follow(powerupPath);
        },
        weight: 100,
      });
    }

    const enemyPath = tile.xypathToObj((obj: any) => {
      return obj instanceof Tank && obj.player.team !== this.team;
    });

    if (enemyPath !== null) {
      const enemy = enemyPath[enemyPath.length - 1];
      opts.push({
        f: () => {
          this.follow(enemyPath);
        },
        weight: 5,
      });

      if (weapon.isActive) {
        const aimbot = this.aimbot(enemy, enemyPath);
        if (enemy.carriedFlag !== null) {
          aimbot.weight *= 2;
        }
        if (aimbot.shouldShoot) {
          opts.push({
            f: () => {
              this.shoot(aimbot.target);
            },
            weight: aimbot.weight,
          });
        }
      }
    }

    if (game.mode.name === "CaptureTheFlag") {
      const carriesFlag = tank.carriedFlag !== null;
      const flagInBase = this.base!.hasFlag();
      const ctfPath = tile.xypathToObj((obj: any) => {
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
          if (obj instanceof Tank && obj.carriedFlag !== null && obj.carriedFlag.team === this.team) {
            return true;
          }
        }
        return false;
      });

      if (ctfPath !== null) {
        const weight = invincible && carriesFlag && flagInBase ? 600 : carriesFlag || !flagInBase ? 300 : 50;
        opts.push({
          f: () => {
            this.follow(ctfPath);
          },
          weight: weight,
        });
      }
    } else if (game.mode.name === "KingOfTheHill") {
      const basePath = tile.xypathToObj((obj: any) => {
        if (obj instanceof Hill && obj.team !== this.team) {
          return true;
        }
        return false;
      });
      if (basePath !== null) {
        const weight = basePath.length < 6 ? 300 : 50;
        opts.push({
          f: () => {
            this.follow(basePath);
          },
          weight: weight,
        });
      }
    }

    const fleePath = this.getFleePath();
    if (fleePath !== null) {
      const weight = invincible ? 1 : 400;
      opts.push({
        f: () => {
          this.follow(fleePath);
        },
        weight: weight,
      });
    }

    if (opts.length > 0) {
      opts.sort((a: any, b: any) => {
        return a.weight > b.weight ? -1 : 1;
      });
      opts[0].f();
    } else {
      this.goto = null;
    }
  }

  /**
   * Sets a goto target from a path.
   * @param {Coord[]} path - The path to follow.
   */
  follow(path: Coord[]): void {
    if (path.length < 2) {
      this.goto = path[0];
    } else {
      this.goto = path[1];
    }
  }

  /**
   * Performs movements towards the goto target.
   */
  performMovements(): void {
    if (this.goto === null) {
      return;
    }
    const tank = this.tank;
    const distx = this.goto.x - tank.x;
    const disty = this.goto.y - tank.y;

    let newangle = Math.atan2(-distx, disty) + Math.PI;
    while (newangle < 0) {
      newangle += 2 * Math.PI;
    }
    newangle = newangle % (2 * Math.PI);
    while (tank.angle < 0) {
      tank.angle += 2 * Math.PI;
    }
    tank.angle = tank.angle % (2 * Math.PI);

    if (Math.abs(tank.angle - newangle) < 0.6 || Math.abs(Math.abs(tank.angle - newangle) - Math.PI * 2) < 0.6) {
      tank.move(1 * Settings.BotSpeed);
    }

    if (Math.abs(tank.angle - newangle) < 0.1) {
      tank.angle = newangle;
    } else if (tank.angle < newangle) {
      if (Math.abs(tank.angle - newangle) < Math.PI) {
        tank.turn(2 * Settings.BotSpeed);
      } else {
        tank.turn(-2 * Settings.BotSpeed);
      }
    } else if (Math.abs(tank.angle - newangle) < Math.PI) {
      tank.turn(-2 * Settings.BotSpeed);
    } else {
      tank.turn(2 * Settings.BotSpeed);
    }
  }

  /**
   * Handles shooting logic.
   * @param {Tank} target - The target to shoot at.
   */
  shoot(target: Tank): void {
    this.goto = null;
    const tank = this.tank;
    const distx = target.x - tank.x;
    const disty = target.y - tank.y;
    tank.angle = Math.atan2(-distx, disty) + Math.PI;

    if (target?.player?.isBot()) {
      setTimeout(() => {
        tank.shoot();
      }, 180 * Math.random());
    } else {
      tank.shoot();
    }

    this.flee();
  }

  /**
   * Evaluates whether it is a good idea to shoot.
   * @param {Tank} enemy - The enemy tank.
   * @param {Array|number} path - Path to the enemy.
   * @returns {object} Result with shouldShoot, target, and weight.
   */
  aimbot(enemy: any, path: Coord[] | null = null): any {
    const result = { shouldShoot: false, target: enemy, weight: 500 };
    const weapon = this.tank.weapon;

    if (path === null) {
      if (!this.tank.map) {
        return result;
      }
      const tile = this.tank.map.getTileByPos(this.tank.x, this.tank.y);
      if (tile !== null) {
        path = tile.xypathToObj(enemy);
      }
    }

    if (path === null) {
      return result;
    }

    const r = Math.random() > 0.6 ? 2 : 1;
    if (path.length <= this.tank.weapon.bot.shootingRange + r && !enemy.invincible()) {
      result.shouldShoot = true;
    }

    if (weapon.name === "Laser") {
      for (let i = 0; i < weapon.trajectory.targets.length; i++) {
        if (weapon.trajectory.targets[i].player.team !== this.team && !enemy.invincible()) {
          result.shouldShoot = true;
        } else {
          result.shouldShoot = false;
        }
      }
    } else if (weapon.name === "Guided" || weapon.name === "WreckingBall") {
      result.shouldShoot = false;
      result.weight = 200;
      const tile = store.game!.map.getTileByPos(this.tank.x, this.tank.y);
      if (tile !== null) {
        for (let i = 0; i < 4; i++) {
          if (tile.walls[i] ^ (weapon.name === "Guided")) {
            result.shouldShoot = true;
            const angle = (-Math.PI / 2) * i;
            result.target = { x: this.tank.x + Math.sin(angle), y: this.tank.y - Math.cos(angle) };
          }
        }
      }
    } else if (weapon.name === "Slingshot") {
      result.weight = 1100;
      const dist = Math.hypot(this.tank.x - enemy.x, this.tank.y - enemy.y);
      result.shouldShoot = dist < 400 && !enemy.invincible();
    }
    return result;
  }

  /**
   * Calculates a path to flee from danger.
   * @returns {Array|null} The flee path or null if no path found.
   */
  getFleePath(): Coord[] | null {
    if (this.fleeing.from === null || this.fleeing.condition === null || !this.fleeing.condition()) {
      return null;
    }
    if (!this.tank.weapon.bot.fleeIfActive && this.tank.weapon.isActive) {
      return null;
    }

    const tile = store.game!.map?.getTileByPos(this.tank.x, this.tank.y);
    if (!tile) {
      return null;
    }

    if (!this.fleeing.from.includes(tile)) {
      this.fleeing.from.push(tile);
    }

    let nextTile: Coord = tile;
    for (let i = 0; i < 4; i++) {
      if (!tile.walls[i] && tile.neighbors[i] && !this.fleeing.from.includes(tile.neighbors[i])) {
        nextTile = tile.neighbors[i] as Coord;
      }
    }

    const fleePath: Coord[] = [tile, nextTile];

    for (let i = 0; i < fleePath.length; i++) {
      const t = fleePath[i];
      fleePath[i] = { x: t.x + (t as Tile).dx / 2, y: t.y + (t as Tile).dy / 2 };
    }
    return fleePath;
  }

  /**
   * Initiates fleeing behavior.
   */
  flee(): void {
    if (this.tank.weapon.bot.fleeingDuration <= 0) {
      return;
    }

    if (!store.game || !store.game.map) {
      return;
    }
    const tile = store.game.map.getTileByPos(this.tank.x, this.tank.y);
    if (tile === null) {
      return;
    }

    const nextTile = store.game.map.getTileByPos(
      this.tank.x + tile.dx * Math.sin(this.tank.angle),
      this.tank.y - tile.dy * Math.cos(this.tank.angle),
    );
    this.fleeing.from = [nextTile, tile];

    const weapon = this.tank.weapon;
    const fleeUntil = this.game!.t + weapon.bot.fleeingDuration;
    this.fleeing.condition = () => {
      return this.game!.t < fleeUntil && (!weapon.bot.fleeIfActive || weapon.isActive);
    };
  }
}

/**
 * Adapts bot speed based on team balance.
 * @param {number} team - The team ID.
 * @param {number} val - The adaptation value.
 * @returns {number|undefined} The new bot speed.
 */
export function adaptBotSpeed(team: any, val: number = 0.1): number | undefined {
  if (!Settings.AdaptiveBotSpeed) {
    return;
  }

  const teams: any[] = [];
  const botcounts: number[] = [];

  for (let i = 0; i < store.game!.players.length; i++) {
    let id = teams.indexOf(store.game!.players[i].team);
    if (id === -1) {
      id = teams.length;
      teams.push(store.game!.players[i].team);
      botcounts.push(0);
    }
    botcounts[id] += store.game!.players[i].isBot() ? 1 : 0;
  }

  let avgbots = 0;
  for (let i = 0; i < teams.length; i++) {
    avgbots += botcounts[i] / parseFloat(teams.length.toString());
  }

  const id = teams.indexOf(team);
  Settings.BotSpeed += (avgbots - botcounts[id]) * val;

  const bs = document.getElementById("BotSpeedometer");
  if (bs) {
    bs.style.display = "block";
    bs.innerHTML = "BotSpeed:&nbsp;&nbsp;" + Math.round(Settings.BotSpeed * 100) + " %";
  }
  return Settings.BotSpeed;
}
