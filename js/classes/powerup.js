

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
SlingshotBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/slingshot.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new Slingshot(tank);
  }
}
SteelBeamBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/steelBeam.png";
  this.apply = function(tank){
    playSound("res/sound/reload.wav");
    tank.weapon = new SteelBeam(tank);
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
InvincibleBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/invincible.png";
  this.applied = false;
  this.apply = function(tank){
    if(this.applied)
      return;
    this.applied = true;
    playSound("res/sound/invincible.mp3");
    tank.speed *= 1.14;
    var img = tank.weapon.image;
    tank.weapon.image = "res/img/invincible.png";
    tank.invincible = true;
    var self = tank;
    tank.player.game.timeouts.push(setTimeout(function(){
      self.speed /= 1.14;
      self.invincible = false;
      tank.weapon.image = img;
    }, 10000));
  }
}
TerminatorBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/terminator.png";
  this.applied = false;
  this.apply = function(tank){
    if(this.applied)
      return;
    this.applied = true;
    playSound("res/sound/terminator.mp3");
    var self = tank;
    tank.defaultWeapon = function(){}
    self.weapon.image = this.image;
    var intvl = setInterval(function(){
      self.weapon.canShoot = true;
      self.weapon.fired = false;
    }, 1000);
    tank.player.game.timeouts.push(setTimeout(function(){
      clearInterval(intvl);
      self.defaultWeapon = function(){
        self.weapon = new Gun(self);
      };
    }, 60000));
  }
}
MultiBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/multi.png";
  this.used = false;
  this.apply = function(tank){
    if(!this.used){
      this.used = true;
      PowerUpFrequency /= 2.5;
      PowerUpFrequency = Math.round(PowerUpFrequency);
      MaxPowerUps *= 2.5;
      var self = tank;
      setTimeout(function(){
        PowerUpFrequency *= 2.5;
        MaxPowerUps /= 2.5;
      }, 8000);
    }
  }
}
FogBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/fog.png";
  this.used = false;
  this.apply = function(tank){
    if(!this.used)
      fogOfWar(game);
  }
}

PowerUps = [
  {create: function(){return new LaserBonus()}, name: "Laser", weight: 1},
  {create: function(){return new MGBonus()}, name: "MG", weight: 1},
  {create: function(){return new GrenadeBonus()}, name: "Grenade", weight: 1},
  {create: function(){return new MineBonus()}, name: "Mine", weight: 1},
  {create: function(){return new GuidedBonus()}, name: "Guided", weight: 1},
  {create: function(){return new WreckingBallBonus()}, name: "WreckingBall", weight: 1},
  {create: function(){return new MultiBonus()}, name: "Multi", weight: 1},
  {create: function(){return new SlingshotBonus()}, name: "Slingshot", weight: 1},
  {create: function(){return new InvincibleBonus()}, name: "Invincible", weight: 1},
  {create: function(){return new TerminatorBonus()}, name: "Terminator", weight: 1},
  {create: function(){return new FogBonus()}, name: "FogOfWar", weight: 0.5},
  {create: function(){return new SpeedBonus()}, name: "SpeedBoost", weight: 1}
];


// get random powerup
function getRandomPowerUp(){
  var totalWeights = 0;
  for(var i=0; i<PowerUps.length; i++)
    totalWeights += PowerUps[i].weight;
  var randWeight = Math.random() * totalWeights;
  var h;
  for(h=0; randWeight>0; h++)
    randWeight -= PowerUps[h].weight;
  playSound("res/sound/original/powerup.mp3");
  return PowerUps[h-1].create();


}
