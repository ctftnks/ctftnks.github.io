/**
 * Key class to track pressed keys using event.code
 */
export const Key = {
  _pressed: new Set<string>(),

  /**
   * Check if a key is currently pressed.
   * @param code - The KeyboardEvent.code (e.g., 'KeyW', 'ArrowUp', 'Space')
   * @returns true, if the key is currently pressed, otherwise false
   */
  isDown: function (code: string): boolean {
    return this._pressed.has(code);
  },

  onKeydown: function (event: KeyboardEvent) {
    this._pressed.add(event.code);

    // Legacy specific prevention for 'W' key if needed,
    // but using code 'KeyW' is more robust.
    if (event.code === "KeyW") {
      event.preventDefault();
      event.stopPropagation();
    }
  },

  onKeyup: function (event: KeyboardEvent) {
    this._pressed.delete(event.code);
  },
};

// event listeners
window.addEventListener("keyup", (e: KeyboardEvent) => Key.onKeyup(e), false);
window.addEventListener("keydown", (e: KeyboardEvent) => Key.onKeydown(e), false);
