import GameMap from "./gamemap";
import Tile from "./tile";

// Static class for some map generation methods

/**
 * Static class containing map generation algorithms.
 */
export class MapGenerator {
  static algorithms: ((map: GameMap, x1?: number, y1?: number, x2?: number, y2?: number) => void)[];

  /**
   * Generates a maze using Prim's algorithm.
   *
   * Start with a grid full of walls.
   * Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
   * While there are walls in the list:
   * Pick a random wall from the list. If the cell on the opposite side isn't in the maze yet:
   * Make the wall a passage and mark the cell on the opposite side as part of the maze.
   * Add the neighboring walls of the cell to the wall list.
   * If the cell on the opposite side already was in the maze, remove the wall from the list.
   * @param map - The map to modify.
   */
  static primsMaze(map: GameMap): void {
    // Start with a grid full of walls.
    for (let i = 0; i < map.Nx * map.Ny; i++) {
      map.tiles[i].walls = [true, true, true, true];
    }

    // candidate walls as (tile, direction) pairs; the tile is always already part of the maze
    const walls: { tile: Tile; dir: number }[] = [];
    const inMaze = new Set<number>();

    const addToMaze = (tile: Tile): void => {
      inMaze.add(tile.id);
      for (let dir = 0; dir < 4; dir++) {
        if (tile.neighbors[dir]) {
          walls.push({ tile, dir });
        }
      }
    };

    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
    addToMaze(map.tiles[Math.floor(Math.random() * map.tiles.length)]);

    // While there are walls in the list:
    while (walls.length > 0) {
      // Pick a random wall from the list and remove it from the list.
      const index = Math.floor(Math.random() * walls.length);
      const { tile, dir } = walls[index];
      walls[index] = walls[walls.length - 1];
      walls.pop();
      // If the cell on the opposite side isn't in the maze yet:
      const opposite = tile.neighbors[dir];
      if (opposite && !inMaze.has(opposite.id)) {
        // Make the wall a passage and mark the cell on the opposite side as part of the maze.
        tile.addWall(dir, true);
        // Add the neighboring walls of the cell to the wall list.
        addToMaze(opposite);
      }
    }
  }

  /**
   * Generates a map using Recursive Division.
   * @param map - The map to modify.
   * @param x1 - Start X.
   * @param y1 - Start Y.
   * @param x2 - End X.
   * @param y2 - End Y.
   */
  static recursiveDivision(map: GameMap, x1: number = -1, y1: number = -1, x2: number = -1, y2: number = -1): void {
    // recursive entry point
    if (x1 === -1) {
      // init limits
      x1 = 0;
      y1 = 0;
      x2 = map.Nx;
      y2 = map.Ny;
      // Start with a grid with no walls
      for (let i = 0; i < map.Nx * map.Ny; i++) {
        map.tiles[i].walls = [false, false, false, false];
      }
      // border walls
      for (let i = 0; i < map.Nx; i++) {
        (map.getTileByIndex(i, 0) as Tile).walls[0] = true;
        (map.getTileByIndex(i, map.Ny - 1) as Tile).walls[2] = true;
      }
      for (let i = 0; i < map.Ny; i++) {
        (map.getTileByIndex(0, i) as Tile).walls[1] = true;
        (map.getTileByIndex(map.Nx - 1, i) as Tile).walls[3] = true;
      }
    }
    // recursion end
    if (x2 - x1 < 2 || y2 - y1 < 2) {
      return;
    }
    if (x2 - x1 > y2 - y1) {
      // vertical cell-dividing wall
      const posX = x1 + Math.floor(Math.random() * (x2 - x1 - 1));
      for (let i = y1; i < y2; i++) {
        (map.getTileByIndex(posX, i) as Tile).addWall(3);
      }
      // random hole in vertical wall
      const posY = y1 + Math.floor(Math.random() * (y2 - y1));
      (map.getTileByIndex(posX, posY) as Tile).addWall(3, true);
      MapGenerator.recursiveDivision(map, x1, y1, posX + 1, y2);
      MapGenerator.recursiveDivision(map, posX + 1, y1, x2, y2);
    } else {
      // horizontal cell-dividing wall
      const posY = y1 + Math.floor(Math.random() * (y2 - y1 - 1));
      for (let i = x1; i < x2; i++) {
        (map.getTileByIndex(i, posY) as Tile).addWall(2);
      }
      // random hole in horizontal wall
      const posX = x1 + Math.floor(Math.random() * (x2 - x1));
      (map.getTileByIndex(posX, posY) as Tile).addWall(2, true);
      MapGenerator.recursiveDivision(map, x1, y1, x2, posY + 1);
      MapGenerator.recursiveDivision(map, x1, posY + 1, x2, y2);
    }
  }

