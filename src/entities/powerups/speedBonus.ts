import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES } from "@/game/assets";

/**
 * Speed Boost powerup.
 * @augments PowerUp
 */
export class SpeedBonus extends PowerUp {
  /**
   * Creates a new SpeedBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.speed;
  }

  /**
   * Applies the speed boost to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    tank.speed *= 1.3;
    tank.player.game!.timeouts.push(
      window.setTimeout(() => {
        tank.speed /= 1.3;
      }, 8000),
    );
  }
}
