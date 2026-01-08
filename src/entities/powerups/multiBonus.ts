import { PowerUp } from "./powerup";
import { store } from "@/stores/gamestore";
import { IMAGES } from "@/game/assets";

/**
 * Multiplier powerup (Spawn rate increase).
 * @augments PowerUp
 */
export class MultiBonus extends PowerUp {
  private used: boolean = false;

  /**
   * Creates a new MultiBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.multi;
  }

  /**
   * Applies the multiplier effect.
   */
  apply(): void {
    if (!this.used) {
      this.used = true;
      if (store.game) {
        store.game.modifyPowerUpSpawnRate(8000);
      }
    }
  }
}
