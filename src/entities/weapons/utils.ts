import Bullet from "../bullet";
import type { Weapon } from "./weapon";
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
    shrapnel.setPosition({ x, y });
    shrapnel.radius = 2;
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
