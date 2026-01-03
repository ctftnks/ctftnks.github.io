import Canvas from "@/game/canvas";
import { store } from "@/game/store";
import { newGame } from "@/game/game";
import { initHUD } from "@/ui/hud";
import { openPage } from "@/ui/pages";

// generate canvas object and players list
window.onload = () => {
  initHUD();
  store.canvas = new Canvas("gameFrame");

  store.players = [store.createPlayer(false), store.createPlayer(true), store.createPlayer(true), store.createPlayer(true)];
  store.players[1].team = store.players[0].team;
  store.players[3].team = store.players[2].team;

  const game = newGame();
  game.paused = true;
  openPage("menu");

  // Listeners for the buttons in the sidebar
  const btnOpenMenu = document.getElementById("btnOpenMenu");
  if (btnOpenMenu) {
    btnOpenMenu.addEventListener("click", () => openPage("menu"));
  }
  const btnResetTime = document.getElementById("btnResetTime");
  if (btnResetTime) {
    btnResetTime.addEventListener("click", () => {
      if (store.game) {
        store.game.resetTime();
      }
    });
  }
  const btnNextMap = document.getElementById("btnNextMap");
  if (btnNextMap) {
    btnNextMap.addEventListener("click", () => newGame());
  }
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
