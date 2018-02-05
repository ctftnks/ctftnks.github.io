var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  M: 77,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  Q: 81,

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

var keymaps = [
  [Key.UP, Key.LEFT, Key.DOWN, Key.RIGHT, Key.M],
  [Key.W, Key.A, Key.S, Key.D, Key.Q]
]


window.addEventListener('keyup', function(event){Key.onKeyup(event);}, false);
window.addEventListener('keydown', function(event){Key.onKeydown(event);}, false);
