import { store } from "../state.js";

// A class for the Map,
// discretized in Nx * Ny tiles, which can be separated by walls (walls)
// also the tiles keep object lists for spatial sorting
// the canvas is passed to the constructor to provide the size of the canvas

/**
 * Represents the game map.
 */
export default class Map {
  /**
   * Creates a new Map.
   * @param {Object} canvas - The canvas object.
   * @param {number} Nx - Number of tiles in X direction.
   * @param {number} Ny - Number of tiles in Y direction.
   */
  constructor(canvas = -1, Nx = -1, Ny = -1) {
    if (canvas == -1) canvas = { width: 1, height: 1 };
    /** @type {Object} The canvas. */
    this.canvas = canvas;
    /** @type {number} Number of tiles in X. */
    if (Nx == -1) this.Nx = parseInt(store.settings.MapNxMin + (store.settings.MapNxMax - store.settings.MapNxMin) * Math.random());
    else this.Nx = Nx;
    /** @type {number} Number of tiles in Y. */
    if (Ny == -1) this.Ny = parseInt(((0.25 * Math.random() + 0.75) * this.Nx * canvas.height) / canvas.width);
    else this.Ny = Ny;
    /** @type {number} Tile width. */
    this.dx = 130;
    // this.dy = canvas.height / this.Ny;
    /** @type {number} Tile height. */
    this.dy = this.dx;
    /** @type {Array<Tile>} List of tiles. */
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

  /**
   * Gets a tile by its grid index.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @returns {Tile|number} The tile or -1 if out of bounds.
   */
  getTileByIndex(i, j) {
    if (i < this.Nx && j < this.Ny && i >= 0 && j >= 0) return this.tiles[i * this.Ny + j];
    return -1;
  }

  /**
   * Links neighboring tiles.
   */
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

  /**
   * Gets a tile by its world position.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {Tile|number} The tile or -1.
   */
  getTileByPos(x, y) {
    var i = parseInt(x / this.dx);
    var j = parseInt(y / this.dy);
    return this.getTileByIndex(i, j);
  }

  /**
   * Spatial sorting: clear tile object lists.
   */
  clearObjectLists() {
    for (var i = 0; i < this.tiles.length; i++) this.tiles[i].objs = [];
  }

  /**
   * Spatial sorting: add object to corresponding tile list.
   * @param {GameObject} obj - The object to add.
   */
  addObject(obj) {
    var tile = this.getTileByPos(obj.x, obj.y);
    if (tile == -1) obj.delete();
    else tile.objs.push(obj);
  }

  /**
   * Returns a random free spawn point.
   * @param {number} tries - Recursion counter.
   * @returns {Object} {x, y} coordinates.
   */
  spawnPoint(tries = 0) {
    var rInt = parseInt(Math.random() * (this.Nx * this.Ny - 1));
    var tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries++ < this.Nx * this.Ny) return this.spawnPoint(tries);
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  /**
   * Draws the map.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (var i = 0; i < this.tiles.length; i++) this.tiles[i].draw(canvas, context);
  }

  /**
   * Update sizes of map and tiles, for window.onresize.
   */
  resize() {
    this.canvas.rescale(Math.min(this.canvas.width / (this.dx * this.Nx), this.canvas.height / (this.dy * this.Ny)));
  }
}

/**
 * Child class for tiles.
 * Contains position, wall list, neighbor list, object list.
 */
export class Tile {
  /**
   * Creates a new Tile.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @param {Map} map - The map instance.
   */
  constructor(i, j, map) {
    /** @type {number} X index. */
    this.i = i;
    /** @type {number} Y index. */
    this.j = j;
    /** @type {Map} The map. */
    this.map = map;
    /** @type {number} Unique tile ID. */
    this.id = i * map.Ny + j;
    /** @type {number} X coordinate in pixels. */
    this.x = i * map.dx;
    /** @type {number} Y coordinate in pixels. */
    this.y = j * map.dy;
    /** @type {number} Width. */
    this.dx = map.dx;
    /** @type {number} Height. */
    this.dy = map.dy;
    /** @type {Array<GameObject>} Objects currently in this tile. */
    this.objs = [];
    // list of walls
    /** @type {Array<boolean>} Walls [top, left, bottom, right]. */
    this.walls = [
      false, // top
      false, // left
      false, // bottom
      false, // right
    ];
    // list of neighbors
    /** @type {Array<Tile|undefined>} Neighbors [top, left, bottom, right]. */
    this.neighbors = [
      undefined, // top
      undefined, // left
      undefined, // bottom
      undefined, // right
    ];
  }

