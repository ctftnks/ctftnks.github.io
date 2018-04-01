
// A class for a single game round with a single map
// contains a list of players, list of objects in the game
// contains a loop mechanism for time-iteration

GameID = 0;
Game = function(canvas){

  // pass canvas class to game, for size / resolution
  this.canvas = canvas;
  this.canvas.game = this;
  // create new random map
  this.map = new Map(this.canvas);
  this.map.resize();
  // generate a random maze with a random algorithm
  // MapGenerator.algorithms[Math.floor(Math.random()*MapGenerator.algorithms.length)](this.map);
  MapGenerator.primsMaze(this.map);
  // MapGenerator.recursiveDivision(this.map);
  // MapGenerator.randomImportedMap(this.map);
  this.players = [];
  this.objs = [];
  this.paused = false;
  this.loop = undefined;
  this.n_playersAlive = 0;
  this.t = 0;
  this.intvls = [];
  this.timeouts = [];
  this.nkills = 0;
  this.mode = new Deathmatch(this);
  GameID++;

  // add a player (class) to the game
  this.addPlayer = function(player){
    this.players.push(player);
    player.game = this;
  }

  // add any object to the game
  this.addObject = function(object){
    this.objs.push(object);
  }

  // start the game, starts time-loop
  this.start = function(){
    var self = this;
    this.mode.init();
    for(var i=0; i<this.players.length; i++)
      this.players[i].spawn();
    this.loop = setInterval(function(){
      self.step();
    }, GameFrequency);
    playSound("res/sound/gamestart.wav");
    if(bgmusic)
      playMusic("res/sound/bgmusic.wav")
    updateScores();
  }

  // a single step of the time-loop
  this.step = function(){
    this.t += GameFrequency;
    if(!this.paused){
      // remove deleted objects and
      // initiate spatial sorting of objects within the map class
      this.map.clearObjectLists();
      for(var i=this.objs.length-1; i>=0; i--)
        if(!this.objs[i].deleted)
          this.map.addObject(this.objs[i]);
        else
          this.objs.splice(i, 1);
      // call step() function for every object in order for it to move/etc.
      for(var i=0; i<this.objs.length; i++)
        this.objs[i].step();
      // do gamemode calculations
      this.mode.step();
	    // add random PowerUp
      if(this.t % PowerUpFrequency == 0){
        var p = getRandomPowerUp();
        var pos = this.map.spawnPoint();
        p.x = pos.x;
        p.y = pos.y;
        this.addObject(p);
        this.timeouts.push(setTimeout(function(){p.delete();}, PowerUpFrequency*MaxPowerUps));
      }
    }
  }

  // pause the game
  this.pause = function(){
    this.paused = !this.paused;
  }

  // stop the game
  this.stop = function(){
    this.paused = true;
    clearInterval(this.loop);
    for(var i=0; i<this.intvls.length; i++)
      clearInterval(this.intvls[i]);
    for(var i=0; i<this.timeouts.length; i++)
      clearTimeout(this.timeouts[i]);
    clearEffects();
    stopMusic();
  }

  // end the game
  this.end = function(){
    this.paused = true;
    var pageid = openPage("leaderboard");
    var self = this;
    setTimeout(function(){
      self.stop();
      closePage(pageid);
      newGame();
    }, EndScreenTime*1000);
  }

}
