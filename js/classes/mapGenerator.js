
// Static class for some map generation methods

MapGenerator = {

  // just random walls somewhere
  randomMap: function(map){
    for(i=0; i<map.Nx; i++){
      for(j=0; j<map.Ny-1; j++){
        if(Math.random() < WallProbability / 2){
          map.tiles[i*map.Ny+j].walls.bottom = true;
          map.tiles[i*map.Ny+j+1].walls.top = true;
        }
      }
    }
    for(i=0; i<map.Nx-1; i++){
      for(j=0; j<map.Ny; j++){
        if(Math.random() < WallProbability / 2){
          map.tiles[i*map.Ny+j].walls.right = true;
          map.tiles[(i+1)*map.Ny+j].walls.left = true;
        }
      }
    }
  }

  // TODO: maze algorithm


}
