import { Weapon } from "./weapon";
import type Tank from "../tank";
import type Bullet from "../bullet";
import { Smoke } from "../smoke";
import { generateCloud } from "../smoke";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";

/**
 * Destroys walls.
 * @augments Weapon
 */
export class WreckingBall extends Weapon {
  override name: string = "WreckingBall";
  override fired: boolean = false;

  /**
   * Creates a new WreckingBall weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.wreckingBall;
    this.bot.shootingRange = 99;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new wrecking ball bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    bullet.radius = 10;
    bullet.color = "#000";
    bullet.speed = Settings.TankSpeed * 1.1;
    bullet.maxAge = 1000;
    /**
     * Custom collision logic for wrecking ball.
     * @param x - Old x position.
     * @param y - Old y position.
     */
    bullet.checkCollision = function (x: number, y: number): void {
      const tile = bullet.game.map.getTileByPos(x, y);
      if (tile === null) {
        return;
      }
      const walls = tile.getWalls(this.x, this.y);
      const wall = walls.indexOf(true);
      if (wall !== -1) {
        if (typeof tile.neighbors[wall] === "undefined" || tile.neighbors[wall] === null) {
          // is the wall an outer wall?
          playSound(this.bounceSound);
          // outer wall: bounce
          if (wall === 1 || wall === 3) {
            // left or right
            this.angle *= -1;
            this.x = 2 * x - this.x;
          }
          if (wall === 0 || wall === 2) {
            // top or bottom
            this.angle = Math.PI - this.angle;
            this.y = 2 * y - this.y;
          }
        } else {
          // hit a wall: remove it!
          playSound(SOUNDS.grenade);
          generateCloud(this.game, bullet.x, bullet.y, 3);
          bullet.delete();
          tile.addWall(wall, true);
        }
      }
    };

    bullet.trace = true;
    /**
     * Leaves a smoke trace.
     */
    bullet.leaveTrace = function (): void {
      if (Math.random() > 0.96) {
        const smoke = new Smoke(bullet.game, this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.game.addObject(smoke);
      }
    };

    return bullet;
  }
}
