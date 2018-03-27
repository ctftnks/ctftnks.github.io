
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player(), new Player()];
  // game = newGame();
  // setTimeout(function(){game.pause();}, 1000);
  openMenu();
};

// start a new round
function newGame(){
  if(typeof game !== 'undefined')
    game.stop();
  game = new Game(canvas);
  if(GameMode == "DM")
    game.mode = new Deathmatch(game);
  if(GameMode == "TDM")
    game.mode = new TeamDeathmatch(game);
  if(GameMode == "CTF")
    game.mode = new CaptureTheFlag(game);

  for(var i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  return game;
}

function addPlayer(bot=false){
  if(players.length >= keymaps.length)
    keymaps.push(keymaps[0].slice());
  if(bot)
    players.push(new Bot());
  else
    players.push(new Player());
  updateMenu();
}

function removePlayer(id){
  var newPlayers = [];
  for(var i=0; i<players.length; i++)
    if(players[i].id != id)
      newPlayers.push(players[i]);
  players = newPlayers;
  updateMenu();
}

function updateScores(){
  var scoreBoard = document.getElementById("scoreBoard");
  scoreBoard.innerHTML = "";

  players.sort(function(a, b){
    return a.score < b.score;
  } );

  for(var i=0; i<players.length; i++){
    var entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:"+players[i].color+";''>";
    entry += players[i].name;
    entry += "</span><span class='score'>";
    if(players[i].spree > 1)
      entry += " <span class='spree'>+"+players[i].spree+"</span>"
    entry += players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}

window.onresize = function(){
  game.canvas.resize();
}
