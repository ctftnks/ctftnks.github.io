import { createApp } from "vue";
import App from "./App.vue";
import Canvas from "@/game/canvas";
import { store } from "@/stores/game";
import { newGame } from "@/game/game";
import { openPage } from "@/stores/ui";

window.onload = () => {
  // Initialize Vue App
  createApp(App).mount("#app");

  // Initialize Game
  // Ensure we have the canvas element
  if (document.getElementById("gameFrame")) {
    store.canvas = new Canvas("gameFrame");
  } else {
    console.error("Canvas element 'gameFrame' not found");
  }

  store.players = [store.createPlayer(false), store.createPlayer(true), store.createPlayer(true), store.createPlayer(true)];
  store.players[1].team = store.players[0].team;
  store.players[3].team = store.players[2].team;

  const game = newGame();
  game.paused = true;
};

window.onresize = () => {
  if (store.game) {
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
