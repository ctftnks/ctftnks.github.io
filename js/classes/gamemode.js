Gamemode = function(game){
  console.log("Mode")
  console.log(game)
  this.name = "defaultmode";
  this.game = game;

}


Deathmatch = function(game){
  console.log("DM")
  Gamemode.call(this, game);
  this.name = "Deathmatch";

  // give score to player
  this.giveScore = function(player, val=1){
    player.score += val;
    player.spree += 1;
    if(player.spree >= 5 && player.spree % 5 == 0){
      player.score += Math.floor(player.spree / 5)
      playSound("res/sound/killingspree.mp3");
    }
  }

  // called when player1 kills player2
  this.newKill = function(player1, player2){
    if(player1.team == player2.team)
      this.giveScore(player1, -1);
    else
      this.giveScore(player1, 1);
  }
}



TeamDeathmatch = function(game){
  console.log("TDM")
  Gamemode.call(this, game);
  this.name = "TeamDeathmatch";

  // give score to team players
  this.giveScore = function(player, val=1){
    for(var i=0; i<this.game.players.length; i++)
      if(this.game.players[i].team == player.team)
        this.game.players[i].score += val;
    player.spree += 1;
    if(player.spree >= 5 && player.spree % 5 == 0){
      player.score += Math.floor(player.spree / 5)
      playSound("res/sound/killingspree.mp3");
    }
  }

  // called when player1 kills player2
  this.newKill = function(player1, player2){
    if(player1.team == player2.team)
      this.giveScore(player1, -1);
    else
      this.giveScore(player1, 1);
  }
}



CaptureTheFlag = function(game){
  Gamemode.call(this, game);
  this.name = "CaptureTheFlag";

  // give score to team players
  this.giveScore = function(player, val=1){
    for(var i=0; i<this.game.players.length; i++)
      if(this.game.players[i].team == player.team)
        this.game.players[i].score += val;
    player.spree += 1;
    if(player.spree >= 5 && player.spree % 5 == 0){
      player.score += Math.floor(player.spree / 5)
      playSound("res/sound/killingspree.mp3");
    }
  }

  // called when player1 kills player2
  this.newKill = function(player1, player2){
    if(player1.team != player2.team){
      player1.spree += 1;
      if(player1.spree >= 5 && player1.spree % 5 == 0){
        player1.score += Math.floor(player1.spree / 5)
        playSound("res/sound/killingspree.mp3");
      }
    }
  }
}
