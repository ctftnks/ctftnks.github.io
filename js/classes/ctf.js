

Flag = function(gam, base){
  Object.call(this);
  this.type = "Flag";
  this.team = undefined;
  this.color = undefined;
  this.game = game;
  this.image = "";
  this.base = base;
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
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for(var i=0; i<tile.objs.length; i++){
      var obj = tile.objs[i];
      if(obj.isTank){
        if(obj.player.team == this.team){
          if(obj.hasFlag != false){
            // score!
            this.game.mode.giveScore(obj.player);
            obj.hasFlag.base.hasFlag = true;
            obj.hasFlag = false;
            // TODO: score sound
            playSound("res/sound/kill.wav");
          }
        }else if(this.hasFlag){
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
