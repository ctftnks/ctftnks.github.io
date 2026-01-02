import GameObject from "./gameobject";
import { Smoke, generateCloud } from "./smoke";
import { playSound } from "../effects";
import { Settings } from "../store";
import { SOUNDS } from "../assets";

/**
 * Represents a bullet fired by a tank.
 * @extends GameObject
 */
export default class Bullet extends GameObject {
  image: string | HTMLImageElement = "";
  player: any;
  map: any;
  weapon: any;
  angle: number | undefined = undefined;
  radius: number = 4;
  speed: number;
  color: string = "#000";
  timeout: number;
  age: number = 0;
  trace: boolean = false;
  bounceSound: any;
  lethal: boolean = true;
  extrahitbox: number = 0;

  /**
   * Creates a new Bullet.
   * @param {Weapon} weapon - The weapon that fired the bullet.
   */
  constructor(weapon: any) {
    super();
    this.image = "";
    this.player = weapon.tank.player;
    this.map = this.player.game.map;
    this.weapon = weapon;
    this.speed = Settings.BulletSpeed;
    this.timeout = Settings.BulletTimeout * 1000;
    this.bounceSound = SOUNDS.bounce;
  }

  /**
   * Draws the bullet on the canvas.
   * @param {CanvasRenderingContext2D} context - The 2D context.
   */
  draw(context: CanvasRenderingContext2D): void {
    if (this.image === "") {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x!, this.y!, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    } else {
      context.save();
      context.translate(this.x!, this.y!);
      context.rotate(this.angle!);
      context.drawImage(this.image as HTMLImageElement, (-this.radius * 5) / 2, (-this.radius * 5) / 2, this.radius * 5, this.radius * 5);
      context.restore();
    }
  }

  /**
   * Timestepping: translation, aging, collision.
   */
  step(): void {
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
    this.x! -= (this.speed * Math.sin(-this.angle!) * Settings.GameFrequency) / 1000;
    this.y! -= (this.speed * Math.cos(-this.angle!) * Settings.GameFrequency) / 1000;

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
  checkCollision(oldx: number, oldy: number): void {
    const tile = this.map.getTileByPos(oldx, oldy);
    if (tile === -1) {
      return;
    }

    const walls = tile.getWalls(this.x, this.y);
    const nwalls = walls.filter((w: boolean) => w).length;

    if (nwalls === 0) {
      return;
    }

    playSound(this.bounceSound);

    if (nwalls === 2) {
      this.angle! += Math.PI;
      this.x = oldx;
      this.y = oldy;
    } else if (walls[1] || walls[3]) {
      this.angle! *= -1;
      this.x = 2 * oldx - this.x!;
    } else if (walls[0] || walls[2]) {
      this.angle! = Math.PI - this.angle!;
      this.y = 2 * oldy - this.y!;
    }
  }

  /**
   * Checks for collision with other bullets.
   */
  checkBulletCollision(): void {
    const bullets: Bullet[] = [];
    const tile = this.map.getTileByPos(this.x, this.y);
    if (tile !== -1) {
      for (let j = 0; j < tile.objs.length; j++) {
        if (tile.objs[j] instanceof Bullet && tile.objs[j].age > 0 && tile.objs[j] !== this) {
          bullets.push(tile.objs[j]);
        }
      }
    }

    for (let i = 0; i < bullets.length; i++) {
      const rad = 0.65 * this.radius + 0.65 * bullets[i].radius + this.extrahitbox;
      if (Math.sqrt(Math.pow(bullets[i].x! - this.x!, 2) + Math.pow(bullets[i].y! - this.y!, 2)) <= rad) {
        if (!bullets[i].lethal) {
          return;
        }
        bullets[i].explode();
        this.explode();
        bullets[i].delete();
        this.delete();
        generateCloud(this.player.game, this.x!, this.y!, 1);
        playSound(SOUNDS.origGun);
        return;
      }
    }
  }

  /**
   * Leave a trace of smoke.
   */
  leaveTrace(): void {
    this.player.game.addObject(new Smoke(this.x, this.y, 300, this.radius, 1));
  }

  /**
   * Delete bullet from map.
   */
  delete(): void {
    this.deleted = true;
  }

  /**
   * Called when the bullet explodes.
   */
  explode(): void {}
}
