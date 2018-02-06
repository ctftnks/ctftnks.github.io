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

  // kill the player, called when tank is shot
  // check if game should end
  this.kill = function(){
    this.game.n_playersAlive -= 1;
    if(this.game.n_playersAlive < 2){
      setTimeout(function(){game.stop();}, TimeAfterLastKill)
    }
  }

}
