import GameObject from "@/entities/gameobject";
import Coord from "@/entities/coord";
import type GameMap from "./gamemap";

/**
 * Class for tiles of a {@link GameMap}.
 * Contains position, wall list, neighbor list, object list.
 */
export default class Tile implements Coord {
  /** X index. */
  public i: number;
  /** Y index. */
  public j: number;
  /** The map. */
  public map: GameMap;
  /** Unique tile ID. */
  public id: number;
  /** X coordinate in pixels. */
  public x: number;
  /** Y coordinate in pixels. */
  public y: number;
  /** Width. */
  public dx: number;
  /** Height. */
  public dy: number;
  /** Objects currently in this tile. */
  public objs: GameObject[] = [];
  /** List of Walls [top, left, bottom, right]. */
  public walls: boolean[] = [false, false, false, false];
  /** List of neighboring tiles [top, left, bottom, right]. */
  public neighbors: (Tile | null)[] = [null, null, null, null];

  /**
   * Creates a new Tile.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @param {GameMap} map - The map instance.
   */
  public constructor(i: number, j: number, map: GameMap) {
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
  public corners(): { x: number; y: number; w: boolean }[] {
    const { x, y, dx, dy, walls } = this;
    return [
      { x, y, w: walls[0] || walls[1] }, // top left
      { x, y: y + dy, w: walls[1] || walls[2] }, // bottom left
      { x: x + dx, y: y + dy, w: walls[2] || walls[3] }, // bottom right
      { x: x + dx, y, w: walls[3] || walls[0] }, // top right
    ];
  }

  /**
   * Draw the tile walls.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  public draw(context: CanvasRenderingContext2D): void {
    const { x, y, dx, dy, walls } = this;
    context.fillStyle = "#555";
    if (walls[0]) {
      context.fillRect(x - 2, y - 2, dx + 4, 4);
    }
    if (walls[1]) {
      context.fillRect(x - 2, y - 2, 4, dy + 4);
    }
    if (walls[2]) {
      context.fillRect(x - 2, y - 2 + dy, dx + 4, 4);
    }
    if (walls[3]) {
      context.fillRect(x - 2 + dx, y - 2, 4, dy + 4);
    }
  }

  /**
   * Adds or removes a wall.
   * @param {number} direction - 0: top, 1: left, 2: bottom, 3: right.
   * @param {boolean} remove - Whether to remove the wall.
   * @param {boolean} neighbor - Whether to update the neighbor as well.
   */
  public addWall(direction: number, remove: boolean = false, neighbor: boolean = true): void {
    direction = direction % 4;
    this.walls[direction] = !remove;
    const neighborTile = this.neighbors[direction];
    if (neighbor && neighborTile) {
      neighborTile.addWall(direction + 2, remove, false);
    }
  }

  /**
   * Is there any walls between the tile and a point at x,y?
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {Array<boolean>} List of walls encountered.
   */
  public getWalls(x: number, y: number): boolean[] {
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
  public pathTo(
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
      const neighbor = this.neighbors[d];
      if (!this.walls[d] && neighbor && !path.includes(neighbor)) {
        const option = neighbor.pathTo(condition, [...path], minPathLength, maxPathLength);
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
    return options.reduce((prev, curr) => (curr.length < prev.length ? curr : prev));
  }

  /**
   * Random walk along the map.
   * @param {number} distance - Steps to walk.
   * @returns {Tile} The final tile.
   */
  public randomWalk(distance: number): Tile {
    if (distance === 0) {
      return this;
    }
    const r = Math.floor(Math.random() * 4);
    for (let d = r; d < 4 + r; d++) {
      const neighbor = this.neighbors[d % 4];
      if (!this.walls[d % 4] && neighbor) {
        return neighbor.randomWalk(distance - 1);
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
  public xypathToObj(
    condition: (obj: GameObject) => boolean,
    maxPathLength: number | null = null,
  ): Array<{ x: number; y: number } | GameObject> | null {
    const tilepath = this.pathTo((dest) => dest.objs.some(condition), [], null, maxPathLength);
    if (!tilepath) {
      return null;
    }
    const xypath: Coord[] = tilepath.map((tile) => ({
      x: tile.x + tile.dx / 2,
      y: tile.y + tile.dy / 2,
    }));

    const lasttile = tilepath[tilepath.length - 1];
    const obj = lasttile.objs.find(condition);

    if (!obj) {
      return null;
    }
    xypath.push(obj);
    return xypath;
  }
}
