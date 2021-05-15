

NBots = 0;

Bot = function (player) {
  Player.call(this);
  this.name = "Bot " + (NBots + 1);
  this.isBot = true;
  this.keys = undefined;
  this.goto = -1;
  this.fleeing = false;
  NBots++;

  this.step = function () {
    // check possible actions and decide for one
    this.autopilot();
    // perform movements, if any are planned
    this.perform_movements();
  }

  this.autopilot = function () {
    // prevent executing this method too often
    this.lastChecked += GameFrequency;
    if (this.lastChecked < 72000 / this.tank.speed)
      // if (this.lastChecked < 360 / this.tank.speed)
      return;
    this.lastChecked = 0;

    // some abbreviations
    var self = this;
    var game = this.game;
    var mode = game.mode;
    var tank = this.tank;
    var weapon = tank.weapon;
    var invincible = tank.invincible();
    var tile = game.map.getTileByPos(tank.x, tank.y);
    var fleeing = false;

    // a list of possible actions: will be populated first and the bot then decides which action to take
    var opts = [];

    // get info on the current situation of the tank

    // check if any interesting powerups are close
    var powerupPath = tile.xypathToObj(function (obj) {
      return obj.isPowerUp && obj.attractsBots;
    }, 2);
    // if powerup found, add option to go to it
    if (powerupPath != -1)
      opts.push({ f: function () { self.follow(powerupPath); }, weight: 100 });

    // check for nearest enemy tank
    var enemyPath = tile.xypathToObj(function (obj) {
      return obj.type == "Tank" && obj.player.team != self.team;
    });
    // if enemy found...
    if (enemyPath != -1) {
      var enemy = enemyPath[enemyPath.length - 1];
      // ...add option to move in its direction
      opts.push({ f: function () { self.follow(enemyPath); }, weight: 1 });
      // ...consider shooting if enemy is within range of the weapon
      if (weapon.active) {
        var aimbot = this.aimbot(enemy, enemyPath);
        if (aimbot.should_shoot)
          opts.push({ f: function () { self.shoot(aimbot.target); }, weight: aimbot.weight });
      }
    }

    // GAME MODE RELATED ACTIONS
    if (game.mode.name == "CaptureTheFlag") {
      // game mode: Capture The Flag
      var carriesFlag = tank.carriedFlag != -1;
      var flagInBase = self.base.hasFlag();
      var ctfPath = tile.xypathToObj(function (obj) {
        // if I have no flag: search for enemy flag
        if (!carriesFlag && obj.type == "Flag" && obj.team != self.team)
          return true;
        // if I have a flag and own flag is at own base: return to base
        if (carriesFlag && obj.type == "Base" && obj.hasFlag() && obj.team == self.team)
          return true;
        // if own flag is not in own base: search it
        if (!flagInBase) {
          if (obj.type == "Flag" && obj.team == self.team)
            return true;
          if (obj.type == "Tank" && obj.carriedFlag != -1 && obj.carriedFlag.team == self.team)
            return true;
        }
      });
      // add option and put weight depending on situation
      if (ctfPath != -1) {
        var weight = (carriesFlag || !flagInBase) ? 300 : 50;
        opts.push({ f: function () { self.follow(ctfPath); }, weight: weight });
      }

    } else if (game.mode.name == "KingOfTheHill") {
      // game mode: King Of The Hill
      // search for free bases
      var basePath = tile.xypathToObj(function (obj) {
        if (obj.type == "Hill" && obj.team != self.team)
          return true;
      });
      if (basePath != -1) {
        var weight = (basePath.length < 6) ? 300 : 50;
        opts.push({ f: function () { self.follow(basePath); }, weight: weight });
      }
    }

    // TODO: check for bullets & fleeing?

    // sort the options by weight and act on the option with the highest weight
    if (opts.length > 0) {
      opts.sort(function (a, b) { return a.weight > b.weight ? -1 : 1; });
      opts[0].f();
    } else {
      // else do nothing
      this.goto = -1;
    }

  }

  // set a goto target from a path, the tank will then move towards the target
  this.follow = function (path) {
    if (path.length < 2)
      this.goto = path[0];
    else
      this.goto = path[1];
  }

  // perform movements towards a goto target (if any)
  this.perform_movements = function () {
    if (this.goto == -1)
      return;
    var tank = this.tank;
    var distx = this.goto.x - tank.x;
    var disty = this.goto.y - tank.y;
    // norm angles to interval [0, 2pi]
    var newangle = Math.atan2(-distx, disty) + Math.PI;
    while (newangle < 0)
      newangle += 2 * Math.PI;
    newangle = newangle % (2 * Math.PI);
    while (tank.angle < 0)
      tank.angle += 2 * Math.PI;
    tank.angle = tank.angle % (2 * Math.PI);
    // turn and move in correct direction
    if (Math.abs(tank.angle - newangle) < 0.6 || Math.abs(Math.abs(tank.angle - newangle) - Math.PI * 2) < 0.6) {
      tank.move(1 * BotSpeed);
    }
    if (Math.abs(tank.angle - newangle) < 0.1) {
      tank.angle = newangle;
    } else if (tank.angle < newangle) {
      if (Math.abs(tank.angle - newangle) < Math.PI)
        tank.turn(2 * BotSpeed);
      else tank.turn(-2 * BotSpeed);
    } else {
      if (Math.abs(tank.angle - newangle) < Math.PI)
        tank.turn(-2 * BotSpeed);
      else tank.turn(2 * BotSpeed);
    }
  }

  // handle shooting
  this.shoot = function (target) {
    this.goto = -1; // don't move anywhere TODO: remove this?
    var tank = this.tank;
    var distx = target.x - tank.x;
    var disty = target.y - tank.y;
    var weapon = tank.weapon.name;
    tank.angle = Math.atan2(-distx, disty) + Math.PI;
    // Shoot target...
    // .. unless it is also a bot...
    if (typeof (target) != "undefined" && typeof (target['player']) != "undefined" && target.player.isBot) {
      // then randomise shooting time, to make bot-fights a bit more fair and random
      setTimeout(function () { tank.shoot() }, 180 * Math.random());
    } else {
      // target is not a bot: just shoot it
      tank.shoot();
    }
    this.stats.shots += 1;
    if (weapon == "Guided") {
      this.fleeFor(3500);
    } else if (weapon == "Grenade") {
      this.fleeFor(4500);
      this.game.timeouts.push(setTimeout(function () {
        tank.shoot();
      }, 4000));
    } else {
      this.fleeFor(1000);
    }
  }

  // evaluate whether it is a good idea to shoot given enemy tank and provide
  // coordinates where to aim, path to enemy can be given optionally
  this.aimbot = function (enemy, path = -1) {
    var result = { should_shoot: false, target: enemy, weight: 500 };
    var weapon = this.tank.weapon;
    if (path == -1)
      path = this.tank.map.xypathToObj(enemy);
    if (path == -1)
      return result;
    var r = Math.random() > 0.6 ? 2 : 1;
    // TODO: more intricate checking for specific weapon types
    // TODO: check if there is something in the way etc...
    if (path.length <= this.tank.weapon.bot_shooting_range + r)
      result.should_shoot = true;
    // rules for specific weapons
    if (weapon.name == "Laser") {
      for (var i = 0; i < weapon.trajectory.targets.length; i++) {
        if (weapon.trajectory.targets[i].player.team != this.team) {
          // shoot only if enemy would be hit
          result.should_shoot = true;
        } else {
          // make sure to not shoot self with laser
          result.should_shoot = false;
        }
      }
    } else if (weapon.name == "Guided" || weapon.name == "WreckingBall") {
      result.should_shoot = false;
      result.weight = 200;
      var tile = game.map.getTileByPos(this.tank.x, this.tank.y);
      for (var i = 0; i < 4; i++) {
        if (tile.walls[i] ^ weapon.name == "Guided") {
          result.should_shoot = true;
          var angle = -Math.PI / 2. * i;
          result.target = { x: this.tank.x + Math.sin(angle), y: this.tank.y - Math.cos(angle) };
        }
      }
    } else if (weapon.name == "Slingshot") {
      result.weight = 1100;
      var dist = Math.hypot(this.tank.x - enemy.x, this.tank.y - enemy.y);
      result.should_shoot = dist < 400;
    }
    return result;
  }


  // flee the situation
  this.fleeFor = function (t) {
    // TODO: implement
  }

}


function adaptBotSpeed(team, val = 0.1) {
  if (!AdaptiveBotSpeed)
    return;

  var teams = [];
  var botcounts = [];

  for (var i = 0; i < game.players.length; i++) {
    var id = teams.indexOf(game.players[i].team);
    if (id == -1) {
      id = teams.length;
      teams.push(game.players[i].team);
      botcounts.push(0);
    }
    botcounts[id] += game.players[i].isBot ? 1 : 0;
  }
  var avgbots = 0
  for (var i = 0; i < teams.length; i++)
    avgbots += botcounts[i] / parseFloat(teams.length);
  id = teams.indexOf(team);
  BotSpeed += (avgbots - botcounts[id]) * val;
  var bs = document.getElementById("BotSpeedometer");
  bs.style.display = "block";
  bs.innerHTML = "BotSpeed:&nbsp;&nbsp;" + Math.round(BotSpeed * 100) + " %"
  return BotSpeed;
}