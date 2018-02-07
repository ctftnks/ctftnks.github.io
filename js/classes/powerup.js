

// a parent class for powerups


PowerUp = function(){
  Object.call(this);
  this.isPowerUp = true;
  this.image = "";
  this.width = 24;
  this.x = undefined;
  this.y = undefined;
  this.radius = 12;

  this.apply = function(tank){

  }

  this.step = function(){}

  this.draw = function(canvas, context){
    context.save();
    context.translate(this.x, this.y);
    var img = new Image;
    img.src = this.image;
    context.drawImage(img, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

}


LaserBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/laser.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new Laser(tank);
  }
}
MGBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/mg.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new MG(tank);
  }
}
GrenadeBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/grenade.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new Grenade(tank);
  }
}
SpeedBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/speed.png";
  this.apply = function(tank){
    tank.speed *= 1.2;
    var self = tank;
    tank.player.game.intvls.push(setTimeout(function(){
      self.speed /= 1.2;
    }, 4000));
  }
}


function getRandomPowerUp(){
  var powerups = [new LaserBonus(), new MGBonus(), new GrenadeBonus(), new SpeedBonus()];
  var len = powerups.length;
  playSound("res/sound/powerup.wav");
  return powerups[Math.floor(Math.random() * len)];
}
