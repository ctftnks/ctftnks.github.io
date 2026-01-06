import { VirtualGameObject } from "@/entities/gameobject";

/**
 * A timeout that executes a callback after a specific game time delay.
 */
export default class GameTimeout extends VirtualGameObject {
  /** The callback to execute. */
  private callback: () => void;

  /**
   * Creates a new GameTimeout.
   * @param delay - the time duration [ms] after which the callback should be run.
   * @param callback - The callback to execute.
   */
  constructor(delay: number, callback: () => void) {
    super();
    this.maxAge = delay;
    this.callback = callback;
  }

  onDeleted(): void {
    this.callback();
  }
}

/**
 * An interval class that executes a callback periodically after a specific game time interval.
 */
export class GameInterval extends VirtualGameObject {
  /** the time interval [ms] at which the callback should be run */
  private delay: number;
  /** The callback to execute. */
  callback: () => void;

  /**
   * Creates a new GameInterval.
   * @param delay - the time interval [ms] at which the callback should be run.
   * @param callback - The callback to execute.
   */
  constructor(delay: number, callback: () => void) {
    super();
    this.delay = delay;
    this.callback = callback;
  }

  /**
   * Update method called every frame.
   */
  step(): void {
    // update the time left and
    if (this.age >= this.delay) {
      this.callback();
      this.age = 0;
    }
  }
}
