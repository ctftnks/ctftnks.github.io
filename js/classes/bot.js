

Bot = function(player){
  Player.call(this);
  this.tank = new BotTank(this);
  this.isBot = true;
  this.keys = undefined;

  this.step = function(){
    // no key detection
  }
}

BotTank = function(player){
  Tank.call(this);
  this.goto = -1
  this.lastChecked = 0;

  this.step = function(){
    this.lastChecked -= GameFrequency;
    if(this.lastChecked > 500){
      // calculate path to next tank
      var tile = bullet.map.getTileByPos(this.x, this.y);
      // TODO: exclude self!
      var path = bullet.map.pathToTank([tile.id]);
      // set goto to coordinates of next path frame
      if(path.length > 1){
        this.goto = bullet.map.tiles[path[1]];
      }else{
        // if there is no next tile, don't move and fire a bullet
        if(tile.objs.length > 0)
          this.goto = bullet.map.tiles[path[0]];
          this.shoot();
      }
    }
    var distx = bullet.goto.x + bullet.goto.dx / 2. - bullet.x;
    var disty = bullet.goto.y + bullet.goto.dy / 2. - bullet.y;
    // var len = Math.sqrt(distx*distx+disty*disty);
    this.angle = Math.atan2(-distx, disty)+Math.PI;

    this.player.step();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

}
