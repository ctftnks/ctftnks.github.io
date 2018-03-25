

Flag = function(gam, base){
  Object.call(this);
  this.type = "Flag";
  this.team = undefined;
  this.color = undefined;
  this.game = game;
  this.image = "";
  this.base = base;

  this.step = function(){
    // TODO: do not poll tile every time!
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for(var i=0; i<tile.objs.length; i++){
      var obj = tile.objs[i];
      if(obj.isTank && Math.pow(this.x-obj.x, 2) + Math.pow(this.y-obj.y, 2) < Math.pow(2*this.size, 2)){
        if(obj.player.team == this.team){
          // return flag to base
          this.base.hasFlag = true;
          // TODO: return sound
          playSound("res/sound/kill.wav");
        }else if(obj.hasFlag == false){
          // pick up flag
          obj.hasFlag = this;
          // TODO: get flag sound
          playSound("res/sound/kill.wav");
        }
      }
    }
  }
}


Base = function(game){
  Object.call(this);
  this.type = "Base";
  this.team = undefined;
  this.color = undefined;
  this.game = game;
  this.image = "";
  this.flag = new Flag(game, this);
  this.hasFlag = true;
  this.size = 20;
  this.x = undefined;
  this.y = undefined;

  this.draw = function(canvas, context){
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rect(-this.size/2, -this.size/2, this.size, this.size);
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  this.step = function(){
    // TODO: do not poll tile every time!
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for(var i=0; i<tile.objs.length; i++){
      var obj = tile.objs[i];
      if(obj.isTank && Math.pow(this.x-obj.x, 2) + Math.pow(this.y-obj.y, 2) < Math.pow(2*this.size, 2)){
        if(obj.player.team == this.team){
          if(obj.hasFlag != false){
            // score!
            this.game.mode.giveScore(obj.player);
            obj.hasFlag.base.hasFlag = true;
            obj.hasFlag = false;
            // TODO: score sound
            playSound("res/sound/kill.wav");
          }
        }else if(this.hasFlag && obj.hasFlag == false){
          // pick up flag
          obj.hasFlag = this.flag;
          this.hasFlag = false;
          // TODO: score get flag sound
          playSound("res/sound/kill.wav");
        }
      }
    }
  }
}
