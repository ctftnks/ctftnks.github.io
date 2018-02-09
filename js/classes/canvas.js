
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
  this.scale = 1;

  // Clear canvas and draw all objects
  this.draw = function(){
  	this.context.clearRect(0, 0, this.canvas.width/this.scale, this.canvas.height/this.scale);
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

  // zoom into the canvas
  this.rescale = function(factor){
    this.scale = factor;
    this.context.setTransform(1, 0, 0, 1, 0, 0);    // reset
    this.context.scale(factor, factor);   // scale by new factor
  }

  this.shake = function(){
    var amp = 14;
    var speed = 25;
    var duration = 660;
    var self = this;
    var i = 0;
    var intvl = setInterval(function(){
      var randx = amp * (Math.random() - 0.5) * Math.exp(i * 250 / duration);
      var randy = amp * (Math.random() - 0.5) * Math.exp(i * 250 / duration);
      i -= 1;
      // self.context.translate(randx, randy);
      self.canvas.style.marginLeft = randx+"px";
      self.canvas.style.marginTop = randy+"px";
      setTimeout(function(){self.canvas.style.marginLeft = 0+"px";self.canvas.style.marginTop = 0+"px";}, speed);
    }, 2*speed);
    this.game.intvls.push(setTimeout(function(){clearInterval(intvl);}, duration));
  }

}
