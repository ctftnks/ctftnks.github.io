import GameObject from "./gameobject";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";
import Game from "@/game/game";
import Tank from "./tank";
import Player from "@/game/player";
import Tile from "@/game/tile";

/**
 * Represents a Flag in Capture the Flag mode.
 * @augments GameObject
 */
export class Flag extends GameObject {
  /** Game instance. */
  game: Game;
  /** The home base. */
  base: Base;
  /** Team color. */
  team: number;
  /** Flag color. */
  color: string;
  /** Flag size. */
  size: number = 24;
  /** Whether the flag is currently picked up. */
  picked: boolean = false;
  /** Whether the flag is in its base. */
  inBase: boolean = true;
  /** Timer for resetting the flag. */
  resetTimer: number = 0;

  /**
   * Creates a new Flag.
   * @param {Game} game - The game instance.
   * @param {Base} base - The base this flag belongs to.
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
   * @param {Tank} tank - The tank picking up the flag.
   */
  pickup(tank: Tank): void {
    tank.carriedFlag = this;
    this.picked = true;
    this.inBase = false;
    this.delete();
  }

  /**
   * Drop the flag at a specific location.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
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
   * @param {CanvasRenderingContext2D} context - The context.
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

/**
 * Represents a Base in the game.
 * @augments GameObject
 */
export class Base extends GameObject {
  /** Team identifier. */
  team: number | null;
  /** Base color. */
  color: string;
  /** Game instance. */
  game: Game;
  /** The flag belonging to this base. */
  flag: Flag | undefined = undefined;
  /** Base size. */
  size: number = 80;
  /** The tile the base is on. */
  tile: Tile | null;

  /**
   * Creates a new Base.
   * @param {Game} game - The game instance.
   * @param {Player} player - The player/team owning the base.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  constructor(game: Game, player: Player | null, x: number, y: number) {
    super();
    if (player === null) {
      this.team = null;
      this.color = "#555";
    } else {
      this.team = player.team;
      this.color = player.color;
    }
    this.game = game;
    this.x = x;
    this.y = y;
    this.tile = this.game.map?.getTileByPos(this.x, this.y) ?? null;
  }

  /**
   * Draws the base.
   * @param {CanvasRenderingContext2D} context - The context.
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
  step(): void {
    if (this.tile === null) {
      return;
    }
    for (let i = 0; i < this.tile.objs.length; i++) {
      const tank: GameObject = this.tile.objs[i];
      if (
        tank instanceof Tank &&
        tank.player.team === this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        if (tank.carriedFlag !== null && this.hasFlag()) {
          // score!
          this.game.mode.giveScore(tank.player, 1);
          playSound(SOUNDS.fanfare);
          tank.carriedFlag.reset();
          tank.carriedFlag = null;
        }
      }
    }
  }

  /**
   * Checks if the base currently holds its flag.
   * @returns {boolean} True if the flag is in the base.
   */
  hasFlag(): boolean {
    if (typeof this.flag === "undefined") {
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
   * @param {Game} game - The game instance.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
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
        this.color = tank.player.color;
      }
    }
  }
}
