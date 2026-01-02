import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updateLeaderboard();

  const settings: any = (window as any).Settings;
  const players: any = (window as any).players;
  const gameID: number = (window as any).GameID;

  let leaderTime = settings.EndScreenTime;
  const h2Elem = document.getElementById("leaderboardh2");
  const counterElem = document.getElementById("leaderboardCounter");
  const shadeElem = document.getElementById("leaderboardshade") as HTMLElement;

  if (h2Elem) h2Elem.innerHTML = "Leaderboard:&nbsp;&nbsp;Game #" + gameID;
  if (counterElem) counterElem.innerHTML = leaderTime + "s";

  const leaderIntvl = setInterval(function () {
    leaderTime -= 1;
    if (counterElem) counterElem.innerHTML = leaderTime + "s";
  }, 1000);

  const leaderTimeout = setTimeout(function () {
    clearInterval(leaderIntvl);
    (window as any).closePage(shadeElem.parentNode);
    (window as any).newGame();
  }, settings.EndScreenTime * 1000);

  if (shadeElem) {
    shadeElem.onclick = function () {
      (window as any).closePage(this);
      (window as any).newGame();
      clearInterval(leaderIntvl);
      clearTimeout(leaderTimeout);
    };
  }
}

export function updateLeaderboard(): void {
  const players: any = (window as any).players;

  players.sort(function (a: any, b: any) {
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

(window as any).updateLeaderboard = updateLeaderboard;
