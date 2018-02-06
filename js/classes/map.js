


Map = function(canvas){

  this.Nx = 16;
  this.Ny = 16;
  this.dx = canvas.width / this.Nx;
  this.dy = canvas.height / this.Ny;
  this.tiles = [];
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
  // generate some random walls
  for(i=0; i<this.Nx; i++){
    for(j=0; j<this.Ny-1; j++){
      if(Math.random() < WallProbability / 2){
        this.tiles[i*this.Ny+j].borders.bottom = true;
        this.tiles[i*this.Ny+j+1].borders.top = true;
      }
    }
  }
  for(i=0; i<this.Nx-1; i++){
    for(j=0; j<this.Ny; j++){
      if(Math.random() < WallProbability / 2){
        this.tiles[i*this.Ny+j].borders.right = true;
        this.tiles[(i+1)*this.Ny+j].borders.left = true;
      }
    }
  }

  this.getTileByPos = function(x, y){
    i = parseInt(x / this.dx);
    j = parseInt(y / this.dy);
    if(i < this.Nx && j < this.Ny && i >= 0 && j >= 0)
      return this.tiles[i * this.Ny + j];
    else
      return -1;
  }

  this.getNeighbor = function(tile1, dx, dy){
    console.log("qq");
    return this.getTileByPos(tile1.x+this.dx*dx, tile1.y+this.dy*dy);
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

  this.spawnPoint = function(){
    rInt = parseInt(Math.random() * (this.Nx * this.Ny - 1));
    tile = this.tiles[rInt];
    return {x: tile.x + this.dx / 2, y: tile.y + this.dy / 2};
  }

  // TODO: draw map in separate canvas that does not need to be updated
  this.draw = function(canvas, context){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].draw(canvas, context);
  }



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
    top: false,
    bottom: false
  };

  this.draw = function(canvas, context){
    context.fillStyle = "#555";
    if(this.borders.left)
      context.fillRect(this.x-1, this.y, 2, this.dy);
    if(this.borders.right)
      context.fillRect(this.x-1+this.dx, this.y, 2, this.dy);
    if(this.borders.top)
      context.fillRect(this.x, this.y-1, this.dx, 2);
    if(this.borders.bottom)
      context.fillRect(this.x, this.y-1+this.dy, this.dx, 2);

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
