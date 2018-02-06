
Bullet = function(weapon){
  Object.call(this);

  this.player = weapon.tank.player;
  this.map = this.player.game.map;
  this.weapon = weapon;
  this.x = undefined;
  this.y = undefined;
  this.radius = 5;
  this.speed = BulletSpeed;
  this.angle = undefined;
  this.timeout = 5000;

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
    this.timeout -= GameFrequency;
    if(this.timeout < 0)
      this.delete();
    // translate bullet
    oldx = this.x;
    oldy = this.y;
    this.x -= this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
    this.checkCollision(oldx, oldy);
  }


  this.checkCollision = function(oldx, oldy){
    // check for collision with walls
    tile = this.map.getTileByPos(oldx, oldy);
    if(tile == -1)
      return;
    border = tile.getBorder(this.x, this.y);
    if(border != -1){
      if(border == "left" || border == "right"){
        this.angle *= -1;
        this.x = 2*oldx - this.x
      }
      if(border == "top" || border == "bottom"){
        this.angle = Math.PI - this.angle;
        this.y = 2*oldy - this.y
      }
    }
  }

  this.delete = function(){
    this.deleted = true;
    this.weapon.canShoot = true;
  }

}
