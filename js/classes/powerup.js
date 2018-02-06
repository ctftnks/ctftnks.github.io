

// a parent class for powerups


PowerUp = function(){
  Object.call(this);
  this.isPowerUp = true;
  this.image = "";
  this.width = 20;
  this.x = undefined;
  this.y = undefined;

  this.apply = function(tank){

  }

  this.step = function(){}

  this.draw = function(canvas, context){
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.fillStyle = "#00F";
    context.arc(0, 0, 5, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
    // context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

}


LaserBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/LaserBonus.png";
  this.apply = function(tank){
    tank.weapon = new Laser();
  }
}
MGBonus = function(){
  PowerUp.call(this);
  this.image = "res/img/MGBonus.png";
  this.apply = function(tank){
    tank.weapon = new MG();
  }
}


function getRandomPowerUp(){
  var powerups = [new LaserBonus(), new MGBonus()];
  var len = powerups.length;
  return powerups[Math.floor(Math.random() * len)];
}
