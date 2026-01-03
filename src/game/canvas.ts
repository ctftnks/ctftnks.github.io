import { store } from "@/game/store";

/**
 * Manages the game canvas and rendering loop.
 */
export default class Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
  private loop: number | undefined;
  scale: number = 1;

  /**
   * Creates a new Canvas manager.
   * @param {string} id - The ID of the canvas element.
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
   */
  draw(): void {
    this.context.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    if (!store.game) {
      return;
    }
    store.game.map.draw(this.context);
    for (let i = 0; i < store.game.objs.length; i++) {
      store.game.objs[i].draw(this.context);
    }
  }

  /**
   * Keep canvas in sync with game: redraw every few milliseconds.
   */
  sync(): void {
    if (typeof this.loop === "undefined") {
      const drawLoop = (): void => {
        this.draw();
        this.loop = requestAnimationFrame(drawLoop);
      };
      this.loop = requestAnimationFrame(drawLoop);
    }
  }

  /**
   * Stop syncing of canvas.
   */
  stopSync(): void {
    if (typeof this.loop !== "undefined") {
      cancelAnimationFrame(this.loop);
    }
  }

  /**
   * Zoom into the canvas.
   * @param {number} factor - The scale factor.
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
    if (store.game?.map) {
      store.game.map.resize();
    }
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
