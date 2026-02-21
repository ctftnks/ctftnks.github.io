import Updatable from "@/entities/updatable";

/**
 * A timeout that executes a callback after a specific game time delay.
 */
export class GameTimeout extends Updatable {
  private isInterval: boolean;

  /**
   * Creates a new GameTimeout.
   * @param delay - the time duration [ms] after which the callback should be run.
   * @param callback - The callback to execute.
   * @param isInterval - should the timeout restart after it is finished (i.e. should it run periodically?).
   */
  constructor(
    private delay: number,
    private callback: () => void,
    isInterval?: boolean,
  ) {
    super();
    this.isInterval = isInterval ? true : false;
  }

  /**
   * Check if the timeout exceeds its finish time and if so, call the callback
   * @param _dt
   */
  step(_dt: number): void {
    if (this.age >= this.delay) {
      this.callback();
      if (this.isInterval) {
        // optional interval logic (repeat the timeout periodically)
        this.age = 0;
      } else {
        this.delete();
      }
    }
  }
}

export default GameTimeout;
