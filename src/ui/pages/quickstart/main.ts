import Bot from "@/game/bot";
import Player from "@/game/player";
import { store } from "@/game/store";
import { updatePlayersMenu } from "@/ui/ui";
import { closePage } from "@/ui/pages";
import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;

  const shade = container.querySelector("#quickstartShade");
  if (shade) {
    shade.addEventListener("click", () => closePage(container));
  }

  const menu = container.querySelector("#quickstartMenu");
  if (menu) {
    menu.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "BUTTON") {
        const action = target.getAttribute("data-action");
        const teams = parseInt(target.getAttribute("data-teams") || "0", 10);
        const size = parseInt(target.getAttribute("data-size") || "0", 10);

        if (action && teams && size) {
          if (action === "quickPvP") {
            quickPvP(teams, size);
          } else if (action === "quickPvB") {
            quickPvB(teams, size);
          } else if (action === "quickMixed") {
            quickMixed(teams, size);
          } else if (action === "quickUnevenMixed") {
            quickUnevenMixed(teams, size);
          }

          closePage(container);
        }
      }
    });
  }
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
      if (i < nteams / 2) {
        store.players.push(new Player());
      } else {
        store.players.push(new Bot());
      }
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
      if (j < teamsize / 2) {
        store.players.push(new Player());
      } else {
        store.players.push(new Bot());
      }
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
      if (j < teamsize / 2 && i === 0) {
        store.players.push(new Player());
      } else {
        store.players.push(new Bot());
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
        p.color = store.players[store.players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}
