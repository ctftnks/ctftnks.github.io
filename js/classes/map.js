


Map = function(){

  this.Nx = 16;
  this.Ny = 16;
  this.dy = undefined;
  this.dx = undefined;
  this.tiles = [];

  for(i=0; i<this.Nx; i++){
    for(j=0; j<this.Ny; j++){
      this.tiles.push(new Tile(i * this.dx, j * this.dy));
    }
  }

  this.setSize = function(Lx, Ly){
    this.dx = Lx / this.Nx;
    this.dy = Ly / this.Ny;
  }

  // TODO: draw map in separate canvas that does not need to be updated
  this.draw = function(){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].draw();
  }

  this.getTileByPos = function(x, y){
    i = parseInt(x / this.dx);
    j = parseInt(y / this.dy);
    if(i < this.Nx && j < this.Ny)
      return this.tiles[i * this.Ny + j];
    else
      return -1;
  }

  this.clearObjectLists = function(){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].objs = [];
  }

  this.addObject = function(obj){
    tile = this.getTileByPos(obj.x, obj.y);
    if(tile == -1)
      obj.delete();
    else
      tile.objs.push(obj);
  }

}


Tile = function(x, y){
  this.x = x;
  this.y = y;
  this.objs = [];
  this.borders = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  this.draw = function(){
    if(this.borders.left){

    }
  }
}
