
// parent class for all objects
Object = function () {

  // every object can be deleted
  // the loop will then delete it from the game object list
  this.deleted = false;
  this.isBullet = false;
  this.isTank = false;
  this.isPowerUp = false;
  this.type = "Object";
  this.image = new Image;

  this.delete = function () {
    this.deleted = true;
  }

  // default draw function
  this.draw = function (canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

  this.step = function () { }
}
