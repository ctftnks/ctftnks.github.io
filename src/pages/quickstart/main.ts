import Bot from "../../classes/bot";
import Player from "../../classes/player";
import { store } from "../../store";
import { updatePlayersMenu } from "../../ui";
import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
}

export function clearPlayers(): void {
  store.players = [];
}

export function quickPvP(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      store.players.push(new Player());
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
        p.color = store.players[store.players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

export function quickPvB(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (i < nteams / 2) store.players.push(new Player());
      else store.players.push(new Bot());
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
        p.color = store.players[store.players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

export function quickMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2) store.players.push(new Player());
      else store.players.push(new Bot());
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
        p.color = store.players[store.players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

export function quickUnevenMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2 && i === 0) store.players.push(new Player());
      else store.players.push(new Bot());
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
        p.color = store.players[store.players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}
