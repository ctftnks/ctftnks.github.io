import type Bullet from "../bullet";
import type Tank from "../tank";
import type Trajectory from "../trajectory";
import { playSound } from "@/game/sounds";
import { SOUNDS } from "@/game/assets";

export interface BotAI {
  shootingRange: number;
  fleeingDuration: number;
  fleeIfActive: boolean;
}

/**
 * Base class for all weapons.
 */
export abstract class Weapon {
  abstract name: string;
  readonly tank: Tank;
  image: HTMLImageElement;
  isActive: boolean = true;
  isDeleted: boolean = false;
  bot: BotAI;
  trajectory?: Trajectory;
  bullet: Bullet | null = null;
  nshots?: number;
  every?: number;
  fired?: boolean;

  /**
   * Creates a new Weapon.
   * @param tank - The tank owning this weapon.
   */
  constructor(tank: Tank) {
    this.tank = tank;
    this.image = new Image();
    this.bot = {
      shootingRange: 2, // distance at which bots fire the weapon
      fleeingDuration: 800, // how long should a bot flee after firing this weapon?
      fleeIfActive: false, // should the bot flee even if this weapon is active?
    };
  }

  /**
   * Fires the weapon.
   * Plays sound and creates a new bullet.
   */
  shoot(): void {
    if (!this.isActive) {
      return;
    }
    playSound(SOUNDS.gun);
    if (!this.isDeleted) {
      this.newBullet();
    }
    this.deactivate();
  }

  /**
   * Creates a new bullet.
   * must be implemented by subclasses.
   * @returns The created bullet.
   */
  abstract newBullet(): Bullet;

  /**
   * Deactivates the weapon (cannot shoot temporarily or until deleted).
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    const delay = this.tank.rapidfire ? 500 : 1800;

    // Safety check
    if (this.tank.player.game) {
      this.tank.player.game.addTimeout(() => {
        if (this.tank.rapidfire) {
          this.activate();
        } else {
          this.delete();
        }
      }, delay);
    }
  }

  /**
   * Reactivate a deactivated weapon.
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Mark weapon as deleted.
   */
  delete(): void {
    this.isActive = false;
    this.isDeleted = true;
  }

  /**
   * Draw crosshair or trajectory preview.
   */

  crosshair(): void {}
}
