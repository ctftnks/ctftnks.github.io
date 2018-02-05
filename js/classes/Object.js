
Object = function(){

  this.deleted = false;

  this.delete = function(){
    this.deleted = true;
    this.weapon.canShoot = true;
  }

}
