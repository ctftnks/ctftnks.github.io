import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { Laser } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Laser weapon powerup.
 * @augments PowerUp
 */
export class LaserBonus extends PowerUp {
  /**
   * Creates a new LaserBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.laser;
  }
  /**
   * Applies the laser weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Laser(tank);
  }
}
