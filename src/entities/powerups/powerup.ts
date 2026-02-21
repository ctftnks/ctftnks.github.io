import { Settings } from "@/stores/settings";
import GameObject from "../gameobject";
import type Tank from "../tank";
import type Game from "@/game/game";

/**
 * Base class for all PowerUps.
 * @augments GameObject
 */
export abstract class PowerUp extends GameObject {
  /** Collision radius. */
  radius: number = 40;
  /** Whether bots are attracted to it. */
  attractsBots: boolean = false;
  /** optional image rendering the powerup */
  image: HTMLImageElement;

  /**
   * Creates a new PowerUp.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.width = 30;
    this.image = new Image();
    this.maxAge = 1000 * Settings.PowerUpRate * Settings.MaxPowerUps;
  }

  /**
   * Applies the powerup effect to a tank.
   * @param tank - The tank picking up the powerup.
   */
  abstract apply(tank: Tank): void;

  /**
   * Update step.
   * @param _dt
   */
  step(_dt: number): void {}

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

export default PowerUp;
