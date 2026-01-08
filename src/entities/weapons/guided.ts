import { Weapon } from "./weapon";
import Tank from "../tank";
import Bullet from "../bullet";
import { Smoke } from "../smoke";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";

/**
 * A guided missile.
 * @augments Weapon
 */
export class Guided extends Weapon {
  override name: string = "Guided";

  /**
   * Creates a new Guided Missile weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.guided;
    this.bot.shootingRange = 16;
    this.bot.fleeingDuration = 3000;
  }

  /**
   * Creates a new guided missile bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.radius = 6;
    e.image = new Image();
    e.image.src = IMAGES.guided;
    e.color = "#555";
    e.smokeColor = "#555";
    e.speed = 1.1 * Settings.TankSpeed;
    let gotoTarget: { x: number; y: number; dx: number; dy: number } | null = null;
    e.extrahitbox = 10;
    e.maxAge = undefined;

    /**
     * Guided bullet logic.
     * @param dt
     */
    e.step = function (dt: number): void {
      e.leaveTrace();

      const oldx = e.x;
      const oldy = e.y;
      // normal translation
      if (gotoTarget === null) {
        e.x -= (e.speed * Math.sin(-e.angle) * dt) / 1000;
        e.y -= (e.speed * Math.cos(-e.angle) * dt) / 1000;
      } else {
        // guided translation:
        // if gotoTarget has point data stored go into it's direction
        const distx = gotoTarget.x + gotoTarget.dx / 2 - e.x;
        const disty = gotoTarget.y + gotoTarget.dy / 2 - e.y;
        const len = Math.sqrt(distx * distx + disty * disty);
        e.x += (e.speed * (distx / len) * dt) / 1000;
        e.y += (e.speed * (disty / len) * dt) / 1000;
        this.angle = Math.atan2(-distx, disty) + Math.PI;
        if (len < 5) {
          gotoTarget = null;
        }
      }
      // check for wall collisions
      e.checkCollision(oldx, oldy);
      // check for bullet-bullet collisions
      e.checkBulletCollision();
      // calculate path to next tank and set next goto tile
      // at first, it waits a while and then repeats the task every few ms
      if (e.age > 1750) {
        e.age -= 250;
        playSound(SOUNDS.guided);
        // get current tile and path
        const tile = e.map.getTileByPos(oldx, oldy)!;
        // Pathfinding logic for guided missile.
        const path = tile.pathTo((destination) => destination.objs.some((obj) => obj instanceof Tank && obj.player.team !== e.player.team));
        // set next path tile as goto point
        if (path && path.length > 1) {
          gotoTarget = path[1];
        } // if there is no next tile, hit the tank in the tile
        else {
          for (let i = 0; i < tile.objs.length; i++) {
            if (tile.objs[i] instanceof Tank) {
              gotoTarget = { x: tile.objs[i].x, y: tile.objs[i].y, dx: 0, dy: 0 };
            }
          }
        }

        if (path && path.length > 0) {
          const target = path[path.length - 1].objs[0];
          if (target instanceof Tank) {
            e.smokeColor = target.color;
          }
        }
      }
      /**
       * Leaves a smoke trace.
       */
      e.leaveTrace = function (): void {
        if (Math.random() > 0.8) {
          const smoke = new Smoke(this.x, this.y, 400, this.radius / 1.4, 0.6);
          smoke.color = e.smokeColor!;
          e.player.game!.addObject(smoke);
        }
      };
    };
    return e;
  }
}
