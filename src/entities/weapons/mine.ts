import { Weapon } from "./weapon";
import type Tank from "../tank";
import Bullet from "../bullet";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";
import { createShrapnelExplosion } from "./utils";

/**
 * A mine.
 * @augments Weapon
 */
export class Mine extends Weapon {
  override name: string = "Mine";
  private nshrapnels: number = 24;

  /**
   * Creates a new Mine weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.mine;
  }

  /**
   * Creates a new mine bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = IMAGES.mine;
    e.radius = 6;
    e.exploded = false;
    e.color = "#000";
    e.maxAge = 120000 + 20 * Math.random();

    /**
     * Explosion logic for mine.
     */
    e.explode = () => {
      if (!e.exploded) {
        e.exploded = true;
        playSound(SOUNDS.grenade);
        createShrapnelExplosion(this, e.x, e.y, this.nshrapnels, {
          timeout: 600,
        });
        this.bullet = null;
      }
    };

    e.game.addTimeout(() => {
      e.speed = 0;
    }, 600);
    return e;
  }
}
