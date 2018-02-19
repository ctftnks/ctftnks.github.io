// A class for a player.
// keeps the players score, color, name, keymap
// and the tank to be controlled

nplayers = 0;
playercolors = [
  "#DA1918",  // red
  "#31B32B",  // green
  "#1F87FF",  // blue
  "#F4641D",  // orange
  "#21B19B",  // teal
  "#A020F0",  // purple
  "#713B17",  // brown
  "#E7E52C"  // yellow
]

// playercolors = [
//   "#F44336",  // red
//   "#4CAF50",  // green
//   "#2196F3",  // blue
//   "#FF9800",  // orange
//   "#009688",  // teal
//   "#9C27B0",  // purple
//   "#FFC107"  // amber
// ]

Player = function(){

  this.id = nplayers++;
  this.name = "Player " + (this.id+1);
  this.color = playercolors[this.id];
  this.team = this.id;
  this.game = undefined;
  this.score = 0;
  this.spree = 0;
  this.keys = keymaps[this.id];
  this.tank = new Tank(this);
  isBot = false;

  // timestep: check if keys pressed and act accordingly
  this.step = function(){
    if (Key.isDown(this.keys[0])) this.tank.move(1);
    if (Key.isDown(this.keys[1])) this.tank.turn(-1);
    if (Key.isDown(this.keys[2])) this.tank.move(-0.5);
    if (Key.isDown(this.keys[3])) this.tank.turn(1);
    if (Key.isDown(this.keys[4])) this.tank.shoot();
  }

  // spawn at some point
  this.spawn = function(){
    if(this.isBot)
      this.tank = new BotTank(this);
    else
      this.tank = new Tank(this);
    this.tank.deleted = false;
    this.tank.map = this.game.map;
    var pos = this.game.map.spawnPoint();
    this.tank.x = pos.x;
    this.tank.y = pos.y;
    this.game.addObject(this.tank);
    this.game.n_playersAlive += 1;
    // this.game.addObject(new Smoke(this.x, this.y));
    var self = this;
    this.game.timeouts.push(setTimeout(function(){
      new Cloud(self.game, self.tank.x, self.tank.y, n=4, radius=20, rspeed=2);
    }, 10));
  }

  // kill the player, called when tank is shot
  // check if game should end
  this.kill = function(){
    this.game.n_playersAlive -= 1;
    this.game.nkills++;
    this.game.canvas.shake();
    this.score -= 1;
    this.spree = 0;
    updateScores();
    if(this.game.nkills >= MaxKillsPerGame){
      this.game.timeouts.push(setTimeout(function(){game.stop();}, 2000));
    }
    var self = this;
    this.game.timeouts.push(setTimeout(function(){
      self.spawn();
    }, 3000));
  }

  // give or subtract score to player, also update killing spree
  this.giveScore = function(val=1){
    this.score += val;
    this.spree += 1;
    if(this.spree > 5 && this.spree % 5 == 0){
      this.score += Math.floor(this.spree / 5)
      playSound("res/sound/killingspree.wav");
    }
    for(var i=0; i<this.game.players.length; i++)
      if(this.game.players[i].team == this.team && this.game.players[i].name != this.name)
        this.game.players[i].score += val;
  }

  // change color
  this.changeColor = function(){
    this.team += 1;
    this.team = this.team % playercolors.length;
    this.color = playercolors[this.team % playercolors.length];
  }

}
