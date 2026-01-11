import Weapon from "./weapon";
import type Tank from "../tank";
import type Bullet from "../bullet";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";

/**
 * A rapid-firing machine gun.
 * @augments Weapon
 */
export class MG extends Weapon {
  override name: string = "MG";
  override nshots: number = 20;
  override every: number = 0;

  /**
   * Creates a new MG.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.mg;
    this.bot.shootingRange = 2;
    this.bot.fleeingDuration = 1500;
    this.bot.fleeIfActive = true;
  }

  /**
   * Fires a burst of bullets.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    bullet.radius = 2;
    bullet.bounceSound = "";
    bullet.extrahitbox = -3;
    bullet.angle = this.tank.angle + 0.2 * (0.5 - Math.random());
    bullet.maxAge = 4000 + 1000 * (0.5 - Math.random());
    bullet.color = "#000";
    return bullet;
  }

  /**
   * Fires the MG burst.
   * @param dt - The time elapsed since the last frame in milliseconds.
   * @override
   */
  override shoot(dt: number): void {
    if (!this.isActive) {
      return;
    }

    if (this.nshots === 20) {
      this.tank.game.addTimeout(() => this.deactivate(), 3000);
    }

    if (this.tank.player.isBot() && this.nshots > 15) {
      window.setTimeout(() => this.shoot(dt), dt);
    }

    this.every -= dt;
    if (this.nshots > 0 && this.every < 0 && this.isActive) {
      this.every = 50;
      playSound(SOUNDS.mg);
      this.newBullet();
      this.nshots--;
      if (this.nshots <= 0) {
        this.nshots = 20;
        this.deactivate();
      }
    }
  }
}
