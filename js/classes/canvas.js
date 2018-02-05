

// The canvas in which the game is drawn
Canvas = function(){

  // Initialize
  this.canvas = document.getElementById("gameFrame");
  this.context = canvas.getContext("2d");
  this.canvas.height = window.innerHeight;
  this.canvas.width = window.innerWidth;

  // Clear canvas and draw all objects
  this.draw = function(){
  	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for(var i=0; i<objs.length; i++)
      objs[i].draw(this.canvas, this.context);
  }

  // Keep canvas in sync with game: redraw every few milliseconds
  this.sync = function(){
    this.canvasIntvl = setInterval(function(){
      this.draw();
  	}, 40);
  }

  this.stopSync = function(){
  	if(typeof(canvasIntvl) != "undefined") clearInterval(canvasIntvl);
  }

}
