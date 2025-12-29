import GameObject from "./object.js";
import { playSound } from "../effects.js";

/**
 * Represents a Flag in Capture the Flag mode.
 * @extends GameObject
 */
export class Flag extends GameObject {
  /**
   * Creates a new Flag.
   * @param {Game} game - The game instance.
   * @param {Base} base - The base this flag belongs to.
   */
  constructor(game, base) {
    super();
    /** @type {string} Object type. */
    this.type = "Flag";
    /** @type {Game} Game instance. */
    this.game = game;
    /** @type {string|HTMLImageElement} Image source. */
    this.image = "";
    /** @type {Base} The home base. */
    this.base = base;
    /** @type {string} Team color. */
    this.team = base.team;
    /** @type {string} Flag color. */
    this.color = base.color;
    /** @type {number} Flag size. */
    this.size = 24;
    /** @type {number} X coordinate. */
    this.x = base.x;
    /** @type {number} Y coordinate. */
    this.y = base.y;
    /** @type {boolean} Whether the flag is currently picked up. */
    this.picked = false;
    /** @type {boolean} Whether the flag is in its base. */
    this.inBase = true;
    /** @type {number} Timer for resetting the flag. */
    this.resetTimer;
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
  pickup(tank) {
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
  drop(x, y) {
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
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for (var i = 0; i < tile.objs.length; i++) {
      var tank = tile.objs[i];
      if (tank.isTank && Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)) {
        if (tank.player.team == this.team) {
          if (!this.base.hasFlag()) {
            // return flag to base
            this.reset();
            playSound("res/sound/resetFlag.wav");
          }
        } else if (tank.carriedFlag == -1 && !this.picked && !tank.deleted) {
          // pick up flag
          this.pickup(tank);
          playSound("res/sound/coin.wav");
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
  draw(canvas, context) {
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
  /**
   * Creates a new Base.
   * @param {Game} game - The game instance.
   * @param {Player} player - The player/team owning the base.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  constructor(game, player, x, y) {
    super();
    /** @type {string} Object type. */
    this.type = "Base";
    /** @type {string} Team identifier. */
    this.team = player.team;
    /** @type {string} Base color. */
    this.color = player.color;
    /** @type {Game} Game instance. */
    this.game = game;
    /** @type {string|HTMLImageElement} Image source. */
    this.image = "";
    /** @type {number} X coordinate. */
    this.x = x;
    /** @type {number} Y coordinate. */
    this.y = y;
    /** @type {Flag|undefined} The flag belonging to this base. */
    this.flag = undefined;
    /** @type {number} Base size. */
    this.size = 80;
    /** @type {Tile} The tile the base is on. */
    this.tile = this.game.map.getTileByPos(this.x, this.y);
  }

  /**
   * Draws the base.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
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
    for (var i = 0; i < this.tile.objs.length; i++) {
      var tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team == this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        if (tank.carriedFlag != -1 && this.hasFlag()) {
          // score!
          this.game.mode.giveScore(tank.player);
          playSound("res/sound/fanfare.mp3");
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
  hasFlag() {
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
  constructor(game, x, y) {
    super(game, { color: "#555", team: "#555" }, x, y);
    /** @type {string} Object type. */
    this.type = "Hill";
  }

  /**
   * Updates the hill state, checking for capture.
   */
  step() {
    for (var i = 0; i < this.tile.objs.length; i++) {
      var tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team != this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        this.team = tank.player.team;
        this.color = tank.player.color;
      }
    }
  }
}
