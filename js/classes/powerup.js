

// a parent class for powerups


PowerUp = function () {
  Object.call(this);
  this.isPowerUp = true;
  this.image = new Image;
  this.width = 30;
  this.x = undefined;
  this.y = undefined;
  this.radius = 40;
  this.attractsBots = false;

  this.apply = function (tank) {

  }

  this.step = function () { }

  this.draw = function (canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

}


LaserBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/laser.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Laser(tank);
  }
}
MGBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/mg.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new MG(tank);
  }
}
GrenadeBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/grenade.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Grenade(tank);
  }
}
MineBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/mine.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Mine(tank);
  }
}
GuidedBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/guided.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Guided(tank);
  }
}
WreckingBallBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/wreckingBall.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new WreckingBall(tank);
  }
}
SlingshotBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/slingshot.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Slingshot(tank);
  }
}
WallBuilderBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/wallBuilder.png";
  this.apply = function (tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new WallBuilder(tank);
  }
}
SpeedBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/speed.png";
  this.apply = function (tank) {
    tank.speed *= 1.10;
    var self = tank;
    tank.player.game.timeouts.push(setTimeout(function () {
      self.speed /= 1.10;
    }, 8000));
  }
}
InvincibleBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/invincible.png";
  this.applied = false;
  this.apply = function (tank) {
    if (this.applied)
      return;
    this.applied = true;
    stopMusic();
    if (!muted)
      playMusic("res/sound/invincible.mp3");
    tank.speed *= 1.14;
    var img = tank.weapon.image.src;
    tank.weapon.image.src = "res/img/invincible.png";
    tank.timers.invincible = tank.player.game.t + 10000;
    var self = tank;
    tank.player.game.timeouts.push(setTimeout(function () {
      self.speed /= 1.14;
      tank.weapon.image.src = img;
      if (bgmusic)
        playMusic("res/sound/bgmusic.wav");
      else if (!tank.invincible())
        stopMusic();
    }, 10100));
  }
}
TerminatorBonus = function () {
  PowerUp.call(this);
  this.attractsBots = true;
  this.image.src = "res/img/terminator.png";
  this.applied = false;
  this.apply = function (tank) {
    if (this.applied)
      return;
    this.applied = true;
    tank.weapon.rapidfire = true;
    playSound("res/sound/terminator.mp3");
    var self = tank;
    tank.defaultWeapon = function () {
      self.weapon.active = true;
      self.weapon.fired = false;
      self.weapon.rapidfire = true;
    }
    // self.weapon.image = this.image;
    tank.player.game.timeouts.push(setTimeout(function () {
      self.defaultWeapon = function () {
        self.weapon = new Gun(self);
      };
    }, 120000));
  }
}
MultiBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/multi.png";
  this.used = false;
  this.apply = function (tank) {
    if (!this.used) {
      this.used = true;
      PowerUpRate /= 2.5;
      PowerUpRate = Math.round(1000 * PowerUpRate) / 1000.;
      MaxPowerUps *= 2.5;
      var self = tank;
      setTimeout(function () {
        PowerUpRate *= 2.5;
        MaxPowerUps /= 2.5;
      }, 8000);
    }
  }
}
FogBonus = function () {
  PowerUp.call(this);
  this.image.src = "res/img/fog.png";
  this.used = false;
  this.apply = function (tank) {
    if (!this.used)
      tank.player.game.intvls.push(fogOfWar(game));
  }
}

PowerUps = [
  { create: function () { return new LaserBonus() }, name: "Laser", weight: 1 },
  { create: function () { return new MGBonus() }, name: "MG", weight: 1 },
  { create: function () { return new GrenadeBonus() }, name: "Grenade", weight: 1 },
  { create: function () { return new MineBonus() }, name: "Mine", weight: 1 },
  { create: function () { return new GuidedBonus() }, name: "Guided", weight: 1 },
  { create: function () { return new WreckingBallBonus() }, name: "WreckingBall", weight: 0.5 },
  { create: function () { return new MultiBonus() }, name: "Multiplier", weight: 1 },
  { create: function () { return new SlingshotBonus() }, name: "Slingshot", weight: 1 },
  { create: function () { return new InvincibleBonus() }, name: "Invincible", weight: 1 },
  { create: function () { return new TerminatorBonus() }, name: "Terminator", weight: 1 },
  { create: function () { return new FogBonus() }, name: "FogOfWar", weight: 0 },
  { create: function () { return new SpeedBonus() }, name: "SpeedBoost", weight: 1 }
];


// get random powerup
function getRandomPowerUp() {
  var totalWeights = 0;
  for (var i = 0; i < PowerUps.length; i++)
    totalWeights += PowerUps[i].weight;
  var randWeight = Math.random() * totalWeights;
  var h;
  for (h = 0; randWeight > 0; h++)
    randWeight -= PowerUps[h].weight;
  playSound("res/sound/original/powerup.mp3");
  return PowerUps[h - 1].create();


}
