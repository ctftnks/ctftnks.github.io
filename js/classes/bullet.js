
Bullet = function(weapon){
  Object.call(this);

  this.player = weapon.tank.player;
  this.weapon = weapon;
  this.x = 0;
  this.y = 0;
  this.radius = 5;
  this.speed = 5;
  this.angle = 5;
  this.timeout = 1000 / 40;

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
    // is bullet timed out?
    this.timeout -= 1;
    if(this.timeout < 0)
      this.delete();
    // translate bullet
    this.x -= this.speed * Math.sin(-this.angle);
    this.y -= this.speed * Math.cos(-this.angle);
    // has bullet hit something?
    // TODO: Collision detection

  }

  this.delete = function(){
    this.deleted = true;
    this.weapon.canShoot = true;
  }

}
