import { BasePage } from "@/ui/BasePage";
import { store } from "@/game/store";
import { updatePlayersMenu } from "@/ui/components/menu/main";
import { closePage } from "@/ui/pages";
import template from "./main.html?raw";

/**
 * QuickstartPage - Component for quickly starting pre-configured games.
 * @augments BasePage
 */
class QuickstartPage extends BasePage {
  /**
   * Renders the quickstart menu template.
   */
  protected render(): void {
    this.innerHTML = template;
  }

  /**
   * Attaches listeners for quickstart game options.
   */
  protected attachListeners(): void {
    const shade = this.querySelector("#quickstartShade");
    if (shade) {
      shade.addEventListener("click", () => closePage(this));
    }

    const menu = this.querySelector("#quickstartMenu");
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

            closePage(this);
          }
        }
      });
    }
  }
}

customElements.define("quickstart-page", QuickstartPage);

function quickPvP(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      store.players.push(store.createPlayer(false));
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  updatePlayersMenu();
}

function quickPvB(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (i < nteams / 2) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  updatePlayersMenu();
}

function quickMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  updatePlayersMenu();
}

function quickUnevenMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2 && i === 0) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  updatePlayersMenu();
}
