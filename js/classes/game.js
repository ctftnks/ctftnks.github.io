// A class for a single game round with a single map
// contains a list of players, list of objects in the game
// contains a loop mechanism for time-iteration

var GameID = 0;
class Game {
  constructor(canvas, map = -1) {
    // pass canvas class to game, for size / resolution
    this.canvas = canvas;
    this.canvas.game = this;
    // create new random map
    if (map == -1) {
      this.map = new Map(this.canvas);
      // MapGenerator.algorithms[Math.floor(Math.random()*MapGenerator.algorithms.length)](this.map);
      // MapGenerator.primsMaze(this.map);
      // MapGenerator.recursiveDivision(this.map);
      MapGenerator.porousRecursiveDivision(this.map);
    } else {
      this.map = map;
    }
    this.map.resize();
    this.players = [];
    this.objs = [];
    this.paused = false;
    this.loop = undefined;
    this.n_playersAlive = 0;
    this.t = 0;
    this.intvls = [];
    this.timeouts = [];
    this.nkills = 0;
    this.mode = new Deathmatch(this);
    GameID++;
  }

  // add a player (class) to the game
  addPlayer(player) {
    this.players.push(player);
    player.game = this;
  }

  // add any object to the game
  addObject(object) {
    this.objs.push(object);
  }

  // start the game, starts time-loop
  start() {
    var self = this;
    this.mode.init();
    for (var i = 0; i < this.players.length; i++) this.players[i].spawn();
    this.loop = setInterval(function () {
      self.step();
    }, GameFrequency);
    playSound("res/sound/gamestart.wav");
    if (bgmusic) playMusic("res/sound/bgmusic.wav");
    updateScores();
  }

  // a single step of the time-loop
  step() {
    if (!this.paused) {
      this.t += GameFrequency;
      // remove deleted objects and
      // initiate spatial sorting of objects within the map class
      this.map.clearObjectLists();
      for (var i = this.objs.length - 1; i >= 0; i--)
        if (!this.objs[i].deleted) this.map.addObject(this.objs[i]);
        else this.objs.splice(i, 1);
      // call step() function for every object in order for it to move/etc.
      for (var i = 0; i < this.objs.length; i++) this.objs[i].step();
      // do gamemode calculations
      this.mode.step();
      // add random PowerUp
      if (this.t % (1000 * PowerUpRate) == 0 && GameMode != "MapEditor") {
        var p = getRandomPowerUp();
        var pos = this.map.spawnPoint();
        p.x = pos.x;
        p.y = pos.y;
        this.addObject(p);
        this.timeouts.push(
          setTimeout(
            function () {
              p.delete();
            },
            1000 * PowerUpRate * MaxPowerUps,
          ),
        );
      }
      if (Key.isDown(Key.ESCAPE)) {
        openPage("menu");
        this.pause();
      }
      if (this.t % 1000 == GameFrequency) {
        var dt = RoundTime * 60 - (this.t - GameFrequency) / 1000;
        dt = dt < 0 ? 0 : dt;
        var dtm = Math.floor(dt / 60);
        var dts = Math.floor(dt - dtm * 60);
        dtm = "" + dtm;
        while (dtm.length < 2) dtm = "0" + dtm;
        dts = "" + dts;
        while (dts.length < 2) dts = "0" + dts;
        document.getElementById("GameTimer").innerHTML = dtm + ":" + dts;
      }
      if (this.t > RoundTime * 60000) this.end();
    }
  }

  // pause the game
  pause() {
    this.paused = !this.paused;
    stopMusic(); // prevent 'invincible' sound from playing all over
  }

  // stop the game
  stop() {
    this.paused = true;
    clearInterval(this.loop);
    for (var i = 0; i < this.intvls.length; i++) clearInterval(this.intvls[i]);
    for (var i = 0; i < this.timeouts.length; i++) clearTimeout(this.timeouts[i]);
    clearEffects();
    stopMusic();
    for (var i = 0; i < this.players.length; i++) this.players[i].base = undefined;
  }

  // end the game
  end() {
    this.paused = true;
    var pageid = openPage("leaderboard");
    this.stop();
  }

  resetTime() {
    this.t = 0;
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].tank.timers.invincible = -1;
      this.players[i].tank.timers.spawnshield = -1;
    }
  }
}