// parent class for all objects
class GameObject {
  constructor() {
    // every object can be deleted
    // the loop will then delete it from the game object list
    this.deleted = false;
    this.isBullet = false;
    this.isTank = false;
    this.isPowerUp = false;
    this.type = "Object";
    this.image = new Image();
  }

  delete() {
    this.deleted = true;
  }

  // default draw function
  draw(canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }

  step() {}
}