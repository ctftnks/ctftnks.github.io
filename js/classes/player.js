
nplayers = 0;

Player = function(color){

  this.id = nplayers++;
  this.name = "Player " + this.id;
  this.color = color;
  this.tank = new Tank(this);

}
