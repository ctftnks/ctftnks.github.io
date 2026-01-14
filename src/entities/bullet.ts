import GameObject from "./gameobject";
import { Smoke, generateCloud } from "./smoke";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";
import { SOUNDS } from "@/game/assets";
import type Player from "@/game/player";
import type Weapon from "./weapons/weapon";
import { circlesIntersect, Coord } from "@/utils/geometry";

/**
 * Represents a bullet fired by a tank.
 * @augments GameObject
 */
export default class Bullet extends GameObject {
  player: Player;
  weapon: Weapon;
  angle: number = 0;
  radius: number = 4;
  speed: number;
  color: string = "#000";
  trace: boolean = false;
  bounceSound: string = SOUNDS.bounce;
  lethal: boolean = true;
  extrahitbox: number = 0; // size of additional hitbox used for bullet-bullet collisions
  exploded: boolean = false; // used only for some powerups
  smokeColor: string | null = null; // used only for some powerups
  image?: HTMLImageElement; // optional image for rendering the bullet

  /**
   * Creates a new Bullet.
   * @param weapon - The weapon that fired the bullet.
   */
  constructor(weapon: Weapon) {
    super(weapon.tank.game);
    this.player = weapon.tank.player;
    this.weapon = weapon;
    this.speed = Settings.BulletSpeed;
    this.maxAge = Settings.BulletTimeout * 1000;
  }

  /**
   * Draws the bullet on the canvas.
   * @param context - The 2D context.
   */
  draw(context: CanvasRenderingContext2D): void {
    if (this.image) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, (-this.radius * 5) / 2, (-this.radius * 5) / 2, this.radius * 5, this.radius * 5);
      context.restore();
    } else {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    }
  }

  /**
   * Timestepping: translation, aging, collision.
   * @param dt
   */
  step(dt: number): void {
    if (this.maxAge && this.age > this.maxAge) {
      this.explode();
      this.delete();
    }

    if (this.trace) {
      this.leaveTrace();
    }

    const oldPosition = {x: this.x, y: this.y};
    this.x -= (this.speed * Math.sin(-this.angle) * dt) / 1000;
    this.y -= (this.speed * Math.cos(-this.angle) * dt) / 1000;

    this.checkCollision(oldPosition);
    if (Settings.BulletsCanCollide) {
      this.checkBulletCollision();
    }
  }

  /**
   * Check for collision with walls, handle them.
   * @param oldPosition - Previous position {x, y}.
   */
  checkCollision(oldPosition: Coord): void {
    if (!this.tile) {
      return;
    }

    const walls = this.tile.getWalls(this.x, this.y);
    const nwalls = walls.filter((w) => w).length;

    if (nwalls === 0) {
      return;
    }

    if (this.bounceSound) {
      playSound(this.bounceSound);
    }

    if (nwalls === 2) {
      this.angle += Math.PI;
      this.setPosition(oldPosition);
    } else if (walls[1] || walls[3]) {
      this.angle *= -1;
      this.x = 2 * oldPosition.x - this.x;
    } else if (walls[0] || walls[2]) {
      this.angle = Math.PI - this.angle;
      this.y = 2 * oldPosition.y - this.y;
    }
  }

  /**
   * Checks for collision with other bullets.
   */
  checkBulletCollision(): void {
    if (!this.tile) {
      return;
    }
    for (const obj of this.tile.objs) {
      if (obj instanceof Bullet && obj.age > 0 && obj !== this) {
        if (circlesIntersect(this, 0.65 * this.radius + this.extrahitbox, obj, 0.65 * obj.radius)) {
          if (!obj.lethal) {
            return;
          }
          obj.explode();
          this.explode();
          obj.delete();
          this.delete();
          generateCloud(this.game, this.x, this.y, 1);
          playSound(SOUNDS.origGun);
          return;
        }
      }
    }
  }

  /**
   * Leave a trace of smoke.
   */
  leaveTrace(): void {
    this.game.addObject(new Smoke(this.game, this.x, this.y, 300, this.radius, 1));
  }

  /**
   * Called when the bullet explodes.
   */
  explode(): void {}
}
