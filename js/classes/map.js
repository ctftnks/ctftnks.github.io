


Map = function(){

  this.Nx = 16;
  this.Ny = 16;
  this.dy = undefined;
  this.dx = undefined;
  this.tiles = [];


  this.setSize = function(Lx, Ly){
    this.dx = Lx / this.Nx;
    this.dy = Ly / this.Ny;
    for(i=0; i<this.Nx; i++){
      for(j=0; j<this.Ny; j++){
        this.tiles.push(new Tile(i * this.dx, j * this.dy, this.dx, this.dy));
      }
    }
    // generate borders at walls
    for(i=0; i<this.Nx; i++){
      this.tiles[i*this.Ny].borders.top = true;
      this.tiles[i*this.Ny + this.Nx-1].borders.bottom = true;
    }
    for(j=0; j<this.Ny; j++){
      this.tiles[j].borders.left = true;
      this.tiles[(this.Nx-1)*this.Ny+j].borders.right = true;
    }
  }

  // TODO: draw map in separate canvas that does not need to be updated
  this.draw = function(canvas, context){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].draw(canvas, context);
  }

  this.getTileByPos = function(x, y){
    i = parseInt(x / this.dx);
    j = parseInt(y / this.dy);
    if(i < this.Nx && j < this.Ny && i >= 0 && j >= 0)
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

  this.isNeighbor = function(tile1, tile2){
    distx = Math.abs(tile1.x - tile2.x);
    disty = Math.abs(tile1.y - tile2.y);
    if(distx < 0.5 * this.dx && disty < 0.5 * this.dy)
      return false;
    return (distx < 1.5 * this.dx && disty < 0.5 * this.dy) || (distx < 0.5 * this.dx && disty < 1.5 * this.dy);
  }

  // this.getBorder = function(tile1, tile2){
  //   if(tile1 == -1 || tile2 == -1)
  //     return -1;
  //   if(!this.isNeighbor(tile1, tile2))
  //     return -1;
  //   distx = tile1.x - tile2.x;
  //   disty = tile1.y - tile2.y;
  //   if(distx > 0 && distx < 1.5 * this.dx && tile1.borders.left)
  //     return "left";
  //   if(distx < 0 && distx < 1.5 * this.dx && tile1.borders.right)
  //     return "right";
  //   if(disty > 0 && disty < 1.5 * this.dy && tile1.borders.top)
  //     return "top";
  //   if(disty < 0 && disty < 1.5 * this.dy && tile1.borders.bottom)
  //     return "bottom";
  //   return -1;
  // }

}


Tile = function(x, y, dx, dy){
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.objs = [];
  this.borders = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  this.draw = function(canvas, context){
    context.fillStyle = "#555";
    if(this.borders.left)
      context.fillRect(this.x, this.y, 1, this.dy);
    if(this.borders.right)
      context.fillRect(this.x+this.dx-1, this.y, 1, this.dy);
    if(this.borders.top)
      context.fillRect(this.x, this.y, this.dx, 1);
    if(this.borders.bottom)
      context.fillRect(this.x, this.y+this.dy-1, this.dx, 1);

  }

  this.getBorder = function(x, y){
    distx = this.x - x;
    disty = this.y - y;
    // borders to walls
    if(distx > 0 && this.borders.left)
      return "left";
    if(distx < -this.dx && this.borders.right)
      return "right";
    if(disty > 0 && this.borders.top)
      return "top";
    if(disty < -this.dy && this.borders.bottom)
      return "bottom";
    return -1;
  }
}
