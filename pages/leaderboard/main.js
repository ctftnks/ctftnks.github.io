import template from "./main.html?raw";
import "./style.css";

export function init(container) {
  container.innerHTML = template;
  updateLeaderboard();

  let leaderTime = Settings.EndScreenTime;
  const h2Elem = document.getElementById("leaderboardh2");
  const counterElem = document.getElementById("leaderboardCounter");
  const shadeElem = document.getElementById("leaderboardshade");

  if (h2Elem) h2Elem.innerHTML = "Leaderboard:&nbsp;&nbsp;Game #" + GameID;
  if (counterElem) counterElem.innerHTML = leaderTime + "s";

  const leaderIntvl = setInterval(function () {
    leaderTime -= 1;
    if (counterElem) counterElem.innerHTML = leaderTime + "s";
  }, 1000);

  const leaderTimeout = setTimeout(function () {
    clearInterval(leaderIntvl);
    closePage(shadeElem.parentNode);
    newGame();
  }, Settings.EndScreenTime * 1000);

  // Attach cleanup to shadeElem onclick if we want to override the HTML one
  // but the HTML one currently uses inline scripts which should work due to (0, eval)
  // however, it's safer to use the closure variables here.
  shadeElem.onclick = function () {
    closePage(this);
    newGame();
    clearInterval(leaderIntvl);
    clearTimeout(leaderTimeout);
  };
}

export function updateLeaderboard() {
  players.sort(function (a, b) {
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

window.updateLeaderboard = updateLeaderboard;
