

Game = function(){

  this.map = undefined;
  this.players = undefined;
  this.canvas = undefined;
  this.grid = undefined;
  this.objs = undefined;


  this.start = function(){
    console.log("Game started!");
  }

  this.pause = function(){
    console.log("Game started!");
  }

  this.resume = function(){
    console.log("Game started!");
  }

  this.stop = function(){
    console.log("Game started!");
  }

  this.addPlayer(player){
    this.players.append(player);
    this.objs.append(player.tank)
  }
}
