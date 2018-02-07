
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  // TODO: add material colors
  players = [new Player("#F00"), new Player("#0F0"), new Player("#00F")];
  console.log(players[0].name);
  newGame();
};

// start a new round
function newGame(){
  game = new Game(canvas);
  for(i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  game.start();
  canvas.sync();
}

function updateScores(){
  scoreBoard = document.getElementById("scoreBoard");
  scoreBoard.innerHTML = "";
  for(var i=0; i<players.length; i++){
    console.log(players[i].name);
    scoreBoard.innerHTML += "<span style='color:"+players[i].color+";>";
    scoreBoard.innerHTML += players[i].name;
    scoreBoard.innerHTML += "</span>&nbsp;&nbsp;&nbsp;";
    scoreBoard.innerHTML += players[i].score;
    scoreBoard.innerHTML += "<br>";
  }
}
