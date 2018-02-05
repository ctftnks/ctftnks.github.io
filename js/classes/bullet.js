
Bullet = function(weapon){
  Object.call(this);

  this.player = weapon.tank.player;
  this.weapon = weapon;
  this.x = 0;
  this.y = 0;
  this.radius = 5;
  this.speed = 5;
  this.timeout = 10;

  this.setPosition = function(x, y){
    this.x = 0;
    this.y = 0;
  }

  this.draw = function(canvas, context){
    context.beginPath();
    context.fillStyle = "#000";
    context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
  }

  this.step = function(){
    // TODO: collision checking
    // update position
  }

  this.delete = function(){
    this.deleted = true;
    this.weapon.canShoot = true;
  }

}
