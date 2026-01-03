import template from "./main.html?raw";
import "./style.css";
import { store } from "@/game/store";
import { updatePlayersMenu, addPlayer, setupPlayersMenuListeners } from "@/ui/ui";
import { openPage, closePage } from "@/ui/pages";
import { newGame } from "@/game/game";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updatePlayersMenu();
  setupPlayersMenuListeners();

  if (typeof store.game !== "undefined") {
    store.game.paused = true;
  }

  // Bind events
  const shade = container.querySelector("#menuShade");
  if (shade) {
    shade.addEventListener("click", () => {
      closePage(container);
      if (!store.game) {
        newGame();
      } else {
        store.game.paused = false;
      }
      window.dispatchEvent(new Event("resize"));
    });
  }

  const btnPowerups = container.querySelector("#btnPowerups");
  if (btnPowerups) {
    btnPowerups.addEventListener("click", () => openPage("powerups"));
  }

  const btnSettings = container.querySelector("#btnSettings");
  if (btnSettings) {
    btnSettings.addEventListener("click", () => openPage("settings"));
  }

  const btnAddPlayer = container.querySelector("#btnAddPlayer");
  if (btnAddPlayer) {
    btnAddPlayer.addEventListener("click", () => addPlayer());
  }

  const btnAddBot = container.querySelector("#btnAddBot");
  if (btnAddBot) {
    btnAddBot.addEventListener("click", () => addPlayer(true));
  }

  const btnQuickTeams = container.querySelector("#btnQuickTeams");
  if (btnQuickTeams) {
    btnQuickTeams.addEventListener("click", () => openPage("quickstart"));
  }

  const btnStartGame = container.querySelector("#btnStartGame");
  if (btnStartGame) {
    btnStartGame.addEventListener("click", () => {
      closePage(container);
      newGame();
      window.dispatchEvent(new Event("resize"));
    });
  }
}
