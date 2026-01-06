import Bullet from "../bullet";
import { Weapon } from "./weapon";
import { Settings } from "@/stores/settings";

/**
 * Options for shrapnel explosion.
 */
export interface ShrapnelOptions {
  /** Duration of shrapnel in ms. */
  timeout: number;
  /** Whether shrapnel ignores wall collisions. */
  noCollision?: boolean;
}

/**
 * Creates a base bullet with standard properties.
 * @param weapon - The weapon firing the bullet.
 * @returns The configured bullet.
 */
export function createBaseBullet(weapon: Weapon): Bullet {
  const bullet = new Bullet(weapon);
  const corners = weapon.tank.corners();
  bullet.x = (corners[0].x + corners[1].x) / 2;
  bullet.y = (corners[0].y + corners[1].y) / 2;
  bullet.lethal = false;
  if (weapon.tank.player.game) {
    weapon.tank.player.game.addObject(bullet);
    // TODO: better timer
    weapon.tank.player.game.addTimeout(() => (bullet.lethal = true), 100);
  }

  return bullet;
}

/**
 * Creates an explosion of shrapnels.
 * @param weapon - The source weapon.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 * @param count - Number of shrapnels.
 * @param options - Explosion options.
 */
export function createShrapnelExplosion(weapon: Weapon, x: number, y: number, count: number, options: ShrapnelOptions): void {
  for (let i = 0; i < count; i++) {
    const shrapnel = new Bullet(weapon);
    shrapnel.x = x;
    shrapnel.y = y;
    shrapnel.radius = 2;
    shrapnel.age = 0;
    shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
    shrapnel.angle = 2 * Math.PI * Math.random();
    shrapnel.timeout = options.timeout;
    shrapnel.extrahitbox = -3;

    if (options.noCollision) {
      shrapnel.checkCollision = function (): void {};
    }

    weapon.tank.player.game!.addObject(shrapnel);
  }
}
