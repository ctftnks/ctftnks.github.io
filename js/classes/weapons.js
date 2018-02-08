
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
        if(self.tank.weapon==self)
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
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2.;
      bullet.speed = 14*BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.radius = 2;
      bullet.color = this.tank.player.color;
      bullet.trace = true;
      bullet.bounceSound = "";
      bullet.leaveTrace = function(){
        var angle = bullet.angle;
        var thisbullet = bullet;
        var smoke = new Smoke(this.x, this.y, timeout=500, radius=thisbullet.radius, rspeed = 0);
        smoke.color = thisbullet.color;
        smoke.draw = function(canvas, context){
          context.save();
          context.beginPath();
          context.translate(smoke.x, smoke.y);
          context.rotate(angle);
          context.rect(-smoke.radius/2, -smoke.radius*2, smoke.radius, smoke.radius*4);
          context.fillStyle = thisbullet.color;
          context.fill();
          context.restore();
        }
        bullet.player.game.addObject(smoke);
      }
      bullet.timeout = 300;
      bullet.age = 0;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      this.fired = true;
      var self = this;
      this.tank.player.game.intvls.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1500));
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
      var self = this;
      bullet.delete = function(){
        self.shoot();
        bullet.deleted = true;
      }
      this.tank.player.game.addObject(bullet);
      this.intvl = setTimeout(function(){self.shoot();}, 10000);
    }
    if(this.fired && this.bullet.age > 300 && !this.exploded){
      this.exploded = true;
      playSound("res/sound/grenade.wav");
      for(var i=0; i<this.nshrapnels; i++){
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
      clearInterval(this.intvl);
      var self = this;
      this.tank.player.game.intvls.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1000));
      this.bullet.delete();
    }
  }
}



// the normal, default gun
Guided = function(tank){
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
      bullet.step = function(){
        bullet.age += GameFrequency;
        if(bullet.age > bullet.timeout)
          bullet.delete();
        bullet.leaveTrace();
        var oldx = bullet.x;
        var oldy = bullet.y;
        bullet.x -= bullet.speed * Math.sin(-bullet.angle) * GameFrequency / 1000.;
        bullet.y -= bullet.speed * Math.cos(-bullet.angle) * GameFrequency / 1000.;
        // check for wall collisions
        bullet.checkCollision(oldx, oldy);
        var tile = bullet.map.getTileByPos(oldx, oldy);
        if(bullet.age > 1000 && tile.id != bullet.lastTileID){
          setTimeout(function(){
            if(bullet.angle > 0.1 && Math.abs(bullet.angle - Math.PI) > 0.1  && Math.abs(bullet.angle + Math.PI) > 0.1 ){
              if(!tile.walls.top) bullet.angle = 0.1;
              else if(!tile.walls.bottom) bullet.angle = Math.PI;
            }
            else{
              if(!tile.walls.right) bullet.angle = Math.PI / 2.;
              else if(!tile.walls.left) bullet.angle = -Math.PI / 2.;
            }
        });
        }
        bullet.lastTileID = tile.id;
      }
      bullet.timeout = 10000;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
    }
  }
}
