


Gun = function(tank){

  this.tank = tank;
  this.canShoot = true;

  this.shoot = function(){
    if(this.canShoot){
      bullet = new Bullet(this);
      bullet.x = this.tank.x;
      bullet.y = this.tank.y;
      bullet.radius = 5;
      bullet.speed = 10;
      bullet.timeout = 10;
      this.tank.player.game.addObject(bullet);      
    }
  }
}
