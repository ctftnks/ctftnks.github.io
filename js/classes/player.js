// A class for a player.
// keeps the players score, color, name, keymap
// and the tank to be controlled

nplayers = 0;
playercolors = [
  "#DA1918",  // red
  "#31B32B",  // green
  "#1F87FF",  // blue
  "#21B19B",  // teal
  "#A020F0",  // purple
  "#F4641D",  // orange
  "#713B17",  // brown
  "#E7E52C"  // yellow
]

// playercolors = [
//   "#F44336",  // red
//   "#4CAF50",  // green
//   "#2196F3",  // blue
//   "#FF9800",  // orange
//   "#009688",  // teal
//   "#9C27B0",  // purple
//   "#FFC107"  // amber
// ]

Player = function () {

  this.id = nplayers++;
  this.name = "Player " + (this.id + 1);
  this.color = playercolors[this.id];
  this.team = this.id;
  this.game = undefined;
  this.base = undefined;
  this.score = 0;
  this.spree = 0;
  this.keys = keymaps[this.id];
  this.tank = new Tank(this);
  this.stats = { deaths: 0, kills: 0, miles: 0, shots: 0 };
  this.isBot = false;

  // timestep: check if keys pressed and act accordingly
  this.step = function () {
    if (Key.isDown(this.keys[0])) this.tank.move(1);
    if (Key.isDown(this.keys[1])) this.tank.turn(-1);
    if (Key.isDown(this.keys[2])) this.tank.move(-0.7);
    if (Key.isDown(this.keys[3])) this.tank.turn(1);
    if (Key.isDown(this.keys[4])) this.tank.shoot();
  }

  // spawn at some point
  this.spawn = function () {
    this.tank = new Tank(this);
    this.tank.deleted = false;
    this.tank.map = this.game.map;
    var spos = this.game.map.spawnPoint();
    if (typeof (this.base) !== "undefined" && this.base.tile != -1) {
      var spos2 = this.base.tile;
      while (spos2.id == this.base.tile.id)
        spos2 = spos2.randomWalk(Math.pow(this.game.mode.BaseSpawnDistance, 2) + Math.round(Math.random()));
      spos = { x: spos2.x + spos2.dx / 2, y: spos2.y + spos2.dy / 2 };
    }
    this.tank.x = spos.x;
    this.tank.y = spos.y;
    this.game.addObject(this.tank);
    this.game.n_playersAlive += 1;
    // this.game.addObject(new Smoke(this.x, this.y));
    var self = this;
    this.game.timeouts.push(setTimeout(function () {
      new Cloud(self.game, self.tank.x, self.tank.y, n = 4, radius = 20, rspeed = 2);
    }, 10));
    // spawn shield
    this.tank.timers.spawnshield = this.game.t + SpawnShieldTime * 1000;
  }

  // kill the player, called when tank is shot
  // check if game should end
  this.kill = function () {
    this.game.n_playersAlive -= 1;
    this.tank.weapon.active = false;
    this.game.nkills++;
    this.game.canvas.shake();
    this.spree = 0;
    this.stats.deaths += 1;
    var self = this;
    this.game.timeouts.push(setTimeout(function () {
      self.spawn();
    }, RespawnTime * 1000));
  }

  // change color
  this.changeColor = function () {
    this.team += 1;
    this.team = this.team % playercolors.length;
    this.color = playercolors[this.team % playercolors.length];
  }

  // reset stats dictionary to 0
  this.resetStats = function () {
    this.stats.deaths = 0;
    this.stats.kills = 0;
    this.stats.miles = 0;
    this.stats.shots = 0;
  }

}
