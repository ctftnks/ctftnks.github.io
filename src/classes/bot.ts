import Player from "./player";
import { store, Settings } from "../state";
import { Tile } from "./gamemap";
import { PowerUp } from "./powerup";

let NBots: number = 0;

/**
 * A bot player that controls a tank automatically.
 * @extends Player
 */
export default class Bot extends Player {
  // keys are inherited from Player
  goto: any = -1;
  fleeing: { from: any; condition: any } = { from: -1, condition: -1 };
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
   * Updates the bot's state.
   */
  step(): void {
    this.autopilot();
    this.perform_movements();
  }

  /**
   * Decides the next action for the bot.
   */
  autopilot(): void {
    this.lastChecked += Settings.GameFrequency;
    if (this.lastChecked < 72000 / this.tank.speed) return;
    this.lastChecked = 0;

    const game = this.game!;
    const tank = this.tank;

    if (!game.map) return;
    if (!tank.map) return;

    const weapon = tank.weapon;
    const invincible = tank.invincible();
    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (tile === -1) return;

    const opts: any[] = [];

    const powerupPath = tile.xypathToObj((obj: any) => {
      return obj instanceof PowerUp && obj.attractsBots;
    }, 2);

    if (powerupPath !== -1)
      opts.push({
        f: () => {
          this.follow(powerupPath);
        },
        weight: 100,
      });

    const enemyPath = tile.xypathToObj((obj: any) => {
      return obj.type === "Tank" && obj.player.team !== this.team;
    });

    if (enemyPath !== -1) {
      const enemy = enemyPath[enemyPath.length - 1];
      opts.push({
        f: () => {
          this.follow(enemyPath);
        },
        weight: 5,
      });

      if (weapon.active) {
        const aimbot = this.aimbot(enemy, enemyPath);
        if (enemy.carriedFlag !== -1) aimbot.weight *= 2;
        if (aimbot.should_shoot)
          opts.push({
            f: () => {
              this.shoot(aimbot.target);
            },
            weight: aimbot.weight,
          });
      }
    }

    if (game.mode.name === "CaptureTheFlag") {
      const carriesFlag = tank.carriedFlag !== -1;
      const flagInBase = this.base!.hasFlag();
      const ctfPath = tile.xypathToObj((obj: any) => {
        if (!carriesFlag && obj.type === "Flag" && obj.team !== this.team) return true;
        if (carriesFlag && obj.type === "Base" && obj.hasFlag() && obj.team === this.team) return true;
        if (!flagInBase) {
          if (obj.type === "Flag" && obj.team === this.team) return true;
          if (obj.type === "Tank" && obj.carriedFlag !== -1 && obj.carriedFlag.team === this.team) return true;
        }
        return false;
      });

      if (ctfPath !== -1) {
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
        if (obj.type === "Hill" && obj.team !== this.team) return true;
        return false;
      });
      if (basePath !== -1) {
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
    if (fleePath !== -1) {
      const weight = invincible ? 1 : 400;
      opts.push({
        f: () => {
          self.follow(fleePath);
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
      this.goto = -1;
    }
  }

  /**
   * Sets a goto target from a path.
   * @param {Array} path - The path to follow.
   */
  follow(path: any[]): void {
    if (path.length < 2) this.goto = path[0];
    else this.goto = path[1];
  }

  /**
   * Performs movements towards the goto target.
   */
  perform_movements(): void {
    if (this.goto === -1) return;
    const tank = this.tank;
    const distx = this.goto.x - tank.x;
    const disty = this.goto.y - tank.y;

    let newangle = Math.atan2(-distx, disty) + Math.PI;
    while (newangle < 0) newangle += 2 * Math.PI;
    newangle = newangle % (2 * Math.PI);
    while (tank.angle < 0) tank.angle += 2 * Math.PI;
    tank.angle = tank.angle % (2 * Math.PI);

    if (Math.abs(tank.angle - newangle) < 0.6 || Math.abs(Math.abs(tank.angle - newangle) - Math.PI * 2) < 0.6) {
      tank.move(1 * Settings.BotSpeed);
    }
    if (Math.abs(tank.angle - newangle) < 0.1) {
      tank.angle = newangle;
    } else if (tank.angle < newangle) {
      if (Math.abs(tank.angle - newangle) < Math.PI) tank.turn(2 * Settings.BotSpeed);
      else tank.turn(-2 * Settings.BotSpeed);
    } else {
      if (Math.abs(tank.angle - newangle) < Math.PI) tank.turn(-2 * Settings.BotSpeed);
      else tank.turn(2 * Settings.BotSpeed);
    }
  }

  /**
   * Handles shooting logic.
   * @param {Object} target - The target to shoot at.
   */
  shoot(target: any): void {
    this.goto = -1;
    const tank = this.tank;
    const distx = target.x - tank.x;
    const disty = target.y - tank.y;
    tank.angle = Math.atan2(-distx, disty) + Math.PI;

    if (typeof target !== "undefined" && typeof target["player"] !== "undefined" && target.player instanceof Bot) {
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
   * @returns {Object} Result with should_shoot, target, and weight.
   */
  aimbot(enemy: any, path: any = -1): any {
    const result = { should_shoot: false, target: enemy, weight: 500 };
    const weapon = this.tank.weapon;

    if (path === -1) {
      if (!this.tank.map) return result;
      const tile = this.tank.map.getTileByPos(this.tank.x, this.tank.y);
      if (tile !== -1) {
        path = tile.xypathToObj(enemy);
      }
    }

    if (path === -1) return result;

    const r = Math.random() > 0.6 ? 2 : 1;
    if (path.length <= this.tank.weapon.bot.shooting_range + r && !enemy.invincible()) result.should_shoot = true;

    if (weapon.name === "Laser") {
      for (let i = 0; i < weapon.trajectory.targets.length; i++) {
        if (weapon.trajectory.targets[i].player.team !== this.team && !enemy.invincible()) {
          result.should_shoot = true;
        } else {
          result.should_shoot = false;
        }
      }
    } else if (weapon.name === "Guided" || weapon.name === "WreckingBall") {
      result.should_shoot = false;
      result.weight = 200;
      const tile = store.game!.map.getTileByPos(this.tank.x, this.tank.y);
      if (tile !== -1) {
        for (let i = 0; i < 4; i++) {
          if (tile.walls[i] ^ (weapon.name === "Guided")) {
            result.should_shoot = true;
            const angle = (-Math.PI / 2) * i;
            result.target = { x: this.tank.x + Math.sin(angle), y: this.tank.y - Math.cos(angle) };
          }
        }
      }
    } else if (weapon.name === "Slingshot") {
      result.weight = 1100;
      const dist = Math.hypot(this.tank.x - enemy.x, this.tank.y - enemy.y);
      result.should_shoot = dist < 400 && !enemy.invincible();
    }
    return result;
  }

  /**
   * Calculates a path to flee from danger.
   * @param {number} duration - Duration of fleeing (not directly used in this logic but signature kept).
   * @returns {Array|number} The flee path or -1 if no path found.
   */
  getFleePath(duration: number = 2): any {
    if (this.fleeing.from === -1 || this.fleeing.condition === -1 || !this.fleeing.condition()) return -1;
    if (!this.tank.weapon.bot.flee_if_active && this.tank.weapon.active) return -1;

    const tile = store.game!.map.getTileByPos(this.tank.x, this.tank.y);
    if (tile === -1) return -1;

    if (!this.fleeing.from.includes(tile)) this.fleeing.from.push(tile);

    let nextTile: Tile = tile;
    for (let i = 0; i < 4; i++)
      if (!(tile as Tile).walls[i] && (tile as Tile).neighbors[i] && !this.fleeing.from.includes((tile as Tile).neighbors[i]))
        nextTile = (tile as Tile).neighbors[i] as Tile;

    const fleePath = [tile, nextTile];

    for (let i = 0; i < fleePath.length; i++) {
      const t = fleePath[i];
      fleePath[i] = { x: t.x + t.dx / 2, y: t.y + t.dy / 2 };
    }
    return fleePath;
  }

  /**
   * Initiates fleeing behavior.
   */
  flee(): void {
    if (this.tank.weapon.bot.fleeing_duration <= 0) return;

    if (!store.game || !store.game.map) return;
    const tile = store.game.map.getTileByPos(this.tank.x, this.tank.y);
    if (tile === -1) return;

    const nextTile = store.game.map.getTileByPos(
      this.tank.x + tile.dx * Math.sin(this.tank.angle),
      this.tank.y - tile.dy * Math.cos(this.tank.angle),
    );
    this.fleeing.from = [nextTile, tile];

    const weapon = this.tank.weapon;
    const flee_until = this.game!.t + weapon.bot.fleeing_duration;
    this.fleeing.condition = () => {
      return this.game!.t < flee_until && (!weapon.bot.flee_if_active || weapon.active);
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
  if (!Settings.AdaptiveBotSpeed) return;

  const teams: any[] = [];
  const botcounts: number[] = [];

  for (let i = 0; i < store.game!.players.length; i++) {
    let id = teams.indexOf(store.game!.players[i].team);
    if (id === -1) {
      id = teams.length;
      teams.push(store.game!.players[i].team);
      botcounts.push(0);
    }
    botcounts[id] += store.game!.players[i] instanceof Bot ? 1 : 0;
  }

  let avgbots = 0;
  for (let i = 0; i < teams.length; i++) avgbots += botcounts[i] / parseFloat(teams.length);

  const id = teams.indexOf(team);
  Settings.BotSpeed += (avgbots - botcounts[id]) * val;

  const bs = document.getElementById("BotSpeedometer");
  if (bs) {
    bs.style.display = "block";
    bs.innerHTML = "BotSpeed:&nbsp;&nbsp;" + Math.round(Settings.BotSpeed * 100) + " %";
  }
  return Settings.BotSpeed;
}
