/**
 * A timeout that executes a callback after a specific game time delay.
 */
export default class GameTimeout {
  /** The game time at which the timeout should trigger. */
  triggerTime: number;
  /** The callback to execute. */
  callback: () => void;

  /**
   * Creates a new GameTimeout.
   * @param triggerTime - The game time to trigger at.
   * @param callback - The callback to execute.
   */
  constructor(triggerTime: number, callback: () => void) {
    this.triggerTime = triggerTime;
    this.callback = callback;
  }
}
