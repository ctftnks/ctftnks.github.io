import Canvas from "./classes/canvas";
import Player from "./classes/player";
import Bot from "./classes/bot";
import Game from "./classes/game";
import GameMap from "./classes/map";
import MapGenerator from "./classes/mapGenerator";
import { Deathmatch, TeamDeathmatch, CaptureTheFlag, KingOfTheHill, MapEditor } from "./classes/gamemode";
import { openPage } from "../pages/pages";
import { store, Settings } from "./state";
import { Key, keymaps } from "./keybindings";
import { PowerUps } from "./classes/powerup";

declare global {
  interface Window {
    Player: typeof Player;
    Bot: typeof Bot;
    Game: typeof Game;
    GameMap: typeof GameMap;
    MapGenerator: typeof MapGenerator;
    Deathmatch: typeof Deathmatch;
    TeamDeathmatch: typeof TeamDeathmatch;
    CaptureTheFlag: typeof CaptureTheFlag;
    KingOfTheHill: typeof KingOfTheHill;
    MapEditor: typeof MapEditor;
    Settings: typeof Settings;
    Key: typeof Key;
    keymaps: typeof keymaps;
    PowerUps: typeof PowerUps;
    store: typeof store;
    game: any;
    canvas: any;
    players: any[];
    nplayers: number;
    editingKeymap: boolean;
    GameID: number;
    newGame: typeof newGame;
    updateScores: typeof updateScores;
    openPage: typeof openPage;
    doEditKeymap?: (code: string) => void;
  }
}

// Expose classes and variables to window for non-module dynamic scripts in pages/
window.Player = Player;
window.Bot = Bot;
window.Game = Game;
window.GameMap = GameMap;
window.MapGenerator = MapGenerator;
window.Deathmatch = Deathmatch;
window.TeamDeathmatch = TeamDeathmatch;
window.CaptureTheFlag = CaptureTheFlag;
window.KingOfTheHill = KingOfTheHill;
window.MapEditor = MapEditor;
window.Settings = Settings;
window.Key = Key;
window.keymaps = keymaps;
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

  const g = newGame();
  g.paused = true;
  openPage("menu");
};

// prevent accidental leaving
window.onbeforeunload = function () {
  const debug = true;
  if (typeof store.game !== "undefined" && !store.game.paused && !debug) return "";
};

// start a new round
export function newGame(map: GameMap | null = null) {
  if (Settings.GameMode === "MapEditor" && map === null) {
    const Nx = prompt("Nx?");
    const Ny = prompt("Ny?");
    map = new GameMap(store.canvas, Nx ? parseInt(Nx) : undefined, Ny ? parseInt(Ny) : undefined);
  }

  if (typeof store.game !== "undefined") store.game.stop();
  store.game = new Game(store.canvas, map);

  if (Settings.GameMode === "DM") store.game.mode = new Deathmatch(store.game);
  if (Settings.GameMode === "TDM") store.game.mode = new TeamDeathmatch(store.game);
  if (Settings.GameMode === "CTF") store.game.mode = new CaptureTheFlag(store.game);
  if (Settings.GameMode === "KOTH") store.game.mode = new KingOfTheHill(store.game);
  if (Settings.GameMode === "MapEditor") store.game.mode = new MapEditor(store.game, map === -1);

  for (let i = 0; i < store.players.length; i++) store.game.addPlayer(store.players[i]);
  store.game.start();
  store.canvas.sync();
  if (Settings.ResetStatsEachGame) for (let i = 0; i < store.game.players.length; i++) store.game.players[i].resetStats();
  return store.game;
}

export function updateScores() {
  const scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) return;
  scoreBoard.innerHTML = "";

  store.players.sort(function (a, b) {
    return b.score - a.score;
  });

  for (let i = 0; i < store.players.length; i++) {
    let entry = "";
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
