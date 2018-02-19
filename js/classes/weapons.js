
// parent class for all weapons
Weapon = function(tank){
  this.canShoot = true;
  this.tank = tank;
  this.image = "";
  this.name = "Weapon";
  this.shoot = function(){

  }
  this.crosshair = function(){

  }
}

// the normal, default gun
Gun = function(tank){
  Weapon.call(this, tank);
  this.name = "Gun";
  this.image = "res/img/gun.png";
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
  Weapon.call(this, tank);
  this.name = "MG";
  this.image = "res/img/mg.png";
  this.canShoot = true;
  this.fired = false;
  this.nshots = 20;
  this.every = 0;
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
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 3000));
    }
  }
}

// yay, lasers!
Laser = function(tank){
  Weapon.call(this, tank);
  this.image = "res/img/laser.png";
  this.name = "Laser";
  this.canShoot = true;
  this.fired = false;
  this.shoot = function(){
    if(!this.fired){
      playSound("res/sound/laser.wav");
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2.;
      bullet.speed = 18*BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.radius = 2;
      bullet.color = this.tank.player.color;
      bullet.trace = true;
      bullet.bounceSound = "";
      bullet.leaveTrace = function(){
        var angle = bullet.angle;
        var thisbullet = bullet;
        var smoke = new Smoke(this.x, this.y, timeout=400, radius=thisbullet.radius, rspeed = 0);
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
      bullet.timeout = 400;
      bullet.age = 0;
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      this.fired = true;
      var self = this;
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1500));
    }
  }
  this.crosshair = function(){
    var x = this.tank.x;
    var y = this.tank.y;
    for(var i=0; i<10; i++){
      x -= 10 * BulletSpeed * Math.sin(-this.tank.angle) * GameFrequency / 1000.;
      y -= 10 * BulletSpeed * Math.cos(-this.tank.angle) * GameFrequency / 1000.;
      if(i>3){
        var smoke = new Smoke(x, y, timeout=5, radius=1, rspeed = 0);
        smoke.color = "rgba(100,100,100,0.4)";
        this.tank.player.game.addObject(smoke);
      }
    }
  }

}


// A grenade that can be remotely detonated
Grenade = function(tank){
  Weapon.call(this, tank);
  this.image = "res/img/grenade.png";
  this.name = "Grenade";
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
      bullet.image = "res/img/grenade.png";
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
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1000));
      this.bullet.delete();
    }
  }
}

// A mine
Mine = function(tank){
  Weapon.call(this, tank);
  this.image = "res/img/mine.png";
  this.name = "Mine";
  this.canShoot = true;
  this.fired = false;
  this.exploded = false;
  this.bullet = undefined;
  this.nshrapnels = 24;
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
      bullet.image = "res/img/mine.png";
      bullet.speed = BulletSpeed;
      bullet.angle = this.tank.angle;
      bullet.timeout = 180000;
      var self = this;
      bullet.delete = function(){
        self.shoot();
        bullet.deleted = true;
      }
      this.tank.player.game.addObject(bullet);
      var self = this;
      this.tank.player.game.timeouts.push(setTimeout(function(){
        bullet.speed = 0;
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 600));
    }

    if(this.fired && this.bullet.age > 1000 && !this.exploded){
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
        shrapnel.timeout = 600;
        // shrapnel.checkCollision = function(x, y){}
        this.tank.player.game.addObject(shrapnel);
      }
      this.bullet.delete();
    }
  }
}



