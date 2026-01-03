import { BasePage } from "@/ui/components/BasePage";
import template from "./main.html?raw";
import "./style.css";
import { store } from "@/game/store";
import { updatePlayersMenu, addPlayer, setupPlayersMenuListeners } from "@/ui/ui";
import { openPage, closePage } from "@/ui/pages";
import { newGame } from "@/game/game";

export class MenuPage extends BasePage {
  protected render(): void {
    this.innerHTML = template;
  }

  protected attachListeners(): void {
    const shade = this.querySelector("#menuShade");
    if (shade) {
      shade.addEventListener("click", () => {
        closePage(this);
        if (!store.game) {
          newGame();
        } else {
          store.game.paused = false;
        }
        window.dispatchEvent(new Event("resize"));
      });
    }

    const btnPowerups = this.querySelector("#btnPowerups");
    if (btnPowerups) {
      btnPowerups.addEventListener("click", () => openPage("powerups"));
    }

    const btnSettings = this.querySelector("#btnSettings");
    if (btnSettings) {
      btnSettings.addEventListener("click", () => openPage("settings"));
    }

    const btnAddPlayer = this.querySelector("#btnAddPlayer");
    if (btnAddPlayer) {
      btnAddPlayer.addEventListener("click", () => addPlayer());
    }

    const btnAddBot = this.querySelector("#btnAddBot");
    if (btnAddBot) {
      btnAddBot.addEventListener("click", () => addPlayer(true));
    }

    const btnQuickTeams = this.querySelector("#btnQuickTeams");
    if (btnQuickTeams) {
      btnQuickTeams.addEventListener("click", () => openPage("quickstart"));
    }

    const btnStartGame = this.querySelector("#btnStartGame");
    if (btnStartGame) {
      btnStartGame.addEventListener("click", () => {
        closePage(this);
        newGame();
        window.dispatchEvent(new Event("resize"));
      });
    }
  }

  protected onMount(): void {
    updatePlayersMenu();
    setupPlayersMenuListeners();

    if (typeof store.game !== "undefined") {
      store.game.paused = true;
    }
  }
}

customElements.define("menu-page", MenuPage);

export function init(container: HTMLElement): void {
  const component = new MenuPage();
  container.appendChild(component);
}
