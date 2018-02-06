// a parent class for all bullets flying through the map
// contains position, ang,e speed, timeout and parent weapon
// provides collision detection with the walls
// Tank-Bullet-collision detection is implemented in the tank class
// as it needs less checks this way


Bullet = function(weapon){
  // inherit from Object class
  Object.call(this);
  this.isBullet = true;
  // parent objects
  this.player = weapon.tank.player;
  this.map = this.player.game.map;
  this.weapon = weapon;
  // to be initialized by weapon when shot
  this.x = undefined;
  this.y = undefined;
  this.angle = undefined;
  this.radius = 5;
  this.speed = BulletSpeed;
  this.color = "#000";
  // lifetime of the bullet in [ms]
  this.timeout = 5000;
  // bullet age starts at negative value, so it doesn't instantly kill the shooter
  this.age = -300;
  // shall the bullet leave a trace of smoke?
  this.trace = false;
  this.bounceSound = "res/sound/bounce.wav";

  // draw the bullet in the canvas
  this.draw = function(canvas, context){
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
  }

  // timestepping: translation, aging, collision
  this.step = function(){
    // is bullet timed out?
    this.age += GameFrequency;
    if(this.age > this.timeout)
      this.delete();
    // leave a trace of smoke
    if(this.trace)
      this.leaveTrace();
    // translate
    var oldx = this.x;
    var oldy = this.y;
    this.x -= this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
    // check for wall collisions
    this.checkCollision(oldx, oldy);
  }

  // check for collision with walls, handle them
  // tests whether last timestep put the bullet in a new tile
  // and if old and new tile are separated by a wall
  this.checkCollision = function(oldx, oldy){
    var tile = this.map.getTileByPos(oldx, oldy);
    if(tile == -1)
      return;
    var wall = tile.getWall(this.x, this.y);
    if(wall != -1){
      playSound(this.bounceSound);
      // there seems to be a wall: handle accordingly
      if(wall == "left" || wall == "right"){
        this.angle *= -1;
        this.x = 2*oldx - this.x
      }
      if(wall == "top" || wall == "bottom"){
        this.angle = Math.PI - this.angle;
        this.y = 2*oldy - this.y
      }
    }
  }

  // leave a trace of smoke
  this.leaveTrace = function(){
    this.player.game.addObject(new Smoke(this.x, this.y, timeout=300, radius=this.radius, rspeed = 1));
  }

  // delete bullet from map, weapon may shoot again
  this.delete = function(){
    this.deleted = true;
    this.weapon.canShoot = true;
  }

}
