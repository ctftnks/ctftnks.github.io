
// A class for the canvas in which the game is drawn
// binds HTML element and handles its size
// provides loop to keep the frame in sync with the game

Canvas = function(id){

  // initialize: get HTML element
  this.canvas = document.getElementById(id);
  this.context = this.canvas.getContext("2d");
  this.canvas.height = this.canvas.clientHeight;
  this.height = this.canvas.clientHeight;
  this.canvas.width = this.canvas.clientWidth;
  this.width = this.canvas.clientWidth;
  this.game = undefined;
  this.loop = undefined;

  // Clear canvas and draw all objects
  this.draw = function(){
  	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.game.map.draw(this.canvas, this.context);
    for(var i=0; i<this.game.objs.length; i++)
      this.game.objs[i].draw(this.canvas, this.context);
  }

  // Keep canvas in sync with game: redraw every few milliseconds
  this.sync = function(){
    if(typeof(this.loop) == "undefined"){
      var self = this;
      this.loop = setInterval(function(){
        self.draw();
      }, FrameFrequency);
    }
  }

  // Stop syncing of canvas
  this.stopSync = function(){
  	if(typeof(this.loop) != "undefined") clearInterval(this.loop);
  }

}
