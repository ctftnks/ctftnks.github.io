import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { Grenade } from "../weapons";
import { playSound } from "@/game/effects";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Grenade weapon powerup.
 * @augments PowerUp
 */
export class GrenadeBonus extends PowerUp {
  /**
   * Creates a new GrenadeBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.grenade;
  }
  /**
   * Applies the grenade weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Grenade(tank);
  }
}
