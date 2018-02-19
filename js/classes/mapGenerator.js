
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


  // TODO: recursive division method

}
