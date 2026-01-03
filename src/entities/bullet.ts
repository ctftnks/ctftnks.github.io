import GameObject from "./gameobject";
import { Smoke, generateCloud } from "./smoke";
import { playSound } from "@/game/effects";
import { Settings } from "@/game/settings";
import { SOUNDS } from "@/game/assets";
import type Player from "@/game/player";
import type GameMap from "@/game/gamemap";
import { Weapon } from "./weapons/weapons";

/**
 * Represents a bullet fired by a tank.
 * @augments GameObject
 */
export default class Bullet extends GameObject {
  public player: Player;
  public map: GameMap;
  public weapon: Weapon;
  public angle: number = 0;
  public radius: number = 4;
  public speed: number;
  public color: string = "#000";
  public timeout: number;
  public age: number = 0;
  public trace: boolean = false;
  public bounceSound: string = SOUNDS.bounce;
  public lethal: boolean = true;
  public extrahitbox: number = 0; // size of additional hitbox used for bullet-bullet collisions
  public exploded: boolean = false; // used only for some powerups
  public smokeColor: string | null = null; // used only for some powerups

  /**
   * Creates a new Bullet.
   * @param {Weapon} weapon - The weapon that fired the bullet.
   */
  public constructor(weapon: Weapon) {
    super();
    this.player = weapon.tank.player;
    this.map = this.player.game!.map;
    this.weapon = weapon;
    this.speed = Settings.BulletSpeed;
    this.timeout = Settings.BulletTimeout * 1000;
  }

  /**
   * Draws the bullet on the canvas.
   * @param {CanvasRenderingContext2D} context - The 2D context.
   */
  public draw(context: CanvasRenderingContext2D): void {
    if (!this.image.src) {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    } else {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, (-this.radius * 5) / 2, (-this.radius * 5) / 2, this.radius * 5, this.radius * 5);
      context.restore();
    }
  }

  /**
   * Timestepping: translation, aging, collision.
   */
  public step(): void {
    this.age += Settings.GameFrequency;
    if (this.age > this.timeout) {
      this.explode();
      this.delete();
    }

    if (this.trace) {
      this.leaveTrace();
    }

    const oldx = this.x;
    const oldy = this.y;
    this.x -= (this.speed * Math.sin(-this.angle) * Settings.GameFrequency) / 1000;
    this.y -= (this.speed * Math.cos(-this.angle) * Settings.GameFrequency) / 1000;

    this.checkCollision(oldx, oldy);
    if (Settings.BulletsCanCollide) {
      this.checkBulletCollision();
    }
  }

  /**
   * Check for collision with walls, handle them.
   * @param {number} oldx - Previous X position.
   * @param {number} oldy - Previous Y position.
   */
  public checkCollision(oldx: number, oldy: number): void {
    const tile = this.map.getTileByPos(oldx, oldy);
    if (!tile) {
      return;
    }

    const walls = tile.getWalls(this.x, this.y);
    const nwalls = walls.filter((w) => w).length;

    if (nwalls === 0) {
      return;
    }

    playSound(this.bounceSound);

    if (nwalls === 2) {
      this.angle += Math.PI;
      this.x = oldx;
      this.y = oldy;
    } else if (walls[1] || walls[3]) {
      this.angle *= -1;
      this.x = 2 * oldx - this.x;
    } else if (walls[0] || walls[2]) {
      this.angle = Math.PI - this.angle;
      this.y = 2 * oldy - this.y;
    }
  }

  /**
   * Checks for collision with other bullets.
   */
  public checkBulletCollision(): void {
    const tile = this.map.getTileByPos(this.x, this.y);
    if (!tile) {
      return;
    }

    for (const obj of tile.objs) {
      if (obj instanceof Bullet && obj.age > 0 && obj !== this) {
        const rad = 0.65 * this.radius + 0.65 * obj.radius + this.extrahitbox;
        const dx = obj.x - this.x;
        const dy = obj.y - this.y;
        if (rad > 0 && dx * dx + dy * dy <= rad * rad) {
          if (!obj.lethal) {
            return;
          }
          obj.explode();
          this.explode();
          obj.delete();
          this.delete();
          generateCloud(this.player.game!, this.x, this.y, 1);
          playSound(SOUNDS.origGun);
          return;
        }
      }
    }
  }

  /**
   * Leave a trace of smoke.
   */
  public leaveTrace(): void {
    this.player.game!.addObject(new Smoke(this.x, this.y, 300, this.radius, 1));
  }

  /**
   * Delete bullet from map.
   */
  public delete(): void {
    this.deleted = true;
  }

  /**
   * Called when the bullet explodes.
   */
  public explode(): void {}
}
