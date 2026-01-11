import PowerUp from "./powerup";
import type Game from "@/game/game";

/**
 * Multiplier powerup (Spawn rate increase).
 * @augments PowerUp
 */
export class MultiBonus extends PowerUp {
  private used: boolean = false;

  /**
   * Creates a new MultiBonus.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
  }

  /**
   * Applies the multiplier effect.
   */
  apply(): void {
    if (!this.used) {
      this.used = true;
      this.game.modifyPowerUpSpawnRate(8000);
    }
  }

  /**
   * Draws the powerup.
   * @param context - The context.
   */
  override draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.arc(0, 0, 14, 0, 2 * Math.PI);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = "black";
    context.font = "bold 14px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("×2", 0, 0);
    context.restore();
  }
}
