

Game = function(){

  this.map = new Map();
  this.players = [];
  this.canvas = undefined;
  this.grid = undefined;
  this.objs = [];
  this.paused = false;
  this.loop = undefined;

  this.addPlayer = function(player){
    this.players.append(player);
    this.addObject(player.tank);
  }

  this.addObject = function(object){
    this.objs.append(object);
  }

  this.start = function(){
    console.log("Game started!");
    this.loop = setInterval(function(){
      this.draw();
    }, 40);
  }

  this.step = function(){
    if(!this.paused)
      for(var i=0; i<objs.length; i++)
        objs[i].step();
  }

  this.stop = function(){
    console.log("Game started!");
  }

}
