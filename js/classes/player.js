
nplayers = 0;

Player = function(color){

  this.id = nplayers++;
  this.name = "Player " + this.id;
  this.color = color;
  this.score = 0;
  this.tank = new Tank(this);
  this.keys = keymaps[this.id];
  this.game = undefined;

  this.step = function(){
    if (Key.isDown(this.keys[0])) this.tank.move(1);
    if (Key.isDown(this.keys[1])) this.tank.turn(-1);
    if (Key.isDown(this.keys[2])) this.tank.move(-0.5);
    if (Key.isDown(this.keys[3])) this.tank.turn(1);
    if (Key.isDown(this.keys[4])) this.tank.shoot();
  }

}
