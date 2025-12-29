import Canvas from "./classes/canvas.js";
import Player from "./classes/player.js";
import Bot from "./classes/bot.js";
import Game from "./classes/game.js";
import Map from "./classes/map.js";
import MapGenerator from "./classes/mapGenerator.js";
import { Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill, MapEditor } from "./classes/gamemode.js";
import { openPage } from "../pages/pages.js";
import { store, Settings } from "./state.js";
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
window.store = store;

// Bridge for legacy code and dynamic HTML/JS
["game", "canvas", "players", "nplayers", "editingKeymap", "GameID"].forEach((key) => {
  Object.defineProperty(window, key, {
    get: () => store[key],
    set: (v) => (store[key] = v),
    configurable: true,
  });
});

// generate canvas object and players list
window.onload = function () {
  store.canvas = new Canvas("gameFrame");

  store.players = [new Player(), new Bot(), new Bot(), new Bot()];
  store.players[1].color = store.players[0].color;
  store.players[1].team = store.players[0].team;
  store.players[3].color = store.players[2].color;
  store.players[3].team = store.players[2].team;

  var g = newGame();
  g.paused = true;
  openPage("menu");
};

// prevent accidental leaving
window.onbeforeunload = function () {
  var debug = true;
  if (typeof store.game !== "undefined" && !store.game.paused && !debug) return "";
};

// start a new round
export function newGame(map = -1) {
  if (Settings.GameMode == "MapEditor" && map == -1) {
    var Nx = prompt("Nx?");
    var Ny = prompt("Ny?");
    map = new Map(store.canvas, Nx, Ny);
  }

  if (typeof store.game !== "undefined") store.game.stop();
  store.game = new Game(store.canvas, map);

  if (Settings.GameMode == "DM") store.game.mode = new Deathmatch(store.game);
  if (Settings.GameMode == "TDM") store.game.mode = new TeamDeathmatch(store.game);
  if (Settings.GameMode == "CTF") store.game.mode = new CaptureTheFlag(store.game);
  if (Settings.GameMode == "KOTH") store.game.mode = new KingOfTheHill(store.game);
  if (Settings.GameMode == "MapEditor") store.game.mode = new MapEditor(store.game, map == -1);

  for (var i = 0; i < store.players.length; i++) store.game.addPlayer(store.players[i]);
  store.game.start();
  store.canvas.sync();
  if (Settings.ResetStatsEachGame) for (var i = 0; i < store.game.players.length; i++) store.game.players[i].resetStats();
  return store.game;
}

export function updateScores() {
  var scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) return;
  scoreBoard.innerHTML = "";

  store.players.sort(function (a, b) {
    return b.score - a.score;
  });

  for (var i = 0; i < store.players.length; i++) {
    var entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:" + store.players[i].color + ";''>";
    entry += store.players[i].name;
    entry += "</span><span class='score'>";
    if (store.players[i].spree > 1) entry += " <span class='spree'>+" + store.players[i].spree + "</span>";
    entry += store.players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}

window.newGame = newGame;
window.updateScores = updateScores;

window.onresize = function () {
  if (typeof store.game !== "undefined") store.game.canvas.resize();
};
