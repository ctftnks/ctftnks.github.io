import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { Mine } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Mine weapon powerup.
 * @augments PowerUp
 */
export class MineBonus extends PowerUp {
  /**
   * Creates a new MineBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.mine;
  }
  /**
   * Applies the mine weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Mine(tank);
  }
}
