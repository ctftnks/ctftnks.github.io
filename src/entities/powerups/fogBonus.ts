import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES } from "@/game/assets";
import { FogEffect } from "@/game/effects";
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
      const game = tank.game;
      const canvas = game.canvas.effectsCanvas;
      if (!canvas || !canvas.getContext("2d")) {
        return;
      }
      const effect = new FogEffect(game);

      // Remove existing FogEffect to avoid stacking
      const existingIndex = game.updatables.findIndex((u) => u instanceof FogEffect);
      if (existingIndex !== -1) {
        game.updatables[existingIndex].delete();
        game.updatables.splice(existingIndex, 1);
        effect.age = 300; // set higher initial age to prevent duplicate fade-in effect
      }

      game.updatables.push(effect);
      this.used = true;
    }
  }
}
