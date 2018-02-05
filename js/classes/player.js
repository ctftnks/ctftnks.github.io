
nplayers = 0;

Player = function(){

  this.id = nplayers++;
  this.name = "Player " + id;
  this.color = "#F00";
  this.tank = new Tank(this);

}
