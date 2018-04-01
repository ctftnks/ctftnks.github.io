
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player(), new Player()];
  openPage("menu");
  checkMobile();
};


// start a new round
function newGame(map=-1){
  if(typeof game !== 'undefined')
    game.stop();
  console.log(map)
  game = new Game(canvas, map);
  if(GameMode == "DM")
    game.mode = new Deathmatch(game);
  if(GameMode == "TDM")
    game.mode = new TeamDeathmatch(game);
  if(GameMode == "CTF")
    game.mode = new CaptureTheFlag(game);
  if(GameMode == "MapEditor")
    game.mode = new MapEditor(game);

  for(var i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  return game;
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
  if(typeof(game) !== "undefined")
    game.canvas.resize();
}
