// A class for tanks which act as the player character
// Recieves a player in its constructor
// contains position, angle, speed of the tank and provides methods to move it
// contains methods for collision detection with walls and bullets
// contains a weapon and a method to shoot it

Tank = function(player){
  Object.call(this);

  this.player = player;
  this.map = undefined;
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.width = 20;
  this.height = 30;
  this.weapon = new Gun(this);
  this.speed = TankSpeed;

  // draw the tank (rotated) on map
  this.draw = function(canvas, context){
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width/2, -this.height/2, this.width, this.height);
    context.fillStyle = this.player.color;
    context.fill();
    context.restore();
  }

  // let player class check for key presses and move tank
  // check for collisions and handle them
  this.step = function(){
    var oldx = this.x;
    var oldy = this.y;
    var oldangle = this.angle;
    this.player.step();
    this.checkBulletCollision();
    if(this.checkWallCollision()){
      this.x = oldx;
      this.y = oldy;
      this.angle = oldangle;
    }
  }

  // move the tank forward/backwards
  this.move = function(direction){
    this.x -= direction * this.speed * Math.sin(-this.angle) * GameFrequency / 1000.;
    this.y -= direction * this.speed * Math.cos(-this.angle) * GameFrequency / 1000.;
  }

  // rotate the tank
  this.turn = function(direction){
    this.angle += direction * TankTurnSpeed * GameFrequency / 1000.;
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
    distx = this.x - x;
    disty = this.y - y;
    // TODO: find a better algorithm, tank is currently approximated as a circle
    return Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2)) < 0.5 * (this.width + this.height)
  }

  // check for collision of the walls:
  // checks if there is a wall between the center of the tank and each corner
  this.checkWallCollision = function(){
    tile = this.map.getTileByPos(this.x, this.y);
    if(tile == -1)
      return;
    corners = this.corners();
    for(i=0; i<corners.length; i++){
      // TODO: check if there are walls between each corner
      // instead of corner and center --> better detection
      wall = tile.getWall(corners[i].x, corners[i].y);
      if(wall != -1)
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
    bullets = [];
    corners = this.corners();
    for(m=0; m<4; m++){
      tile = this.map.getTileByPos(corners[m].x, corners[m].y);
      for(j=0; j<tile.objs.length; j++){
        if(tile.objs[j].isBullet && tile.objs[j].age > 0)
          bullets.push(tile.objs[j]);
      }
    }
    // for each bullet in the list, check if it intersects the tank
    for(i=0; i<bullets.length; i++){
      if(this.intersects(bullets[i].x, bullets[i].y)){
        // Hit! kill the player, delete the tank and bullet
        bullets[i].delete();
        this.delete();
        this.player.kill();
        // increment score of the shooter
        if(this.player.name == bullets[i].player.name)
          bullets[i].player.score -= 1;
        else
          bullets[i].player.score += 1;
        // fancy explosion cloud
        new Cloud(this.player.game, this.x, this.y);
      }
    }
  }
}
