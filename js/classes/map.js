// A class for the Map,
// discretized in Nx * Ny tiles, which can be separated by walls (walls)
// also the tiles keep object lists for spatial sorting
// the canvas is passed to the constructor to provide the size of the canvas

Map = function(canvas){

  this.Nx = parseInt(MapNxMin + (MapNxMax-MapNxMin) * Math.random());
  this.Ny = parseInt((0.4 * Math.random() + 0.6) * this.Nx * canvas.height / canvas.width);
  console.log(this.Ny);
  this.dx = canvas.width / 10;
  canvas.scale(10 / this.Nx);
  // this.dy = canvas.height / this.Ny;
  this.dy = this.dx;
  this.tiles = [];

  // Tile initialization
  // create discrete tiles
  for(var i=0; i<this.Nx; i++){
    for(var j=0; j<this.Ny; j++){
      this.tiles.push(new Tile(i, j, this));
    }
  }


  // get tile by i,j-index
  this.getTileByIndex = function(i, j){
    if(i < this.Nx && j < this.Ny && i >= 0 && j >= 0)
      return this.tiles[i * this.Ny + j];
    return -1;
  }

  // get tile by x,y-position
  this.getTileByPos = function(x, y){
    var i = parseInt(x / this.dx);
    var j = parseInt(y / this.dy);
    return this.getTileByIndex(i, j);
  }

  // spatial sorting: clear tile object lists
  this.clearObjectLists = function(){
    for(var i=0; i<this.tiles.length; i++)
      this.tiles[i].objs = [];
  }

  // spatial sorting: add object to corresponding tile list
  this.addObject = function(obj){
    var tile = this.getTileByPos(obj.x, obj.y);
    if(tile == -1)
      obj.delete();
    else
      tile.objs.push(obj);
  }

  // return a random free spawn point
  this.spawnPoint = function(tries = 0){
    var rInt = parseInt(Math.random() * (this.Nx * this.Ny - 1));
    var tile = this.tiles[rInt];
    // if there is something else already, find another point
    if(tile.objs.length > 0 && tries++ < this.Nx * this.Ny)
      return this.spawnPoint(tries);
    return {x: tile.x + this.dx / 2, y: tile.y + this.dy / 2};
  }

  // draw the map
  this.draw = function(canvas, context){
    for(var i=0; i<this.tiles.length; i++)
      this.tiles[i].draw(canvas, context);
  }

  // link neighboring tiles
  for(var i=0; i<this.Nx; i++){
    for(var j=0; j<this.Ny; j++){
      this.tiles[i*this.Ny+j].neighbors = {
        left: this.getTileByIndex(i-1, j),
        right: this.getTileByIndex(i+1, j),
        top: this.getTileByIndex(i, j-1),
        bottom: this.getTileByIndex(i, j+1)
      }
    }
  }

  // get the shortest path to the next tank
  this.pathToTank(listOfTiles){

  }
}

// child class for tiles
// contains position, wall list, neighbor list, object list
// contains a method to check whether the tile has a wall towards a point
Tile = function(i, j, map){
  this.i = i;
  this.j = j;
  this.map = map;
  this.id = i*map.Ny+j;
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
    var distx = this.x - x;
    var disty = this.y - y;
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
