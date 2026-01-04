import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { WreckingBall } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Wrecking Ball weapon powerup.
 * @augments PowerUp
 */
export class WreckingBallBonus extends PowerUp {
  /**
   * Creates a new WreckingBallBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.wreckingBall;
  }
  /**
   * Applies the wrecking ball weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new WreckingBall(tank);
  }
}
