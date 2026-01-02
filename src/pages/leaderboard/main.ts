import { newGame } from "../../classes/game";
import type Player from "../../classes/player";
import { Settings, store } from "../../store";
import { closePage } from "../pages";
import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updateLeaderboard();

  let leaderTime = Settings.EndScreenTime;
  const h2Elem = document.getElementById("leaderboardh2");
  const counterElem = document.getElementById("leaderboardCounter");
  const shadeElem = document.getElementById("leaderboardshade") as HTMLElement;

  if (h2Elem) h2Elem.innerHTML = "Leaderboard:&nbsp;&nbsp;Game #" + store.GameID;
  if (counterElem) counterElem.innerHTML = leaderTime + "s";

  const leaderIntvl = setInterval(() => {
    leaderTime -= 1;
    if (counterElem) counterElem.innerHTML = leaderTime + "s";
  }, 1000);

  const leaderTimeout = setTimeout(() => {
    clearInterval(leaderIntvl);
    closePage(shadeElem.parentNode);
    newGame();
  }, Settings.EndScreenTime * 1000);

  if (shadeElem) {
    shadeElem.onclick = function () {
      closePage(this);
      newGame();
      clearInterval(leaderIntvl);
      clearTimeout(leaderTimeout);
    };
  }
}

export function updateLeaderboard(): void {
  store.players.sort((a: Player, b: Player) => {
    return b.score - a.score;
  });

  const lb = document.getElementById("leaderboard");
  if (!lb) return;

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

  for (const i in players) {
    const p = players[i];
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
