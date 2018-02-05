
// TODO: merge with player class?

Tank = function(player){
  Object.call(this);

  this.player = player;
  this.x = 100;
  this.y = 100;
  this.angle = 0;
  this.width = 20;
  this.height = 30;
  this.weapon = new MG(this);
  this.speed = TankSpeed;

  this.setPosition = function(x, y){
    this.x = x;
    this.y = y;
  }

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
    // TODO: collision checking
  }

  this.move = function(direction){
    this.x -= direction * this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= direction * this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
  }

  this.turn = function(direction){
    this.angle += direction * TankTurnSpeed * GameFrequency / 1000.;
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

  this.intersects = function(){


    return false;
  }

}
