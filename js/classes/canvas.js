

// The canvas in which the game is drawn
Canvas = function(id){

  // Initialize
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext("2d");
  this.canvas.height = this.canvas.clientHeight;
  this.canvas.width = this.canvas.clientWidth;
  console.log(this.canvas.width);
  console.log(this.canvas.height);
  this.game = undefined;
  this.loop = undefined;

  // Clear canvas and draw all objects
  this.draw = function(){
  	this.context.clearRect(0, 0, this.width, this.height);
    for(var i=0; i<this.game.objs.length; i++)
      this.game.objs[i].draw(this.canvas, this.context);
  }

  // Keep canvas in sync with game: redraw every few milliseconds
  this.sync = function(){
    if(typeof(this.loop) == "undefined"){
      var self = this;
      this.loop = setInterval(function(){
        self.draw();
      }, 40);
    }
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
