
// static Key class
// keeps track of pressed keys
var Key = {
  _pressed: {},

  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  R0: 48,
  R1: 49,
  R2: 50,
  R3: 51,
  R4: 52,
  R5: 53,
  R6: 54,
  R7: 55,
  R8: 56,
  R9: 57,
  N0: 96,
  N1: 97,
  N2: 98,
  N3: 99,
  N4: 100,
  N5: 101,
  N6: 102,
  N7: 103,
  N8: 104,
  N9: 105,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  COMMA: 188,
  DASH: 189,
  PERIOD: 190,
  LL: 220,
  SHIFT: 16,
  CAPSLOCK: 20,
  TAB: 9,
  CARET: 192,
  ALT: 18,
  CTRL: 17,
  ENTER: 13,
  SPACE: 32,
  BACKSPACE: 8,
  ESCAPE: 27,


  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

// available keymaps
// order: up, left, down, right, fire
// var keymaps = [
//   [Key.UP, Key.LEFT, Key.DOWN, Key.RIGHT, Key.M],
//   [Key.W, Key.A, Key.S, Key.D, Key.Q],
//   [Key.T, Key.F, Key.G, Key.H, Key.R],
//   [Key.I, Key.J, Key.K, Key.L, Key.U]
// ]
var keymaps = [
  [Key.UP, Key.LEFT, Key.DOWN, Key.RIGHT, Key.SPACE],
  [Key.W, Key.A, Key.S, Key.D, Key.Q],
  [Key.F, Key.C, Key.V, Key.B, Key.X],
  [Key.Z, Key.G, Key.H, Key.J, Key.T],
  [Key.K, Key.M, Key.COMMA, Key.PERIOD, Key.N],
  [Key.N4, Key.E, Key.R, Key.N5, Key.N3],
  [Key.N8, Key.U, Key.I, Key.N9, Key.N7]
]

// event listeners
window.addEventListener('keyup', function(event){Key.onKeyup(event);}, false);
window.addEventListener('keydown', function(event){Key.onKeydown(event);}, false);
