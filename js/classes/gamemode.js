class Gamemode {
  constructor(game) {
    this.name = "defaultmode";
    this.game = game;
    this.BaseSpawnDistance = 2;
  }
  step() {}
  init() {}
}

class Deathmatch extends Gamemode {
  constructor(game) {
    super(game);
    this.name = "Deathmatch";
  }

  // give score to player
  giveScore(player, val = 1) {
    player.score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 == 0) {
      player.score += Math.floor(player.spree / 5);
      playSound("res/sound/killingspree.mp3");
    }
    updateScores();
    adaptBotSpeed(player.team);
  }

  // called when player1 kills player2
  newKill(player1, player2) {
    if (player1.team == player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }
}

class TeamDeathmatch extends Gamemode {
  constructor(game) {
    super(game);
    this.name = "TeamDeathmatch";
    this.initiated = false;
    this.BaseSpawnDistance = 2;
  }

  // give score to team players
  giveScore(player, val = 1) {
    for (var i = 0; i < this.game.players.length; i++) if (this.game.players[i].team == player.team) this.game.players[i].score += val;
    player.spree += 1;
    if (player.spree >= 5 && player.spree % 5 == 0) {
      player.score += Math.floor(player.spree / 5);
      playSound("res/sound/killingspree.mp3");
    }
    updateScores();
    adaptBotSpeed(player.team);
  }

  // called when player1 kills player2
  newKill(player1, player2) {
    if (player1.team == player2.team) this.giveScore(player1, -1);
    else this.giveScore(player1, 1);
  }

