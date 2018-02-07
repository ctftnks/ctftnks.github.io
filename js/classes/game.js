
// A class for a single game round with a single map
// contains a list of players, list of objects in the game
// contains a loop mechanism for time-iteration

Game = function(canvas){

  // pass canvas class to game, for size / resolution
  this.canvas = canvas;
  this.canvas.game = this;
  // create new random map
  this.map = new Map(this.canvas);
  this.players = [];
  this.objs = [];
  this.paused = false;
  this.loop = undefined;
  this.n_playersAlive = 0;
  this.t = 0;
  this.intvls = [];
  this.nkills = 0;

  // add a player (class) to the game
  this.addPlayer = function(player){
    this.players.push(player);
    player.game = this;
    player.spawn();
  }

  // add any object to the game
  this.addObject = function(object){
    this.objs.push(object);
  }

  // start the game, starts time-loop
  this.start = function(){
    console.log("Game started!");
    var self = this;
    this.loop = setInterval(function(){
      self.step();
    }, GameFrequency);
    playSound("res/sound/gamestart.wav");
    updateScores();
  }

  // a single step of the time-loop
  this.step = function(){
    this.t += GameFrequency;
    // remove deleted objects and
    // initiate spatial sorting of objects within the map class
    if(!this.paused){
      this.map.clearObjectLists();
      var newObjs = [];
      for(var i=0; i<this.objs.length; i++)
        if(!this.objs[i].deleted){
          newObjs.push(this.objs[i]);
          this.map.addObject(this.objs[i]);
        }
      // call step() function for every object in order for it to move/etc.
      this.objs = newObjs;
      for(var i=0; i<this.objs.length; i++)
        this.objs[i].step();
    }
    // add random PowerUp
    if(this.t % PowerUpFrequency == 0){
      var p = getRandomPowerUp();
      var pos = this.map.spawnPoint();
      p.x = pos.x;
      p.y = pos.y;
      this.addObject(p);
      this.intvls.push(setInterval(function(){p.delete();}, PowerUpFrequency*MaxPowerUps));
    }
  }

  // stop the game
  this.stop = function(){
    this.paused = true;
    clearInterval(this.loop);
    for(var i=0; i<this.intvls.length; i++)
      clearInterval(this.intvls[i]);
    console.log("Game stopped!");
    newGame();
  }

}
