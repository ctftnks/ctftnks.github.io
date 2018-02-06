// A class for the Map,
// discretized in Nx * Ny tiles, which can be separated by walls (walls)
// also the tiles keep object lists for spatial sorting
// the canvas is passed to the constructor to provide the size of the canvas

Map = function(canvas){

  this.Nx = 16;
  this.Ny = 16;
  this.dx = canvas.width / this.Nx;
  this.dy = canvas.height / this.Ny;
  this.tiles = [];

  // get tile by i,j-index
  this.getTileByIndex = function(i, j){
    if(i < this.Nx && j < this.Ny && i >= 0 && j >= 0)
      return this.tiles[i * this.Ny + j];
    return -1;
  }

  // get tile by x,y-position
  this.getTileByPos = function(x, y){
    i = parseInt(x / this.dx);
    j = parseInt(y / this.dy);
    return this.getTileByIndex(i, j);
  }

  // get tile relative to tile1 shifted by dx,dy steps
  this.getNeighbor = function(tile1, dx, dy){
    console.log("qq");
    return this.getTileByPos(tile1.x+this.dx*dx, tile1.y+this.dy*dy);
  }

  // spatial sorting: clear tile object lists
  this.clearObjectLists = function(){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].objs = [];
  }

  // spatial sorting: add object to corresponding tile list
  this.addObject = function(obj){
    tile = this.getTileByPos(obj.x, obj.y);
    if(tile == -1)
      obj.delete();
    else
      tile.objs.push(obj);
  }

  // return a random free spawn point
  this.spawnPoint = function(){
    rInt = parseInt(Math.random() * (this.Nx * this.Ny - 1));
    tile = this.tiles[rInt];
    // TODO: check if tile.objs.length == 0
    return {x: tile.x + this.dx / 2, y: tile.y + this.dy / 2};
  }

  // draw the map
  // TODO: draw map in separate canvas that does not need to be updated?
  this.draw = function(canvas, context){
    for(i=0; i<this.tiles.length; i++)
      this.tiles[i].draw(canvas, context);
  }

  // Tile initialization
  // create discrete tiles
  for(i=0; i<this.Nx; i++){
    for(j=0; j<this.Ny; j++){
      this.tiles.push(new Tile(i, j, this));
    }
  }
  // link neighboring tiles
  for(i=0; i<this.Nx; i++){
    for(j=0; j<this.Ny; j++){
      this.tiles[i*this.Ny+j].neighbors = {
        left: this.getTileByIndex(i-1, j),
        right: this.getTileByIndex(i+1, j),
        top: this.getTileByIndex(i, j-1),
        bottom: this.getTileByIndex(i, j+1)
      }
    }
  }
  // generate walls at walls
  for(i=0; i<this.Nx; i++){
    this.tiles[i*this.Ny].walls.top = true;
    this.tiles[i*this.Ny + this.Nx-1].walls.bottom = true;
  }
  for(j=0; j<this.Ny; j++){
    this.tiles[j].walls.left = true;
    this.tiles[(this.Nx-1)*this.Ny+j].walls.right = true;
  }
  // generate some random walls
  MapGenerator.randomMap(this);
}

// child class for tiles
// contains position, wall list, neighbor list, object list
// contains a method to check whether the tile has a wall towards a point
Tile = function(i, j, map){
  this.i = i;
  this.j = j;
  this.map = map;
  this.id = i*j;
  this.x = i * map.dx;
  this.y = j * map.dy;
  this.dx = map.dx;
  this.dy = map.dy;
  this.objs = [];
  // list of walls
  this.walls = {
    left: false,
    right: false,
    top: false,
    bottom: false
  };
  // list of neighbors
  this.neighbors = undefined;

  // draw the tile walls (width fixed as 4px)
  this.draw = function(canvas, context){
    context.fillStyle = "#555";
    if(this.walls.left)
      context.fillRect(this.x-2, this.y-1, 4, this.dy+2);
    if(this.walls.right)
      context.fillRect(this.x-2+this.dx, this.y-1, 4, this.dy+2);
    if(this.walls.top)
      context.fillRect(this.x-1, this.y-2, this.dx+2, 4);
    if(this.walls.bottom)
      context.fillRect(this.x-1, this.y-2+this.dy, this.dx+2, 4);

  }

  // is there a wall between the tile and a point at x,y?
  // if so, what kind of wall is it?
  this.getWall = function(x, y){
    distx = this.x - x;
    disty = this.y - y;
    // walls to walls
    if(distx > 0 && this.walls.left)
      return "left";
    if(distx < -this.dx && this.walls.right)
      return "right";
    if(disty > 0 && this.walls.top)
      return "top";
    if(disty < -this.dy && this.walls.bottom)
      return "bottom";
    return -1;
  }
}
