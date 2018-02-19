

// a parent class for powerups


PowerUp = function(){
  Object.call(this);
  this.isPowerUp = true;
  this.image = "";
  this.width = 30;
  this.x = undefined;
  this.y = undefined;
  this.radius = 40;

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
MineBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/mine.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new Mine(tank);
  }
}
GuidedBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/guided.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new Guided(tank);
  }
}
WreckingBallBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/wreckingBall.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new WreckingBall(tank);
  }
}
SpeedBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/speed.png";
  this.apply = function(tank){
    tank.speed *= 1.14;
    var self = tank;
    tank.player.game.timeouts.push(setTimeout(function(){
      self.speed /= 1.14;
    }, 4000));
  }
}
MultiBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/multi.png";
  this.used = false;
  this.apply = function(tank){
    if(!this.used){
      this.used = true;
      PowerUpFrequency /= 3.;
      MaxPowerUps *= 3.;
      var self = tank;
      setTimeout(function(){
        PowerUpFrequency *= 3.;
        MaxPowerUps /= 3.;
      }, 8000);
    }
  }
}


function getRandomPowerUp(){
  var powerups = [
    new LaserBonus(),
    new MGBonus(),
    new GrenadeBonus(),
    new MineBonus(),
    new GuidedBonus(),
    new WreckingBallBonus(),
    new MultiBonus(),
    new SpeedBonus()
  ];
  var len = powerups.length;
  playSound("res/sound/original/powerup.mp3");
  return powerups[Math.floor(Math.random() * len)];
}
