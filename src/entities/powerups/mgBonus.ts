import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { MG } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Machine Gun weapon powerup.
 * @augments PowerUp
 */
export class MGBonus extends PowerUp {
  /**
   * Creates a new MGBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.mg;
  }
  /**
   * Applies the MG weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new MG(tank);
  }
}
