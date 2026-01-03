import { store } from "@/game/store";

/**
 * Update the global scoreboard HUD
 * This is called when scores change in the game
 */
export function updateScores(): void {
  const scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) {
    return;
  }
  scoreBoard.innerHTML = "";

  store.players.sort((a, b) => {
    return b.score - a.score;
  });

  for (let i = 0; i < store.players.length; i++) {
    let entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:" + store.players[i].team.color + ";''>";
    entry += store.players[i].name;
    entry += "</span><span class='score'>";
    if (store.players[i].spree > 1) {
      entry += " <span class='spree'>+" + store.players[i].spree + "</span>";
    }
    entry += store.players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}
