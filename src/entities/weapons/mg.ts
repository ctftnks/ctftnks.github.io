import { Weapon } from "./weapon";
import type Tank from "../tank";
import type Bullet from "../bullet";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";

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
    bullet.timeout = 4000 + 1000 * (0.5 - Math.random());
    bullet.color = "#000";
    return bullet;
  }

  /**
   * Fires the MG burst.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }

    if (this.nshots === 20) {
      this.tank.player.game!.addTimeout(() => this.deactivate(), 3000);
    }

    if (this.tank.player.isBot() && this.nshots > 15) {
      window.setTimeout(() => this.shoot(), Settings.GameFrequency);
    }

    this.every -= Settings.GameFrequency;
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
