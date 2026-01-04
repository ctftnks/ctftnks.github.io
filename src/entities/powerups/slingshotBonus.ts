import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { Slingshot } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Slingshot weapon powerup.
 * @augments PowerUp
 */
export class SlingshotBonus extends PowerUp {
  /**
   * Creates a new SlingshotBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.slingshot;
  }
  /**
   * Applies the slingshot weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Slingshot(tank);
  }
}
