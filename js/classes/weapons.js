
// parent class for all weapons
Weapon = function(tank){
  this.tank = tank;
  this.canShoot = true;
  this.image = "";
  this.shoot = function(){

  }
}

// the normal, default gun
Gun = function(tank){
  Weapon.call(this);
  this.image = "res/img/gun.png";
  this.tank = tank;
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
      playSound("res/sound/gun.wav");
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 4;
      bullet.color = this.tank.player.color;
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 10000;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
    }
  }
}


// a rapid-firing mini-gun
MG = function(tank){
  this.image = "res/img/mg.png";
  this.tank = tank;
  this.canShoot = true;
  this.fired = false;
  this.nshots = 20;
  this.every = 50;
  this.shoot = function(){
    this.every -= GameFrequency;
    if(this.nshots > 0 && this.every < 0){
      this.every = 50;
      playSound("res/sound/mg.wav");
      var bullet = new Bullet(this);
      this.nshots--;
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.speed = BulletSpeed;
      bullet.bounceSound = "";
      bullet.angle = this.tank.angle + 0.2 * (0.5 - Math.random());
      bullet.timeout = 5000 + 1000 * (0.5 - Math.random());;
      this.tank.player.game.addObject(bullet);
      if(this.fired)
        return;
      this.fired = true;
      var self = this;
      this.tank.player.game.intvls.push(setTimeout(function(){
        self.tank.defaultWeapon();
      }, 2500));
    }
  }
}

// yay, lasers!
Laser = function(tank){
  this.image = "res/img/laser.png";
  this.tank = tank;
  this.canShoot = true;
  this.fired = false;
  this.shoot = function(){
    if(!this.fired){
      playSound("res/sound/laser.wav");
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.color = this.tank.player.color;
      bullet.trace = true;
      bullet.bounceSound = "";
      bullet.leaveTrace = function(){
        var angle = bullet.angle;
        var thisbullet = bullet;
        var smoke = new Smoke(this.x, this.y, timeout=150, radius=thisbullet.radius, rspeed = 0);
        smoke.color = thisbullet.color;
        // smoke.draw = function(canvas, context){
        //   context.save();
        //   context.beginPath();
        //   context.translate(smoke.x, smoke.y);
        //   context.rotate(angle);
        //   context.rect(-smoke.radius/2, -smoke.radius*5, smoke.radius, smoke.radius*10);
        //   context.fillStyle = thisbullet.color;
        //   context.fill();
        //   context.restore();
        // }
        bullet.player.game.addObject(smoke);
      }
      bullet.speed = 14*BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 300;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      this.fired = true;
      var self = this;
      setTimeout(function(){self.tank.defaultWeapon();}, 1500);
    }
  }
}


// A grenade that can be remotely detonated
Grenade = function(tank){
  this.image = "res/img/grenade.png";
  this.tank = tank;
  this.canShoot = true;
  this.fired = false;
  this.exploded = false;
  this.bullet = undefined;
  this.nshrapnels = 30;
  this.shoot = function(){
    if(!this.fired){
      var bullet = new Bullet(this);
      this.bullet = bullet;
      this.fired = true;
      this.canShoot = false;
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 6;
      bullet.color = "#000";
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 10000;
      this.tank.player.game.addObject(bullet);
      var self = this;
      this.intvl = setTimeout(function(){self.shoot();}, 10000);
    }
    if(this.fired && this.bullet.age > 300 && !this.exploded){
      this.exploded = true;
      playSound("res/sound/grenade.wav");
      for(i=0; i<this.nshrapnels; i++){
        var shrapnel = new Bullet(this);
        shrapnel.x = this.bullet.x;
        shrapnel.y = this.bullet.y;
        shrapnel.radius = 2;
        shrapnel.age = 0;
        shrapnel.speed = 2 * BulletSpeed * (0.8 + 0.4 * Math.random());
        shrapnel.angle = 2 * Math.PI * Math.random();
        shrapnel.timeout = 800;
        shrapnel.checkCollision = function(x, y){}
        this.tank.player.game.addObject(shrapnel);
      }
      // clearInterval(this.intvl);
      var self = this;
      setTimeout(function(){self.tank.defaultWeapon();}, 1000);
      this.bullet.delete();
    }
  }
}
