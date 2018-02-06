
// parent class for all weapons
Weapon = function(tank){
  this.tank = tank;
  this.canShoot = true;
  this.shoot = function(){

  }
}

// the normal, default gun
Gun = function(tank){
  Weapon.call(this);
  this.image = "";
  this.tank = tank;
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
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
  this.shoot = function(){
    if(this.canShoot){
      if(Math.random() > 0.5) return;
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle + 0.1 * (0.5 - Math.random());
      bullet.timeout = 5000;
      this.tank.player.game.addObject(bullet);
      if(this.fired)
        return;
      this.fired = true;
      var self = this;
      setTimeout(function(){
        self.canShoot = false;
        setTimeout(function(){self.tank.defaultWeapon();}, 1500);
      }, 1500);
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
    if(this.canShoot && !this.fired){
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.color = this.tank.player.color;
      bullet.trace = true;
      bullet.leaveTrace = function(){
        var angle = bullet.angle
        var thisbullet = bullet;
        var smoke = new Smoke(this.x, this.y, timeout=150, radius=thisbullet.radius, rspeed = 0);
        // TODO: var color
        smoke.color = thisbullet.color;
        smoke.draw = function(canvas, context){
          context.save();
          context.beginPath();
          context.translate(smoke.x, smoke.y);
          context.rotate(angle);
          context.rect(-smoke.radius/2, -smoke.radius*5, smoke.radius, smoke.radius*10);
          context.fillStyle = thisbullet.color;
          context.fill();
          context.restore();
        }
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
  this.nshrapnels = 20;
  this.shoot = function(){
    if(this.canShoot && !this.fired){
      var bullet = new Bullet(this);
      this.bullet = bullet;
      this.fired = true;
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 8;
      bullet.color = this.tank.player.color;
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 10000;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      var self = this;
      setTimeout(function(){self.shoot();}, 10000);
    }
    if(this.fired && this.bullet.age > 0 && !this.exploded){
      this.exploded = true;
      for(i=0; i<this.nshrapnels; i++){
        var bullet = new Bullet(this);
        bullet.x = this.bullet.x;
        bullet.y = this.bullet.y;
        bullet.radius = 2;
        bullet.speed = 2*BulletSpeed;
        bullet.angle = 2 * Math.PI * Math.random();
        bullet.timeout = 3000;
        bullet.checkCollision = function(x, y){}
        this.tank.player.game.addObject(bullet);
      }
      var self = this;
      setTimeout(function(){self.tank.defaultWeapon();}, 1000);
      this.bullet.delete();
    }
  }
}
