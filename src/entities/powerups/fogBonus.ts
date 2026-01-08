import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES } from "@/game/assets";
import { fogOfWar } from "@/game/effects";
import type Game from "@/game/game";

/**
 * Fog of War powerup.
 * @augments PowerUp
 */
export class FogBonus extends PowerUp {
  private used: boolean = false;
  /**
   * Creates a new FogBonus.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.image.src = IMAGES.fog;
  }
  /**
   * Applies the fog of war effect.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (!this.used) {
      fogOfWar(this.game);
      this.used = true;
    }
  }
}
