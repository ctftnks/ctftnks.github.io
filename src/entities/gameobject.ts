import Coord from "./coord";

/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default abstract class GameObject implements Coord {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  /** time (in milliseconds) for how long the object already exists in the game */
  age: number = 0;
  /** optional duration in milliseconds for how long the object should still exist in the game */
  maxAge?: number;

  /**
   * Creates a new GameObject.
   */
  constructor() {}

  /**
   * Update the position of the object on the map
   * @param coord a coordinate tuple (x, y)
   */
  setPosition(coord: Coord): void {
    this.x = coord.x;
    this.y = coord.y;
  }

  /**
   * Marks the object as deleted.
   */
  delete(): void {
    this.maxAge = -1;
  }

  /**
   * Should the object no longer exist, i.e., is it deleted or has it exceeded its life time?
   */
  isDeleted(): boolean {
    return this.maxAge !== undefined && this.age > this.maxAge;
  }

  /**
   * Hook that is called when an object is being deleted by the game.
   */
  onDeleted(): void {}

  /**
   * Default draw function.
   * @param context - The 2D rendering context.
   */
  abstract draw(context: CanvasRenderingContext2D): void;

  /**
   * Update method called every frame.
   */
  step(): void {}
}

/**
 * Virtual game objects are like GameObjects but have no position and are not expected to be drawn
 * on the map. They are basically just a convenient way to hook into the .step() method of the game.
 */
export abstract class VirtualGameObject extends GameObject {
  /**
   * Default draw function (empty because virtual objects do not require to be drawn)
   */
  draw(): void {}
}
