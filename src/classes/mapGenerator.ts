import GameMap from "./gamemap";
import Tile from "./tile";
import { store } from "@/store";
import { newGame } from "./game";

// Static class for some map generation methods

/**
 * Static class containing map generation algorithms.
 */
export default class MapGenerator {
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
   * @param {GameMap} map - The map to modify.
   */
  static primsMaze(map: GameMap): void {
    // Start with a grid full of walls.
    for (let i = 0; i < map.Nx * map.Ny; i++) {
      map.tiles[i].walls = [true, true, true, true];
    }

    const walls: number[] = [];
    const inMaze: number[] = [];

    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
    const randomCell = map.tiles[parseInt("" + Math.random() * (map.Nx * map.Ny - 1))];
    inMaze.push(randomCell.id);
    for (let i = 0; i < 4; i++) {
      walls.push(randomCell.id + 0.1 * i);
    }

    // While there are walls in the list:
    while (walls.length > 0) {
      // Pick a random wall from the list.
      const randomWallNo = parseInt((Math.random() * (walls.length - 1)).toString());
      const randomWall = walls[randomWallNo];
      // If the cell on the opposite side isn't in the maze yet:
      const cellID = Math.floor(randomWall);
      const wallDir = parseInt(((10 * randomWall) % 4).toString());
      const tile = map.tiles[cellID];
      const opposite = tile.neighbors[wallDir % 4];
      if (opposite && inMaze.indexOf(opposite.id) === -1) {
        // Make the wall a passage and mark the cell on the opposite side as part of the maze.
        tile.addWall(wallDir, true);
        inMaze.push(opposite.id);
        // Add the neighboring walls of the cell to the wall list.
        for (let i = 0; i < 4; i++) {
          if (opposite.walls[i]) {
            walls.push(opposite.id + 0.1 * i);
          }
        }
        walls.splice(randomWallNo, 1);
      } else // If the cell on the opposite side already was in the maze, remove the wall from the list.
      {
        walls.splice(randomWallNo, 1);
      }
    }
  }

  /**
   * Generates a map using Recursive Division.
   * @param {GameMap} map - The map to modify.
   * @param {number} x1 - Start X.
   * @param {number} y1 - Start Y.
   * @param {number} x2 - End X.
   * @param {number} y2 - End Y.
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
   * @param {GameMap} map - The map to modify.
   * @param {number} x1 - Start X.
   * @param {number} y1 - Start Y.
   * @param {number} x2 - End X.
   * @param {number} y2 - End Y.
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
      MapGenerator.recursiveDivision(map, x1, y1, posX + 1, y2);
      MapGenerator.recursiveDivision(map, posX + 1, y1, x2, y2);
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
      MapGenerator.recursiveDivision(map, x1, y1, x2, posY + 1);
      MapGenerator.recursiveDivision(map, x1, posY + 1, x2, y2);
    }
  }

  /**
   * Export map into bit format.
   * @param {GameMap} map - The map to export.
   * @returns {string} The encoded map data.
   */
  static exportMap(map: GameMap): string {
    const Nx = map.Nx;
    const Ny = map.Ny;
    let data = "";
    for (let j = 0; j < Ny; j++) {
      for (let i = 0; i < Nx; i++) {
        let number = 0;
        const t = map.getTileByIndex(i, j) as Tile;
        for (let d = 0; d < 4; d++) {
          number += (t.walls[d] ? 1 : 0) * Math.pow(2, d);
        }
        data += "" + number;
        if (i < Nx - 1) {
          data += " ";
        }
      }
      if (j < Ny - 1) {
        data += "\n";
      }
    }
    return data;
  }

  /**
   * Applies a prefetched map data to an existing map object.
   * @param {GameMap} map - The map to update.
   */
  static importedMap(map: GameMap) {
    if (!prefetchedMap) {
      return;
    }
    // copy tiles and size to old map
    map.Nx = prefetchedMap.Nx;
    map.Ny = prefetchedMap.Ny;
    map.tiles = prefetchedMap.tiles;
    // map.dx = prefetchedMap.dx;
    // map.dy = prefetchedMap.dy;
    map.resize();
  }

  /**
   * Import map from file.
   * @param {string|number} mapname - Map identifier.
   */
  static importMap(mapname: string | null = null): void {
    // request file
    const xhttp = new XMLHttpRequest();
    // TODO: pick random name
    const maxMapId = 0;
    if (mapname === null) {
      mapname = Math.floor(Math.random() * maxMapId).toString();
    }
    xhttp.open("GET", "maps/" + mapname + ".csv", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        // got data from file, now process it
        const data = this.responseText;
        const lines = data.match(/[^\r\n]+/g);
        if (!lines) {
          return;
        }
        const Ny = lines.length;
        const Nx = lines[0].split(" ").length;

        // Safety check for game
        const map = new GameMap(store.canvas!, Nx, Ny);
        for (let j = 0; j < Ny; j++) {
          const line = lines[j].split(" ");
          for (let i = 0; i < Nx; i++) {
            const number = parseInt(line[i]);
            const t = map.getTileByIndex(i, j) as Tile;
            for (let d = 0; d < 4; d++) {
              t.walls[d] = (number >>> d) % 2 === 1;
            }
          }
        }
        // copy tiles and size to old map
        // map.Nx = newmap.Nx;
        // map.Ny = newmap.Ny;
        // map.tiles = newmap.tiles;
        // map.dx = newmap.dx;
        // map.dy = newmap.dy;
        // map.resize();
        // prefetchedMap = map;
        newGame(map);
      }
    };
  }
}

export const prefetchedMap: GameMap | undefined = undefined;

// List of all algorithms
MapGenerator.algorithms = [
  MapGenerator.primsMaze,
  MapGenerator.recursiveDivision,
  MapGenerator.porousRecursiveDivision,
  MapGenerator.porousRecursiveDivision,
];
