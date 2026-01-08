import Bullet from "../bullet";
import type Tank from "../tank";
import type Trajectory from "../trajectory";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";

/**
 * Base class for all weapons.
 */
export class Weapon {
  name: string = "Weapon";
  tank: Tank;
  image: HTMLImageElement;
  isActive: boolean = true;
  isDeleted: boolean = false;
  bot: { shootingRange: number; fleeingDuration: number; fleeIfActive: boolean };
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
    this.image.src = "";
    this.bot = {
      shootingRange: 2, // distance at which bots fire the weapon
      fleeingDuration: 800, // how long should a bot flee after firing this weapon?
      fleeIfActive: false, // should the bot flee even if this weapon is active?
    };
  }

  /**
   * Fires the weapon.
   * Plays sound and creates a new bullet.
   * @param _dt - The time elapsed since the last frame in milliseconds.
   */
  shoot(_dt?: number): void {
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
   * Creates a new bullet with all the typical properties.
   * Handles tank corner positioning and initial lethality delay.
   * @returns The created bullet.
   */
  newBullet(): Bullet {
    const bullet = new Bullet(this);
    const corners = this.tank.corners();
    bullet.x = (corners[0].x + corners[1].x) / 2;
    bullet.y = (corners[0].y + corners[1].y) / 2;
    bullet.lethal = false;
    window.setTimeout(() => (bullet.lethal = true), 100);
    bullet.angle = this.tank.angle;
    bullet.player = this.tank.player;
    bullet.color = this.tank.player.team.color;
    this.tank.game.addObject(bullet);
    return bullet;
  }

  /**
   * Deactivates the weapon (cannot shoot temporarily or until deleted).
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    const delay = this.tank.rapidfire ? 500 : 1800;
    this.tank.game.addTimeout(() => {
      if (this.tank.rapidfire) {
        this.activate();
      } else {
        this.delete();
      }
    }, delay);
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
