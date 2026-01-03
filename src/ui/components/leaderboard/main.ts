import { BasePage } from "@/ui/BasePage";
import { newGame } from "@/game/game";
import type Player from "@/game/player";
import template from "./main.html?raw";
import "./style.css";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";
import { closePage } from "@/ui/pages";

/**
 * LeaderboardPage - Component for displaying the game results and countdown to next round.
 * @augments BasePage
 */
export class LeaderboardPage extends BasePage {
  private leaderIntvl: number | null = null;
  private leaderTimeout: number | null = null;

  /**
   * Renders the leaderboard template.
   */
  protected render(): void {
    this.innerHTML = template;
  }

  /**
   * Attaches listeners for closing the leaderboard.
   */
  protected attachListeners(): void {
    const shadeElem = this.querySelector("#leaderboardshade") as HTMLElement | null;
    if (shadeElem) {
      shadeElem.onclick = () => {
        this.cleanup();
        closePage(this);
        newGame();
      };
    }
  }

  /**
   * Updates the leaderboard and starts the countdown on mount.
   */
  protected onMount(): void {
    updateLeaderboard();

    let leaderTime = Settings.EndScreenTime;
    const h2Elem = this.querySelector("#leaderboardh2");
    const counterElem = this.querySelector("#leaderboardCounter");

    if (h2Elem) {
      h2Elem.innerHTML = "Leaderboard:&nbsp;&nbsp;Game #" + store.GameID;
    }
    if (counterElem) {
      counterElem.innerHTML = leaderTime + "s";
    }

    this.leaderIntvl = window.setInterval(() => {
      leaderTime -= 1;
      if (counterElem) {
        counterElem.innerHTML = leaderTime + "s";
      }
    }, 1000);

    this.leaderTimeout = window.setTimeout(() => {
      this.cleanup();
      closePage(this);
      newGame();
    }, Settings.EndScreenTime * 1000);
  }

  /**
   * Cleans up intervals on unmount.
   */
  protected onUnmount(): void {
    this.cleanup();
  }

  /**
   * Stops leaderboard-related timers.
   */
  private cleanup(): void {
    if (this.leaderIntvl !== null) {
      window.clearInterval(this.leaderIntvl);
    }
    if (this.leaderTimeout !== null) {
      window.clearTimeout(this.leaderTimeout);
    }
  }
}

customElements.define("leaderboard-page", LeaderboardPage);

export function init(container: HTMLElement): void {
  const component = new LeaderboardPage();
  container.appendChild(component);
}

export function updateLeaderboard(): void {
  store.players.sort((a: Player, b: Player) => {
    return b.score - a.score;
  });

  const lb = document.getElementById("leaderboard");
  if (!lb) {
    return;
  }

  let content = "";
  content += "<table>";
  content += "<tr>";
  content += "<th>Name</th>";
  content += "<th>Score</th>";
  content += "<th>Kills</th>";
  content += "<th>Deaths</th>";
  content += "<th>Shots</th>";
  content += "<th>Miles</th>";
  content += "</tr>";

  for (const p of store.players) {
    content += "<tr>";
    content += "<td>" + p.name + "</td>";
    content += "<td>" + p.score + "</td>";
    content += "<td>" + p.stats.kills + "</td>";
    content += "<td>" + p.stats.deaths + "</td>";
    content += "<td>" + p.stats.shots + "</td>";
    content += "<td>" + Math.round(p.stats.miles / 100) + "</td>";
    content += "</tr>";
  }

  content += "</table>";
  lb.innerHTML = content;
}
