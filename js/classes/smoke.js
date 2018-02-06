// a class for fancy smoke circles on the map
Smoke = function(x, y, timeout=300, radius=10, rspeed = 1){
  // inherit from Object class
  Object.call(this);
  // to be initialized
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = "rgba(40, 40, 40, 0.4)";
  this.rspeed = rspeed;
  // lifetime of the smoke in [ms]
  this.timeout = timeout;



  // draw the bullet in the canvas
  this.draw = function(canvas, context){
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
  }

  // timestepping: translation, aging, collision
  this.step = function(){
    // is bullet timed out?
    this.timeout -= GameFrequency;
    if(this.timeout < 0)
      this.delete();
    this.radius -= rspeed * GameFrequency / 40.;
    if(this.radius < 0) this.radius = 0;
  }
}

// make a whole cloud of smoke
Cloud = function(x, y, n=1, dr=10, timeout=1000, radius=10, rspeed=1){
  // TODO
}
