/**
 * Type for event listener functions.
 */
type Listener<T> = (data: T) => void;

/**
 * A simple event emitter for decoupling game logic from the UI.
 */
class EventEmitter {
  private listeners: { [key: string]: Listener<any>[] } = {};

  /**
   * Registers an event listener.
   * @param {string} event - The name of the event.
   * @param {Listener<T>} listener - The callback function.
   */
  on<T>(event: string, listener: Listener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * Unregisters an event listener.
   * @param {string} event - The name of the event.
   * @param {Listener<T>} listener - The callback function to remove.
   */
  off<T>(event: string, listener: Listener<T>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  /**
   * Emits an event, triggering all registered listeners.
   * @param {string} event - The name of the event.
   * @param {T} [data] - Optional data to pass to listeners.
   */
  emit<T>(event: string, data?: T): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach((l) => l(data));
  }
}

/**
 * Singleton instance of the game event emitter.
 */
export const gameEvents = new EventEmitter();

/**
 * Constants for game event names.
 */
export const EVENTS = {
  /** Fired when the game timer updates. Data: time remaining in seconds. */
  TIME_UPDATED: "timeUpdated",
  /** Fired when bot speed is adapted. Data: new bot speed percentage (0-1). */
  BOT_SPEED_UPDATED: "botSpeedUpdated",
  /** Fired when scores need to be refreshed. */
  SCORE_UPDATED: "scoreUpdated",
};
