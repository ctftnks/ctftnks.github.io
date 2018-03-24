Gamemode = function(game){
  this.name = "defaultmode";

}


Deathmatch = function(game){
  Gamemode.call(this, game);
  this.name = "Deathmatch";

}
