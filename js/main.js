
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player("#F00"), new Player("#0F0"), new Player("#00F")];
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
  // for(player: players){
  //
  // }
}
