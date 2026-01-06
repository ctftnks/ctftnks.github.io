import { PowerUp } from "./powerup";
import { store } from "@/stores/gamestore";
import { IMAGES } from "@/game/assets";
import { Settings } from "@/stores/settings";

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
      Settings.PowerUpRate /= 2.5;
      Settings.PowerUpRate = Math.round(1000 * Settings.PowerUpRate) / 1000;
      Settings.MaxPowerUps *= 2.5;
      if (store.game) {
        store.game.addTimeout(() => {
          Settings.PowerUpRate *= 2.5;
          Settings.MaxPowerUps /= 2.5;
        }, 8000);
      }
    }
  }
}
