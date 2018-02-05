

Game = function(){

  this.map = new Map();
  this.players = [];
  this.canvas = undefined;
  this.grid = undefined;
  this.objs = [];
  this.paused = false;
  this.loop = undefined;

  this.addPlayer = function(player){
    this.players.push(player);
    player.game = this;
    this.addObject(player.tank);
  }

  this.addObject = function(object){
    this.objs.push(object);
  }

  this.start = function(){
    console.log("Game started!");
    var self = this;
    this.loop = setInterval(function(){
      self.step();
    }, 20);
  }

  this.step = function(){
    if(!this.paused){
      var newObjs = [];
      for(var i=0; i<this.objs.length; i++)
        if(!this.objs[i].deleted){
          newObjs.push(this.objs[i]);
          this.objs[i].step();
        }
      this.objs = newObjs;
    }
  }

  this.stop = function(){
    console.log("Game started!");
  }

}
