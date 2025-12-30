import GameObject from "./object.js";
import { Smoke, Cloud } from "./smoke.js";
import { playSound } from "../effects.js";
import { GameFrequency } from "../constants.js";
import { store, Settings } from "../state.js";

// a parent class for all bullets flying through the map
// contains position, ang,e speed, timeout and parent weapon
// provides collision detection with the walls
// Tank-Bullet-collision detection is implemented in the tank class
// as it needs less checks this way

/**
 * Represents a bullet fired by a tank.
 * @extends GameObject
 */
export default class Bullet extends GameObject {
  /**
   * Creates a new Bullet.
   * @param {Weapon} weapon - The weapon that fired the bullet.
   */
  constructor(weapon) {
    // inherit from GameObject class
    super();
    /** @type {boolean} Indicates this is a bullet. */
    this.isBullet = true;
    /** @type {string|HTMLImageElement} Image of the bullet. */
    this.image = "";
    // parent objects
    /** @type {Player} The player who fired the bullet. */
    this.player = weapon.tank.player;
    /** @type {Map} The game map. */
    this.map = this.player.game.map;
    /** @type {Weapon} The weapon instance. */
    this.weapon = weapon;
    // to be initialized by weapon when shot
    /** @type {number} X coordinate. */
    this.x = undefined;
    /** @type {number} Y coordinate. */
    this.y = undefined;
    /** @type {number} Movement angle. */
    this.angle = undefined;
    /** @type {number} Bullet radius. */
    this.radius = 4;
    /** @type {number} Bullet speed. */
    this.speed = Settings.BulletSpeed;
    /** @type {string} Bullet color. */
    this.color = "#000";
    // lifetime of the bullet in [ms]
    /** @type {number} Timeout before bullet expires. */
    this.timeout = Settings.BulletTimeout * 1000;
    // bullet age starts at negative value, so it doesn't instantly kill the shooter
    /** @type {number} Current age of the bullet. */
    this.age = -0;
    // shall the bullet leave a trace of smoke?
    /** @type {boolean} Whether to leave a smoke trace. */
    this.trace = false;
    /** @type {string} Sound to play on bounce. */
    this.bounceSound = "res/sound/bounce.wav";
    /** @type {boolean} Whether the bullet is lethal. */
    this.lethal = true;
    // hitbox enlargement of the bullet
    /** @type {number} Extra hitbox size. */
    this.extrahitbox = 0;
  }

  /**
   * Draws the bullet on the canvas.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The 2D context.
   */
  draw(canvas, context) {
    if (this.image === "") {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    } else {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, (-this.radius * 5) / 2, (-this.radius * 5) / 2, this.radius * 5, this.radius * 5);
      context.restore();
    }
  }

  /**
   * Timestepping: translation, aging, collision.
   */
  step() {
    // is bullet timed out?
    this.age += GameFrequency;
    if (this.age > this.timeout) {
      this.explode();
      this.delete();
    }
    // leave a trace of smoke
    if (this.trace) this.leaveTrace();
    // translate
    const oldx = this.x;
    const oldy = this.y;
    this.x -= (this.speed * Math.sin(-this.angle) * GameFrequency) / 1000;
    this.y -= (this.speed * Math.cos(-this.angle) * GameFrequency) / 1000;
    // check for wall collisions
    this.checkCollision(oldx, oldy);
    if (Settings.BulletsCanCollide) this.checkBulletCollision();
  }

  /**
   * Check for collision with walls, handle them.
   * Tests whether last timestep put the bullet in a new tile
   * and if old and new tile are separated by a wall.
   * @param {number} oldx - Previous X position.
   * @param {number} oldy - Previous Y position.
   */
  checkCollision(oldx, oldy) {
    const tile = this.map.getTileByPos(oldx, oldy);
    if (tile === -1) return;
    const walls = tile.getWalls(this.x, this.y);
    // check if there is any wall, otherwise return
    const nwalls = walls.filter((w) => w).length;
    if (nwalls === 0) return;
    // there seems to be a wall: handle accordingly
    playSound(this.bounceSound);
    // check if there is two walls at once
    if (nwalls === 2) {
      // invert direction
      this.angle += Math.PI;
      this.x = oldx;
      this.y = oldy;
    }
    // otherwise there is only one wall
    else if (walls[1] || walls[3]) {
      // left or right
      this.angle *= -1;
      this.x = 2 * oldx - this.x;
    } else if (walls[0] || walls[2]) {
      // top or bottom
      this.angle = Math.PI - this.angle;
      this.y = 2 * oldy - this.y;
    }
  }

  /**
   * Checks for collision with other bullets.
   */
  checkBulletCollision() {
    // create a list of bullets that may hit this one by looking
    // at the object lists of the tiles of the tanks corners
    const bullets = [];
    const tile = this.map.getTileByPos(this.x, this.y);
    if (tile !== -1) {
      for (let j = 0; j < tile.objs.length; j++) {
        if (tile.objs[j].isBullet && tile.objs[j].age > 0 && tile.objs[j] !== this) bullets.push(tile.objs[j]);
      }
    }
    // for each bullet in the list, check if it intersects this one
    for (let i = 0; i < bullets.length; i++) {
      const rad = 0.65 * this.radius + 0.65 * bullets[i].radius + this.extrahitbox;
      if (Math.sqrt(Math.pow(bullets[i].x - this.x, 2) + Math.pow(bullets[i].y - this.y, 2)) <= rad) {
        if (!bullets[i].lethal) return;
        // Hit!
        bullets[i].explode();
        this.explode();
        bullets[i].delete();
        this.delete();
        new Cloud(this.player.game, this.x, this.y, 1);
        playSound("res/sound/original/gun.mp3");
        return;
      }
    }
  }

  /**
   * Leave a trace of smoke.
   */
  leaveTrace() {
    this.player.game.addObject(new Smoke(this.x, this.y, 300, this.radius, 1));
  }

  /**
   * Delete bullet from map.
   */
  delete() {
    this.deleted = true;
  }

  /**
   * Called when the bullet explodes.
   */
  explode() {}
}
