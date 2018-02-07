// A class for a player.
// keeps the players score, color, name, keymap
// and the tank to be controlled

nplayers = 0;

Player = function(color){

  this.id = nplayers++;
  this.name = "Player " + this.id;
  this.color = color;
  this.game = undefined;
  this.score = 0;
  this.keys = keymaps[this.id];
  this.tank = new Tank(this);

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
    this.tank = new Tank(this);
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
