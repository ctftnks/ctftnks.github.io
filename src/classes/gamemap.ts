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
  /** The canvas. */
  canvas: Canvas | { width: number; height: number };
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
  constructor(canvas: Canvas | any = -1, Nx: number = -1, Ny: number = -1) {
    if (canvas === -1) canvas = { width: 1, height: 1 };
    this.canvas = canvas;

    if (Nx === -1) {
      this.Nx = parseInt((store.settings.MapNxMin + (store.settings.MapNxMax - store.settings.MapNxMin) * Math.random()).toString());
    } else {
      this.Nx = Nx;
    }

    if (Ny === -1) {
      this.Ny = parseInt((((0.25 * Math.random() + 0.75) * this.Nx * canvas.height) / canvas.width).toString());
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
   * @returns {Tile|number} The tile or -1 if out of bounds.
   */
  getTileByIndex(i: number, j: number): Tile | -1 {
    if (i < this.Nx && j < this.Ny && i >= 0 && j >= 0) return this.tiles[i * this.Ny + j];
    return -1;
  }

  /**
   * Links neighboring tiles.
   */
  linkNeighbors(): void {
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
        this.tiles[i * this.Ny + j].neighbors = [
          this.getTileByIndex(i, j - 1) as Tile | undefined,
          this.getTileByIndex(i - 1, j) as Tile | undefined,
          this.getTileByIndex(i, j + 1) as Tile | undefined,
          this.getTileByIndex(i + 1, j) as Tile | undefined,
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
  getTileByPos(x: number, y: number): Tile | -1 {
    const i = parseInt((x / this.dx).toString());
    const j = parseInt((y / this.dy).toString());
    return this.getTileByIndex(i, j);
  }

  /**
   * Spatial sorting: clear tile object lists.
   */
  clearObjectLists(): void {
    for (let i = 0; i < this.tiles.length; i++) this.tiles[i].objs = [];
  }

  /**
   * Spatial sorting: add object to corresponding tile list.
   * @param {GameObject} obj - The object to add.
   */
  addObject(obj: GameObject): void {
    const tile = this.getTileByPos(obj.x, obj.y);
    if (tile === -1) obj.delete();
    else tile.objs.push(obj);
  }

  /**
   * Returns a random free spawn point.
   * @param {number} tries - Recursion counter.
   * @returns {Object} {x, y} coordinates.
   */
  spawnPoint(tries: number = 0): { x: number; y: number } {
    const rInt = parseInt((Math.random() * (this.Nx * this.Ny - 1)).toString());
    const tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries++ < this.Nx * this.Ny) return this.spawnPoint(tries);
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  /**
   * Draws the map.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (let i = 0; i < this.tiles.length; i++) this.tiles[i].draw(context);
  }

  /**
   * Update sizes of map and tiles, for window.onresize.
   */
  resize(): void {
    if (this.canvas instanceof Canvas) {
      this.canvas.rescale(Math.min(this.canvas.width / (this.dx * this.Nx), this.canvas.height / (this.dy * this.Ny)));
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
  neighbors: (Tile | undefined)[] = [undefined, undefined, undefined, undefined];

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
   * @returns {Array<Object>} List of corners with {x, y, w}.
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
  addWall(direction: number, remove: boolean = false, neighbor: boolean = true): void {
    direction = direction % 4;
    this.walls[direction] = !remove;
    if (neighbor && typeof this.neighbors[direction] !== "undefined" && this.neighbors[direction] !== -1) {
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
  pathTo(condition: (tile: Tile) => boolean, path: Tile[] = [], minPathLength: number = -1, maxPathLength: number = -1): Tile[] | -1 {
    // add current tile to path
    path.push(this);
    // if the current path is longer than the shortest known path: abort!
    if (minPathLength !== -1 && path.length >= minPathLength) return -1;
    if (maxPathLength !== -1 && path.length > maxPathLength) return -1;
    // is this tile what we've been searching for? Then we're done!
    if (condition(this)) return path;
    // else keep searching:
    // for every neighbor that is not separated by a wall and is not yet in path
    // calculate the path recursively. If a path is found, add it to a list
    const options: Tile[][] = [];
    for (let d = 0; d < 4; d++)
      if (!this.walls[d] && this.neighbors[d] && path.indexOf(this.neighbors[d] as Tile) === -1) {
        const option = (this.neighbors[d] as Tile).pathTo(condition, path.slice(), minPathLength, maxPathLength);
        if (option !== -1) {
          minPathLength = option.length;
          options.push(option);
        }
      }
    // found no options? negative result
    if (options.length === 0) return -1;
    // find option with minimal length and return
    let min = -1;
    for (let i = 0; i < options.length; i++) {
      if (min === -1 || options[i].length < options[min].length) min = i;
    }
    return options[min];
  }

  /**
   * Random walk along the map.
   * @param {number} distance - Steps to walk.
   * @returns {Tile} The final tile.
   */
  randomWalk(distance: number): Tile {
    if (distance === 0) return this;
    const r = Math.floor(Math.random() * 4);
    for (let d = r; d < 4 + r; d++) {
      if (
        !this.walls[d % 4] &&
        typeof this.neighbors[d % 4] !== "undefined" &&
        this.neighbors[d % 4] !== undefined &&
        this.neighbors[d % 4] !== -1
      ) {
        return (this.neighbors[d % 4] as Tile).randomWalk(distance - 1);
      }
    }
    return this;
  }

  /**
   * Is object of type 'type' in tile?
   * @param {string} type - Object type to search for.
   * @returns {number} Index of object in list or -1.
   */
  find(type: string): number {
    for (let i = 0; i < this.objs.length; i++) if (this.objs[i].type === type) return i;
    return -1;
  }

  /**
   * Find any object that matches the condition and return a path of coordinates to it.
   * @param {Function} condition - Match condition.
   * @param {number} maxPathLength - Max path length.
   * @returns {Array|number} Path to object or -1.
   */
  xypathToObj(condition: (obj: GameObject) => boolean, maxPathLength: number = -1): Array<{ x: number; y: number } | GameObject> | -1 {
    const tilepath = this.pathTo(
      function (dest) {
        for (let i = 0; i < dest.objs.length; i++) if (condition(dest.objs[i])) return true;
        return false;
      },
      [],
      -1,
      maxPathLength,
    );
    if (tilepath === -1) return -1;
    const xypath: Array<{ x: number; y: number } | GameObject> = [];
    for (let i = 0; i < tilepath.length; i++) {
      const tile = tilepath[i];
      xypath.push({ x: tile.x + tile.dx / 2, y: tile.y + tile.dy / 2 });
    }
    let obj: GameObject | -1 = -1;
    const lasttile = tilepath[tilepath.length - 1];
    for (let i = 0; i < lasttile.objs.length; i++) {
      if (condition(lasttile.objs[i])) {
        obj = lasttile.objs[i];
        break;
      }
    }
    if (obj === -1) return -1;
    xypath.push(obj);
    return xypath;
  }
}
