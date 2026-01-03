import Canvas from "@/game/canvas";
import { store } from "@/game/store";
import { newGame } from "@/game/game";
import { openPage } from "@/ui/pages";
import "@/ui/components/sidebar/SideBar";

// generate canvas object and players list
window.onload = () => {
  store.canvas = new Canvas("gameFrame");

  store.players = [store.createPlayer(false), store.createPlayer(true), store.createPlayer(true), store.createPlayer(true)];
  store.players[1].team = store.players[0].team;
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

// Pause the game with the Esc key
window.addEventListener(
  "keydown",
  (e: KeyboardEvent) => {
    if (e.key === "Escape" && store.game && !store.game.paused) {
      store.game.pause();
      openPage("menu");
    }
  },
  false,
);
