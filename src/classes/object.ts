/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default class GameObject {
  deleted: boolean = false;
  isBullet: boolean = false;
  isTank: boolean = false;
  isPowerUp: boolean = false;
  type: string = "Object";
  image: HTMLImageElement;
  x: number = 0;
  y: number = 0;
  width: number = 0;
  img: HTMLImageElement | undefined;

  /**
   * Creates a new GameObject.
   */
  constructor() {
    // every object can be deleted
    // the loop will then delete it from the game object list
    this.deleted = false;
    this.isBullet = false;
    this.isTank = false;
    this.isPowerUp = false;
    this.type = "Object";
    this.image = new Image();
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.img = undefined;
  }

  /**
   * Marks the object as deleted.
   */
  delete(): void {
    this.deleted = true;
  }

  /**
   * Default draw function.
   * @param {Object} canvas - The canvas element (or wrapper).
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   */
  draw(canvas: any, context: CanvasRenderingContext2D): void {
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
