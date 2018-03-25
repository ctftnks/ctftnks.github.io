Gamemode = function(game){
  this.name = "defaultmode";
  this.game = game;
  this.step = function(){}
}


Deathmatch = function(game){
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
    updateScores();
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
    updateScores();
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
  this.initiated = false;

  // give score to team players
  this.giveScore = function(player, val=1){
    for(var i=0; i<this.game.players.length; i++)
      if(this.game.players[i].team == player.team)
        this.game.players[i].score += val;
    updateScores();
  }

  // called when player1 kills player2
  this.newKill = function(player1, player2){
    if(player1.team != player2.team){
      player1.spree += 1;
      if(player1.spree >= 5 && player1.spree % 5 == 0){
        player1.score += Math.floor(player1.spree / 5)
        playSound("res/sound/killingspree.mp3");
      }
      updateScores();
    }
  }

  this.init = function(){
    var bases = [];
    var game = this.game;

    // create single base for each team
    for(var i=0; i<game.players.length; i++){
      var baseExists = false;
      for(var j=0; j<bases.length; j++)
        if(game.players[i].team == bases[j].team)
          baseExists = true;
      if(!baseExists){
        var b = new Base(game);
        var pos = game.map.spawnPoint();
        b.x = pos.x;
        b.y = pos.y;
        b.team = game.players[i].team;
        b.color = game.players[i].color;
        bases.push(b);
        game.addObject(b);
      }
    }
  }

  this.step = function(){
    if(!this.initiated){
      this.init();
      this.initiated = true;
    }
  }
}
