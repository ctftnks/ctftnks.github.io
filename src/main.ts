import Canvas from "@/game/canvas";
import Player from "@/game/player";
import Bot from "@/game/bot";
import { Settings, store } from "@/store";
import { newGame } from "@/game/game";
import { databinding } from "@/ui/databinding";
import { openPage } from "./ui/pages";

// generate canvas object and players list
window.onload = () => {
  store.canvas = new Canvas("gameFrame");

  store.players = [new Player(), new Bot(), new Bot(), new Bot()];
  store.players[1].color = store.players[0].color;
  store.players[1].team = store.players[0].team;
  store.players[3].color = store.players[2].color;
  store.players[3].team = store.players[2].team;

  const game = newGame();
  game.paused = true;
  openPage("menu");
};

// prevent accidental leaving
window.onbeforeunload = () => {
  const debug = true;
  if (typeof store.game !== "undefined" && !store.game.paused && !debug) {
    return "";
  }
};

window.onresize = () => {
  if (typeof store.game !== "undefined") {
    store.game.canvas.resize();
  }
};

// Put some objects into the global scope such that they can be called by inline JS (onclick=...)
(window as any).store = store;
(window as any).Settings = Settings;
(window as any).databinding = databinding;
(window as any).newGame = newGame;
