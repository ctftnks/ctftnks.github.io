

// The canvas in which the game is drawn
Canvas = function(id){

  // Initialize
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext("2d");
  this.canvas.height = window.innerHeight;
  this.canvas.width = window.innerWidth;
  this.game = undefined;
  this.loop = undefined;

  // Clear canvas and draw all objects
  this.draw = function(){
    console.log("f")
  	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for(var i=0; i<objs.length; i++)
      this.game.objs[i].draw(this.canvas, this.context);
  }

  // Keep canvas in sync with game: redraw every few milliseconds
  this.sync = function(){
    this.loop = setInterval(function(){
      this.draw();
  	}, 40);
  }

  // Stop syncing of canvas
  this.stopSync = function(){
  	if(typeof(this.loop) != "undefined") clearInterval(this.loop);
  }

  // add a game to be drawn to the canvas
  this.setGame = function(game){
    this.game = game;
  }

}
