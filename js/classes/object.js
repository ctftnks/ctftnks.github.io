
// parent class for all objects
Object = function(){

  // every object can be deleted
  // the loop will then delete it from the game object list
  this.deleted = false;
  this.isBullet = false;

  this.delete = function(){
    this.deleted = true;
  }

}
