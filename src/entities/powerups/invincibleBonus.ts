import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES, SOUNDS } from "@/game/assets";
import { stopMusic, playMusic } from "@/game/effects";
import { Settings } from "@/stores/settings";
import type Game from "@/game/game";

/**
 * Invincibility powerup.
 * @augments PowerUp
 */
export class InvincibleBonus extends PowerUp {
  private applied: boolean = false;

  /**
   * Creates a new InvincibleBonus.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.attractsBots = true;
    this.image.src = IMAGES.invincible;
  }

  /**
   * Applies the invincibility to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (this.applied) {
      return;
    }
    this.applied = true;
    stopMusic();
    if (!Settings.muted) {
      playMusic(SOUNDS.invincible);
    }
    tank.speed *= 1.14;
    tank.invincibleDuration = 10000;
    this.game.addTimeout(() => {
      tank.speed /= 1.14;
      if (Settings.bgmusic) {
        // playMusic(SOUNDS.bgmusic); // Assuming we might want to add bgmusic later.
      } else if (!tank.invincible()) {
        stopMusic();
      }
    }, 10100);
  }
}
