/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default class GameObject {
  type: string = "Object";
  image: HTMLImageElement;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  img: HTMLImageElement | undefined;
  // every object can be deleted
  // the loop will then delete it from the game object list
  deleted: boolean = false;

  /**
   * Creates a new GameObject.
   */
  constructor() {
    this.image = new Image();
  }

  /**
   * Marks the object as deleted.
   */
  delete(): void {
    this.deleted = true;
  }

  /**
   * Default draw function.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   */
  draw(context: CanvasRenderingContext2D): void {
    if (this.img) {
      context.save();
      context.translate(this.x, this.y);
      context.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
      context.restore();
    }
  }

  /**
   * Update method called every frame.
   */
  step(): void {}
}