  /**
   * Generates a map using Recursive Division with more holes.
   * @param map - The map to modify.
   * @param x1 - Start X.
   * @param y1 - Start Y.
   * @param x2 - End X.
   * @param y2 - End Y.
   */
  static porousRecursiveDivision(map: GameMap, x1: number = -1, y1: number = -1, x2: number = -1, y2: number = -1): void {
    // recursive entry point
    if (x1 === -1) {
      // init limits
      x1 = 0;
      y1 = 0;
      x2 = map.Nx;
      y2 = map.Ny;
      // Start with a grid with no walls
      for (let i = 0; i < map.Nx * map.Ny; i++) {
        map.tiles[i].walls = [false, false, false, false];
      }
      // border walls
      for (let i = 0; i < map.Nx; i++) {
        (map.getTileByIndex(i, 0) as Tile).walls[0] = true;
        (map.getTileByIndex(i, map.Ny - 1) as Tile).walls[2] = true;
      }
      for (let i = 0; i < map.Ny; i++) {
        (map.getTileByIndex(0, i) as Tile).walls[1] = true;
        (map.getTileByIndex(map.Nx - 1, i) as Tile).walls[3] = true;
      }
    }
    // recursion end
    if (x2 - x1 < 2 || y2 - y1 < 2) {
      return;
    }
    if (x2 - x1 > y2 - y1) {
      // vertical cell-dividing wall
      const posX = x1 + Math.floor(Math.random() * (x2 - x1 - 1));
      for (let i = y1; i < y2; i++) {
        (map.getTileByIndex(posX, i) as Tile).addWall(3);
      }
      const doubleHole = y2 - y1 > 2 ? 3 : 1;
      for (let k = 0; k < doubleHole; k++) {
        // random hole in vertical wall
        const posY = y1 + Math.floor(Math.random() * (y2 - y1));
        (map.getTileByIndex(posX, posY) as Tile).addWall(3, true);
      }
      MapGenerator.porousRecursiveDivision(map, x1, y1, posX + 1, y2);
      MapGenerator.porousRecursiveDivision(map, posX + 1, y1, x2, y2);
    } else {
      // horizontal cell-dividing wall
      const posY = y1 + Math.floor(Math.random() * (y2 - y1 - 1));
      for (let i = x1; i < x2; i++) {
        (map.getTileByIndex(i, posY) as Tile).addWall(2);
      }
      const doubleHole = x2 - x1 > 2 ? 3 : 1;
      for (let k = 0; k < doubleHole; k++) {
        // random hole in horizontal wall
        const posX = x1 + Math.floor(Math.random() * (x2 - x1));
        (map.getTileByIndex(posX, posY) as Tile).addWall(2, true);
      }
      MapGenerator.porousRecursiveDivision(map, x1, y1, x2, posY + 1);
      MapGenerator.porousRecursiveDivision(map, x1, posY + 1, x2, y2);
    }
  }
}

export default MapGenerator;

// List of all algorithms
MapGenerator.algorithms = [
  MapGenerator.primsMaze,
  MapGenerator.recursiveDivision,
  MapGenerator.porousRecursiveDivision,
  MapGenerator.porousRecursiveDivision,
];
