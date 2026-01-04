import Base from "./base";
import type Game from "@/game/game";
import Tank from "./tank";
import type GameObject from "./gameobject";

/**
 * Represents a Hill in King of the Hill mode.
 * @augments Base
 */
export default class Hill extends Base {
  /**
   * Creates a new Hill.
   * @param game - The game instance.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   */
  constructor(game: Game, x: number, y: number) {
    super(game, null, x, y);
  }

  /**
   * Updates the hill state, checking for capture.
   */
  step(): void {
    if (this.tile === null) {
      return;
    }
    for (let i = 0; i < this.tile.objs.length; i++) {
      const tank: GameObject = this.tile.objs[i];
      if (
        tank instanceof Tank &&
        tank.player.team !== this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        this.team = tank.player.team;
        this.color = this.team.color;
      }
    }
  }
}
