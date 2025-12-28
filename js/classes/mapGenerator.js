// Static class for some map generation methods

/**
 * Static class containing map generation algorithms.
 */
class MapGenerator {
  /**
   * Generates a random map with walls.
   * @param {Map} map - The map to modify.
   */
  static randomMap(map) {
    // generate walls at frame borders
    for (var i = 0; i < this.Nx; i++) {
      this.tiles[i * this.Ny].walls[0] = true;
      this.tiles[i * this.Ny + this.Nx - 1].walls[2] = true;
    }
    for (var j = 0; j < this.Ny; j++) {
      this.tiles[j].walls[1] = true;
      this.tiles[(this.Nx - 1) * this.Ny + j].walls[3] = true;
    }
    for (var i = 0; i < map.Nx; i++) {
      for (var j = 0; j < map.Ny - 1; j++) {
        if (Math.random() < 0.6 / 2) {
          map.tiles[i * map.Ny + j].walls[2] = true;
          map.tiles[i * map.Ny + j + 1].walls[0] = true;
        }
      }
    }
    for (var i = 0; i < map.Nx - 1; i++) {
      for (var j = 0; j < map.Ny; j++) {
        if (Math.random() < 0.6 / 2) {
          map.tiles[i * map.Ny + j].walls[3] = true;
          map.tiles[(i + 1) * map.Ny + j].walls[1] = true;
        }
      }
    }
  }

  // Prim's maze algorithm
  // Start with a grid full of walls.
  // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
  // While there are walls in the list:
  // Pick a random wall from the list. If the cell on the opposite side isn't in the maze yet:
  // Make the wall a passage and mark the cell on the opposite side as part of the maze.
  // Add the neighboring walls of the cell to the wall list.
  // If the cell on the opposite side already was in the maze, remove the wall from the list.

  /**
   * Generates a maze using Prim's algorithm.
   * @param {Map} map - The map to modify.
   */
  static primsMaze(map) {
    // Start with a grid full of walls.
    for (var i = 0; i < map.Nx * map.Ny; i++) map.tiles[i].walls = [true, true, true, true];
    var walls = [];
    var inMaze = [];
    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
    var randomCell = map.tiles[parseInt(Math.random() * (map.Nx * map.Ny - 1))];
    inMaze.push(randomCell.id);
    for (var i = 0; i < 4; i++) walls.push(randomCell.id + 0.1 * i);
    // While there are walls in the list:
    while (walls.length > 0) {
      // Pick a random wall from the list.
      var randomWallNo = parseInt(Math.random() * (walls.length - 1));
      var randomWall = walls[randomWallNo];
      // If the cell on the opposite side isn't in the maze yet:
      var cellID = Math.floor(randomWall);
      var wallDir = parseInt((10 * randomWall) % 4);
      var opposite = map.tiles[cellID].neighbors[wallDir % 4];
      if (opposite != -1 && inMaze.indexOf(opposite.id) == -1) {
        // Make the wall a passage and mark the cell on the opposite side as part of the maze.
        map.tiles[cellID].addWall(wallDir, true);
        inMaze.push(opposite.id);
        // Add the neighboring walls of the cell to the wall list.
        for (var i = 0; i < 4; i++) if (opposite.walls[i]) walls.push(opposite.id + 0.1 * i);
        walls.splice(randomWallNo, 1);
      } else {
        // If the cell on the opposite side already was in the maze, remove the wall from the list.
        walls.splice(randomWallNo, 1);
      }
    }
  }

  /**
   * Generates a map using Recursive Division.
   * @param {Map} map - The map to modify.
   * @param {number} x1 - Start X.
   * @param {number} y1 - Start Y.
   * @param {number} x2 - End X.
   * @param {number} y2 - End Y.
   */
  static recursiveDivision(map, x1 = -1, y1 = -1, x2 = -1, y2 = -1) {
    // recursive entry point
    if (x1 == -1) {
      // init limits
      x1 = 0;
      y1 = 0;
      x2 = map.Nx;
      y2 = map.Ny;
      // Start with a grid with no walls
      for (var i = 0; i < map.Nx * map.Ny; i++) map.tiles[i].walls = [false, false, false, false];
      // border walls
      for (var i = 0; i < map.Nx; i++) {
        map.getTileByIndex(i, 0).walls[0] = true;
        map.getTileByIndex(i, map.Ny - 1).walls[2] = true;
      }
      for (var i = 0; i < map.Ny; i++) {
        map.getTileByIndex(0, i).walls[1] = true;
        map.getTileByIndex(map.Nx - 1, i).walls[3] = true;
      }
    }
    // recursion end
    if (x2 - x1 < 2 || y2 - y1 < 2) return;
    if (x2 - x1 > y2 - y1) {
      // vertical cell-dividing wall
      var posX = x1 + Math.floor(Math.random() * (x2 - x1 - 1));
      for (var i = y1; i < y2; i++) map.getTileByIndex(posX, i).addWall(3);
      // random hole in vertical wall
      var posY = y1 + Math.floor(Math.random() * (y2 - y1));
      map.getTileByIndex(posX, posY).addWall(3, true);
      MapGenerator.recursiveDivision(map, x1, y1, posX + 1, y2);
      MapGenerator.recursiveDivision(map, posX + 1, y1, x2, y2);
    } else {
      // vertical cell-dividing wall
      var posY = y1 + Math.floor(Math.random() * (y2 - y1 - 1));
      for (var i = x1; i < x2; i++) map.getTileByIndex(i, posY).addWall(2);
      // random hole in vertical wall
      var posX = x1 + Math.floor(Math.random() * (x2 - x1));
      map.getTileByIndex(posX, posY).addWall(2, true);
      MapGenerator.recursiveDivision(map, x1, y1, x2, posY + 1);
      MapGenerator.recursiveDivision(map, x1, posY + 1, x2, y2);
    }
  }

