import { store } from "../state";

/**
 * Manages the game canvas and rendering loop.
 */
export default class Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
  game: any;
  loop: number | undefined;
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
    this.game = undefined;
    this.loop = undefined;
    this.scale = 1;
  }

  /**
   * Clear canvas and draw all objects.
   */
  draw(): void {
    this.context.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    this.game.map.draw(this.context);
    for (let i = 0; i < this.game.objs.length; i++) this.game.objs[i].draw(this.context);
  }

  /**
   * Keep canvas in sync with game: redraw every few milliseconds.
   */
  sync(): void {
    if (typeof this.loop === "undefined") {
      const drawLoop = () => {
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
    if (typeof this.loop !== "undefined") cancelAnimationFrame(this.loop);
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
    if (typeof store.game !== "undefined") store.game.map.resize();
  }

  /**
   * Shakes the canvas visually.
   */
  shake(): void {
    const amp = 14;
    const speed = 25;
    const duration = 660;
    let i = 0;

    const intvl = setInterval(() => {
      const randx = amp * (Math.random() - 0.5) * Math.exp((i * 250) / duration);
      const randy = amp * (Math.random() - 0.5) * Math.exp((i * 250) / duration);
      i -= 1;
      this.canvas.style.marginLeft = randx + "px";
      this.canvas.style.marginTop = randy + "px";
      setTimeout(() => {
        this.canvas.style.marginLeft = 0 + "px";
        this.canvas.style.marginTop = 0 + "px";
      }, speed);
    }, 2 * speed);

    this.game.timeouts.push(
      setTimeout(() => {
        clearInterval(intvl);
      }, duration),
    );
  }
}
