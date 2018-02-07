// a class for fancy smoke circles on the map
Smoke = function(x, y, timeout=300, radius=10, rspeed = 1){
  // inherit from Object class
  Object.call(this);
  // to be initialized
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = "rgba(40, 40, 40, 0.3)";
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
Cloud = function(game, x, y, n=4, radius=20, rspeed=0.3, color=-1){
  for(var i=0; i<n; i++){
    var rx = x + radius * 2 * (Math.random() - 0.5);
    var ry = y + radius * 2 * (Math.random() - 0.5);
    var rr = radius + radius * (Math.random() - 0.5)
    var smoke = new Smoke(rx, ry, 2000, radius, rspeed);
    if(color != -1)
      smoke.color = color;
    game.addObject(smoke);
  }
}
