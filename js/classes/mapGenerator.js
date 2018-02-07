
// Static class for some map generation methods

MapGenerator = {

  // just random walls somewhere
  randomMap: function(map){
    for(var i=0; i<map.Nx; i++){
      for(var j=0; j<map.Ny-1; j++){
        if(Math.random() < WallProbability / 2){
          map.tiles[i*map.Ny+j].walls.bottom = true;
          map.tiles[i*map.Ny+j+1].walls.top = true;
        }
      }
    }
    for(var i=0; i<map.Nx-1; i++){
      for(var j=0; j<map.Ny; j++){
        if(Math.random() < WallProbability / 2){
          map.tiles[i*map.Ny+j].walls.right = true;
          map.tiles[(i+1)*map.Ny+j].walls.left = true;
        }
      }
    }
  },

  // TODO: maze algorithm
  // prims maze algorithm
  // Start with a grid full of walls.
  // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
  // While there are walls in the list:
    // Pick a random wall from the list. If the cell on the opposite side isn't in the maze yet:
      // Make the wall a passage and mark the cell on the opposite side as part of the maze.
      // Add the neighboring walls of the cell to the wall list.
    // If the cell on the opposite side already was in the maze, remove the wall from the list.


  primsMaze: function(map){
    // Start with a grid full of walls.
    for(var i=0; i<map.Nx*map.Ny; i++){
        map.tiles[i].walls.top = true;
        map.tiles[i].walls.bottom = true;
        map.tiles[i].walls.left = true;
        map.tiles[i].walls.right = true;
    }
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
      var opposite = MapGenerator.getNeighbor(map.tiles[cellID], wallDir);
      if(opposite != -1 && inMaze.indexOf(opposite.id) == -1){
        // Make the wall a passage and mark the cell on the opposite side as part of the maze.
        MapGenerator.modWall(map.tiles[cellID], wallDir, false);
        inMaze.push(opposite.id);
        // Add the neighboring walls of the cell to the wall list.
        if(opposite.walls.top) walls.push(opposite.id+0.1*0);
        if(opposite.walls.right) walls.push(opposite.id+0.1*1);
        if(opposite.walls.bottom) walls.push(opposite.id+0.1*2);
        if(opposite.walls.left) walls.push(opposite.id+0.1*3);
        walls.splice(randomWallNo, 1);
      }else{
        // If the cell on the opposite side already was in the maze, remove the wall from the list.
        walls.splice(randomWallNo, 1);
      }
    }
  },

  // auxiliary functions
  modWall(tile, direction, add=true, neighbor=true){
    if(tile != -1){
      switch(direction % 4){
        case 0:
          tile.walls.top = add;
          if(neighbor)
            MapGenerator.modWall(tile.neighbors.top, direction + 2, add, false);
          break;
        case 1:
          tile.walls.right = add;
          if(neighbor)
            MapGenerator.modWall(tile.neighbors.right, direction + 2, add, false);
          break;
        case 2:
          tile.walls.bottom = add;
          if(neighbor)
            MapGenerator.modWall(tile.neighbors.bottom, direction + 2, add, false);
          break;
        case 3:
          tile.walls.left = add;
          if(neighbor)
            MapGenerator.modWall(tile.neighbors.left, direction + 2, add, false);
          break;
        default: break;
      }
    }
  },
  getNeighbor(tile, direction){
    if(tile != -1){
      switch(direction % 4){
        case 0:
          return tile.neighbors.top;
          break;
        case 1:
          return tile.neighbors.right;
          break;
        case 2:
          return tile.neighbors.bottom;
          break;
        case 3:
          return tile.neighbors.left;
          break;
        default: break;
      }
    }
  }
}
