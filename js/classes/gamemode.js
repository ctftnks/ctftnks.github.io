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
  this.initiated = false;

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

  // init bases and spawn players
  this.init = function(){
    var bases = [];
    var game = this.game;

    // create single base for each team
    for(var i=0; i<game.players.length; i++){
      var baseExists = false;
      var player = game.players[i];
      for(var j=0; j<bases.length; j++)
        if(player.team == bases[j].team){
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if(!baseExists){
        // find spawnPoint that is far away from existing bases
        var maxLength = -1;
        var maxPos = game.map.spawnPoint();
        for(var k=0; k<20; k++){
          var pos = game.map.spawnPoint();
          var tile = game.map.getTileByPos(pos.x, pos.y);
          var length = 0;
          for(var j=0; j<bases.length; j++){
            var stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            var path = tile.pathTo(function(destination){
              return destination.id == stile.id;
            });
            if(path != -1)
              length += path.length * path.length;
          }
          for(var j=0; j<bases.length; j++)
            if(bases[j].x == pos.x && bases[j].y == pos.y)
              length = -1;
          if(length > maxLength){
            maxLength = length;
            maxPos = pos;
          }
        }
        var b = new Base(game, player, maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        var spawnPoint = b.tile;
        while(spawnPoint.id == b.tile.id)
          spawnPoint = spawnPoint.randomWalk(Math.floor(Math.random()*5));
        player.tank.x = spawnPoint.x + spawnPoint.dx/2;
        player.tank.y = spawnPoint.y + spawnPoint.dy/2;
        player.base = b;
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
      var player = game.players[i];
      for(var j=0; j<bases.length; j++)
        if(player.team == bases[j].team){
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if(!baseExists){
        // find spawnPoint that is far away from existing bases
        var maxLength = -1;
        var maxPos = game.map.spawnPoint();
        for(var k=0; k<20; k++){
          var pos = game.map.spawnPoint();
          var tile = game.map.getTileByPos(pos.x, pos.y);
          var length = 0;
          for(var j=0; j<bases.length; j++){
            var stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            var path = tile.pathTo(function(destination){
              return destination.id == stile.id;
            });
            if(path != -1)
              length += path.length * path.length;
          }
          for(var j=0; j<bases.length; j++)
            if(bases[j].x == pos.x && bases[j].y == pos.y)
              length = -1;
          if(length > maxLength){
            maxLength = length;
            maxPos = pos;
          }
        }
        var b = new Base(game, player, maxPos.x, maxPos.y);
        b.flag = new Flag(game, b);
        b.flag.drop(maxPos.x, maxPos.y);
        b.hasFlag = true;
        bases.push(b);
        game.addObject(b);
        var spawnPoint = b.tile;
        while(spawnPoint.id == b.tile.id)
          spawnPoint = spawnPoint.randomWalk(Math.floor(Math.random()*5));
        player.tank.x = spawnPoint.x + spawnPoint.dx/2;
        player.tank.y = spawnPoint.y + spawnPoint.dy/2;
        player.base = b;
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
