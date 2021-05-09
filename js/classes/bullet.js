// a parent class for all bullets flying through the map
// contains position, ang,e speed, timeout and parent weapon
// provides collision detection with the walls
// Tank-Bullet-collision detection is implemented in the tank class
// as it needs less checks this way


Bullet = function (weapon) {
  // inherit from Object class
  Object.call(this);
  this.isBullet = true;
  this.image = "";
  // parent objects
  this.player = weapon.tank.player;
  this.map = this.player.game.map;
  this.weapon = weapon;
  // to be initialized by weapon when shot
  this.x = undefined;
  this.y = undefined;
  this.angle = undefined;
  this.radius = 4;
  this.speed = BulletSpeed;
  this.color = "#000";
  // lifetime of the bullet in [ms]
  this.timeout = BulletTimeout * 1000;
  // bullet age starts at negative value, so it doesn't instantly kill the shooter
  this.age = -0;
  // shall the bullet leave a trace of smoke?
  this.trace = false;
  this.bounceSound = "res/sound/bounce.wav";
  this.lethal = true;
  // hitbox enlargement of the bullet
  this.extrahitbox = 0;

  // draw the bullet in the canvas
  this.draw = function (canvas, context) {
    if (this.image == "") {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
    } else {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, -this.radius * 5 / 2, -this.radius * 5 / 2, this.radius * 5, this.radius * 5);
      context.restore();
    }
  }

  // timestepping: translation, aging, collision
  this.step = function () {
    // is bullet timed out?
    this.age += GameFrequency;
    if (this.age > this.timeout)
      this.delete();
    // leave a trace of smoke
    if (this.trace)
      this.leaveTrace();
    // translate
    var oldx = this.x;
    var oldy = this.y;
    this.x -= this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
    // check for wall collisions
    this.checkCollision(oldx, oldy);
    if (BulletsCanCollide)
      this.checkBulletCollision();
  }

  // check for collision with walls, handle them
  // tests whether last timestep put the bullet in a new tile
  // and if old and new tile are separated by a wall
  this.checkCollision = function (oldx, oldy) {
    var tile = this.map.getTileByPos(oldx, oldy);
    if (tile == -1)
      return;
    var walls = tile.getWalls(this.x, this.y);
    // check if there is any wall, otherwise return
    var nwalls = walls.filter(w => w).length
    if (nwalls == 0)
      return;
    // there seems to be a wall: handle accordingly
    playSound(this.bounceSound);
    // check if there is two walls at once
    if (nwalls == 2){
      // invert direction
      this.angle += Math.PI;
      this.x = oldx;
      this.y = oldy;
    }
    // otherwise there is only one wall
    else if (walls[1] || walls[3]) {   // left or right
      this.angle *= -1;
      this.x = 2 * oldx - this.x
    }
    else if (walls[0] || walls[2]) {   // top or bottom
      this.angle = Math.PI - this.angle;
      this.y = 2 * oldy - this.y
    }
  }


  this.checkBulletCollision = function () {
    // create a list of bullets that may hit this one by looking
    // at the object lists of the tiles of the tanks corners
    var bullets = [];
    var tile = this.map.getTileByPos(this.x, this.y);
    if (tile != -1) {
      for (var j = 0; j < tile.objs.length; j++) {
        if (tile.objs[j].isBullet && tile.objs[j].age > 0 && tile.objs[j] != this)
          bullets.push(tile.objs[j]);
      }
    }
    // for each bullet in the list, check if it intersects this one
    for (var i = 0; i < bullets.length; i++) {
      var rad = 0.65 * this.radius + 0.65 * bullets[i].radius + this.extrahitbox;
      if (Math.sqrt(Math.pow(bullets[i].x - this.x, 2) + Math.pow(bullets[i].y - this.y, 2)) <= rad) {
        if (!bullets[i].lethal)
          return;
        // Hit!
        bullets[i].delete();
        new Cloud(this.player.game, this.x, this.y, n = 1);
        playSound("res/sound/original/gun.mp3");
        this.delete();
        return;
      }
    }
  }

  // leave a trace of smoke
  this.leaveTrace = function () {
    this.player.game.addObject(new Smoke(this.x, this.y, timeout = 300, radius = this.radius, rspeed = 1));
  }

  // delete bullet from map
  this.delete = function () {
    this.deleted = true;
  }

}
