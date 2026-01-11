import PowerUp from "./powerup";
import { IMAGES } from "@/game/assets";
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
    this.image.src = IMAGES.multi;
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
}
