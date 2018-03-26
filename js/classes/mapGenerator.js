
// Static class for some map generation methods

MapGenerator = {

  // just random walls somewhere
  randomMap: function(map){
    // generate walls at frame borders
    for(var i=0; i<this.Nx; i++){
      this.tiles[i*this.Ny].walls[0] = true;
      this.tiles[i*this.Ny + this.Nx-1].walls[2] = true;
    }
    for(var j=0; j<this.Ny; j++){
      this.tiles[j].walls[1] = true;
      this.tiles[(this.Nx-1)*this.Ny+j].walls[3] = true;
    }
    for(var i=0; i<map.Nx; i++){
      for(var j=0; j<map.Ny-1; j++){
        if(Math.random() < 0.6 / 2){
          map.tiles[i*map.Ny+j].walls[2] = true;
          map.tiles[i*map.Ny+j+1].walls[0] = true;
        }
      }
    }
    for(var i=0; i<map.Nx-1; i++){
      for(var j=0; j<map.Ny; j++){
        if(Math.random() < 0.6 / 2){
          map.tiles[i*map.Ny+j].walls[3] = true;
          map.tiles[(i+1)*map.Ny+j].walls[1] = true;
        }
      }
    }
  },

  // Prim's maze algorithm
  // Start with a grid full of walls.
  // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
  // While there are walls in the list:
    // Pick a random wall from the list. If the cell on the opposite side isn't in the maze yet:
      // Make the wall a passage and mark the cell on the opposite side as part of the maze.
      // Add the neighboring walls of the cell to the wall list.
    // If the cell on the opposite side already was in the maze, remove the wall from the list.


  primsMaze: function(map){
    // Start with a grid full of walls.
    for(var i=0; i<map.Nx*map.Ny; i++)
        map.tiles[i].walls = [true, true, true, true];
    walls = [];
    inMaze = [];
    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
    var randomCell = map.tiles[parseInt(Math.random() * (map.Nx*map.Ny - 1))];
    inMaze.push(randomCell.id);
    for(var i=0; i<4; i++)
      walls.push(randomCell.id+0.1*i);
    // While there are walls in the list:
    while(walls.length > 0){
      // Pick a random wall from the list.
      var randomWallNo = parseInt(Math.random() * (walls.length - 1));
      var randomWall = walls[randomWallNo];
      // If the cell on the opposite side isn't in the maze yet:
      var cellID = Math.floor(randomWall);
      var wallDir = parseInt((10*randomWall) % 4);
      var opposite = map.tiles[cellID].neighbors[wallDir % 4];
      if(opposite != -1 && inMaze.indexOf(opposite.id) == -1){
        // Make the wall a passage and mark the cell on the opposite side as part of the maze.
        map.tiles[cellID].addWall(wallDir, true);
        inMaze.push(opposite.id);
        // Add the neighboring walls of the cell to the wall list.
        for(var i=0; i<4; i++)
          if(opposite.walls[i]) walls.push(opposite.id+0.1*i);
        walls.splice(randomWallNo, 1);
      }else{
        // If the cell on the opposite side already was in the maze, remove the wall from the list.
        walls.splice(randomWallNo, 1);
      }
    }
  },

  // Recursive Division Algorithm
  recursiveDivision: function(map, x1=-1, y1=-1, x2=-1, y2=-1){
    // recursive entry point
    if(x1 == -1){
      // init limits
      x1 = 0;
      y1 = 0;
      x2 = map.Nx;
      y2 = map.Ny;
      // Start with a grid with no walls
      for(var i=0; i<map.Nx*map.Ny; i++)
          map.tiles[i].walls = [false, false, false, false];
      // border walls
      for(var i=0; i<map.Nx; i++){
        map.getTileByIndex(i, 0).walls[0] = true;
        map.getTileByIndex(i, map.Ny-1).walls[2] = true;
      }
      for(var i=0; i<map.Ny; i++){
        map.getTileByIndex(0, i).walls[1] = true;
        map.getTileByIndex(map.Nx-1, i).walls[3] = true;
      }
    }
    // recursion end
    if(x2 - x1 < 2 || y2 - y1 < 2)
      return;
    if(x2 - x1 > y2 - y1){
      // vertical cell-dividing wall
      var posX = x1 + Math.floor(Math.random() * (x2 - x1 - 1));
      for(var i=y1; i<y2; i++)
        map.getTileByIndex(posX, i).addWall(3);
      // random hole in vertical wall
      var posY = y1 + Math.floor(Math.random() * (y2 - y1));
      map.getTileByIndex(posX, posY).addWall(3, true);
      MapGenerator.recursiveDivision(map, x1, y1, posX+1, y2);
      MapGenerator.recursiveDivision(map, posX+1, y1, x2, y2);
    }else{
      // vertical cell-dividing wall
      var posY = y1 + Math.floor(Math.random() * (y2 - y1 - 1));
      for(var i=x1; i<x2; i++)
        map.getTileByIndex(i, posY).addWall(2);
      // random hole in vertical wall
      var posX = x1 + Math.floor(Math.random() * (x2 - x1));
      map.getTileByIndex(posX, posY).addWall(2, true);
      MapGenerator.recursiveDivision(map, x1, y1, x2, posY+1);
      MapGenerator.recursiveDivision(map, x1, posY+1, x2, y2);
    }
  },

}

// List of all algorithms
MapGenerator.algorithms = [MapGenerator.primsMaze, MapGenerator.recursiveDivision];
