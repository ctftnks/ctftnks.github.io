// A class for the canvas in which the game is drawn
// binds HTML element and handles its size
// provides loop to keep the frame in sync with the game

/**
 * Manages the game canvas and rendering loop.
 */
class Canvas {
  /**
   * Creates a new Canvas manager.
   * @param {string} id - The ID of the canvas element.
   */
  constructor(id) {
    // initialize: get HTML element
    /** @type {HTMLCanvasElement} The canvas element. */
    this.canvas = document.getElementById(id);
    /** @type {CanvasRenderingContext2D} The 2D rendering context. */
    this.context = this.canvas.getContext("2d");
    this.canvas.height = this.canvas.clientHeight;
    /** @type {number} Canvas height. */
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    /** @type {number} Canvas width. */
    this.width = this.canvas.clientWidth;
    /** @type {Game} Reference to the game object. */
    this.game = undefined;
    /** @type {number|undefined} The interval ID for the draw loop. */
    this.loop = undefined;
    /** @type {number} Scale factor. */
    this.scale = 1;
  }

  /**
   * Clear canvas and draw all objects.
   */
  draw() {
    this.context.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    this.game.map.draw(this.canvas, this.context);
    for (var i = 0; i < this.game.objs.length; i++) this.game.objs[i].draw(this.canvas, this.context);
  }

  /**
   * Keep canvas in sync with game: redraw every few milliseconds.
   */
  sync() {
    if (typeof this.loop == "undefined") {
      var self = this;
      this.loop = setInterval(function () {
        self.draw();
      }, FrameFrequency);
    }
  }

  /**
   * Stop syncing of canvas.
   */
  stopSync() {
    if (typeof this.loop != "undefined") clearInterval(this.loop);
  }

  /**
   * Zoom into the canvas.
   * @param {number} factor - The scale factor.
   */
  rescale(factor) {
    this.scale = factor;
    this.context.setTransform(1, 0, 0, 1, 0, 0); // reset
    this.context.scale(factor, factor); // scale by new factor
  }

  /**
   * Update sizes of canvas and map for window.onresize.
   */
  resize() {
    this.canvas.height = this.canvas.clientHeight;
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.width = this.canvas.clientWidth;
    if (typeof game !== "undefined") game.map.resize();
    // this.rescale(Math.max(this.width / (game.map.dx * game.map.Nx));
  }

  /**
   * Shakes the canvas visually.
   */
  shake() {
    var amp = 14;
    var speed = 25;
    var duration = 660;
    var self = this;
    var i = 0;
    var intvl = setInterval(function () {
      var randx = amp * (Math.random() - 0.5) * Math.exp((i * 250) / duration);
      var randy = amp * (Math.random() - 0.5) * Math.exp((i * 250) / duration);
      i -= 1;
      // self.context.translate(randx, randy);
      self.canvas.style.marginLeft = randx + "px";
      self.canvas.style.marginTop = randy + "px";
      setTimeout(function () {
        self.canvas.style.marginLeft = 0 + "px";
        self.canvas.style.marginTop = 0 + "px";
      }, speed);
    }, 2 * speed);
    this.game.timeouts.push(
      setTimeout(function () {
        clearInterval(intvl);
      }, duration),
    );
  }
}
