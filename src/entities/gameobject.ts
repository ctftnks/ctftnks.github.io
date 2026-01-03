import { Coord } from "./coord";

/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default abstract class GameObject implements Coord {
  public image: HTMLImageElement;
  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  // every object can be deleted
  // the loop will then delete it from the game object list
  public deleted: boolean = false;

  /**
   * Creates a new GameObject.
   */
  constructor() {
    this.image = new Image();
  }

  /**
   * Marks the object as deleted.
   */
  public delete(): void {
    this.deleted = true;
  }

  /**
   * Default draw function.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   */
  public draw(context: CanvasRenderingContext2D): void {
    if (this.image) {
      context.save();
      context.translate(this.x, this.y);
      context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
      context.restore();
    }
  }

  /**
   * Update method called every frame.
   */
  public step(): void {}
}
