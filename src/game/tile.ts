import GameObject from "@/entities/gameobject";
import { type Coord } from "@/utils/geometry";
import type GameMap from "./gamemap";

/**
 * Class for tiles of a {@link GameMap}.
 * Contains position, wall list, neighbor list, object list.
 */
export class Tile implements Coord {
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
   * @param i - X index.
   * @param j - Y index.
   * @param map - The map instance.
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
   * @returns List of corners with {x, y, w}.
   */
  corners(): { x: number; y: number; w: boolean }[] {
    const { x, y, dx, dy, walls, neighbors } = this;
    return [
      // top left: check Top wall (0), Left wall (1), Top Neighbor's Left Wall (neighbors[0].walls[1]), Left Neighbor's Top Wall (neighbors[1].walls[0])
      {
        x,
        y,
        w: (walls[0] || walls[1] || neighbors[0]?.walls[1] || neighbors[1]?.walls[0]) ?? false,
      },
      // bottom left: check Left wall (1), Bottom wall (2), Left Neighbor's Bottom Wall (neighbors[1].walls[2]), Bottom Neighbor's Left Wall (neighbors[2].walls[1])
      {
        x,
        y: y + dy,
        w: (walls[1] || walls[2] || neighbors[1]?.walls[2] || neighbors[2]?.walls[1]) ?? false,
      },
      // bottom right: check Bottom wall (2), Right wall (3), Bottom Neighbor's Right Wall (neighbors[2].walls[3]), Right Neighbor's Bottom Wall (neighbors[3].walls[2])
      {
        x: x + dx,
        y: y + dy,
        w: (walls[2] || walls[3] || neighbors[2]?.walls[3] || neighbors[3]?.walls[2]) ?? false,
      },
      // top right: check Right wall (3), Top wall (0), Right Neighbor's Top Wall (neighbors[3].walls[0]), Top Neighbor's Right Wall (neighbors[0].walls[3])
      {
        x: x + dx,
        y,
        w: (walls[3] || walls[0] || neighbors[3]?.walls[0] || neighbors[0]?.walls[3]) ?? false,
      },
    ];
  }

  /**
   * Draw the tile walls.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
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
   * @param direction - 0: top, 1: left, 2: bottom, 3: right.
   * @param remove - Whether to remove the wall.
   * @param neighbor - Whether to update the neighbor as well.
   */
  addWall(direction: number, remove: boolean = false, neighbor: boolean = true): void {
    direction = direction % 4;
    this.walls[direction] = !remove;
    const neighborTile = this.neighbors[direction];
    if (neighbor && neighborTile) {
      neighborTile.addWall(direction + 2, remove, false);
    }
  }

  /**
   * Is there any walls between the tile and a point at x,y?
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns List of walls encountered.
   */
  getWalls(x: number, y: number): boolean[] {
    const { x: tx, y: ty, dx, dy, walls, neighbors } = this;
    const distx = tx - x;
    const disty = ty - y;
    const collisionFlags = [false, false, false, false];

    // Determine relative position
    const isLeft = distx > 0;
    const isRight = distx < -dx;
    const isTop = disty > 0;
    const isBottom = disty < -dy;

    // Check direct walls
    if (isTop && walls[0]) {
      collisionFlags[0] = true;
    }
    if (isLeft && walls[1]) {
      collisionFlags[1] = true;
    }
    if (isBottom && walls[2]) {
      collisionFlags[2] = true;
    }
    if (isRight && walls[3]) {
      collisionFlags[3] = true;
    }

    // Check corner cases (diagonal neighbors)
    if (isTop) {
      if (isLeft) {
        // Top-Left Corner
        if (!walls[1] && neighbors[1]?.walls[0]) {
          collisionFlags[0] = true;
        }
        if (!walls[0] && neighbors[0]?.walls[1]) {
          collisionFlags[1] = true;
        }
      } else if (isRight) {
        // Top-Right Corner
        if (!walls[3] && neighbors[3]?.walls[0]) {
          collisionFlags[0] = true;
        }
        if (!walls[0] && neighbors[0]?.walls[3]) {
          collisionFlags[3] = true;
        }
      }
    } else if (isBottom) {
      if (isLeft) {
        // Bottom-Left Corner
        if (!walls[1] && neighbors[1]?.walls[2]) {
          collisionFlags[2] = true;
        }
        if (!walls[2] && neighbors[2]?.walls[1]) {
          collisionFlags[1] = true;
        }
      } else if (isRight) {
        // Bottom-Right Corner
        if (!walls[3] && neighbors[3]?.walls[2]) {
          collisionFlags[2] = true;
        }
        if (!walls[2] && neighbors[2]?.walls[3]) {
          collisionFlags[3] = true;
        }
      }
    }

    return collisionFlags;
  }

  /**
   * Find the shortest path to any tile in the map where condition is met (breadth-first search).
   * Among equally short paths, the one preferring the directions in the order top, left, bottom, right wins.
   * @param condition - Function returning boolean.
   * @param path - Tiles already visited before this one, they are prepended to the result and not visited again.
   * @param minPathLength - Only accept paths that are shorter than this.
   * @param maxPathLength - Max allowed path length.
   * @returns The path or null if not found.
   */
  pathTo(
    condition: (tile: Tile) => boolean,
    path: Tile[] = [],
    minPathLength: number | null = null,
    maxPathLength: number | null = null,
  ): Tile[] | null {
    const cameFrom = new Map<Tile, Tile | null>([[this, null]]);
    for (const visited of path) {
      cameFrom.set(visited, null);
    }
    let frontier: Tile[] = [this];
    // number of tiles of a path that ends in the current frontier
    let length = path.length + 1;

    while (frontier.length > 0) {
      if ((minPathLength !== null && length >= minPathLength) || (maxPathLength !== null && length > maxPathLength)) {
        return null;
      }
      const next: Tile[] = [];
      for (const tile of frontier) {
        if (condition(tile)) {
          const result: Tile[] = [];
          for (let t: Tile | null | undefined = tile; t; t = cameFrom.get(t)) {
            result.unshift(t);
          }
          return [...path, ...result];
        }
        for (let d = 0; d < 4; d++) {
          const neighbor = tile.neighbors[d];
          if (!tile.walls[d] && neighbor && !cameFrom.has(neighbor)) {
            cameFrom.set(neighbor, tile);
            next.push(neighbor);
          }
        }
      }
      frontier = next;
      length++;
    }
    return null;
  }

  /**
   * Random walk along the map.
   * @param distance - Steps to walk.
   * @returns The final tile.
   */
  randomWalk(distance: number): Tile {
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
   * @param condition - Match condition.
   * @param maxPathLength - Max path length.
   * @returns Path to object or null.
   */
  xypathToObj(condition: (obj: GameObject) => boolean, maxPathLength: number | null = null): Coord[] | null {
    const tilepath = this.pathTo((dest) => dest.objs.some(condition), [], null, maxPathLength);
    if (!tilepath) {
      return null;
    }
    const xypath: Coord[] = tilepath.map((tile) => ({
      x: tile.x + tile.dx / 2,
      y: tile.y + tile.dy / 2,
    }));
    const foundObj = tilepath[tilepath.length - 1].objs.find(condition);
    if (!foundObj) {
      return null;
    }
    xypath.push(foundObj);
    return xypath;
  }
}

export default Tile;
