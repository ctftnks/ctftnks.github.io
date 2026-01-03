import { store } from "../store";
import GameObject from "./gameobject";
import Canvas from "./canvas";

/**
 * Represents the game map.
 *
 * Discretized in Nx * Ny tiles, which can be separated by walls (walls)
 * also the tiles keep object lists for spatial sorting
 * the canvas is passed to the constructor to provide the size of the canvas
 */
export default class GameMap {
  /** Number of tiles in X. */
  Nx: number;
  /** Number of tiles in Y. */
  Ny: number;
  /** Tile width. */
  dx: number = 130;
  /** Tile height. */
  dy: number;
  /** List of tiles. */
  tiles: Tile[] = [];

  /**
   * Creates a new GameMap.
   * @param {Canvas} canvas - The canvas object.
   * @param {number} Nx - Number of tiles in X direction.
   * @param {number} Ny - Number of tiles in Y direction.
   */
  constructor(canvas: Canvas, Nx: number | null = null, Ny: number | null = null) {
    if (Nx === null) {
      this.Nx = parseInt((store.settings.MapNxMin + (store.settings.MapNxMax - store.settings.MapNxMin) * Math.random()).toString());
    } else {
      this.Nx = Nx;
    }

    if (Ny === null) {
      this.Ny = parseInt((((0.25 * Math.random() + 0.75) * this.Nx * canvas!.height) / canvas!.width).toString());
    } else {
      this.Ny = Ny;
    }

    // this.dy = canvas.height / this.Ny;
    this.dy = this.dx;

    // Tile initialization
    // create discrete tiles
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
        this.tiles.push(new Tile(i, j, this));
      }
    }

    this.linkNeighbors();
  }

  /**
   * Gets a tile by its grid index.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @returns {Tile|null} The tile or null if out of bounds.
   */
  getTileByIndex(i: number, j: number): Tile | null {
    if (i < this.Nx && j < this.Ny && i >= 0 && j >= 0) {
      return this.tiles[i * this.Ny + j];
    }
    return null;
  }

  /**
   * Links neighboring tiles.
   */
  linkNeighbors(): void {
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
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
   * @returns {Tile|null} The tile or null.
   */
  getTileByPos(x: number, y: number): Tile | null {
    const i = parseInt((x / this.dx).toString());
    const j = parseInt((y / this.dy).toString());
    return this.getTileByIndex(i, j);
  }

  /**
   * Spatial sorting: clear tile object lists.
   */
  clearObjectLists(): void {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].objs = [];
    }
  }

  /**
   * Spatial sorting: add object to corresponding tile list.
   * @param {GameObject} obj - The object to add.
   */
  addObject(obj: GameObject): void {
    const tile = this.getTileByPos(obj.x, obj.y);
    if (tile === null) {
      obj.delete();
    } else {
      tile.objs.push(obj);
    }
  }

  /**
   * Returns a random free spawn point.
   * @param {number} tries - Recursion counter.
   * @returns {object} {x, y} coordinates.
   */
  spawnPoint(tries: number = 0): { x: number; y: number } {
    const rInt = parseInt((Math.random() * (this.Nx * this.Ny - 1)).toString());
    const tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries++ < this.Nx * this.Ny) {
      return this.spawnPoint(tries);
    }
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  /**
   * Draws the map.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].draw(context);
    }
  }

  /**
   * Update sizes of map and tiles, for window.onresize.
   */
  resize(): void {
    if (store.canvas instanceof Canvas) {
      store.canvas.rescale(Math.min(store.canvas.width / (this.dx * this.Nx), store.canvas.height / (this.dy * this.Ny)));
    }
  }
}

/**
 * Child class for tiles.
 * Contains position, wall list, neighbor list, object list.
 */
export class Tile {
  /** X index. */
  i: number;
  /** Y index. */
  j: number;
  /** The map. */
  map: GameMap;
  /** Unique tile ID. */
  id: number;
  /** X coordinate in pixels. */
  x: number;
  /** Y coordinate in pixels. */
  y: number;
  /** Width. */
  dx: number;
  /** Height. */
  dy: number;
  /** Objects currently in this tile. */
  objs: GameObject[] = [];
  /** List of Walls [top, left, bottom, right]. */
  walls: boolean[] = [false, false, false, false];
  /** List of neighboring tiles [top, left, bottom, right]. */
  neighbors: (Tile | null)[] = [null, null, null, null];

  /**
   * Creates a new Tile.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @param {GameMap} map - The map instance.
   */
  constructor(i: number, j: number, map: GameMap) {
    this.i = i;
    this.j = j;
    this.map = map;
    this.id = i * map.Ny + j;
    this.x = i * map.dx;
    this.y = j * map.dy;
    this.dx = map.dx;
    this.dy = map.dy;
  }

  /**
   * Return the coordinates of the corners of the tile and whether they're part of some wall.
   * @returns {Array<object>} List of corners with {x, y, w}.
   */
  corners(): { x: number; y: number; w: boolean }[] {
    return [
      { x: this.x, y: this.y, w: this.walls[0] || this.walls[1] }, // top left
      { x: this.x, y: this.y + this.dy, w: this.walls[1] || this.walls[2] }, // bottom left
      { x: this.x + this.dx, y: this.y + this.dy, w: this.walls[2] || this.walls[3] }, // bottom right
      { x: this.x + this.dx, y: this.y, w: this.walls[3] || this.walls[0] }, // top right
    ];
  }

