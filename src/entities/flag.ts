import GameObject from "./gameobject";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";
import type Game from "@/game/game";
import Tank from "./tank";
import type Team from "@/game/team";
import type Base from "./base";

/**
 * Represents a Flag in Capture the Flag mode.
 * @augments GameObject
 */
export default class Flag extends GameObject {
  /** The game instance. */
  game: Game;
  /** The home base of this flag. */
  base: Base;
  /** The team this flag belongs to. */
  team: Team;
  /** The color of the flag. */
  color: string;
  /** The size of the flag for drawing and collision. */
  size: number = 24;
  /** Whether the flag is currently being carried by a tank. */
  picked: boolean = false;
  /** Whether the flag is currently at its home base. */
  inBase: boolean = true;
  /** Timestamp until which the flag stays at its dropped position before resetting. */
  resetTimer: number = 0;

  /**
   * Creates a new Flag.
   * @param game - The game instance.
   * @param base - The base this flag belongs to.
   */
  constructor(game: Game, base: Base) {
    super();
    this.game = game;
    this.base = base;
    this.team = base.team!;
    this.color = base.color;
    this.x = base.x;
    this.y = base.y;
  }

  /**
   * Return flag to base.
   */
  reset(): void {
    this.inBase = true;
    this.drop(this.base.x, this.base.y);
  }

  /**
   * Let tank pick up the flag.
   * @param tank - The tank picking up the flag.
   */
  pickup(tank: Tank): void {
    tank.carriedFlag = this;
    this.picked = true;
    this.inBase = false;
    this.delete();
  }

  /**
   * Drop the flag at a specific location.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   */
  drop(x: number, y: number): void {
    this.deleted = false;
    this.x = x;
    this.y = y;
    this.resetTimer = this.game.t + 30000;
    this.picked = false;
    this.game.objs.push(this);
  }

  /**
   * Updates the flag state.
   */
  step(): void {
    if (!this.game.map) {
      return;
    }
    const tile = this.game.map.getTileByPos(this.x, this.y);
    if (tile === null) {
      return;
    }
    for (let i = 0; i < tile.objs.length; i++) {
      const tank: GameObject = tile.objs[i];
      if (tank instanceof Tank && Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)) {
        if (tank.player.team === this.team) {
          if (!this.base.hasFlag()) {
            // return flag to base
            this.reset();
            playSound(SOUNDS.resetFlag);
          }
        } else if (tank.carriedFlag === null && !this.picked && !tank.deleted) {
          // pick up flag
          this.pickup(tank as Tank);
          playSound(SOUNDS.coin);
        }
      }
    }
    if (!this.inBase && !this.picked && this.resetTimer < this.game.t) {
      this.reset();
    }
    if (this.inBase) {
      this.x = this.base.x;
      this.y = this.base.y;
    }
  }

  /**
   * Draws the flag.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.fillStyle = this.base.color;
    context.rect(-this.size / 2, -this.size / 2, this.size / 1.1, this.size / 2);
    context.fill();
    context.beginPath();
    context.fillStyle = "#000";
    context.rect(-this.size / 2, -this.size / 2, this.size / 6, this.size * 1.1);
    context.fill();
    context.restore();
  }
}
