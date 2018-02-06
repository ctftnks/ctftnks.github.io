

Game = function(canvas){

  this.canvas = canvas;
  this.canvas.game = this;
  this.map = new Map(this.canvas);
  this.players = [];
  this.objs = [];
  this.paused = false;
  this.loop = undefined;

  this.addPlayer = function(player){
    this.players.push(player);
    player.game = this;
    this.addObject(player.tank);
    pos = this.map.spawnPoint();
    player.tank.x = pos.x;
    player.tank.y = pos.y;
  }

  this.addObject = function(object){
    this.objs.push(object);
  }

  this.start = function(){
    console.log("Game started!");
    var self = this;
    this.loop = setInterval(function(){
      self.step();
    }, GameFrequency);
  }

  this.step = function(){
    if(!this.paused){
      this.map.clearObjectLists();
      var newObjs = [];
      for(var i=0; i<this.objs.length; i++)
        if(!this.objs[i].deleted){
          newObjs.push(this.objs[i]);
          this.map.addObject(this.objs[i]);
        }
      this.objs = newObjs;
      for(var i=0; i<this.objs.length; i++)
        this.objs[i].step();
    }
  }

  this.stop = function(){
    console.log("Game stopped!");
  }

}
