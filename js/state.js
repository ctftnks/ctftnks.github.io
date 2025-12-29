export let game;
export let canvas;
export let players = [];
export let nplayers = 0;
export let editingKeymap = false;

export function setGame(newGame) {
  game = newGame;
}

export function setCanvas(newCanvas) {
  canvas = newCanvas;
}

export function setPlayers(newPlayers) {
  players = newPlayers;
}

export function setNPlayers(value) {
  nplayers = value;
}

export function setEditingKeymap(value) {
  editingKeymap = value;
}
