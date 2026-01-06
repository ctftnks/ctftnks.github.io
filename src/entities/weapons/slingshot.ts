import { Weapon } from "./weapon";
import type Tank from "../tank";
import type Bullet from "../bullet";
import { Smoke } from "../smoke";
import { IMAGES } from "@/game/assets";
import { Settings } from "@/stores/settings";
import { createBaseBullet } from "./utils";

/**
 * Throws over walls.
 * @augments Weapon
 */
export class Slingshot extends Weapon {
  override name: string = "Slingshot";
  override fired: boolean = false;

  /**
   * Creates a new Slingshot weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.slingshot;
    this.bot.shootingRange = 8;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new slingshot bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = createBaseBullet(this);
    bullet.radius = 6;
    bullet.color = "#333";
    bullet.speed = 2 * Settings.BulletSpeed;
    bullet.timeout = 2000;
    /**
     * Custom collision check for slingshot bullet.
     */
    bullet.checkCollision = function (): void {};
    bullet.trace = true;
    /**
     * Leaves a smoke trace.
     */
    bullet.leaveTrace = function (): void {
      if (Math.random() > 0.96) {
        bullet.speed *= 0.92;
        const smoke = new Smoke(this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.player.game!.addObject(smoke);
      }
    };

    return bullet;
  }
}
