

Flag = function(gam, base){
  Object.call(this);
  this.type = "Flag";
  this.game = game;
  this.image = "";
  this.base = base;
  this.team = base.team;
  this.color = base.color;
  this.size = 24;
  this.x = base.x;
  this.y = base.y;

  // return flag to base
  this.reset = function(){
    this.base.hasFlag = true;
    this.drop(this.base.x, this.base.y);
  }
  // let tank pick up the flag
  this.pickup = function(tank){
    tank.hasFlag = this;
    this.base.hasFlag = false;
    this.delete();
  }
  this.drop = function(x, y){
    this.deleted = false;
    this.x = x;
    this.y = y;
    this.game.objs.push(this);
  }

  this.step = function(){
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for(var i=0; i<tile.objs.length; i++){
      var tank = tile.objs[i];
      if(tank.isTank && Math.pow(this.x-tank.x, 2) + Math.pow(this.y-tank.y, 2) < Math.pow(2*this.size, 2)){
        if(tank.player.team == this.team){
          if(!this.base.hasFlag){
            // return flag to base
            this.reset();
            // TODO: add return sound
            playSound("res/sound/kill.wav");
          }
        }else if(tank.hasFlag == false){
          // pick up flag
          this.pickup(tank);
          // TODO: add pickup sound
          playSound("res/sound/kill.wav");
        }
      }
    }
  }

  this.draw = function(canvas, context){
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.fillStyle = this.base.color;
    context.rect(-this.size/2, -this.size/2, this.size/1.1, this.size/2);
    context.fill();
    context.beginPath();
    context.fillStyle = "#000";
    context.rect(-this.size/2, -this.size/2, this.size/6, this.size*1.1);
    context.fill();
    context.restore();
  }
}


Base = function(game, player, x, y){
  Object.call(this);
  this.type = "Base";
  this.team = player.team;
  this.color = player.color;
  this.game = game;
  this.image = "";
  this.x = x;
  this.y = y;
  this.flag = new Flag(game, this);
  this.flag.drop(x, y);
  this.hasFlag = true;
  this.size = 80;
  this.tile = -1;

  this.draw = function(canvas, context){
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;
    context.rect(-this.size/2, -this.size/2, 8, this.size);
    context.rect(-this.size/2, -this.size/2, this.size, 8);
    context.rect(this.size/2, this.size/2, -8, -this.size);
    context.rect(this.size/2, this.size/2, -this.size, -8);
    context.fill();
    context.restore();
  }

  this.step = function(){
    if(this.tile == -1)
      this.tile = this.game.map.getTileByPos(this.x, this.y);
    for(var i=0; i<this.tile.objs.length; i++){
      var tank = this.tile.objs[i];
      if(tank.isTank && tank.player.team == this.team && Math.pow(this.x-tank.x, 2) + Math.pow(this.y-tank.y, 2) < Math.pow(2*this.size, 2)){
        if(tank.hasFlag != false && this.hasFlag){
          // score!
          this.game.mode.giveScore(tank.player);
          // TODO: add score sound
          playSound("res/sound/kill.wav");
          tank.hasFlag.reset();
          tank.hasFlag = false;
        }
      }
    }
  }
}
