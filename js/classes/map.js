// A class for the Map,
// discretized in Nx * Ny tiles, which can be separated by walls (walls)
// also the tiles keep object lists for spatial sorting
// the canvas is passed to the constructor to provide the size of the canvas

class Map {
  constructor(canvas = -1, Nx = -1, Ny = -1) {
    if (canvas == -1) canvas = { width: 1, height: 1 };
    this.canvas = canvas;
    if (Nx == -1) this.Nx = parseInt(MapNxMin + (MapNxMax - MapNxMin) * Math.random());
    else this.Nx = Nx;
    if (Ny == -1) this.Ny = parseInt(((0.25 * Math.random() + 0.75) * this.Nx * canvas.height) / canvas.width);
    else this.Ny = Ny;
    this.dx = 130;
    // this.dy = canvas.height / this.Ny;
    this.dy = this.dx;
    this.tiles = [];

    // Tile initialization
    // create discrete tiles
    for (var i = 0; i < this.Nx; i++) {
      for (var j = 0; j < this.Ny; j++) {
        this.tiles.push(new Tile(i, j, this));
      }
    }
    
    this.linkNeighbors();
  }

  // get tile by i,j-index
  getTileByIndex(i, j) {
    if (i < this.Nx && j < this.Ny && i >= 0 && j >= 0) return this.tiles[i * this.Ny + j];
    return -1;
  }

  // link neighboring tiles
  linkNeighbors() {
    for (var i = 0; i < this.Nx; i++) {
      for (var j = 0; j < this.Ny; j++) {
        this.tiles[i * this.Ny + j].neighbors = [
          this.getTileByIndex(i, j - 1),
          this.getTileByIndex(i - 1, j),
          this.getTileByIndex(i, j + 1),
          this.getTileByIndex(i + 1, j),
        ];
      }
    }
  }

  // get tile by x,y-position
  getTileByPos(x, y) {
    var i = parseInt(x / this.dx);
    var j = parseInt(y / this.dy);
    return this.getTileByIndex(i, j);
  }

  // spatial sorting: clear tile object lists
  clearObjectLists() {
    for (var i = 0; i < this.tiles.length; i++) this.tiles[i].objs = [];
  }

  // spatial sorting: add object to corresponding tile list
  addObject(obj) {
    var tile = this.getTileByPos(obj.x, obj.y);
    if (tile == -1) obj.delete();
    else tile.objs.push(obj);
  }

  // return a random free spawn point
  spawnPoint(tries = 0) {
    var rInt = parseInt(Math.random() * (this.Nx * this.Ny - 1));
    var tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries++ < this.Nx * this.Ny) return this.spawnPoint(tries);
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  // draw the map
  draw(canvas, context) {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (var i = 0; i < this.tiles.length; i++) this.tiles[i].draw(canvas, context);
  }

  // update sizes of map and tiles, for window.onresize
  resize() {
    this.canvas.rescale(Math.min(this.canvas.width / (this.dx * this.Nx), this.canvas.height / (this.dy * this.Ny)));
  }
}

// child class for tiles
// contains position, wall list, neighbor list, object list
// contains a method to check whether the tile has a wall towards a point
class Tile {
  constructor(i, j, map) {
    this.i = i;
    this.j = j;
    this.map = map;
    this.id = i * map.Ny + j;
    this.x = i * map.dx;
    this.y = j * map.dy;
    this.dx = map.dx;
    this.dy = map.dy;
    this.objs = [];
    // list of walls
    this.walls = [
      false, // top
      false, // left
      false, // bottom
      false, // right
    ];
    // list of neighbors
    this.neighbors = [
      undefined, // top
      undefined, // left
      undefined, // bottom
      undefined, // right
    ];
    
    // Explicitly call linkNeighbors if this is the last tile created, 
    // or rely on Map calling it. 
    // The original code did linking after loop.
    // I moved linking logic to Map constructor or method.
    // Wait, original code:
    /*
      for (var i = 0; i < this.Nx; i++) {
        for (var j = 0; j < this.Ny; j++) {
           this.tiles.push(new Tile(i, j, this));
        }
      }
      // link neighboring tiles
      for (var i = 0; i < this.Nx; i++) { ... }
    */
    // So I need to add that linking loop to Map constructor or call it.
    // I added linkNeighbors method to Map and I should call it in Map constructor.
    // But I can't edit Map constructor in this `write_file` block easily without re-writing Map.
    // I will rewrite Map constructor to include linking.
  }

