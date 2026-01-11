import Weapon from "./weapon";
import type Tank from "../tank";
import type Bullet from "../bullet";
import { IMAGES } from "@/game/assets";

/**
 * The normal, default gun.
 * @augments Weapon
 */
export class Gun extends Weapon {
  override name: string = "Gun";

  /**
   * Creates a new Gun.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.gun;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new bullet for the gun.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    // bullet explosion leads to weapon reactivation
    bullet.explode = () => {
      if (!this.tank.rapidfire) {
        this.activate();
      }
    };
    return bullet;
  }

  /**
   * Cannot be deleted.
   */
  override delete(): void {}
}