  // init bases and spawn players
  init() {
    var bases = [];
    var game = this.game;

    // create single base for each team
    for (var i = 0; i < game.players.length; i++) {
      var baseExists = false;
      var player = game.players[i];
      for (var j = 0; j < bases.length; j++)
        if (player.team == bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        var maxLength = -1;
        var maxPos = game.map.spawnPoint();
        for (var k = 0; k < 100; k++) {
          var pos = game.map.spawnPoint();
          var tile = game.map.getTileByPos(pos.x, pos.y);
          var length = 0;
          var initfirst = false;
          if (bases.length == 0) {
            bases.push(game.map.spawnPoint());
            initfirst = true;
          }
          for (var j = 0; j < bases.length; j++) {
            var stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            var path = tile.pathTo(function (destination) {
              return destination.id == stile.id;
            });
            if (path != -1) length += path.length * path.length;
          }
          if (initfirst) bases = [];
          for (var j = 0; j < bases.length; j++) if (bases[j].x == pos.x && bases[j].y == pos.y) length = -1;
          if (length > maxLength) {
            maxLength = length;
            maxPos = pos;
          }
        }
        var b = new Base(game, player, maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        var spawnPoint = b.tile;
        while (spawnPoint.id == b.tile.id) spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

class CaptureTheFlag extends Gamemode {
  constructor(game) {
    super(game);
    this.name = "CaptureTheFlag";
    this.initiated = false;
    this.BaseSpawnDistance = 7;
  }

  // give score to team players
  giveScore(player, val = 1) {
    for (var i = 0; i < this.game.players.length; i++) if (this.game.players[i].team == player.team) this.game.players[i].score += val;
    updateScores();
    adaptBotSpeed(player.team);
  }

  // called when player1 kills player2
  newKill(player1, player2) {
    if (player1.team != player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 == 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound("res/sound/killingspree.mp3");
      }
      updateScores();
    }
  }

  init() {
    var bases = [];
    var game = this.game;

    // create single base for each team
    for (var i = 0; i < game.players.length; i++) {
      var baseExists = false;
      var player = game.players[i];
      for (var j = 0; j < bases.length; j++)
        if (player.team == bases[j].team) {
          baseExists = true;
          player.tank.x = bases[j].x;
          player.tank.y = bases[j].y;
          player.base = bases[j];
        }
      if (!baseExists) {
        // find spawnPoint that is far away from existing bases
        var maxLength = -1;
        var maxPos = game.map.spawnPoint();
        for (var k = 0; k < 100; k++) {
          var pos = game.map.spawnPoint();
          var tile = game.map.getTileByPos(pos.x, pos.y);
          var length = 0;
          var initfirst = false;
          if (bases.length == 0) {
            bases.push(game.map.spawnPoint());
            initfirst = true;
          }
          for (var j = 0; j < bases.length; j++) {
            var stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
            var path = tile.pathTo(function (destination) {
              return destination.id == stile.id;
            });
            if (path != -1) length += path.length * path.length;
          }
          if (initfirst) bases = [];
          for (var j = 0; j < bases.length; j++) if (bases[j].x == pos.x && bases[j].y == pos.y) length = -1;
          if (length > maxLength) {
            maxLength = length;
            maxPos = pos;
          }
        }
        var b = new Base(game, player, maxPos.x, maxPos.y);
        b.flag = new Flag(game, b);
        b.flag.drop(maxPos.x, maxPos.y);
        bases.push(b);
        game.addObject(b);
        var spawnPoint = b.tile;
        while (spawnPoint.id == b.tile.id) spawnPoint = spawnPoint.randomWalk(this.game.mode.BaseSpawnDistance + Math.round(Math.random()));
        player.tank.x = spawnPoint.x + spawnPoint.dx / 2;
        player.tank.y = spawnPoint.y + spawnPoint.dy / 2;
        player.base = b;
      }
    }
  }
}

// the map editor: implemented as a GameMode
class MapEditor extends Gamemode {
  constructor(game, clearmap = true) {
    super(game);
    this.clearmap = clearmap;
  }

  init() {
    var map = this.game.map;
    if (this.clearmap) {
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
    // add single player
    this.game.players = [];
    var p = new Player();
    this.game.addPlayer(p);
    p.keys = keymaps[0];
    p.color = playercolors[0];
  }

  step() {
    var t = this.game.players[0].tank;
    if (t.weapon.name != "WallBuilder") {
      t.weapon = new WallBuilder(t);
      t.defaultWeapon = function () {
        t.weapon = new WallBuilder(t);
      };
      t.checkWallCollision = function () {
        return false;
      };
    }
  }
}

class KingOfTheHill extends Gamemode {
  constructor(game) {
    super(game);
    this.name = "KingOfTheHill";
    this.bases = [];
  }

  // give score to team players
  giveScore(player, val = 1) {
    player.score += val;
    updateScores();
  }

  // called when player1 kills player2
  newKill(player1, player2) {
    if (player1.team != player2.team) {
      player1.spree += 1;
      if (player1.spree >= 5 && player1.spree % 5 == 0) {
        // player1.score += Math.floor(player1.spree / 5)
        playSound("res/sound/killingspree.mp3");
      }
      updateScores();
    }
  }

  step() {
    // if all bases same color: score in intervals for team
    var scoreevery = 2000;
    var equal = true;
    for (var i = 0; i < this.bases.length; i++) {
      if (this.bases[i].team != this.bases[0].team) {
        equal = false;
        break;
      }
    }
    var team = this.bases[0].team;
    if (equal && team != "#555" && this.game.t % scoreevery == 0) {
      for (var i = 0; i < this.game.players.length; i++) if (this.game.players[i].team == team) this.giveScore(this.game.players[i], 1);
      adaptBotSpeed(team, 0.02);
    }
  }

  init() {
    var bases = [];
    var game = this.game;

    // create players.length-1 bases
    for (var ni = 0; ni < game.players.length - 1; ni++) {
      // find spawnPoint that is far away from existing bases
      var maxLength = -1;
      var maxPos = game.map.spawnPoint();
      for (var k = 0; k < 100; k++) {
        var pos = game.map.spawnPoint();
        var tile = game.map.getTileByPos(pos.x, pos.y);
        var length = 0;
        var initfirst = false;
        if (bases.length == 0) {
          bases.push(game.map.spawnPoint());
          initfirst = true;
        }
        for (var j = 0; j < bases.length; j++) {
          var stile = this.game.map.getTileByPos(bases[j].x, bases[j].y);
          var path = tile.pathTo(function (destination) {
            return destination.id == stile.id;
          });
          if (path != -1) length += path.length * path.length;
        }
        if (initfirst) bases = [];
        for (var j = 0; j < bases.length; j++) if (bases[j].x == pos.x && bases[j].y == pos.y) length = -1;
        if (length > maxLength) {
          maxLength = length;
          maxPos = pos;
        }
      }
      var b = new Hill(game, maxPos.x, maxPos.y);
      bases.push(b);
      game.addObject(b);
    }
    this.bases = bases;
  }
}