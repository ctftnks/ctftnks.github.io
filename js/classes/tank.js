
// TODO: merge with player class?

Tank = function(player){
  Object.call(this);

  this.player = player;
  this.map = undefined;
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.width = 20;
  this.height = 30;
  this.weapon = new MG(this);
  this.speed = TankSpeed;

  this.draw = function(canvas, context){
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width/2, -this.height/2, this.width, this.height);
    context.fillStyle = this.player.color;
    context.fill();
    context.restore();
  }

  this.step = function(){
    this.player.step();
    this.checkBulletCollision();
  }

  this.move = function(direction){
    oldx = this.x;
    oldy = this.y;
    this.x -= direction * this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= direction * this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
    if(this.checkWallCollision()){
      this.x = oldx;
      this.y = oldy;
    }
  }

  this.turn = function(direction){
    var oldangle = this.angle;
    this.angle += direction * TankTurnSpeed * GameFrequency / 1000.;
    if(this.checkWallCollision())
      this.angle = oldangle;
  }

  this.shoot = function(){
      this.weapon.shoot();
  }

  this.defaultWeapon = function(){
    this.weapon = new Gun(this);
  }

  this.corners = function(){
      return [
        {
          x: this.x - (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
          y: this.y + (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x + (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
          y: this.y - (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x - (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
          y: this.y + (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x + (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
          y: this.y - (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle)
        }
      ];
  }

  this.intersects = function(x, y){
    distx = this.x - x;
    disty = this.y - y;
    // TODO: find a better algorithm
    return Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2)) < 0.5 * (this.width + this.height)
  }

  this.checkWallCollision = function(){
    tile = this.map.getTileByPos(this.x, this.y);
    if(tile == -1)
      return;
    corners = this.corners();
    for(i=0; i<corners.length; i++){
      border = tile.getBorder(corners[i].x, corners[i].y);
      if(border != -1)
        return true;
    }
    return false;
  }

  this.checkBulletCollision = function(){
    bullets = [];
    corners = this.corners();
    for(m=0; m<4; m++){
      tile = this.map.getTileByPos(corners[m].x, corners[m].y);
      for(j=0; j<tile.objs.length; j++){
        if(tile.objs[j].isBullet && tile.objs[j].age > 0)
          bullets.push(tile.objs[j]);
      }
    }
    for(i=0; i<bullets.length; i++){
      if(this.intersects(bullets[i].x, bullets[i].y)){
        this.player.kill();
        bullets[i].player.score += 1;
        bullets[i].delete();
      }
    }
  }
}
