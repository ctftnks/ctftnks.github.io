

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

      if(path.length < 4){
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
      // TODO: make angle gradually converge to new angle
      this.angle = Math.atan2(-distx, disty)+Math.PI;
      // if((((this.angle/(Math.PI*2)) % 1) + 1) % 1 < (Math.atan2(-distx, disty)+Math.PI)/(Math.PI*2)){
      // if((((this.angle/(Math.PI*2)) % 1) + 1) % 1 < ((((Math.atan2(-distx, disty)+Math.PI)/(Math.PI*2)) % 1) + 1) % 1){
      //   this.turn(1);
      //   this.turn(1);
      // }else{
      //   this.turn(-1);
      //   this.turn(-1);
      // }
      var oldx = this.x;
      var oldy = this.y;
      this.move(1);
      // stuck?
      if(this.x == oldx && this.y == oldy){
        this.angle += 0.1;
        this.move(-1);
        this.move(-1);
        this.move(-1);
        this.move(-1);
      }

    }else{
      // this.angle = 0;
    }

    this.player.step();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

}
