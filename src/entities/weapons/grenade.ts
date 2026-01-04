import { Weapon } from "./weapon";
import type Tank from "../tank";
import Bullet from "../bullet";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";

/**
 * A grenade that can be remotely detonated.
 * @augments Weapon
 */
export class Grenade extends Weapon {
  override name: string = "Grenade";
  override nshots: number = 30; // repurposed for nshrapnels if needed, but original used nshrapnels

  private nshrapnels: number = 30;

  /**
   * Creates a new Grenade weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.grenade;
    this.bot.fleeingDuration = 4000;
    this.bot.fleeIfActive = false;
  }

  /**
   * Creates a new grenade bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = IMAGES.grenade;
    e.radius = 6;
    e.color = "#000";
    e.timeout = 10000;
    e.exploded = false;

    /**
     * Explosion logic for grenade.
     */
    e.explode = () => {
      if (!e.exploded) {
        e.exploded = true;
        playSound(SOUNDS.grenade);
        for (let i = 0; i < this.nshrapnels; i++) {
          const shrapnel = new Bullet(this as Weapon);
          shrapnel.x = e.x;
          shrapnel.y = e.y;
          shrapnel.radius = 2;
          shrapnel.age = 0;
          shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
          shrapnel.angle = 2 * Math.PI * Math.random();
          shrapnel.timeout = (360 * 280) / Settings.BulletSpeed;
          shrapnel.extrahitbox = -3;
          /**
           * Custom collision check for shrapnel.
           */
          shrapnel.checkCollision = function (): void {};
          this.tank.player.game!.addObject(shrapnel);
        }
        this.bullet = null;
        this.deactivate();
      }
    };

    return e;
  }

  /**
   * Fires or detonates the grenade.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }
    if (!this.bullet) {
      if (!this.isDeleted) {
        this.bullet = this.newBullet();
      } else {
        this.bullet = null;
      }
    } else if (this.bullet.age > 300) {
      const bullet = this.bullet;
      bullet.explode();
      bullet.delete();
      this.deactivate();
      return;
    }
  }
}