  /**
   * Draw the tile walls.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#555";
    if (this.walls[0]) {
      context.fillRect(this.x - 2, this.y - 2, this.dx + 4, 4);
    }
    if (this.walls[1]) {
      context.fillRect(this.x - 2, this.y - 2, 4, this.dy + 4);
    }
    if (this.walls[2]) {
      context.fillRect(this.x - 2, this.y - 2 + this.dy, this.dx + 4, 4);
    }
    if (this.walls[3]) {
      context.fillRect(this.x - 2 + this.dx, this.y - 2, 4, this.dy + 4);
    }
  }

  /**
   * Adds or removes a wall.
   * @param {number} direction - 0: top, 1: left, 2: bottom, 3: right.
   * @param {boolean} remove - Whether to remove the wall.
   * @param {boolean} neighbor - Whether to update the neighbor as well.
   */
  addWall(direction: number, remove: boolean = false, neighbor: boolean = true): void {
    direction = direction % 4;
    this.walls[direction] = !remove;
    if (neighbor && typeof this.neighbors[direction] !== "undefined" && this.neighbors[direction] !== null) {
      (this.neighbors[direction] as Tile).addWall(direction + 2, remove, false);
    }
  }

  /**
   * Is there any walls between the tile and a point at x,y?
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {Array<boolean>} List of walls encountered.
   */
  getWalls(x: number, y: number): boolean[] {
    const distx = this.x - x;
    const disty = this.y - y;
    const walls = [false, false, false, false];
    // walls to walls
    if (disty > 0 && this.walls[0]) {
      walls[0] = true;
    }
    if (distx > 0 && this.walls[1]) {
      walls[1] = true;
    }
    if (disty < -this.dy && this.walls[2]) {
      walls[2] = true;
    }
    if (distx < -this.dx && this.walls[3]) {
      walls[3] = true;
    }
    return walls;
  }

  /**
   * Recursively find the shortest path to any tile in map where condition is met.
   * @param {Function} condition - Function returning boolean.
   * @param {Array} path - Current path.
   * @param {number|null} minPathLength - Optimization: abort if path is longer than this.
   * @param {number|null} maxPathLength - Max allowed path length.
   * @returns {Array<Tile>|null} The path or null if not found.
   */
  pathTo(
    condition: (tile: Tile) => boolean,
    path: Tile[] = [],
    minPathLength: number | null = null,
    maxPathLength: number | null = null,
  ): Tile[] | null {
    // add current tile to path
    path.push(this);
    // if the current path is longer than the shortest known path: abort!
    if (minPathLength !== null && path.length >= minPathLength) {
      return null;
    }
    if (maxPathLength !== null && path.length > maxPathLength) {
      return null;
    }
    // is this tile what we've been searching for? Then we're done!
    if (condition(this)) {
      return path;
    }
    // else keep searching:
    // for every neighbor that is not separated by a wall and is not yet in path
    // calculate the path recursively. If a path is found, add it to a list
    const options: Tile[][] = [];
    for (let d = 0; d < 4; d++) {
      if (!this.walls[d] && this.neighbors[d] && path.indexOf(this.neighbors[d] as Tile) === -1) {
        const option = (this.neighbors[d] as Tile).pathTo(condition, path.slice(), minPathLength, maxPathLength);
        if (option !== null) {
          minPathLength = option.length;
          options.push(option);
        }
      }
    }
    // found no options? negative result
    if (options.length === 0) {
      return null;
    }
    // find option with minimal length and return
    let min = 0;
    for (let i = 0; i < options.length; i++) {
      if (options[i].length < options[min].length) {
        min = i;
      }
    }

    return options[min];
  }

  /**
   * Random walk along the map.
   * @param {number} distance - Steps to walk.
   * @returns {Tile} The final tile.
   */
  randomWalk(distance: number): Tile {
    if (distance === 0) {
      return this;
    }
    const r = Math.floor(Math.random() * 4);
    for (let d = r; d < 4 + r; d++) {
      if (!this.walls[d % 4] && this.neighbors[d % 4] !== null) {
        return (this.neighbors[d % 4] as Tile).randomWalk(distance - 1);
      }
    }

    return this;
  }

  /**
   * Find any object that matches the condition and return a path of coordinates to it.
   * @param {Function} condition - Match condition.
   * @param {number|null} maxPathLength - Max path length.
   * @returns {Array|null} Path to object or null.
   */
  xypathToObj(
    condition: (obj: GameObject) => boolean,
    maxPathLength: number | null = null,
  ): Array<{ x: number; y: number } | GameObject> | null {
    const tilepath = this.pathTo(
      (dest) => {
        for (let i = 0; i < dest.objs.length; i++) {
          if (condition(dest.objs[i])) {
            return true;
          }
        }
        return false;
      },
      [],
      null,
      maxPathLength,
    );
    if (tilepath === null) {
      return null;
    }
    const xypath: Array<{ x: number; y: number } | GameObject> = [];
    for (let i = 0; i < tilepath.length; i++) {
      const tile = tilepath[i];
      xypath.push({ x: tile.x + tile.dx / 2, y: tile.y + tile.dy / 2 });
    }
    let obj: GameObject | null = null;
    const lasttile = tilepath[tilepath.length - 1];
    for (let i = 0; i < lasttile.objs.length; i++) {
      if (condition(lasttile.objs[i])) {
        obj = lasttile.objs[i];
        break;
      }
    }

    if (obj === null) {
      return null;
    }
    xypath.push(obj);
    return xypath;
  }
}
