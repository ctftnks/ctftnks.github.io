import Bullet from "../bullet";
import type Weapon from "./weapon";
import { Settings } from "@/stores/settings";

/**
 * Creates an explosion of shrapnels.
 * @param weapon - The source weapon.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 * @param count - Number of shrapnels.
 * @param timeout - duration of a shrapnel in ms.
 */
export function createShrapnelExplosion(weapon: Weapon, x: number, y: number, count: number, timeout: number): void {
  for (let i = 0; i < count; i++) {
    const shrapnel = new Bullet(weapon);
    shrapnel.setPosition({ x, y });
    shrapnel.radius = 2;
    shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
    shrapnel.angle = 2 * Math.PI * Math.random();
    shrapnel.maxAge = timeout + Math.random() * 80;
    shrapnel.isBulletBulletCollisionEnabled = false;
    shrapnel.bounceSound = "";
    weapon.tank.game.addObject(shrapnel);
  }
}
