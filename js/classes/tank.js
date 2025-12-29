import GameObject from "./object.js";
import { Gun } from "./weapons.js";
import { Cloud } from "./smoke.js";
import { playSound } from "../effects.js";
import {
  TankWidth,
  TankHeight,
  Settings,
  GameFrequency,
} from "../constants.js";

// A class for tanks which act as the player character
// Recieves a player in its constructor
// contains position, angle, speed of the tank and provides methods to move it
// contains methods for collision detection with walls and bullets
// contains a weapon and a method to shoot it

/**
 * Represents a Tank controlled by a player.
 * @extends GameObject
 */
export default class Tank extends GameObject {
  /**
   * Creates a new Tank.
   * @param {Player} player - The player owning this tank.
   */
  constructor(player) {
    super();

    /** @type {Player} The player. */
    this.player = player;
    /** @type {string} Tank color. */
    this.color = this.player.color;
    /** @type {Map|undefined} The game map. */
    this.map = undefined;
    /** @type {number} X coordinate. */
    this.x = 0;
    /** @type {number} Y coordinate. */
    this.y = 0;
    /** @type {number} Rotation angle. */
    this.angle = 2 * Math.PI * Math.random();
    /** @type {number} Tank width. */
    this.width = TankWidth;
    /** @type {number} Tank height. */
    this.height = TankHeight;
    /** @type {Weapon} Current weapon. */
    this.weapon = new Gun(this);
    /** @type {number} Movement speed. */
    this.speed = Settings.TankSpeed;
    /** @type {boolean} Indicates this is a tank. */
    this.isTank = true;
    /** @type {string} Object type. */
    this.type = "Tank";
    /** @type {Object} Timers for effects. */
    this.timers = { spawnshield: -1, invincible: -1 };
    /** @type {Flag|number} The flag currently carried, or -1. */
    this.carriedFlag = -1;
    /** @type {Array<Weapon>} Inventory of weapons (unused?). */
    this.weapons = [];
    /** @type {boolean} Whether rapid fire is active. */
    this.rapidfire = false;
  }

