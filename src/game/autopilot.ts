import { Settings } from "@/stores/settings";
import Tile from "./tile";
import { PowerUp } from "@/entities/powerups";
import Tank from "@/entities/tank";
import Base, { Hill } from "@/entities/base";
import Flag from "@/entities/flag";
import Coord from "@/entities/coord";
import { Laser, Guided, WreckingBall, Slingshot } from "@/entities/weapons";
import { CaptureTheFlag, KingOfTheHill } from "./gamemode";
import type Game from "./game";

/**
 * Configuration constants for Autopilot behavior.
 */
const CONFIG = {
  // Time in ms between decision updates (approximate, dependent on speed)
  UpdateIntervalBase: 72000,

  // Weights for different behaviors (Higher = higher priority)
  Weights: {
    Flee: {
      Normal: 400,
      Invincible: 1, // Don't flee if invincible
    },
    PowerUp: 100,
    Enemy: {
      Follow: 5,
      Shoot: 500,
      CarryingFlagMultiplier: 2,
    },
    CTF: {
      ReturnFlag: 600, // Highest priority: score the flag
      GetFlag: 300, // High priority: go get the enemy flag
      Defend: 50, // Low priority: defend base/carrier
    },
    KOTH: {
      Capture: 300, // Hill is close
      Approach: 50, // Hill is far
    },
  },
};

/** Options that are considered by the autopilot */
interface AutopilotAction {
  execute: () => void;
  weight: number;
}

interface AimResult {
  shouldShoot: boolean;
  target: Tank | Coord;
  weight: number;
}

/**
 * Handles the automatic steering logic for a bot player.
 */
