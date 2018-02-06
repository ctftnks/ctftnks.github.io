

// the normal, default gun
Gun = function(tank){

  this.tank = tank;
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
      bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 4;
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

  this.tank = tank;
  this.canShoot = true;
  this.fired = false;

  this.shoot = function(){
    if(this.canShoot){
      if(Math.random() > 0.5) return;
      bullet = new Bullet(this);
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
  this.tank = tank;
  this.canShoot = true;
  this.shoot = function(){
    if(this.canShoot){
      bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.color = this.tank.player.color;
      bullet.trace = true;
      bullet.leaveTrace = function(){
        var angle = bullet.angle
        var smoke = new Smoke(this.x, this.y, timeout=150, radius=bullet.radius, rspeed = 0);
        smoke.color = bullet.color;
        smoke.draw = function(canvas, context){
          context.save();
          context.beginPath();
          context.translate(smoke.x, smoke.y);
          context.rotate(angle);
          context.rect(-smoke.radius/2, -smoke.radius*5, smoke.radius, smoke.radius*10);
          context.fillStyle = bullet.color;
          context.fill();
          context.restore();
        }
        bullet.player.game.addObject(smoke);
      }
      bullet.speed = 10*BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 150;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
    }
  }
}
