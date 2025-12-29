/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default class GameObject {
  /**
   * Creates a new GameObject.
   */
  constructor() {
    // every object can be deleted
    // the loop will then delete it from the game object list
    /** @type {boolean} Whether the object is marked for deletion. */
    this.deleted = false;
    /** @type {boolean} Whether the object is a bullet. */
    this.isBullet = false;
    /** @type {boolean} Whether the object is a tank. */
    this.isTank = false;
    /** @type {boolean} Whether the object is a powerup. */
    this.isPowerUp = false;
    /** @type {string} The type of the object. */
    this.type = "Object";
    /** @type {HTMLImageElement} The image of the object. */
    this.image = new Image();
    /** @type {number} The x coordinate. */
    this.x = 0;
    /** @type {number} The y coordinate. */
    this.y = 0;
    /** @type {number} The width of the object. */
    this.width = 0;
    /** @type {HTMLImageElement} The image source. */
    this.img = undefined;
  }

  /**
   * Marks the object as deleted.
   */
  delete() {
    this.deleted = true;
  }

  /**
   * Default draw function.
   * @param {Object} canvas - The canvas element (or wrapper).
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   */
  draw(canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

  /**
   * Update method called every frame.
   */
  step() {}
}
