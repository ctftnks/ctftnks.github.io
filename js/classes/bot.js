

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
  Tank.call(this, player);
  this.player = player;
  this.goto = -1;
  this.lastChecked = 0;

  this.checkWallCollision = function(){return false;}
  this.step = function(){
    this.lastChecked += GameFrequency;
    if(this.lastChecked > 400){
      this.lastChecked = 0;
      // calculate path to next tank (excluding self)
      var tile = this.map.getTileByPos(this.x, this.y);
      var self = this;
      var path = tile.pathTo(function(destination){
        for(var i=0; i<destination.objs.length; i++){
          if(destination.objs[i].isTank)
            return destination.objs[i].player.id != self.player.id;
        }
        return false;
      });

      if(path.length < 3){
        // if path is short enough: aim and fire a bullet
        this.goto = -1;
        var target = path[path.length-1].objs[0];
        var distx = target.x - this.x;
        var disty = target.y - this.y;
        this.angle = Math.atan2(-distx, disty)+Math.PI;
        this.shoot();
      }else{
        // else set goto to coordinates of next path frame
        this.goto = path[1];
      }
    }
    if(this.goto != -1 && typeof(this.goto) != "undefined"){
      var distx = this.goto.x + this.goto.dx / 2. - this.x;
      var disty = this.goto.y + this.goto.dy / 2. - this.y;

      // norm angles to interval [0, 2pi]
      var newangle = Math.atan2(-distx, disty)+Math.PI;
      while(newangle < 0)
        newangle += 2 * Math.PI;
      newangle = newangle % (2*Math.PI);
      while(this.angle < 0)
        this.angle += 2 * Math.PI;
      this.angle = this.angle % (2*Math.PI);
      // turn and move in correct direction
      if(Math.abs(this.angle - newangle)<0.6){
        this.move(1);
      }
      if(Math.abs(this.angle - newangle)<0.1){
        this.angle = newangle;
      } else if(this.angle < newangle) {
          if(Math.abs(this.angle - newangle)<Math.PI)
             this.turn(2);
          else this.turn(-2);
      } else {
          if(Math.abs(this.angle - newangle)<Math.PI)
             this.turn(-2);
          else this.turn(2);
      }
    }

    this.player.step();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

}
