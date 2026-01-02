import { store } from "./state";

/**
 * Modern Key class to track pressed keys using event.code
 */
export const Key = {
  _pressed: new Set<string>(),

  /**
   * Check if a key is currently pressed.
   * @param {string} code - The KeyboardEvent.code (e.g., 'KeyW', 'ArrowUp', 'Space')
   * @returns {boolean}
   */
  isDown: function (code: string): boolean {
    return this._pressed.has(code);
  },

  onKeydown: function (event: KeyboardEvent) {
    this._pressed.add(event.code);

    if (store.editingKeymap) {
      // Prevent default behavior while remapping keys
      event.preventDefault();
      // 'ControlLeft' or 'ControlRight' are usually forbidden in this game's logic
      if (event.code.startsWith("Control")) return;

      const doEditKeymap = (window as any).doEditKeymap;
      if (doEditKeymap) doEditKeymap(event.code);
    }

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

/**
 * Default keymaps using modern KeyboardEvent.code strings.
 * order: up, left, down, right, fire
 */
export const keymaps: string[][] = [
  ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Space"],
  ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ"],
  ["Numpad8", "Numpad4", "Numpad5", "Numpad6", "Numpad7"],
  ["KeyF", "KeyC", "KeyV", "KeyB", "KeyX"],
  ["KeyZ", "KeyG", "KeyH", "KeyJ", "KeyT"],
  ["KeyK", "KeyM", "Comma", "Period", "KeyN"],
  ["Digit4", "KeyE", "KeyR", "Digit5", "Digit3"],
  ["Digit8", "KeyU", "KeyI", "Digit9", "Digit7"],
];

// event listeners
window.addEventListener("keyup", (e: KeyboardEvent) => Key.onKeyup(e), false);
window.addEventListener("keydown", (e: KeyboardEvent) => Key.onKeydown(e), false);

/**
 * Returns a user-friendly label for a given key code.
 * @param {string} code
 * @returns {string}
 */
export function getKeyLabel(code: string): string {
  if (!code) return "";

  // Clean up common codes
  // KeyW -> W, ArrowUp -> Up, Digit1 -> 1, Numpad1 -> Num1
  let label = code
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace(/^Digit/, "")
    .replace(/^Numpad/, "Num");

  if (label === "Space") return "Space";
  return label.toUpperCase();
}
