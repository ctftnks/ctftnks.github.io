// a class for fancy smoke circles on the map
/**
 * Represents a smoke particle.
 * @extends GameObject
 */
class Smoke extends GameObject {
  /**
   * Creates a new Smoke particle.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} timeout - Lifetime in ms.
   * @param {number} radius - Initial radius.
   * @param {number} rspeed - Radius shrinking speed.
   */
  constructor(x, y, timeout = 300, radius = 10, rspeed = 1) {
    // inherit from GameObject class
    super();
    // to be initialized
    /** @type {number} X coordinate. */
    this.x = x;
    /** @type {number} Y coordinate. */
    this.y = y;
    /** @type {number} Current radius. */
    this.radius = radius;
    /** @type {string} Color. */
    this.color = "rgba(40, 40, 40, 0.3)";
    /** @type {number} Shrink speed. */
    this.rspeed = rspeed;
    // lifetime of the smoke in [ms]
    /** @type {number} Remaining lifetime. */
    this.timeout = timeout;
  }

  /**
   * Draws the smoke particle.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  }

  /**
   * Updates the smoke particle.
   */
  step() {
    // is bullet timed out?
    this.timeout -= GameFrequency;
    if (this.timeout < 0) this.delete();
    this.radius -= (this.rspeed * GameFrequency) / 40;
    if (this.radius < 0) this.radius = 0;
  }
}

/**
 * Creates a cluster of smoke particles (Cloud).
 * @param {Game} game - The game instance.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} n - Number of particles.
 * @param {number} radius - Radius of the cloud.
 * @param {number} rspeed - Shrink speed.
 * @param {string|number} color - Color override.
 */
const Cloud = function (game, x, y, n = 4, radius = 20, rspeed = 0.3, color = -1) {
  for (var i = 0; i < n; i++) {
    var rx = x + radius * 2 * (Math.random() - 0.5);
    var ry = y + radius * 2 * (Math.random() - 0.5);
    var rr = radius + radius * (Math.random() - 0.5);
    var smoke = new Smoke(rx, ry, 2000, radius, rspeed);
    if (color != -1) smoke.color = color;
    game.addObject(smoke);
  }
};
