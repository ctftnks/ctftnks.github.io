import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { Guided } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Guided Missile weapon powerup.
 * @augments PowerUp
 */
export class GuidedBonus extends PowerUp {
  /**
   * Creates a new GuidedBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.guided;
  }
  /**
   * Applies the guided weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Guided(tank);
  }
}
