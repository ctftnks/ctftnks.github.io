

window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player("#F00"), new Player("#0F0")];
  newGame();
};

function newGame(){
  game = new Game();
  for(i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  canvas.setGame(game);
  game.start();
  canvas.sync();
}
