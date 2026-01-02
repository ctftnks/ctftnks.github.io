import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
}

function clearPlayers(): void {
  (window as any).players = [];
}

function quickPvP(nteams: number, teamsize: number): void {
  const Player = (window as any).Player;
  (window as any).players = [];
  (window as any).nplayers = 0;
  const players: any[] = (window as any).players;

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
  (window as any).updatePlayersMenu();
}

function quickPvB(nteams: number, teamsize: number): void {
  const Player = (window as any).Player;
  const Bot = (window as any).Bot;
  (window as any).players = [];
  (window as any).nplayers = 0;
  const players: any[] = (window as any).players;

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
  (window as any).updatePlayersMenu();
}

function quickMixed(nteams: number, teamsize: number): void {
  const Player = (window as any).Player;
  const Bot = (window as any).Bot;
  (window as any).players = [];
  (window as any).nplayers = 0;
  const players: any[] = (window as any).players;

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
  (window as any).updatePlayersMenu();
}

function quickUnevenMixed(nteams: number, teamsize: number): void {
  const Player = (window as any).Player;
  const Bot = (window as any).Bot;
  (window as any).players = [];
  (window as any).nplayers = 0;
  const players: any[] = (window as any).players;

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
  (window as any).updatePlayersMenu();
}

(window as any).clearPlayers = clearPlayers;
(window as any).quickPvP = quickPvP;
(window as any).quickPvB = quickPvB;
(window as any).quickMixed = quickMixed;
(window as any).quickUnevenMixed = quickUnevenMixed;
