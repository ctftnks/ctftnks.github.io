import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES, SOUNDS } from "@/game/assets";
import { playSound } from "@/game/effects";

/**
 * Terminator powerup (Rapid Fire).
 * @augments PowerUp
 */
export class TerminatorBonus extends PowerUp {
  private applied: boolean = false;

  /**
   * Creates a new TerminatorBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.terminator;
  }
  /**
   * Applies the terminator effect to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (this.applied) {
      return;
    }
    this.applied = true;
    tank.rapidfire = true;
    playSound(SOUNDS.terminator);
    tank.player.game!.addTimeout(() => {
      tank.rapidfire = false;
    }, 120000);
  }
}