export default class Autopilot {
  goto: Coord | null = null;
  private timeSinceLastUpdate: number = 0;
  private fleeingState: { from: Tile[] | null; condition: (() => boolean) | null } = { from: null, condition: null };

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
    this.updateDecision(tank, game);
    this.performMovements(tank);
  }

  /**
   * Decides the next action for the bot.
   * @param tank The tank to be steered by the bot
   * @param game The game in which the tank lives
   */
  private updateDecision(tank: Tank, game: Game): void {
    this.timeSinceLastUpdate += Settings.GameFrequency;

    // Limit update frequency based on tank speed (faster tanks "think" faster?)
    if (this.timeSinceLastUpdate < CONFIG.UpdateIntervalBase / tank.speed) {
      return;
    }
    this.timeSinceLastUpdate = 0;

    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return;
    }

    const options: AutopilotAction[] = [];

    // 1. Consider Powerups
    const powerupAction = this.evaluatePowerups(tile);
    if (powerupAction) {
      options.push(powerupAction);
    }

    // 2. Consider Enemies (Fighting)
    const enemyAction = this.evaluateEnemies(tile, tank, game);
    if (enemyAction) {
      options.push(enemyAction);
    }

    // 3. Consider Game Mode Objectives
    if (game.mode instanceof CaptureTheFlag) {
      const ctfAction = this.evaluateCTF(tile, tank);
      if (ctfAction) {
        options.push(ctfAction);
      }
    } else if (game.mode instanceof KingOfTheHill) {
      const kothAction = this.evaluateKOTH(tile, tank);
      if (kothAction) {
        options.push(kothAction);
      }
    }

    // 4. Consider Fleeing
    const fleeAction = this.evaluateFleeing(tank, game);
    if (fleeAction) {
      options.push(fleeAction);
    }

    // Execute the best option
    if (options.length > 0) {
      // Sort descending by weight
      options.sort((a, b) => b.weight - a.weight);
      options[0].execute();
    } else {
      this.goto = null;
    }
  }

  /**
   * Evaluates pathing to nearby powerups.
   * @param tile
   */
  private evaluatePowerups(tile: Tile): AutopilotAction | null {
    const path = tile.xypathToObj((obj) => obj instanceof PowerUp && obj.attractsBots, 2);
    if (path) {
      return {
        execute: () => this.setPath(path),
        weight: CONFIG.Weights.PowerUp,
      };
    }
    return null;
  }

  /**
   * Evaluates engaging nearby enemies.
   * @param tile
   * @param tank
   * @param game
   */
  private evaluateEnemies(tile: Tile, tank: Tank, game: Game): AutopilotAction | null {
    const bot = tank.player;
    const path = tile.xypathToObj((obj) => obj instanceof Tank && obj.player.team !== bot.team);

    if (!path) {
      return null;
    }

    const enemy = path[path.length - 1] as Tank;

    // Default action: Follow the enemy
    let bestAction: AutopilotAction = {
      execute: () => {
        const dist = Math.hypot(tank.x - enemy.x, tank.y - enemy.y);
        // Prevent stacking: Maintain a minimum distance
        if (dist < tank.width * 1.2) {
          // Too close: Back off slightly instead of moving forward
          let angle = Math.atan2(tank.y - enemy.y, tank.x - enemy.x);
          // Handle perfect overlap
          if (dist < 1) {
            angle = Math.random() * 2 * Math.PI;
          }
          const retreatDist = tank.width * 2;
          this.goto = {
            x: enemy.x + Math.cos(angle) * retreatDist,
            y: enemy.y + Math.sin(angle) * retreatDist,
          };
        } else {
          this.setPath(path);
        }
      },
      weight: CONFIG.Weights.Enemy.Follow,
    };

    // If weapon is ready, check if we should shoot
    if (tank.weapon.isActive) {
      const aimResult = this.calculateAim(tank, enemy, path, game);

      if (enemy.carriedFlag) {
        aimResult.weight *= CONFIG.Weights.Enemy.CarryingFlagMultiplier;
      }

      if (aimResult.shouldShoot) {
        // Shooting usually takes priority over just following
        const shootAction = {
          execute: () => this.shootAt(tank, aimResult.target, game),
          weight: aimResult.weight,
        };

        if (shootAction.weight > bestAction.weight) {
          bestAction = shootAction;
        }
      }
    }

    return bestAction;
  }

  /**
   * Logic for Capture The Flag mode.
   * @param tile
   * @param tank
   * @param game
   */
  private evaluateCTF(tile: Tile, tank: Tank): AutopilotAction | null {
    const bot = tank.player;
    const carriesFlag = tank.carriedFlag !== null;
    const flagInBase = bot.base?.hasFlag() ?? false;
    const invincible = tank.invincible();

    // Determine target based on state
    // Condition 1: We have the flag -> Return to base
    // Condition 2: We don't have flag, enemy has our flag -> Kill carrier / retrieve flag
    // Condition 3: We don't have flag, our flag is home -> Go get enemy flag
    // Condition 4: Support -> Go to friendly carrier

    const path = tile.xypathToObj((obj) => {
      // 1. If carrying flag, go to own base (which has our flag)
      if (carriesFlag) {
        return obj instanceof Base && obj.hasFlag() && obj.team === bot.team;
      }

      // 2. If flag not in base, find it (dropped or carried by enemy or friendly)
      if (!flagInBase) {
        // Our flag dropped somewhere
        if (obj instanceof Flag && obj.team === bot.team) {
          return true;
        }
        // Enemy carrying our flag (We need to kill them, so this acts as finding them)
        if (obj instanceof Tank && obj.carriedFlag?.team === bot.team) {
          return true;
        }
      }

      // 3. Go get enemy flag (dropped or in their base)
      if (obj instanceof Flag && obj.team !== bot.team) {
        return true;
      }

      return false;
    });

    if (path) {
      let weight = CONFIG.Weights.CTF.Defend;

      if (invincible && carriesFlag && flagInBase) {
        // Super high priority if we are about to score and are invincible
        weight = CONFIG.Weights.CTF.ReturnFlag;
      } else if (carriesFlag || !flagInBase) {
        // High priority to return flag or retrieve our flag
        weight = CONFIG.Weights.CTF.GetFlag;
      }

      return {
        execute: () => this.setPath(path),
        weight,
      };
    }

    return null;
  }

  /**
   * Logic for King Of The Hill mode.
   * @param tile
   * @param tank
   */
  private evaluateKOTH(tile: Tile, tank: Tank): AutopilotAction | null {
    const bot = tank.player;
    // Find a hill that is NOT controlled by us
    const path = tile.xypathToObj((obj) => obj instanceof Hill && obj.team !== bot.team);

    if (path) {
      const weight = path.length < 6 ? CONFIG.Weights.KOTH.Capture : CONFIG.Weights.KOTH.Approach;
      return {
        execute: () => this.setPath(path),
        weight,
      };
    }
    return null;
  }

  /**
   * Logic for Fleeing (when in danger or after shooting).
   * @param tank
   * @param game
   */
  private evaluateFleeing(tank: Tank, game: Game): AutopilotAction | null {
    const fleePath = this.findFleePath(tank, game);
    if (fleePath) {
      const weight = tank.invincible() ? CONFIG.Weights.Flee.Invincible : CONFIG.Weights.Flee.Normal;
      return {
        execute: () => this.setPath(fleePath),
        weight,
      };
    }
    return null;
  }

  /**
   * Sets the movement target based on a path.
   * @param path
   */
  private setPath(path: Coord[]): void {
    // If path has at least 2 points (start, next), go to next.
    // If only 1 point (we are there), go there.
    this.goto = path.length < 2 ? path[0] : path[1];
  }

  /**
   * Determines if and how the bot should aim/shoot.
   * @param tank
   * @param enemy
   * @param path
   * @param game
   */
  private calculateAim(tank: Tank, enemy: Tank, path: Coord[] | null, game: Game): AimResult {
    const weapon = tank.weapon;
    const result: AimResult = { shouldShoot: false, target: enemy, weight: CONFIG.Weights.Enemy.Shoot };

    // Standard distance check with a bit of randomness
    const randomBuffer = Math.random() > 0.6 ? 2 : 1;
    if (path && path.length <= weapon.bot.shootingRange + randomBuffer && !enemy.invincible()) {
      result.shouldShoot = true;
    }

    // Special Weapon Logic
    if (weapon instanceof Laser) {
      // Shoot if laser line hits an enemy
      result.shouldShoot = weapon.trajectory.targets.some((t) => t.player.team !== tank.player.team && !enemy.invincible());
    } else if (weapon instanceof Guided || weapon instanceof WreckingBall) {
      // These weapons need wall proximity to be effective or need smart placement
      result.shouldShoot = false;
      result.weight = 200; // Lower priority
      const tile = game.map.getTileByPos(tank.x, tank.y);
      if (tile) {
        // Try to fire in a cardinal direction that has no wall (or has wall for WreckingBall)
        for (let i = 0; i < 4; i++) {
          const hasWall = tile.walls[i];
          if (hasWall !== weapon instanceof Guided) {
            result.shouldShoot = true;
            const angle = (-Math.PI / 2) * i;
            // Target a point relative to tank to force the angle
            result.target = { x: tank.x + Math.sin(angle), y: tank.y - Math.cos(angle) };
            break; // Found a valid direction
          }
        }
      }
    } else if (weapon instanceof Slingshot) {
      result.weight = 1100; // Very high priority
      const dist = Math.hypot(tank.x - enemy.x, tank.y - enemy.y);
      result.shouldShoot = dist < 400 && !enemy.invincible();
    }

    return result;
  }

  /**
   * Executes a shooting action.
   * @param tank
   * @param target
   * @param game
   */
  private shootAt(tank: Tank, target: Coord, game: Game): void {
    this.goto = null; // Stop moving to aim

    // Calculate aim angle
    const distx = target.x - tank.x;
    const disty = target.y - tank.y;
    const distance = Math.hypot(distx, disty);
    const baseAngle = Math.atan2(-distx, disty) + Math.PI;

    // 1. Aim Jitter: Don't always shoot at the exact center to avoid bullet collision stalemates
    // Calculate max offset that still hits the target (assuming target width ~40px)
    const targetWidth = target instanceof Tank ? target.width : 40;
    // Use a safety factor (e.g., 3.0) to ensure we aim within the central 2/3rds of the target
    const maxOffset = Math.atan2(targetWidth / 3.0, distance);
    const randomOffset = (Math.random() - 0.5) * 2 * maxOffset;

    tank.angle = baseAngle + randomOffset;

    // 2. Micro-Movement: Occasionally move slightly to break rhythm
    if (Math.random() < 0.05) {
      tank.move(Math.random() < 0.5 ? 1 : -1);
    }

    // Add reaction delay if target is another bot
    const isTargetBot = target instanceof Tank && target.player?.isBot();

    if (isTargetBot) {
      game.addTimeout(() => tank.shoot(), 180 * Math.random());
    } else {
      tank.shoot();
    }

    // Trigger fleeing behavior after shooting
    this.initiateFlee(tank, game);
  }

  /**
   * Calculates a path to flee from danger.
   * @param tank
   * @param game
   */
  private findFleePath(tank: Tank, game: Game): Coord[] | null {
    if (!this.fleeingState.from || !this.fleeingState.condition || !this.fleeingState.condition()) {
      return null;
    }
    // Don't flee if weapon requires active control and we aren't allowed to interrupt
    if (!tank.weapon.bot.fleeIfActive && tank.weapon.isActive) {
      return null;
    }

    const tile = game.map?.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return null;
    }

    // Add current tile to avoided list
    if (!this.fleeingState.from.includes(tile)) {
      this.fleeingState.from.push(tile);
    }

    // Find a neighbor that isn't in the "from" list (history)
    let nextTile: Tile = tile;
    for (let i = 0; i < 4; i++) {
      const ntile = tile.neighbors[i];
      if (!tile.walls[i] && ntile && !this.fleeingState.from.includes(ntile)) {
        nextTile = ntile;
        break;
      }
    }

    // Return simple path [current, next]
    return [tile, nextTile].map((t) => ({
      x: t.x + t.dx / 2,
      y: t.y + t.dy / 2,
    }));
  }

  /**
   * Sets up the state for fleeing.
   * @param tank
   * @param game
   */
  private initiateFlee(tank: Tank, game: Game): void {
    const weapon = tank.weapon;
    if (weapon.bot.fleeingDuration <= 0 || !game.map) {
      return;
    }
    const tile = game.map.getTileByPos(tank.x, tank.y);
    if (!tile) {
      return;
    }

    // Determine direction behind the tank (approximate)
    const backX = tank.x + tile.dx * Math.sin(tank.angle);
    const backY = tank.y - tile.dy * Math.cos(tank.angle);
    const nextTile = game.map.getTileByPos(backX, backY);

    // "from" tracks where we came from / where we don't want to go back to immediately
    this.fleeingState.from = nextTile ? [nextTile, tile] : [tile];

    const fleeUntil = game.t + weapon.bot.fleeingDuration;

    this.fleeingState.condition = () => {
      if (!game) {
        return false;
      }
      // Stop fleeing if time up
      if (game.t >= fleeUntil) {
        return false;
      }
      // Stop fleeing if weapon active and we shouldn't flee while active
      if (!weapon.bot.fleeIfActive && weapon.isActive) {
        return false;
      }
      return true;
    };
  }

  /**
   * Performs movements towards the goto target.
   * @param tank
   */
  private performMovements(tank: Tank): void {
    if (!this.goto) {
      return;
    }
    const distx = this.goto.x - tank.x;
    const disty = this.goto.y - tank.y;

    // Calculate target angle (0 to 2PI)
    let targetAngle = (Math.atan2(-distx, disty) + Math.PI) % (2 * Math.PI);
    if (targetAngle < 0) {
      targetAngle += 2 * Math.PI;
    }

    // Normalize tank angle (0 to 2PI)
    tank.angle = ((tank.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const diff = Math.abs(tank.angle - targetAngle);

    // Move forward if angle is roughly correct
    if (diff < 0.6 || Math.abs(diff - Math.PI * 2) < 0.6) {
      tank.move(Settings.BotSpeed);
    }

    // Turn towards target
    if (diff < 0.1) {
      tank.angle = targetAngle;
    } else if (tank.angle < targetAngle) {
      // Determine shortest turn direction
      tank.turn(diff < Math.PI ? 2 * Settings.BotSpeed : -2 * Settings.BotSpeed);
    } else {
      tank.turn(diff < Math.PI ? -2 * Settings.BotSpeed : 2 * Settings.BotSpeed);
    }
  }
}
