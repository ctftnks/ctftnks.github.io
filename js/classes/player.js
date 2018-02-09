// A class for a player.
// keeps the players score, color, name, keymap
// and the tank to be controlled

nplayers = 0;
playercolors = [
  "#222222",  // red
  "#222222",  // red
  "#000000",  // red
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
  this.game = undefined;
  this.score = 0;
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
    // this.tank = new Tank(this);
    this.tank.map = this.game.map;
    var pos = this.game.map.spawnPoint();
    this.tank.x = pos.x;
    this.tank.y = pos.y;
    this.game.addObject(this.tank);
    this.game.n_playersAlive += 1;
    // this.game.addObject(new Smoke(this.x, this.y));
    var self = this;
    this.game.intvls.push(setTimeout(function(){
      new Cloud(self.game, self.tank.x, self.tank.y, n=4, radius=20, rspeed=2);
    }, 10));
  }

  // kill the player, called when tank is shot
  // check if game should end
  this.kill = function(){
    this.game.n_playersAlive -= 1;
    this.game.nkills++;
    this.game.canvas.shake();
    updateScores();
    if(this.game.nkills >= MaxKillsPerGame){
      this.game.intvls.push(setTimeout(function(){game.stop();}, TimeAfterLastKill));
    }
    var self = this;
    this.game.intvls.push(setTimeout(function(){
      self.spawn();
    }, 3000));
  }

}