  /**
   * Draws the tank (rotated) on map.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    context.fillStyle = this.player.color;
    if (this.timers.invincible > this.player.game.t) {
      var dt = this.timers.invincible - this.player.game.t / 600;
      context.fillStyle = "hsl(" + parseInt(360 * dt) + ",100%,40%)";
    }
    if (this.spawnshield()) {
      context.fillStyle = "#555";
      // context.globalAlpha = 0.5;
      context.globalAlpha = 0.7 * (1 - (this.timers.spawnshield - this.player.game.t) / (Settings.SpawnShieldTime * 1000));
    }
    context.fill();
    context.beginPath();
    context.fillStyle = "rgba(0, 0, 0, 0.15)";
    context.rect(-this.width / 2, -this.height / 2, this.width / 5, this.height);
    context.rect(this.width / 2 - this.width / 5, -this.height / 2, this.width / 5, this.height);
    context.fill();
    if (this.carriedFlag != -1) {
      context.beginPath();
      context.fillStyle = this.carriedFlag.color;
      context.rect(
        -this.carriedFlag.size / 2,
        -this.carriedFlag.size / 2,
        this.carriedFlag.size / 1.1,
        this.carriedFlag.size / 2,
      );
      context.fill();
      context.beginPath();
      context.fillStyle = "#000";
      context.rect(
        -this.carriedFlag.size / 2,
        -this.carriedFlag.size / 2,
        this.carriedFlag.size / 6,
        this.carriedFlag.size * 1.1,
      );
      context.fill();
    } else if (this.weapon.image.src.split("/").slice(-1)[0] == "Marc.png") {
      context.drawImage(this.weapon.image, -this.width / 2, (-1.8 * this.height) / 2, this.width, this.height * 1.4);
    } else if (this.weapon.image != "") {
      context.drawImage(this.weapon.image, -this.width / 2, -this.width / 2, this.width, this.width);
    }
    // draw label
    if (Settings.ShowTankLabels) {
      context.rotate(-this.angle);
      context.fillStyle = this.player.color;
      context.font = "" + 14 + "px Arial";
      context.fillText(this.player.name, -16, -40);
      context.rotate(this.angle);
    }
    context.restore();
  }

  /**
   * Let player class check for key presses and move tank.
   * Check for collisions and handle them.
   */
  step() {
    this.player.step();
    if (this.weapon.is_deleted) this.defaultWeapon();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

  /**
   * Move the tank forward/backwards.
   * @param {number} direction - 1 for forward, -1 for backward.
   */
  move(direction) {
    this.player.stats.miles += 1;
    var oldx = this.x;
    var oldy = this.y;
    var speed = this.spawnshield() ? 0 : this.speed;
    this.x -= (direction * speed * Math.sin(-this.angle) * GameFrequency) / 1000;
    this.y -= (direction * speed * Math.cos(-this.angle) * GameFrequency) / 1000;
    var colliding_corner = this.checkWallCollision();
    if (colliding_corner != -1) {
      this.x = oldx;
      this.y = oldy;
      var oldangle = this.angle;
      this.angle -= 0.1 * ((colliding_corner % 2) - 0.5) * direction;
      if (this.checkWallCollision() != -1) this.angle = oldangle;
    }
  }

  /**
   * Rotate the tank.
   * @param {number} direction - 1 for right, -1 for left.
   */
  turn(direction) {
    var oldangle = this.angle;
    this.angle += (((direction * Settings.TankTurnSpeed * GameFrequency) / 1000) * Settings.TankSpeed) / 180;
    var colliding_corner = this.checkWallCollision();
    if (colliding_corner != -1) {
      this.angle = oldangle;
      var oldx = this.x;
      var oldy = this.y;
      var sign = (colliding_corner - 2) * direction * 0.1;
      this.x += sign * Math.cos(-this.angle);
      this.y += -sign * Math.sin(-this.angle);
      if (this.checkWallCollision() != -1) {
        this.x -= 2 * sign * Math.cos(-this.angle);
        this.y -= -2 * sign * Math.sin(-this.angle);
        if (this.checkWallCollision() != -1) {
          this.x = oldx;
          this.y = oldy;
        }
      }
    }
  }

  /**
   * Use the weapon.
   */
  shoot() {
    if (this.spawnshield()) return;
    this.weapon.shoot();
    if (this.weapon.active && this.weapon.name != "MG") this.player.stats.shots += 1;
  }

  /**
   * Return to the default weapon.
   */
  defaultWeapon() {
    this.weapon = new Gun(this);
  }

  /**
   * Get x,y-coordinates of the tanks corners.
   * Needed for collision detection and weapon firing.
   * @returns {Array<Object>} List of corners {x, y}.
   */
  corners() {
    return [
      {
        x: this.x - (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
        y: this.y + (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x + (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
        y: this.y - (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x - (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
        y: this.y + (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x + (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
        y: this.y - (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle),
      },
    ];
  }

  /**
   * Does the tank intersect with a point?
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {boolean} True if intersecting.
   */
  intersects(x, y) {
    // checks if (0 < AM*AB < AB*AB) ^ (0 < AM*AD < AD*AD)
    // see: https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    var corners = this.corners();
    var A = corners[0];
    var B = corners[1];
    var D = corners[2];
    var AMAB = (A.x - x) * (A.x - B.x) + (A.y - y) * (A.y - B.y);
    var AMAD = (A.x - x) * (A.x - D.x) + (A.y - y) * (A.y - D.y);
    var ABAB = (A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y);
    var ADAD = (A.x - D.x) * (A.x - D.x) + (A.y - D.y) * (A.y - D.y);
    return 0 < AMAB && AMAB < ABAB && 0 < AMAD && AMAD < ADAD;
  }

  /**
   * Check for collision of the walls:
   * Checks if there is a wall between the center of the tank and each corner.
   * @returns {number} Index of colliding corner or -1.
   */
  checkWallCollision() {
    if (this.player.isBot) return -1;
    var tile = this.map.getTileByPos(this.x, this.y);
    var corners = this.corners();
    var tiles = [];
    for (var i = 0; i < 4; i++) {
      if (tile.getWalls(corners[i].x, corners[i].y).filter((w) => w).length != 0) return i;
      var tile2 = this.map.getTileByPos(corners[i].x, corners[i].y);
      if (tile2 != tile) tiles.push(tile2);
    }
    // check if any wall corner end intersects with the tank
    for (var t = 0; t < tiles.length; t++) {
      var corners = tiles[t].corners();
      for (var i = 0; i < 4; i++) if (corners[i].w && this.intersects(corners[i].x, corners[i].y)) return i;
    }
    return -1;
  }

  /**
   * Check for collision with a bullet.
   * Uses spatial sorting of the map class.
   * Only checks thos bullets that lie within the tiles of the tanks corners.
   */
  checkBulletCollision() {
    if (this.spawnshield()) return;
    // create a list of bullets that may hit the tank by looking
    // at the object lists of the tiles of the tanks corners
    var bullets = [];
    var powerups = [];
    var corners = this.corners();
    for (var m = 0; m < 4; m++) {
      var tile = this.map.getTileByPos(corners[m].x, corners[m].y);
      if (tile != -1) {
        for (var j = 0; j < tile.objs.length; j++) {
          if (tile.objs[j].isBullet && tile.objs[j].age > 0) bullets.push(tile.objs[j]);
          if (tile.objs[j].isPowerUp) powerups.push(tile.objs[j]);
        }
      }
    }
    // for each bullet in the list, check if it intersects the tank
    for (var i = 0; i < bullets.length; i++) {
      if (this.intersects(bullets[i].x, bullets[i].y)) {
        // Friendly fire?
        if (
          !Settings.FriendlyFire &&
          this.player.team == bullets[i].player.team &&
          this.player.id != bullets[i].player.id
        )
          return;
        if (!bullets[i].lethal) return;
        // Hit!
        if (this.invincible()) return;
        bullets[i].explode();
        bullets[i].delete();
        // count stats
        if (bullets[i].player.team != this.player.team) bullets[i].player.stats.kills += 1;
        // fancy explosion cloud
        new Cloud(this.player.game, this.x, this.y, 6);
        // let gamemode handle scoring
        this.player.game.mode.newKill(bullets[i].player, this.player);
        // kill the player, delete the tank and bullet
        playSound("res/sound/kill.wav");
        this.delete();
        this.player.kill();
        return;
      }
    }
    for (var i = 0; i < powerups.length; i++) {
      if (this.intersects(powerups[i].x, powerups[i].y)) {
        powerups[i].apply(this);
        powerups[i].delete();
      }
    }
  }

  /**
   * Is the spawnshield active?
   * @returns {boolean} True if spawnshield active.
   */
  spawnshield() {
    var t = this.player.game.t;
    return this.timers.spawnshield > t;
  }
  /**
   * Properties: is invincible?
   * @returns {boolean} True if invincible.
   */
  invincible() {
    var t = this.player.game.t;
    return this.timers.spawnshield > t || this.timers.invincible > t;
  }
  /**
   * Is the player of the tank a bot?
   * @returns {boolean} True if bot.
   */
  isBot() {
    return this.player.isBot;
  }

  /**
   * Deletes the tank.
   */
  delete() {
    // CTF: if tank has flag, drop it
    if (this.carriedFlag != -1) this.carriedFlag.drop(this.x, this.y);
    // delete the weapon
    this.weapon.delete();
    // mark the tank as deleted
    this.deleted = true;
  }
}
