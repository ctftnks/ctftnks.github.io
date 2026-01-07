import { Weapon } from "./weapon";
import type Tank from "../tank";
import Bullet from "../bullet";
import Trajectory from "../trajectory";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound, hexToRgbA } from "@/game/effects";

/**
 * Laser weapon.
 * @augments Weapon
 */
export class Laser extends Weapon {
  override name: string = "Laser";
  override fired: boolean = false;
  override trajectory: Trajectory;

  /**
   * Creates a new Laser.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.laser;
    this.trajectory = new Trajectory(this.tank.player.game!.map, this.tank.x, this.tank.y, this.tank.angle);
    this.trajectory.length = 620;
    this.trajectory.drawevery = 3;
    this.trajectory.color = hexToRgbA(this.tank.player.team.color, 0.4);
    this.tank.player.game!.addObject(this.trajectory);
    this.bot.fleeingDuration = 0;
  }

  /**
   * Fires the laser.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }
    playSound(SOUNDS.laser);
    this.trajectory.length = 1300;
    this.trajectory.delta = 2;
    this.trajectory.step(0);

    for (const p of this.trajectory.points.slice(15)) {
      const bullet = new Bullet(this);
      bullet.setPosition(p);
      bullet.angle = p.angle;
      bullet.radius = 2;
      bullet.extrahitbox = -100;
      bullet.maxAge = 150;
      bullet.speed = 0;
      bullet.color = this.tank.player.team.color;
      bullet.bounceSound = "";
      /**
       * Custom collision check for laser bullet.
       */
      bullet.checkCollision = function (): void {};
      this.tank.player.game!.addObject(bullet);
    }
    this.deactivate();
  }

  /**
   * Updates crosshair position.
   * @override
   */
  override crosshair(): void {
    this.trajectory.setPosition(this.tank);
    this.trajectory.angle = this.tank.angle;
    this.trajectory.age = 0;
    this.trajectory.length = this.isActive ? 620 : 0;
  }

  /**
   * Deletes the weapon and its trajectory.
   * @override
   */
  override delete(): void {
    this.isDeleted = true;
    this.trajectory.delete();
  }
}
