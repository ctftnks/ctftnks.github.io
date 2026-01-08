import { PowerUp } from "./powerup";
import type Tank from "../tank";
import type { Weapon } from "../weapons/weapon";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";
import type Game from "@/game/game";

/**
 * Base class for weapon powerups to reduce duplication.
 * @augments PowerUp
 */
export class WeaponBonus extends PowerUp {
  /**
   * Creates a new WeaponBonus.
   * @param game - The game instance.
   * @param imageSrc - The source of the image.
   * @param weaponClass - The class of the weapon to grant.
   * @param attractsBots - Whether bots are attracted to this powerup.
   */
  constructor(
    game: Game,
    imageSrc: string,
    private weaponClass: new (tank: Tank) => Weapon,
    attractsBots: boolean = false,
  ) {
    super(game);
    this.image.src = imageSrc;
    this.attractsBots = attractsBots;
  }

  /**
   * Applies the weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new this.weaponClass(tank);
  }
}
