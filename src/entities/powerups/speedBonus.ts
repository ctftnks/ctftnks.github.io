import PowerUp from "./powerup";
import type Tank from "../tank";
import { IMAGES } from "@/game/assets";
import type Game from "@/game/game";

/**
 * Speed Boost powerup.
 * @augments PowerUp
 */
export class SpeedBonus extends PowerUp {
  /**
   * Creates a new SpeedBonus.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.attractsBots = true;
    this.image.src = IMAGES.speed;
  }

  /**
   * Applies the speed boost to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    tank.speed *= 1.3;
    this.game.addTimeout(() => {
      tank.speed /= 1.3;
    }, 8000);
  }
}
