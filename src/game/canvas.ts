import type Game from "./game";

/**
 * Manages the game canvas and rendering loop.
 */
export default class Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
  scale: number = 1;

  /**
   * Creates a new Canvas manager.
   * @param id - The ID of the canvas element.
   */
  constructor(id: string) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;
    this.canvas.height = this.canvas.clientHeight;
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.width = this.canvas.clientWidth;
  }

  /**
   * Clear canvas and draw all objects.
   * @param game - The game instance to render.
   */
  draw(game: Game): void {
    this.context.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    game.map.draw(this.context);
    for (let i = 0; i < game.objs.length; i++) {
      game.objs[i].draw(this.context);
    }
  }

  /**
   * Zoom into the canvas.
   * @param factor - The scale factor.
   */
  rescale(factor: number): void {
    this.scale = factor;
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.scale(factor, factor);
  }

  /**
   * Update sizes of canvas and map for window.onresize.
   */
  resize(): void {
    this.canvas.height = this.canvas.clientHeight;
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.width = this.canvas.clientWidth;
  }

  /**
   * Shakes the canvas visually using CSS animation.
   */
  shake(): void {
    this.canvas.classList.remove("shake");
    // Trigger reflow to restart animation if it's already running
    void this.canvas.offsetWidth;
    this.canvas.classList.add("shake");
  }
}
