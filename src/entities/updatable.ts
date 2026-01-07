/**
 * Parent class for all things in the game that have a step() method that is called on every game step
 */
export default abstract class Updatable {
  /** time (in milliseconds) for how long the object already exists in the game */
  age: number = 0;
  /** optional duration in milliseconds for how long the object should still exist in the game */
  maxAge?: number;

  /**
   * Creates a new Updatable.
   */
  constructor() {}

  /**
   * Marks the object as deleted.
   */
  delete(): void {
    this.maxAge = -1;
  }

  /**
   * Is the object marked as deleted?
   */
  isDeleted(): boolean {
    return this.maxAge !== undefined && this.age > this.maxAge;
  }

  /**
   * Update method called every frame.
   */
  step(): void {}
}
