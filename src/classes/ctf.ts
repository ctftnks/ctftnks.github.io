import GameObject from "./object";
import { playSound } from "../effects";
import { SOUNDS } from "../assets";
import Game from "./game";
import Tank from "./tank";
import Player from "./player";

/**
 * Represents a Flag in Capture the Flag mode.
 * @extends GameObject
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
  picked: boolean;
  /** Whether the flag is in its base. */
  inBase: boolean;
  /** Timer for resetting the flag. */
  resetTimer: number;

  /**
   * Creates a new Flag.
   * @param {Game} game - The game instance.
   * @param {Base} base - The base this flag belongs to.
   */
  constructor(game: Game, base: Base) {
    super();
    this.type = "Flag";
    this.game = game;
    this.base = base;
    this.team = base.team;
    this.color = base.color;
    this.size = 24;
    this.x = base.x;
    this.y = base.y;
    this.picked = false;
    this.inBase = true;
    this.resetTimer = 0;
  }

  /**
   * Return flag to base.
   */
  reset() {
    this.inBase = true;
    this.drop(this.base.x, this.base.y);
  }

  /**
   * Let tank pick up the flag.
   * @param {Tank} tank - The tank picking up the flag.
   */
  pickup(tank: Tank) {
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
  drop(x: number, y: number) {
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
  step() {
    if (!this.game.map) return;
    const tile = this.game.map.getTileByPos(this.x, this.y);
    if (tile === -1) return;
    for (let i = 0; i < tile.objs.length; i++) {
      const tank: GameObject = tile.objs[i];
      if (tank.isTank && Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)) {
        if ((tank as Tank).player.team === this.team) {
          if (!this.base.hasFlag()) {
            // return flag to base
            this.reset();
            playSound(SOUNDS.resetFlag);
          }
        } else if ((tank as Tank).carriedFlag === -1 && !this.picked && !tank.deleted) {
          // pick up flag
          this.pickup(tank as Tank);
          playSound(SOUNDS.coin);
        }
      }
    }
    if (!this.inBase && !this.picked && this.resetTimer < this.game.t) this.reset();
    if (this.inBase) {
      this.x = this.base.x;
      this.y = this.base.y;
    }
  }

  /**
   * Draws the flag.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas: any, context: CanvasRenderingContext2D) {
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
 * @extends GameObject
 */
export class Base extends GameObject {
  /** Team identifier. */
  team: number;
  /** Base color. */
  color: string;
  /** Game instance. */
  game: Game;
  /** The flag belonging to this base. */
  flag: Flag | undefined;
  /** Base size. */
  size: number;
  /** The tile the base is on. */
  tile: any;

  /**
   * Creates a new Base.
   * @param {Game} game - The game instance.
   * @param {Player} player - The player/team owning the base.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  constructor(game: Game, player: Player | { color: string; team: number }, x: number, y: number) {
    super();
    this.type = "Base";
    this.team = player.team;
    this.color = player.color;
    this.game = game;
    this.x = x;
    this.y = y;
    this.flag = undefined;
    this.size = 80;
    this.tile = this.game.map ? this.game.map.getTileByPos(this.x, this.y) : undefined;
  }

  /**
   * Draws the base.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas: any, context: CanvasRenderingContext2D) {
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
  step() {
    if (!this.tile || this.tile === -1) return;
    for (let i = 0; i < this.tile.objs.length; i++) {
      const tank: Tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team === this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        if (tank.carriedFlag !== -1 && this.hasFlag()) {
          // score!
          this.game.mode.giveScore(tank.player);
          playSound(SOUNDS.fanfare);
          tank.carriedFlag.reset();
          tank.carriedFlag = -1;
        }
      }
    }
  }

  /**
   * Checks if the base currently holds its flag.
   * @returns {boolean} True if the flag is in the base.
   */
  hasFlag(): boolean {
    if (typeof this.flag === "undefined") return false;
    return this.flag.inBase;
  }
}

/**
 * Represents a Hill in King of the Hill mode.
 * @extends Base
 */
export class Hill extends Base {
  /**
   * Creates a new Hill.
   * @param {Game} game - The game instance.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  constructor(game: Game, x: number, y: number) {
    super(game, { color: "#555", team: -1 }, x, y);
    this.type = "Hill";
  }

  /**
   * Updates the hill state, checking for capture.
   */
  step() {
    if (!this.tile || (this.tile as any) === -1) return;
    for (let i = 0; i < this.tile.objs.length; i++) {
      const tank: Tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team !== this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        this.team = tank.player.team;
        this.color = tank.player.color;
      }
    }
  }
}
