import GameObject from "./gameobject";
import { Settings } from "@/game/settings";
import type Game from "@/game/game";

/**
 * Represents a fancy smoke circle on the map.
 * @augments GameObject
 */
export class Smoke extends GameObject {
  radius: number;
  color: string = "rgba(40, 40, 40, 0.3)";
  rspeed: number;
  timeout: number;

  /**
   * Creates a new Smoke particle.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param timeout - Lifetime in ms.
   * @param radius - Initial radius.
   * @param rspeed - Radius shrinking speed.
   */
  constructor(x: number, y: number, timeout: number = 300, radius: number = 10, rspeed: number = 1) {
    // inherit from GameObject class
    super();
    // to be initialized
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.rspeed = rspeed;
    // lifetime of the smoke in [ms]
    this.timeout = timeout;
  }

  /**
   * Draws the smoke particle.
   * @param context - The context.
   */
  override draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  }

  /**
   * Updates the smoke particle.
   */
  override step(): void {
    // is bullet timed out?
    this.timeout -= Settings.GameFrequency;
    if (this.timeout < 0) {
      this.delete();
    }
    this.radius -= (this.rspeed * Settings.GameFrequency) / 40;
    if (this.radius < 0) {
      this.radius = 0;
    }
  }
}

/**
 * Creates a cluster of smoke particles (Cloud).
 * @param game - The game instance.
 * @param x - X coordinate.
 * @param y - Y coordinate.
 * @param n - Number of particles.
 * @param radius - Radius of the cloud.
 * @param rspeed - Shrink speed.
 * @param color - Color override.
 */
export function generateCloud(
  game: Game,
  x: number,
  y: number,
  n: number = 4,
  radius: number = 20,
  rspeed: number = 0.3,
  color: string = "",
): void {
  for (let i = 0; i < n; i++) {
    const rx = x + radius * 2 * (Math.random() - 0.5);
    const ry = y + radius * 2 * (Math.random() - 0.5);
    const smoke = new Smoke(rx, ry, 2000, radius, rspeed);
    if (color !== "") {
      smoke.color = color;
    }
    game.addObject(smoke);
  }
}
