import GameObject from "../gameobject";
import type Tank from "../tank";

/**
 * Base class for all PowerUps.
 * @augments GameObject
 */
export abstract class PowerUp extends GameObject {
  /** Collision radius. */
  radius: number = 40;
  /** Whether bots are attracted to it. */
  attractsBots: boolean = false;

  /**
   * Creates a new PowerUp.
   */
  constructor() {
    super();
    this.width = 30;
  }

  /**
   * Applies the powerup effect to a tank.
   * @param tank - The tank picking up the powerup.
   */
  abstract apply(tank: Tank): void;

  /**
   * Update step.
   */
  step(): void {}

  /**
   * Draws the powerup.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }
}