// the normal, default gun
Guided = function(tank){
  Weapon.call(this, tank);
  this.image = "res/img/guided.png";
  this.name = "Guided";
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
      playSound("res/sound/gun.wav");
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 6;
      bullet.image = "res/img/guided.png";
      bullet.color = "#555";
      bullet.smokeColor = "#555";
      bullet.speed = 1.2*TankSpeed;
      bullet.angle = this.tank.angle;
      bullet.goto = -1;
      bullet.step = function(){
        bullet.age += GameFrequency;
        if(bullet.age > bullet.timeout)
          bullet.delete();
        bullet.leaveTrace();
        var oldx = bullet.x;
        var oldy = bullet.y;
        // normal translation
        if(bullet.goto == -1){
          bullet.x -= bullet.speed * Math.sin(-bullet.angle) * GameFrequency / 1000.;
          bullet.y -= bullet.speed * Math.cos(-bullet.angle) * GameFrequency / 1000.;
        }else{
          // guided translation:
          // if bullet.goto has point data stored go into it's direction
          var distx = bullet.goto.x + bullet.goto.dx / 2. - bullet.x;
          var disty = bullet.goto.y + bullet.goto.dy / 2. - bullet.y;
          var len = Math.sqrt(distx*distx+disty*disty);
          bullet.x += bullet.speed * (distx/len) * GameFrequency / 1000.;
          bullet.y += bullet.speed * (disty/len) * GameFrequency / 1000.;
          this.angle = Math.atan2(-distx, disty)+Math.PI;
        }
        // check for wall collisions
        bullet.checkCollision(oldx, oldy);
        // calculate path to next tank and set next goto tile
        // at first, it waits a while and then repeats the task every few ms
        if(bullet.age > 1750){
          bullet.age -= 250;
          playSound("res/sound/guided.wav");
          // get current tile and path
          var tile = bullet.map.getTileByPos(oldx, oldy);
          var path = tile.pathTo(function(destination){
            for(var i=0; i<destination.objs.length; i++)
              return destination.objs[i].isTank;
          });
          // set next path tile as goto point
          if(path.length > 1){
            bullet.goto = path[1];
          }else{
            // if there is no next tile, hit first object in tile
            if(tile.objs.length > 0 && tile.objs[0].isTank)
              bullet.goto = {x:tile.objs[0].x,y:tile.objs[0].y,dx:0,dy:0};
          }
          if(path.length > 0)
            bullet.smokeColor = path[path.length-1].objs[0].color;
        }
        bullet.leaveTrace = function(){
          if(Math.random() > 0.8){
            var smoke = new Smoke(this.x, this.y, timeout=400, radius=this.radius/1.4, rspeed = 0.6);
            smoke.color = bullet.smokeColor;
            bullet.player.game.addObject(smoke);
          }
        }
      }
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      var self = this;
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1000));
    }
  }
}


// destroys walls
WreckingBall = function(tank){
  Weapon.call(this, tank);
  this.image = "res/img/wreckingBall.png";
  this.name = "WreckingBall";
  this.canShoot = true;
  this.fired = false;

  this.shoot = function(){
    if(this.canShoot && !this.fired){
      playSound("res/sound/gun.wav");
      var bullet = new Bullet(this);
      bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2.;
      bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
      bullet.radius = 10;
      bullet.color = "#000";
      bullet.speed = BulletSpeed/2;
      bullet.angle = this.tank.angle;
      bullet.timeout = 10000;
      bullet.checkCollision = function(x, y){
        var tile = this.map.getTileByPos(x, y);
        if(tile == -1)
          return;
        var wall = tile.getWall(this.x, this.y);
        // TODO: check if wall is outer wall! don't remove outer walls
        if(wall != -1){
          // is the wall an outer wall?
          if(typeof(tile.neighbors[wall]) == "undefined" || tile.neighbors[wall] == -1){
            playSound(this.bounceSound);
            // outer wall wall: handle accordingly
            if(wall == 1 || wall == 3){   // left or right
              this.angle *= -1;
              this.x = 2 * x - this.x
            }
            if(wall == 0 || wall == 2){   // top or bottom
              this.angle = Math.PI - this.angle;
              this.y = 2 * y - this.y
            }
          }else{
            // hit a wall: remove it!
            playSound("res/sound/grenade.wav");
            new Cloud(this.player.game, bullet.x, bullet.y, n=3);
            bullet.delete();
            tile.addWall(wall, true);
          }
        }
      }
      bullet.trace = true;
      bullet.leaveTrace = function(){
        if(Math.random() > 0.96){
          var smoke = new Smoke(this.x, this.y, timeout=800, radius=bullet.radius, rspeed = 0.6);
          smoke.color = "rgba(0,0,0,0.3)";
          bullet.player.game.addObject(smoke);
        }
      }
      this.tank.player.game.addObject(bullet);
      this.canShoot = false;
      this.fired = true;
      var self = this;
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1000));
    }
  }
}


// creates walls
SteelBeam = function(tank){
  Weapon.call(this, tank);
  this.name = "SteelBeam";
  this.image = "res/img/steelBeam.png";
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
      playSound("res/sound/gun.wav");
      var tile = this.tank.map.getTileByPos(this.tank.x, this.tank.y);
      var direction = this.tank.angle;
      while(direction < 0)
        direction += 2*Math.PI;
      var direction = Math.round(-direction / (Math.PI/2.) + 16) % 4;
      tile.addWall(direction);
      this.canShoot = false;
      var self = this;
      this.tank.player.game.timeouts.push(setTimeout(function(){
        if(self.tank.weapon==self)
          self.tank.defaultWeapon();
      }, 1000));
    }
  }
}
