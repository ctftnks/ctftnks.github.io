// A class for tanks which act as the player character
// Recieves a player in its constructor
// contains position, angle, speed of the tank and provides methods to move it
// contains methods for collision detection with walls and bullets
// contains a weapon and a method to shoot it

Tank = function(player){
  Object.call(this);

  this.player = player;
  this.color = this.player.color;
  this.map = undefined;
  this.x = 0;
  this.y = 0;
  this.angle = 2 * Math.PI * Math.random();
  this.width = TankWidth;
  this.height = TankHeight;
  this.weapon = new Gun(this);
  this.speed = TankSpeed;
  this.isTank = true;
  this.type = "Tank";
  this.invincible = false;
  this.carriedFlag = -1;

  // draw the tank (rotated) on map
  this.draw = function(canvas, context){
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width/2, -this.height/2, this.width, this.height);
    context.fillStyle = this.player.color;
    context.fill();
    context.beginPath();
    if(!this.player.isBot){
      context.fillStyle = "rgba(0, 0, 0, 0.15)";
      context.rect(-this.width/2, -this.height/2, this.width/5, this.height);
      context.rect(this.width/2-this.width/5, -this.height/2, this.width/5, this.height);
      context.fill();
    }
    if(this.carriedFlag != -1){
      context.beginPath();
      context.fillStyle = this.carriedFlag.color;
      context.rect(-this.carriedFlag.size/2, -this.carriedFlag.size/2, this.carriedFlag.size/1.1, this.carriedFlag.size/2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#000";
      context.rect(-this.carriedFlag.size/2, -this.carriedFlag.size/2, this.carriedFlag.size/6, this.carriedFlag.size*1.1);
      context.fill();
    }
    else if(this.weapon.image != ""){
      context.drawImage(this.weapon.image, -this.width / 2, -this.width / 2, this.width, this.width);
    }
    context.restore();
  }

  // let player class check for key presses and move tank
  // check for collisions and handle them
  this.step = function(){
    this.player.step();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

  // move the tank forward/backwards
  this.move = function(direction){
    var oldx = this.x;
    var oldy = this.y;
    this.x -= direction * this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= direction * this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
    if(this.invincible){
      if(this.x < 0 || this.y < 0 || this.x > this.map.Nx * this.map.dx || this.y > this.map.Ny * this.map.dy){
        this.x = oldx;
        this.y = oldy;
      }
      return;
    }
    if(this.checkWallCollision()){
      this.x = oldx;
      this.y = oldy;
    }
  }

  // rotate the tank
  this.turn = function(direction){
    var oldangle = this.angle;
    this.angle += direction * TankTurnSpeed * GameFrequency / 1000.;
    // if(!this.invincible && this.checkWallCollision())
    if(this.checkWallCollision())
      this.angle = oldangle;
  }

  // use the weapon
  this.shoot = function(){
      this.weapon.shoot();
  }

  // return to the default weapon
  this.defaultWeapon = function(){
    this.weapon = new Gun(this);
  }

  // get x,y-coordinates of the tanks corners
  // needed for collision detection and weapon firing
  this.corners = function(){
      return [
        {
          x: this.x - (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
          y: this.y + (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x + (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
          y: this.y - (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x - (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
          y: this.y + (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle)
        },
        {
          x: this.x + (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
          y: this.y - (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle)
        }
      ];
  }

  // does the tank intersect with a point?
  this.intersects = function(x, y){
    // center
    var distx = this.x - x;
    var disty = this.y - y;
    // TODO: find a better algorithm, tank is currently approximated as a circle
    // anyways, approximation seems to suffice for gameplay
    return Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2)) < 0.5 * (this.height)
  }

  // check for collision of the walls:
  // checks if there is a wall between the center of the tank and each corner
  this.checkWallCollision = function(){
    var tile = this.map.getTileByPos(this.x, this.y);
    var corners = this.corners();
    for(var i=0; i<corners.length; i++){
      if(tile.getWall(corners[i].x, corners[i].y) != -1)
        return true;
    }
    return false;
  }

  // check for collision with a bullet
  // uses spatial sorting of the map class
  // only checks thos bullets that lie within the tiles of the corners
  this.checkBulletCollision = function(){
    // create a list of bullets that may hit the tank by looking
    // at the object lists of the tiles of the tanks corners
    var bullets = [];
    var powerups = [];
    var corners = this.corners();
    for(var m=0; m<4; m++){
      var tile = this.map.getTileByPos(corners[m].x, corners[m].y);
      if(tile != -1){
        for(var j=0; j<tile.objs.length; j++){
          if(tile.objs[j].isBullet && tile.objs[j].age > 0)
          bullets.push(tile.objs[j]);
          if(tile.objs[j].isPowerUp)
          powerups.push(tile.objs[j]);
        }
      }
    }
    // for each bullet in the list, check if it intersects the tank
    for(var i=0; i<bullets.length; i++){
      if(this.intersects(bullets[i].x, bullets[i].y)){
        // Friendly fire?
        if(!FriendlyFire && (this.player.team == bullets[i].player.team && this.player.id != bullets[i].player.id))
          return;
        // Hit!
        bullets[i].delete();
        if(this.invincible)
          return;
        // fancy explosion cloud
        new Cloud(this.player.game, this.x, this.y, n=6);
        // let gamemode handle scoring
        this.player.game.mode.newKill(bullets[i].player, this.player);
        // CTF: if tank has flag, drop it
        if(this.carriedFlag != -1)
          this.carriedFlag.drop(this.x, this.y);
        // kill the player, delete the tank and bullet
        playSound("res/sound/kill.wav");
        bullets[i].delete();
        this.delete();
        this.player.kill();
        return;
      }
    }
    for(var i=0; i<powerups.length; i++){
      if(this.intersects(powerups[i].x, powerups[i].y)){
        powerups[i].apply(this);
        powerups[i].delete();
      }
    }
  }
}
