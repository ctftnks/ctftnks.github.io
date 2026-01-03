import template from "./main.html?raw";
import "./style.css";
import Bot from "@/game/bot";
import Player from "@/game/player";
import { store } from "@/game/store";
import { updatePlayersMenu } from "@/ui/ui";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updatePlayersMenu();
  if (typeof store.game !== "undefined") {
    store.game.paused = true;
  }
}

function addPlayer(bot: boolean = false): void {
  if (store.players.length >= store.keymaps.length) {
    store.keymaps.push(store.keymaps[0].slice());
  }
  if (bot) {
    store.players.push(new Bot());
  } else {
    store.players.push(new Player());
  }
  updatePlayersMenu();
}

function removePlayer(id: number): void {
  const newPlayers = [];
  for (let i = 0; i < store.players.length; i++) {
    if (store.players[i].id !== id) {
      newPlayers.push(store.players[i]);
    }
  }
  store.players = newPlayers;
  updatePlayersMenu();
}

// Put some objects into the global scope such that they can be called by inline JS (onclick=...)
(window as any).addPlayer = addPlayer;
(window as any).removePlayer = removePlayer;