  // return the coordinates of the corners of the tile and whether they're part of some wall
  corners() {
    return [
      { x: this.x, y: this.y, w: this.walls[0] || this.walls[1] }, // top left
      { x: this.x, y: this.y + this.dy, w: this.walls[1] || this.walls[2] }, // bottom left
      { x: this.x + this.dx, y: this.y + this.dy, w: this.walls[2] || this.walls[3] }, // bottom right
      { x: this.x + this.dx, y: this.y, w: this.walls[3] || this.walls[0] }, // top right
    ];
  }

  // draw the tile walls (width fixed as 4px)
  draw(canvas, context) {
    context.fillStyle = "#555";
    if (this.walls[0]) context.fillRect(this.x - 2, this.y - 2, this.dx + 4, 4);
    if (this.walls[1]) context.fillRect(this.x - 2, this.y - 2, 4, this.dy + 4);
    if (this.walls[2]) context.fillRect(this.x - 2, this.y - 2 + this.dy, this.dx + 4, 4);
    if (this.walls[3]) context.fillRect(this.x - 2 + this.dx, this.y - 2, 4, this.dy + 4);
  }

  addWall(direction, remove = false, neighbor = true) {
    direction = direction % 4;
    this.walls[direction] = !remove;
    if (neighbor && typeof this.neighbors[direction] !== "undefined" && this.neighbors[direction] != -1)
      this.neighbors[direction].addWall(direction + 2, remove, false);
  }

  // is there any walls between the tile and a point at x,y?
  // if so, what kind of wall is it?
  getWalls(x, y) {
    var distx = this.x - x;
    var disty = this.y - y;
    var walls = [false, false, false, false];
    // walls to walls
    if (disty > 0 && this.walls[0]) walls[0] = true;
    if (distx > 0 && this.walls[1]) walls[1] = true;
    if (disty < -this.dy && this.walls[2]) walls[2] = true;
    if (distx < -this.dx && this.walls[3]) walls[3] = true;
    return walls;
  }

  // recursively find the shortest path to any tile in map where condition is met
  // condition is a function condition(Tile t){} returning boolean
  pathTo(condition, path = [], minPathLength = -1, maxPathLength = -1) {
    // add current tile to path
    path.push(this);
    // if the current path is longer than the shortest known path: abort!
    if (minPathLength != -1 && path.length >= minPathLength) return -1;
    if (maxPathLength != -1 && path.length > maxPathLength) return -1;
    // is this tile what we've been searching for? Then we're done!
    if (condition(this)) return path;
    // else keep searching:
    // for every neighbor that is not separated by a wall and is not yet in path
    // calculate the path recursively. If a path is found, add it to a list
    var options = [];
    for (var d = 0; d < 4; d++)
      if (!this.walls[d] && this.neighbors[d] != -1 && path.indexOf(this.neighbors[d]) == -1) {
        var option = this.neighbors[d].pathTo(condition, path.slice(), minPathLength, maxPathLength);
        if (option != -1) {
          minPathLength = option.length;
          options.push(option);
        }
      }
    // found no options? negative result
    if (options.length == 0) return -1;
    // find option with minimal length and return
    var min = -1;
    for (var i = 0; i < options.length; i++) if (min == -1 || options[i].length < options[min].length) min = i;
    return options[min];
  }

  // random walk along the map
  randomWalk(distance) {
    if (distance == 0) return this;
    var r = Math.floor(Math.random() * 4);
    for (var d = r; d < 4 + r; d++)
      if (!this.walls[d % 4] && typeof this.neighbors[d % 4] !== "undefined" && this.neighbors[d % 4] != -1)
        return this.neighbors[d % 4].randomWalk(distance - 1);
    return this;
  }

  // is object of type 'type' in tile?
  // if so, return object list id, otherwise -1
  find(type) {
    for (var i = 0; i < this.objs.length; i++) if (this.objs[i].type == type) return i;
    return -1;
  }

  // Find any object that matches the condition and return a path of coordinates to it and the object itself as the last coordinate
  xypathToObj(condition, maxPathLength = -1) {
    var tilepath = this.pathTo(
      function (dest) {
        for (var i = 0; i < dest.objs.length; i++) if (condition(dest.objs[i])) return true;
      },
      [],
      -1,
      maxPathLength,
    );
    if (tilepath == -1) return -1;
    var xypath = [];
    for (var i = 0; i < tilepath.length; i++) {
      var tile = tilepath[i];
      xypath.push({ x: tile.x + tile.dx / 2, y: tile.y + tile.dy / 2 });
    }
    var obj = -1;
    var lasttile = tilepath[tilepath.length - 1];
    for (var i = 0; i < lasttile.objs.length; i++) {
      if (condition(lasttile.objs[i])) {
        obj = lasttile.objs[i];
        break;
      }
    }
    if (obj == -1) return -1;
    xypath.push(obj);
    return xypath;
  }
}