import GameObject from "./gameobject";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";
import type Game from "@/game/game";
import Tank from "./tank";
import type Tile from "@/game/tile";
import type Team from "@/game/team";
import type Flag from "./flag";

/**
 * Represents a Base in the game.
 * @augments GameObject
 */
export default class Base extends GameObject {
  /** Team identifier. */
  team?: Team;
  /** Base color. */
  color: string;
  /** Game instance. */
  game: Game;
  /** The flag belonging to this base. */
  flag?: Flag;
  /** Base size. */
  size: number = 80;
  /** The tile the base is on. */
  tile: Tile | null;

  /**
   * Creates a new Base.
   * @param game - The game instance.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param team - The team owning the base.
   */
  constructor(game: Game, x: number, y: number, team?: Team) {
    super();
    this.game = game;
    this.setPosition({ x, y });
    this.tile = this.game.map?.getTileByPos(this.x, this.y) ?? null;
    this.color = "#555";
    if (team) {
      this.team = team;
      this.color = team.color;
    }
  }

  /**
   * Draws the base.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;
    context.rect(-this.size / 2, -this.size / 2, 8, this.size);
    context.rect(-this.size / 2, -this.size / 2, this.size, 8);
    context.rect(this.size / 2, this.size / 2, -8, -this.size);
    context.rect(this.size / 2, this.size / 2, -this.size, -8);
    context.fill();
    context.restore();
  }

  /**
   * Updates the base state, checking for flag captures.
   */
  step(_dt: number): void {
    if (this.tile === null) {
      return;
    }
    for (const obj of this.tile.objs) {
      if (
        obj instanceof Tank &&
        obj.player.team === this.team &&
        Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        if (obj.carriedFlag !== null && this.hasFlag()) {
          // score!
          this.game.mode.giveScore(obj.player, 1);
          playSound(SOUNDS.fanfare);
          obj.carriedFlag.reset();
          obj.carriedFlag = null;
        }
      }
    }
  }

  /**
   * Checks if the base currently holds its flag.
   * @returns True if the flag is in the base.
   */
  hasFlag(): boolean {
    if (!this.flag) {
      return false;
    }
    return this.flag.inBase;
  }
}

/**
 * Represents a Hill in King of the Hill mode.
 * @augments Base
 */
export class Hill extends Base {
  /**
   * Creates a new Hill.
   * @param game - The game instance.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   */
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, undefined); // Base with undefined team
  }

  /**
   * Updates the hill state, checking for capture.
   */
  step(_dt: number): void {
    if (this.tile === null) {
      return;
    }
    for (const obj of this.tile.objs) {
      if (
        obj instanceof Tank &&
        obj.player.team !== this.team &&
        Math.pow(this.x - obj.x, 2) + Math.pow(this.y - obj.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        this.team = obj.player.team;
        this.color = this.team.color;
      }
    }
  }
}
