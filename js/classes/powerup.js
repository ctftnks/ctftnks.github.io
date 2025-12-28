// a parent class for powerups

class PowerUp extends GameObject {
  constructor() {
    super();
    this.isPowerUp = true;
    this.image = new Image();
    this.width = 30;
    this.x = undefined;
    this.y = undefined;
    this.radius = 40;
    this.attractsBots = false;
  }

  apply(tank) {}

  step() {}

  draw(canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }
}

class LaserBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/laser.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Laser(tank);
  }
}

class MGBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/mg.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new MG(tank);
  }
}

class GrenadeBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/grenade.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Grenade(tank);
  }
}

class MineBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/mine.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Mine(tank);
  }
}

class GuidedBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/guided.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Guided(tank);
  }
}

class WreckingBallBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/wreckingBall.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new WreckingBall(tank);
  }
}

class SlingshotBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/slingshot.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new Slingshot(tank);
  }
}

class WallBuilderBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/wallBuilder.png";
  }
  apply(tank) {
    playSound("res/sound/reload.wav");
    tank.weapon = new WallBuilder(tank);
  }
}

class SpeedBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/speed.png";
  }
  apply(tank) {
    tank.speed *= 1.1;
    var self = tank;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.speed /= 1.1;
      }, 8000),
    );
  }
}

class InvincibleBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/invincible.png";
    this.applied = false;
  }
  apply(tank) {
    if (this.applied) return;
    this.applied = true;
    stopMusic();
    if (!muted) playMusic("res/sound/invincible.mp3");
    tank.speed *= 1.14;
    tank.timers.invincible = tank.player.game.t + 10000;
    var self = tank;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.speed /= 1.14;
        if (bgmusic) playMusic("res/sound/bgmusic.wav");
        else if (!tank.invincible()) stopMusic();
      }, 10100),
    );
  }
}

class TerminatorBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = "res/img/terminator.png";
    this.applied = false;
  }
  apply(tank) {
    if (this.applied) return;
    this.applied = true;
    tank.rapidfire = true;
    playSound("res/sound/terminator.mp3");
    var self = tank;
    // self.weapon.image = this.image;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.rapidfire = false;
      }, 120000),
    );
  }
}

class MultiBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/multi.png";
    this.used = false;
  }
  apply(tank) {
    if (!this.used) {
      this.used = true;
      PowerUpRate /= 2.5;
      PowerUpRate = Math.round(1000 * PowerUpRate) / 1000;
      MaxPowerUps *= 2.5;
      var self = tank;
      setTimeout(function () {
        PowerUpRate *= 2.5;
        MaxPowerUps /= 2.5;
      }, 8000);
    }
  }
}

class FogBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = "res/img/fog.png";
    this.used = false;
  }
  apply(tank) {
    if (!this.used) tank.player.game.intvls.push(fogOfWar(game));
  }
}

const PowerUps = [
  {
    create: function () {
      return new LaserBonus();
    },
    name: "Laser",
    weight: 1,
  },
  {
    create: function () {
      return new MGBonus();
    },
    name: "MG",
    weight: 1,
  },
  {
    create: function () {
      return new GrenadeBonus();
    },
    name: "Grenade",
    weight: 1,
  },
  {
    create: function () {
      return new MineBonus();
    },
    name: "Mine",
    weight: 1,
  },
  {
    create: function () {
      return new GuidedBonus();
    },
    name: "Guided",
    weight: 1,
  },
  {
    create: function () {
      return new WreckingBallBonus();
    },
    name: "WreckingBall",
    weight: 0.5,
  },
  {
    create: function () {
      return new MultiBonus();
    },
    name: "Multiplier",
    weight: 1,
  },
  {
    create: function () {
      return new SlingshotBonus();
    },
    name: "Slingshot",
    weight: 1,
  },
  {
    create: function () {
      return new InvincibleBonus();
    },
    name: "Invincible",
    weight: 1,
  },
  {
    create: function () {
      return new TerminatorBonus();
    },
    name: "Terminator",
    weight: 1,
  },
  {
    create: function () {
      return new FogBonus();
    },
    name: "FogOfWar",
    weight: 0,
  },
  {
    create: function () {
      return new SpeedBonus();
    },
    name: "SpeedBoost",
    weight: 1,
  },
];

// get random powerup
function getRandomPowerUp() {
  var totalWeights = 0;
  for (var i = 0; i < PowerUps.length; i++) totalWeights += PowerUps[i].weight;
  var randWeight = Math.random() * totalWeights;
  var h;
  for (h = 0; randWeight > 0; h++) randWeight -= PowerUps[h].weight;
  playSound("res/sound/original/powerup.mp3");
  return PowerUps[h - 1].create();
}