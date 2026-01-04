import { openPage } from "@/ui/pages";
import { newGame } from "@/game/game";
import { store } from "@/game/store";
import { gameEvents, EVENTS } from "@/game/events";
import sideBarHtml from "./SideBar.html?raw";
import "./style.css";

/** Sidebar web component (light DOM). HTML and CSS are imported from files. */
class SideBar extends HTMLElement {
  private onTimeUpdated = (secs?: number): void => {
    const timer = this.querySelector<HTMLSpanElement>("#GameTimer");
    if (!timer || typeof secs === "undefined") {
      return;
    }
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs - minutes * 60);
    timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  private onBotSpeedUpdated = (speed?: number): void => {
    const bs = this.querySelector<HTMLDivElement>("#BotSpeedometer");
    if (!bs || typeof speed === "undefined") {
      return;
    }
    bs.style.display = "block";
    bs.innerHTML = `BotSpeed:&nbsp;&nbsp;${Math.round(speed * 100)} %`;
  };

  /**
   * Updates scores in the sidebar.
   */
  private onScoreUpdated = (): void => {
    this.updateScores();
  };

  /**
   * Attaches listeners and registers game event handlers on mount.
   */
  connectedCallback(): void {
    this.render();
    this.attachListeners();
    gameEvents.on(EVENTS.TIME_UPDATED, this.onTimeUpdated);
    gameEvents.on(EVENTS.BOT_SPEED_UPDATED, this.onBotSpeedUpdated);
    gameEvents.on(EVENTS.SCORE_UPDATED, this.onScoreUpdated);
  }

  /**
   * Unregisters game event handlers and removes listeners on unmount.
   */
  disconnectedCallback(): void {
    gameEvents.off(EVENTS.TIME_UPDATED, this.onTimeUpdated);
    gameEvents.off(EVENTS.BOT_SPEED_UPDATED, this.onBotSpeedUpdated);
    gameEvents.off(EVENTS.SCORE_UPDATED, this.onScoreUpdated);
    this.removeListeners();
  }

  /**
   * Renders the sidebar template.
   */
  private render(): void {
    // Inject component CSS and HTML into the element (light DOM)
    this.innerHTML = sideBarHtml;
    this.updateScores();
  }

  /** Render the scoreboard using `store.players` */
  private updateScores(): void {
    const scoreBoard = this.querySelector<HTMLDivElement>("#scoreBoard");
    if (!scoreBoard) {
      return;
    }

    const players = [...store.players].sort((a, b) => b.score - a.score);
    scoreBoard.innerHTML = "";

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const entry = document.createElement("div");
      entry.className = "entry";

      const name = document.createElement("span");
      name.className = "name";
      name.style.color = p.team.color;
      name.textContent = p.name;
      entry.appendChild(name);

      const score = document.createElement("span");
      score.className = "score";
      if (p.spree > 1) {
        const spree = document.createElement("span");
        spree.className = "spree";
        spree.textContent = ">+" + p.spree;
        score.appendChild(spree);
      }
      const sc = document.createTextNode(String(p.score));
      score.appendChild(sc);
      entry.appendChild(score);

      scoreBoard.appendChild(entry);
    }
  }

  private attachListeners(): void {
    const open = this.querySelector<HTMLDivElement>("#btnOpenMenu");
    if (open) {
      open.addEventListener("click", this.handleOpenMenu);
    }

    const reset = this.querySelector<HTMLDivElement>("#btnResetTime");
    if (reset) {
      reset.addEventListener("click", this.handleResetTime);
    }

    const next = this.querySelector<HTMLDivElement>("#btnNextMap");
    if (next) {
      next.addEventListener("click", this.handleNextMap);
    }
  }

  private removeListeners(): void {
    const open = this.querySelector<HTMLDivElement>("#btnOpenMenu");
    if (open) {
      open.removeEventListener("click", this.handleOpenMenu);
    }

    const reset = this.querySelector<HTMLDivElement>("#btnResetTime");
    if (reset) {
      reset.removeEventListener("click", this.handleResetTime);
    }

    const next = this.querySelector<HTMLDivElement>("#btnNextMap");
    if (next) {
      next.removeEventListener("click", this.handleNextMap);
    }
  }

  private handleOpenMenu = (): void => {
    openPage("menu");
  };

  private handleResetTime = (): void => {
    if (store.game) {
      store.game.resetTime();
    }
  };

  private handleNextMap = (): void => {
    newGame();
  };
}

if (!customElements.get("side-bar")) {
  customElements.define("side-bar", SideBar);
}