  /**
   * Generates a map using Recursive Division with more holes.
   * @param {Map} map - The map to modify.
   * @param {number} x1 - Start X.
   * @param {number} y1 - Start Y.
   * @param {number} x2 - End X.
   * @param {number} y2 - End Y.
   */
  static porousRecursiveDivision(map, x1 = -1, y1 = -1, x2 = -1, y2 = -1) {
    // recursive entry point
    if (x1 == -1) {
      // init limits
      x1 = 0;
      y1 = 0;
      x2 = map.Nx;
      y2 = map.Ny;
      // Start with a grid with no walls
      for (var i = 0; i < map.Nx * map.Ny; i++) map.tiles[i].walls = [false, false, false, false];
      // border walls
      for (var i = 0; i < map.Nx; i++) {
        map.getTileByIndex(i, 0).walls[0] = true;
        map.getTileByIndex(i, map.Ny - 1).walls[2] = true;
      }
      for (var i = 0; i < map.Ny; i++) {
        map.getTileByIndex(0, i).walls[1] = true;
        map.getTileByIndex(map.Nx - 1, i).walls[3] = true;
      }
    }
    // recursion end
    if (x2 - x1 < 2 || y2 - y1 < 2) return;
    if (x2 - x1 > y2 - y1) {
      // vertical cell-dividing wall
      var posX = x1 + Math.floor(Math.random() * (x2 - x1 - 1));
      for (var i = y1; i < y2; i++) map.getTileByIndex(posX, i).addWall(3);
      var doubleHole = y2 - y1 > 2 ? 3 : 1;
      for (var k = 0; k < doubleHole; k++) {
        // random hole in vertical wall
        var posY = y1 + Math.floor(Math.random() * (y2 - y1));
        map.getTileByIndex(posX, posY).addWall(3, true);
      }
      MapGenerator.recursiveDivision(map, x1, y1, posX + 1, y2);
      MapGenerator.recursiveDivision(map, posX + 1, y1, x2, y2);
    } else {
      // horizontal cell-dividing wall
      var posY = y1 + Math.floor(Math.random() * (y2 - y1 - 1));
      for (var i = x1; i < x2; i++) map.getTileByIndex(i, posY).addWall(2);
      var doubleHole = x2 - x1 > 2 ? 3 : 1;
      for (var k = 0; k < doubleHole; k++) {
        // random hole in horizontal wall
        var posX = x1 + Math.floor(Math.random() * (x2 - x1));
        map.getTileByIndex(posX, posY).addWall(2, true);
      }
      MapGenerator.recursiveDivision(map, x1, y1, x2, posY + 1);
      MapGenerator.recursiveDivision(map, x1, posY + 1, x2, y2);
    }
  }

  /**
   * Export map into bit format.
   * @param {Map} map - The map to export.
   * @returns {string} The encoded map data.
   */
  static exportMap(map) {
    var Nx = map.Nx;
    var Ny = map.Ny;
    var data = "";
    for (var j = 0; j < Ny; j++) {
      for (var i = 0; i < Nx; i++) {
        var number = 0;
        var t = map.getTileByIndex(i, j);
        for (var d = 0; d < 4; d++) number += t.walls[d] * Math.pow(2, d);
        data += "" + number;
        if (i < Nx - 1) data += " ";
      }
      if (j < Ny - 1) data += "\n";
    }
    return data;
  }

  /**
   * Applies a prefetched map data to an existing map object.
   * @param {Map} map - The map to update.
   */
  static importedMap(map) {
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
  static importMap(mapname = -1) {
    // request file
    var xhttp = new XMLHttpRequest();
    // TODO: pick random name
    var maxMapId = 0;
    if (mapname == -1) mapname = Math.floor(Math.random() * maxMapId);
    xhttp.open("GET", "maps/" + mapname + ".csv", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // got data from file, now process it
        var data = this.responseText;
        var lines = data.match(/[^\r\n]+/g);
        var Ny = lines.length;
        var Nx = lines[0].split(" ").length;
        var map = new Map(game.map.canvas, Nx, Ny);
        for (var j = 0; j < Ny; j++) {
          var line = lines[j].split(" ");
          for (var i = 0; i < Nx; i++) {
            var number = parseInt(line[i]);
            var t = map.getTileByIndex(i, j);
            for (var d = 0; d < 4; d++) t.walls[d] = (number >>> d) % 2 == 1;
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

var prefetchedMap = undefined;

// List of all algorithms
MapGenerator.algorithms = [
  MapGenerator.primsMaze,
  MapGenerator.recursiveDivision,
  MapGenerator.porousRecursiveDivision,
  MapGenerator.porousRecursiveDivision,
];
