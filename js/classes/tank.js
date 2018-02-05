


Tank = function(player){

  this.player = player;
  this.x = 0;
  this.y = 0;
  this.angle = 0;

  this.setPosition = function(x, y){
    this.x = 0;
    this.y = 0;
  }

  this.draw = function(canvas, context){
    context.fillStyle = "rgba("+monitorAromas[n].r+", "+monitorAromas[n].g+", "+monitorAromas[n].b+", "+val+")";
    context.fillRect(i*antAroma.resolution, j*antAroma.resolution, antAroma.resolution, antAroma.resolution);
  }

}
