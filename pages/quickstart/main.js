import template from "./main.html?raw";
import "./style.css";

export function init(container) {
  container.innerHTML = template;
}

function clearPlayers() {
  window.players = [];
}

function quickPvP(nteams, teamsize) {
  window.players = [];
  window.nplayers = 0;
  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      players.push(new Player());
      const p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

function quickPvB(nteams, teamsize) {
  window.players = [];
  window.nplayers = 0;
  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (i < nteams / 2) players.push(new Player());
      else players.push(new Bot());
      const p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

function quickMixed(nteams, teamsize) {
  window.players = [];
  window.nplayers = 0;
  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2) players.push(new Player());
      else players.push(new Bot());
      const p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

function quickUnevenMixed(nteams, teamsize) {
  window.players = [];
  window.nplayers = 0;
  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2 && i === 0) players.push(new Player());
      else players.push(new Bot());
      const p = players[players.length - 1];
      if (j > 0) {
        p.team = players[players.length - 2].team;
        p.color = players[players.length - 2].color;
      }
    }
  }
  updatePlayersMenu();
}

window.clearPlayers = clearPlayers;
window.quickPvP = quickPvP;
window.quickPvB = quickPvB;
window.quickMixed = quickMixed;
window.quickUnevenMixed = quickUnevenMixed;