  /**
   * Return the coordinates of the corners of the tile and whether they're part of some wall.
   * @returns {Array<Object>} List of corners with {x, y, w}.
   */
  corners() {
    return [
      { x: this.x, y: this.y, w: this.walls[0] || this.walls[1] }, // top left
      { x: this.x, y: this.y + this.dy, w: this.walls[1] || this.walls[2] }, // bottom left
      { x: this.x + this.dx, y: this.y + this.dy, w: this.walls[2] || this.walls[3] }, // bottom right
      { x: this.x + this.dx, y: this.y, w: this.walls[3] || this.walls[0] }, // top right
    ];
  }

  /**
   * Draw the tile walls.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    context.fillStyle = "#555";
    if (this.walls[0]) context.fillRect(this.x - 2, this.y - 2, this.dx + 4, 4);
    if (this.walls[1]) context.fillRect(this.x - 2, this.y - 2, 4, this.dy + 4);
    if (this.walls[2]) context.fillRect(this.x - 2, this.y - 2 + this.dy, this.dx + 4, 4);
    if (this.walls[3]) context.fillRect(this.x - 2 + this.dx, this.y - 2, 4, this.dy + 4);
  }

  /**
   * Adds or removes a wall.
   * @param {number} direction - 0: top, 1: left, 2: bottom, 3: right.
   * @param {boolean} remove - Whether to remove the wall.
   * @param {boolean} neighbor - Whether to update the neighbor as well.
   */
  addWall(direction, remove = false, neighbor = true) {
    direction = direction % 4;
    this.walls[direction] = !remove;
    if (neighbor && typeof this.neighbors[direction] !== "undefined" && this.neighbors[direction] != -1)
      this.neighbors[direction].addWall(direction + 2, remove, false);
  }

  /**
   * Is there any walls between the tile and a point at x,y?
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {Array<boolean>} List of walls encountered.
   */
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

  /**
   * Recursively find the shortest path to any tile in map where condition is met.
   * @param {Function} condition - Function returning boolean.
   * @param {Array} path - Current path.
   * @param {number} minPathLength - Optimization: abort if path is longer than this.
   * @param {number} maxPathLength - Max allowed path length.
   * @returns {Array<Tile>|number} The path or -1 if not found.
   */
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

  /**
   * Random walk along the map.
   * @param {number} distance - Steps to walk.
   * @returns {Tile} The final tile.
   */
  randomWalk(distance) {
    if (distance == 0) return this;
    var r = Math.floor(Math.random() * 4);
    for (var d = r; d < 4 + r; d++)
      if (!this.walls[d % 4] && typeof this.neighbors[d % 4] !== "undefined" && this.neighbors[d % 4] != -1)
        return this.neighbors[d % 4].randomWalk(distance - 1);
    return this;
  }

  /**
   * Is object of type 'type' in tile?
   * @param {string} type - Object type to search for.
   * @returns {number} Index of object in list or -1.
   */
  find(type) {
    for (var i = 0; i < this.objs.length; i++) if (this.objs[i].type == type) return i;
    return -1;
  }

  /**
   * Find any object that matches the condition and return a path of coordinates to it.
   * @param {Function} condition - Match condition.
   * @param {number} maxPathLength - Max path length.
   * @returns {Array|number} Path to object or -1.
   */
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
