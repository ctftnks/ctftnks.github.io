class Flag extends GameObject {
  constructor(game, base) {
    super();
    this.type = "Flag";
    this.game = game;
    this.image = "";
    this.base = base;
    this.team = base.team;
    this.color = base.color;
    this.size = 24;
    this.x = base.x;
    this.y = base.y;
    this.picked = false;
    this.inBase = true;
    this.resetTimer;
  }

  // return flag to base
  reset() {
    this.inBase = true;
    this.drop(this.base.x, this.base.y);
  }
  // let tank pick up the flag
  pickup(tank) {
    tank.carriedFlag = this;
    this.picked = true;
    this.inBase = false;
    this.delete();
  }
  drop(x, y) {
    this.deleted = false;
    this.x = x;
    this.y = y;
    this.resetTimer = this.game.t + 30000;
    this.picked = false;
    this.game.objs.push(this);
  }

  step() {
    var tile = this.game.map.getTileByPos(this.x, this.y);
    for (var i = 0; i < tile.objs.length; i++) {
      var tank = tile.objs[i];
      if (tank.isTank && Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)) {
        if (tank.player.team == this.team) {
          if (!this.base.hasFlag()) {
            // return flag to base
            this.reset();
            playSound("res/sound/resetFlag.wav");
          }
        } else if (tank.carriedFlag == -1 && !this.picked && !tank.deleted) {
          // pick up flag
          this.pickup(tank);
          playSound("res/sound/coin.wav");
        }
      }
    }
    if (!this.inBase && !this.picked && this.resetTimer < this.game.t) this.reset();
    if (this.inBase) {
      this.x = this.base.x;
      this.y = this.base.y;
    }
  }

  draw(canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.fillStyle = this.base.color;
    context.rect(-this.size / 2, -this.size / 2, this.size / 1.1, this.size / 2);
    context.fill();
    context.beginPath();
    context.fillStyle = "#000";
    context.rect(-this.size / 2, -this.size / 2, this.size / 6, this.size * 1.1);
    context.fill();
    context.restore();
  }
}

class Base extends GameObject {
  constructor(game, player, x, y) {
    super();
    this.type = "Base";
    this.team = player.team;
    this.color = player.color;
    this.game = game;
    this.image = "";
    this.x = x;
    this.y = y;
    this.flag = undefined;
    this.size = 80;
    this.tile = this.game.map.getTileByPos(this.x, this.y);
  }

  draw(canvas, context) {
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;
    context.rect(-this.size / 2, -this.size / 2, 8, this.size);
    context.rect(-this.size / 2, -this.size / 2, this.size, 8);
    context.rect(this.size / 2, this.size / 2, -8, -this.size);
    context.rect(this.size / 2, this.size / 2, -this.size, -8);
    context.fill();
    context.restore();
  }

  step() {
    for (var i = 0; i < this.tile.objs.length; i++) {
      var tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team == this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        if (tank.carriedFlag != -1 && this.hasFlag()) {
          // score!
          this.game.mode.giveScore(tank.player);
          playSound("res/sound/fanfare.mp3");
          tank.carriedFlag.reset();
          tank.carriedFlag = -1;
        }
      }
    }
  }

  hasFlag() {
    if (typeof this.flag === "undefined") return false;
    return this.flag.inBase;
  }
}

class Hill extends Base {
  constructor(game, x, y) {
    super(game, { color: "#555", team: "#555" }, x, y);
    this.type = "Hill";
  }

  step() {
    for (var i = 0; i < this.tile.objs.length; i++) {
      var tank = this.tile.objs[i];
      if (
        tank.isTank &&
        tank.player.team != this.team &&
        Math.pow(this.x - tank.x, 2) + Math.pow(this.y - tank.y, 2) < Math.pow(2 * this.size, 2)
      ) {
        this.team = tank.player.team;
        this.color = tank.player.color;
      }
    }
  }
}