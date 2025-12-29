import Canvas from "./classes/canvas.js";
import Player from "./classes/player.js";
import Bot from "./classes/bot.js";
import Game from "./classes/game.js";
import Map from "./classes/map.js";
import MapGenerator from "./classes/mapGenerator.js";
import { Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill, MapEditor } from "./classes/gamemode.js";
import { openPage } from "../pages/pages.js";
import { Settings } from "./constants.js";
import { game, canvas, players, setGame, setCanvas, setPlayers, editingKeymap, setEditingKeymap, nplayers, setNPlayers, GameID, setGameID } from "./state.js";
import { Key, keymaps, keyLabels } from "./keybindings.js";
import { PowerUps } from "./classes/powerup.js";

// Expose classes and variables to window for non-module dynamic scripts in pages/
window.Player = Player;
window.Bot = Bot;
window.Game = Game;
window.Map = Map;
window.MapGenerator = MapGenerator;
window.Deathmatch = Deathmatch;
window.TeamDeathmatch = TeamDeathmatch;
window.CaptureTheFlag = CaptureTheFlag;
window.KingOfTheHill = KingOfTheHill;
window.MapEditor = MapEditor;
window.Settings = Settings;
window.Key = Key;
window.keymaps = keymaps;
window.keyLabels = keyLabels;
window.PowerUps = PowerUps;

Object.defineProperty(window, 'players', {
  get: () => players,
  set: (v) => setPlayers(v)
});
Object.defineProperty(window, 'game', {
  get: () => game,
  set: (v) => setGame(v)
});
Object.defineProperty(window, 'canvas', {
  get: () => canvas,
  set: (v) => setCanvas(v)
});
Object.defineProperty(window, 'editingKeymap', {
  get: () => editingKeymap,
  set: (v) => setEditingKeymap(v)
});
Object.defineProperty(window, 'nplayers', {
  get: () => nplayers,
  set: (v) => setNPlayers(v)
});
Object.defineProperty(window, 'GameID', {
  get: () => GameID,
  set: (v) => setGameID(v)
});

// generate canvas object and players list
window.onload = function () {
  const newCanvas = new Canvas("gameFrame");
  setCanvas(newCanvas);
  
  const newPlayers = [new Player(), new Bot(), new Bot(), new Bot()];
  newPlayers[1].color = newPlayers[0].color;
  newPlayers[1].team = newPlayers[0].team;
  newPlayers[3].color = newPlayers[2].color;
  newPlayers[3].team = newPlayers[2].team;
  setPlayers(newPlayers);

  var g = newGame();
  g.paused = true;
  openPage("menu");
};

// prevent accidental leaving
window.onbeforeunload = function () {
  var debug = true;
  if (typeof game !== "undefined" && !game.paused && !debug) return "";
};

// start a new round
export function newGame(map = -1) {
  if (Settings.GameMode == "MapEditor" && map == -1) {
    var Nx = prompt("Nx?");
    var Ny = prompt("Ny?");
    map = new Map(canvas, Nx, Ny);
  }

  if (typeof game !== "undefined") game.stop();
  const nextGame = new Game(canvas, map);
  setGame(nextGame);
  
  if (Settings.GameMode == "DM") game.mode = new Deathmatch(game);
  if (Settings.GameMode == "TDM") game.mode = new TeamDeathmatch(game);
  if (Settings.GameMode == "CTF") game.mode = new CaptureTheFlag(game);
  if (Settings.GameMode == "KOTH") game.mode = new KingOfTheHill(game);
  if (Settings.GameMode == "MapEditor") game.mode = new MapEditor(game, map == -1);

  for (var i = 0; i < players.length; i++) game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  if (Settings.ResetStatsEachGame) for (var i = 0; i < game.players.length; i++) game.players[i].resetStats();
  return game;
}

export function updateScores() {
  var scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) return;
  scoreBoard.innerHTML = "";

  players.sort(function (a, b) {
    return b.score - a.score;
  });

  for (var i = 0; i < players.length; i++) {
    var entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:" + players[i].color + ";''>";
    entry += players[i].name;
    entry += "</span><span class='score'>";
    if (players[i].spree > 1) entry += " <span class='spree'>+" + players[i].spree + "</span>";
    entry += players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}

window.newGame = newGame;
window.updateScores = updateScores;

window.onresize = function () {
  if (typeof game !== "undefined") game.canvas.resize();
};
