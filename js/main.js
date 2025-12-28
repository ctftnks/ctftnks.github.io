// generate canvas object and players list
window.onload = function () {
  canvas = new Canvas("gameFrame");
  players = [new Player(), new Bot(), new Bot(), new Bot()];
  players[1].color = players[0].color;
  players[1].team = players[0].team;
  players[3].color = players[2].color;
  players[3].team = players[2].team;
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
function newGame(map = -1) {
  if (GameMode == "MapEditor" && map == -1) {
    var Nx = prompt("Nx?");
    var Ny = prompt("Ny?");
    map = new Map(canvas, Nx, Ny);
  }

  if (typeof game !== "undefined") game.stop();
  game = new Game(canvas, map);
  if (GameMode == "DM") game.mode = new Deathmatch(game);
  if (GameMode == "TDM") game.mode = new TeamDeathmatch(game);
  if (GameMode == "CTF") game.mode = new CaptureTheFlag(game);
  if (GameMode == "KOTH") game.mode = new KingOfTheHill(game);
  if (GameMode == "MapEditor") game.mode = new MapEditor(game, map == -1);

  for (var i = 0; i < players.length; i++) game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  if (ResetStatsEachGame) for (var i = 0; i < game.players.length; i++) game.players[i].resetStats();
  return game;
}

function updateScores() {
  var scoreBoard = document.getElementById("scoreBoard");
  scoreBoard.innerHTML = "";

  players.sort(function (a, b) {
    return a.score < b.score;
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

window.onresize = function () {
  if (typeof game !== "undefined") game.canvas.resize();
};
