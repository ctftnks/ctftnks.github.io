
// TODO: merge with player class?

Tank = function(player){
  Object.call(this);

  this.player = player;
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.width = 10;
  this.length = 20;
  this.weapon = new Gun(this);
  this.canShoot = true;

  this.setPosition = function(x, y){
    this.x = 0;
    this.y = 0;
  }

  this.draw = function(canvas, context){
    context.save();
    context.translate(this.x + this.width/2, this.y + this.length/2)
    context.rotate(angle);
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.width, this.length);
    context.restore();
  }

  this.step = function(){
    // TODO: check if keys pressed
    // then update positions
    // TODO: collision checking
  }

  this.shoot = function(){
      this.weapon.shoot();
  }

}
