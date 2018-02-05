


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


Laser = function(tank){

  this.tank = tank;
  this.canShoot = true;
  this.numberOfShots = 30;

  this.shoot = function(){
    if(this.canShoot){
      bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 2;
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle + 0.1 * (0.5 - Math.random());
      bullet.timeout = 5000;
      this.tank.player.game.addObject(bullet);
      if(this.numberOfShots-- < 0){
        this.tank.defaultWeapon();
        this.tank.weapon.canShoot = false;
        var self = this;
        setTimeout(function(){self.tank.weapon.canShoot = true;}, 1000);
      }
    }
  }
}
