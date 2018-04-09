

NBots = 0;

Bot = function(player){
  Player.call(this);
  this.name = "Bot " + (NBots+1);
  this.tank = new BotTank(this);
  this.isBot = true;
  this.keys = undefined;
  NBots++;

  this.step = function(){
    // no key detection
  }
}

BotTank = function(player){
  Tank.call(this, player);
  this.player = player;
  this.goto = -1;
  this.lastChecked = 0;
  this.path = undefined;
  this.isFleeing = false;

  this.checkWallCollision = function(){return false;}
  this.step = function(){
    this.lastChecked += GameFrequency;
    if(this.lastChecked > 380/BotSpeed){
      this.lastChecked = 0;
      // calculate path to next tank (excluding self)
      var tile = this.map.getTileByPos(this.x, this.y);
      var self = this;
      var path = tile.pathTo(function(destination){
        for(var i=0; i<destination.objs.length; i++){
          if(destination.objs[i].isTank && (BotsShootBots || !destination.objs[i].player.isBot))
            return destination.objs[i].player.team != self.player.team;
        }
        return false;
      });
      var dontShoot = false;

      // extra rule for Capture The Flag
      if(GameMode == "CTF"){
        var flagPath = tile.pathTo(function(destination){
          for(var i=0; i<destination.objs.length; i++){
            // if I have no flag: search for enemy flag
            if(self.carriedFlag == -1 && destination.objs[i].type == "Flag" && destination.objs[i].team != self.player.team)
              return true;
            // if I have a flag and own flag is at own base: return to base
            if(self.carriedFlag != -1 && destination.objs[i].type == "Base" && destination.objs[i].hasFlag && destination.objs[i].team == self.player.team)
              return true;
          }
          // if own flag is not in own base: search it
          if(typeof(self.player.base) !== "undefined" && !self.player.base.hasFlag)
            for(var i=0; i<destination.objs.length; i++){
              if(destination.objs[i].type == "Flag" && destination.objs[i].team == self.player.team)
                return true;
              if(destination.objs[i].type == "Tank" && destination.objs[i].carriedFlag != -1 && destination.objs[i].carriedFlag.team == self.player.team)
                return true;
            }
          return false;
        });
        if(path == -1 || typeof(path) === "undefined" || path.length > 4 || !this.weapon.canShoot || (this.carriedFlag != -1 && path.length > 3)){
          if(flagPath != -1 && typeof(flagPath) !== "undefined"){
            dontShoot = true;
            for(var k=0; k<flagPath[flagPath.length-1].objs.length; k++)
	           if(flagPath[flagPath.length-1].objs[k].type == "Flag")
               flagPath.push({objs: {}, x: flagPath[flagPath.length-1].objs[k].x, y: flagPath[flagPath.length-1].objs[k].y, dx: 0, dy: 0});
            path = flagPath;
          }
        }
      }
      this.path = path;

      var sdist = 3;
      if(this.weapon.name == "Laser")
        sdist = 5;
      if(this.weapon.name == "Guided")
        sdist = 5;
      if(this.weapon.name == "Guided")
        sdist = 5;
      if(Math.random() > 0.6)
        sdist+=1;


      // get reverse path to flee
      if(this.isFleeing && GameMode != "CTF")
        this.flee();

      if(path.length < sdist && !dontShoot){
        // if path is short enough: aim and fire a bullet
        this.goto = -1;
        var target = path[path.length-1].objs[0];
        if(typeof(target)!="undefined"){
          var distx = target.x - this.x;
          var disty = target.y - this.y;
        }else{
          var distx = 0;
          var disty = 0;
        }
        var weapon = this.weapon.name;
        this.angle = Math.atan2(-distx, disty)+Math.PI;

        this.shoot();
        this.player.stats.shots += 1;
        if(weapon == "Guided"){
          this.fleeFor(3500);
        } else if(weapon == "Grenade"){
          this.fleeFor(4500);
          var self = this;
          this.player.game.timeouts.push(setTimeout(function(){
            self.shoot();
          }, 4000));
        } else {
          this.fleeFor(1000);
        }
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
      if(Math.abs(this.angle - newangle)<0.6 || Math.abs(Math.abs(this.angle - newangle) - Math.PI*2)<0.6){
        this.move(1*BotSpeed);
      }
      if(Math.abs(this.angle - newangle)<0.1){
        this.angle = newangle;
      } else if(this.angle < newangle) {
          if(Math.abs(this.angle - newangle)<Math.PI)
             this.turn(2*BotSpeed);
          else this.turn(-2*BotSpeed);
      } else {
          if(Math.abs(this.angle - newangle)<Math.PI)
             this.turn(-2*BotSpeed);
          else this.turn(2*BotSpeed);
      }
    }

    this.player.step();
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

  // flee instead of going to the next tank
  this.flee = function(){
    if(this.path.length > 1){
      var currentTile = this.path[0];
      var nextTile = this.path[1];
      var nn = -1;
      var currentDirection = -1;
      for(var i=0; i<4; i++)
        if(currentTile.neighbors[i].id == nextTile.id)
          currentDirection = i
      var reverseDirection = currentDirection + 2;
      this.path[1] = this.path[0];
      for(var i=reverseDirection; i<reverseDirection+4; i++)
        if(!currentTile.walls[i%4] && currentTile.neighbors[i%4].id != nextTile.id)
          this.path[1] = currentTile.neighbors[i%4];
    }
  }

  // flee for a time of <time> ms
  this.fleeFor = function(time){
    if(!this.isFleeing){
      var self = this;
      this.player.game.timeouts.push(setTimeout(function(){
        self.isFleeing = false;
      }, time));
      this.isFleeing = true;
    }
  }


}
