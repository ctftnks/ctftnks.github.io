import Bullet from "./bullet.js";
import Trajectory from "./trajectory.js";
import { playSound, hexToRgbA } from "../effects.js";
import { Smoke, Cloud } from "./smoke.js";
import { GameFrequency } from "../constants.js";
import { Settings } from "../state.js";

// parent class for all weapons
/**
 * Base class for all weapons.
 */
export class Weapon {
  /**
   * Creates a new Weapon.
   * @param {Tank} tank - The tank owning this weapon.
   */
  constructor(tank) {
    /** @type {string} Weapon name. */
    this.name = "Weapon";
    /** @type {Tank} The tank. */
    this.tank = tank;
    /** @type {HTMLImageElement} Weapon icon/image. */
    this.image = new Image();
    this.image.src = "";
    /** @type {HTMLImageElement} Another image ref? */
    this.img = undefined;
    /** @type {boolean} Whether the weapon is active. */
    this.active = true;
    /** @type {boolean} Whether the weapon is deleted. */
    this.is_deleted = false;
    /** @type {Object} Bot behavior settings for this weapon. */
    this.bot = {
      shooting_range: 2, // distance at which bots fire the weapon
      fleeing_duration: 800, // how long should a bot flee after firing this weapon?
      flee_if_active: false, // should the bot flee even if this weapon is active?
    };
  }

  /**
   * Fires the weapon.
   */
  shoot() {
    if (!this.active) return;
    playSound("res/sound/gun.wav");
    this.newBullet();
    this.deactivate();
  }

  /**
   * Creates a new bullet with all the typical properties.
   * @returns {Bullet} The created bullet.
   */
  newBullet() {
    const bullet = new Bullet(this);
    bullet.x = (this.tank.corners()[0].x + this.tank.corners()[1].x) / 2;
    bullet.y = (this.tank.corners()[0].y + this.tank.corners()[1].y) / 2;
    bullet.lethal = false;
    setTimeout(function () {
      bullet.lethal = true;
    }, 100);
    bullet.angle = this.tank.angle;
    bullet.player = this.tank.player;
    bullet.color = this.tank.player.color;
    this.tank.player.game.addObject(bullet);
    return bullet;
  }

  /**
   * Deactivates the weapon (cannot shoot temporarily or until deleted).
   */
  deactivate() {
    if (this.active === false) return;
    this.active = false;
    const self = this;
    if (this.tank.rapidfire)
      this.tank.player.game.timeouts.push(
        setTimeout(function () {
          self.activate();
        }, 500),
      );
    else
      this.tank.player.game.timeouts.push(
        setTimeout(function () {
          self.delete();
        }, 1800),
      );
  }

  /**
   * Reactivate a deactivated weapon.
   */
  activate() {
    this.active = true;
  }

  /**
   * Mark weapon as deleted.
   */
  delete() {
    this.active = false;
    this.is_deleted = true;
  }

  /**
   * Draw crosshair or trajectory preview.
   */
  crosshair() {}
}

/**
 * The normal, default gun.
 * @extends Weapon
 */
export class Gun extends Weapon {
  /**
   * Creates a new Gun.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "Gun";
    this.image = new Image();
    this.image.src = "res/img/gun.png";
    // Extra rule for face
    if (this.tank.player.name === "Marc" || this.tank.player.name === "marc") {
      this.image.src = "res/img/Marc.png";
    }
    this.bot.fleeing_duration = 0;
  }

  newBullet() {
    const bullet = super.newBullet();
    // bullet explosion leads to weapon reactivation
    const self = this;
    bullet.explode = function () {
      if (!self.tank.rapidfire) self.activate();
    };
    return bullet;
  }

  /**
   * Cannot be deleted.
   */
  delete() {}
}

/**
 * A rapid-firing machine gun.
 * @extends Weapon
 */
export class MG extends Weapon {
  /**
   * Creates a new MG.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "MG";
    this.image = new Image();
    this.image.src = "res/img/mg.png";
    this.nshots = 20;
    this.every = 0;
    this.bot.shooting_range = 2;
    this.bot.fleeing_duration = 1500;
    this.bot.flee_if_active = true;
  }

  newBullet() {
    const bullet = super.newBullet();
    bullet.radius = 2;
    bullet.bounceSound = "";
    bullet.extrahitbox = -3;
    bullet.angle = this.tank.angle + 0.2 * (0.5 - Math.random());
    bullet.timeout = 4000 + 1000 * (0.5 - Math.random());
    bullet.color = "#000";
    return bullet;
  }

  shoot() {
    if (!this.active) return;
    const self = this;
    if (this.nshots === 20)
      this.tank.player.game.timeouts.push(
        setTimeout(function () {
          self.deactivate();
        }, 3000),
      );
    if (this.tank.player.isBot && this.nshots > 15)
      setTimeout(function () {
        self.shoot();
      }, GameFrequency);
    this.every -= GameFrequency;
    if (this.nshots > 0 && this.every < 0 && this.active) {
      this.every = 50;
      playSound("res/sound/mg.wav");
      this.newBullet();
      this.nshots--;
      if (this.nshots <= 0) {
        this.nshots = 20;
        this.deactivate();
      }
    }
  }
}

/**
 * Laser weapon.
 * @extends Weapon
 */
export class Laser extends Weapon {
  /**
   * Creates a new Laser.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.image = new Image();
    this.image.src = "res/img/laser.png";
    this.name = "Laser";
    this.active = true;
    this.fired = false;
    this.trajectory = new Trajectory(this.tank.player.game.map);
    this.trajectory.x = this.tank.x;
    this.trajectory.y = this.tank.y;
    this.trajectory.angle = this.tank.angle;
    this.trajectory.length = 620;
    this.trajectory.drawevery = 3;
    this.trajectory.color = hexToRgbA(this.tank.player.color, 0.4);
    this.tank.player.game.addObject(this.trajectory);
    this.bot.fleeing_duration = 0;
  }

  shoot() {
    if (!this.active) return;
    playSound("res/sound/laser.wav");
    this.trajectory.length = 1300;
    this.trajectory.delta = 2;
    this.trajectory.step();
    for (let i = 15; i < this.trajectory.points.length; i++) {
      const p = this.trajectory.points[i];
      const bullet = new Bullet(this);
      bullet.x = p.x;
      bullet.y = p.y;
      bullet.angle = p.angle;
      bullet.radius = 2;
      bullet.extrahitbox = -100;
      bullet.timeout = 150;
      bullet.speed = 0;
      bullet.color = this.tank.player.color;
      bullet.bounceSound = "";
      bullet.age = 0;
      this.tank.player.game.addObject(bullet);
    }
    this.deactivate();
  }
  crosshair() {
    this.trajectory.x = this.tank.x;
    this.trajectory.y = this.tank.y;
    this.trajectory.angle = this.tank.angle;
    this.trajectory.timeout = 100;
    this.trajectory.length = this.active ? 620 : 0;
  }
  delete() {
    this.is_deleted = true;
    this.trajectory.delete();
  }
}

/**
 * A grenade that can be remotely detonated.
 * @extends Weapon
 */
export class Grenade extends Weapon {
  /**
   * Creates a new Grenade weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "Grenade";
    this.image = new Image();
    this.image.src = "res/img/grenade.png";
    this.bullet = undefined;
    this.nshrapnels = 30;
    this.bot.fleeing_duration = 4000;
    this.bot.flee_if_active = false;
  }

  newBullet() {
    if (this.is_deleted) return;
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = "res/img/grenade.png";
    e.radius = 6;
    e.color = "#000";
    e.timeout = 10000;
    e.exploded = false;
    const self = this;
    e.explode = function () {
      if (!e.exploded) {
        e.exploded = true;
        playSound("res/sound/grenade.wav");
        for (let i = 0; i < self.nshrapnels; i++) {
          const shrapnel = new Bullet(self);
          shrapnel.x = e.x;
          shrapnel.y = e.y;
          shrapnel.radius = 2;
          shrapnel.age = 0;
          shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
          shrapnel.angle = 2 * Math.PI * Math.random();
          shrapnel.timeout = (360 * 280) / Settings.BulletSpeed;
          shrapnel.extrahitbox = -3;
          shrapnel.checkCollision = function (x, y) {};
          self.tank.player.game.addObject(shrapnel);
        }
        self.bullet = undefined;
        self.deactivate();
      }
    };

    return e;
  }

  shoot() {
    if (!this.active) return;
    if (typeof this.bullet === "undefined") {
      this.bullet = this.newBullet();
    } else if (this.bullet.age > 300) {
      const bullet = this.bullet;
      bullet.explode();
      bullet.delete();
      this.deactivate();
      return;
    }
  }
}

/**
 * A mine.
 * @extends Weapon
 */
export class Mine extends Weapon {
  /**
   * Creates a new Mine weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "Mine";
    this.image = new Image();
    this.image.src = "res/img/mine.png";
    this.bullet = undefined;
    this.nshrapnels = 24;
  }

  newBullet() {
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = "res/img/mine.png";
    e.radius = 6;
    e.exploded = false;
    e.color = "#000";
    e.timeout = 120000 + 20 * Math.random();
    const self = this;
    e.explode = function () {
      if (!e.exploded) {
        e.exploded = true;
        playSound("res/sound/grenade.wav");
        for (let i = 0; i < self.nshrapnels; i++) {
          const shrapnel = new Bullet(self);
          shrapnel.x = e.x;
          shrapnel.y = e.y;
          shrapnel.radius = 2;
          shrapnel.age = 0;
          shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
          shrapnel.angle = 2 * Math.PI * Math.random();
          shrapnel.timeout = 600;
          shrapnel.extrahitbox = -3;
          // shrapnel.checkCollision = function(x, y){}
          self.tank.player.game.addObject(shrapnel);
        }
        self.bullet = undefined;
      }
    };
    e.player.game.timeouts.push(
      setTimeout(function () {
        e.speed = 0;
      }, 600),
    );
    return e;
  }
}

/**
 * A guided missile.
 * @extends Weapon
 */
export class Guided extends Weapon {
  /**
   * Creates a new Guided Missile weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "Guided";
    this.image = new Image();
    this.image.src = "res/img/guided.png";
    this.active = true;
    this.bot.shooting_range = 16;
    this.bot.fleeing_duration = 3000;
  }

  newBullet() {
    const e = super.newBullet();
    e.radius = 6;
    e.image = new Image();
    e.image.src = "res/img/guided.png";
    e.color = "#555";
    e.smokeColor = "#555";
    e.speed = 1.1 * Settings.TankSpeed;
    e.goto = -1;
    e.extrahitbox = 10;
    e.step = function () {
      e.age += GameFrequency;
      if (e.age > e.timeout) e.delete();
      e.leaveTrace();
      const oldx = e.x;
      const oldy = e.y;
      // normal translation
      if (e.goto === -1) {
        e.x -= (e.speed * Math.sin(-e.angle) * GameFrequency) / 1000;
        e.y -= (e.speed * Math.cos(-e.angle) * GameFrequency) / 1000;
      } else {
        // guided translation:
        // if e.goto has point data stored go into it's direction
        const distx = e.goto.x + e.goto.dx / 2 - e.x;
        const disty = e.goto.y + e.goto.dy / 2 - e.y;
        const len = Math.sqrt(distx * distx + disty * disty);
        e.x += (e.speed * (distx / len) * GameFrequency) / 1000;
        e.y += (e.speed * (disty / len) * GameFrequency) / 1000;
        this.angle = Math.atan2(-distx, disty) + Math.PI;
      }
      // check for wall collisions
      e.checkCollision(oldx, oldy);
      // check for bullet-bullet collisions
      e.checkBulletCollision();
      // calculate path to next tank and set next goto tile
      // at first, it waits a while and then repeats the task every few ms
      if (e.age > 1750) {
        e.age -= 250;
        playSound("res/sound/guided.wav");
        // get current tile and path
        const tile = e.map.getTileByPos(oldx, oldy);
        const path = tile.pathTo(function (destination) {
          for (let i = 0; i < destination.objs.length; i++)
            if (destination.objs[i].isTank && destination.objs[i].player.team !== e.player.team) return true;
          return false;
        });
        // set next path tile as goto point
        if (path.length > 1) {
          e.goto = path[1];
        } else {
          // if there is no next tile, hit the tank in the tile
          for (let i = 0; i < tile.objs.length; i++) {
            if (tile.objs[i].isTank) {
              e.goto = { x: tile.objs[i].x, y: tile.objs[i].y, dx: 0, dy: 0 };
            }
          }
        }
        if (path.length > 0) e.smokeColor = path[path.length - 1].objs[0].color;
      }
      e.leaveTrace = function () {
        if (Math.random() > 0.8) {
          const smoke = new Smoke(this.x, this.y, 400, this.radius / 1.4, 0.6);
          smoke.color = e.smokeColor;
          e.player.game.addObject(smoke);
        }
      };
    };
    return e;
  }
}

/**
 * Destroys walls.
 * @extends Weapon
 */
export class WreckingBall extends Weapon {
  /**
   * Creates a new WreckingBall weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.image = new Image();
    this.image.src = "res/img/wreckingBall.png";
    this.name = "WreckingBall";
    this.active = true;
    this.fired = false;
    this.bot.shooting_range = 99;
    this.bot.fleeing_duration = 0;
  }

  newBullet() {
    const bullet = super.newBullet();
    bullet.radius = 10;
    bullet.color = "#000";
    bullet.speed = Settings.TankSpeed * 1.1;
    bullet.timeout = 1000;
    bullet.checkCollision = function (x, y) {
      const tile = bullet.map.getTileByPos(x, y);
      if (tile === -1) return;
      const walls = tile.getWalls(this.x, this.y);
      const wall = walls.indexOf(true);
      if (wall !== -1) {
        // is the wall an outer wall?
        if (typeof tile.neighbors[wall] === "undefined" || tile.neighbors[wall] === -1) {
          playSound(this.bounceSound);
          // outer wall: bounce
          if (wall === 1 || wall === 3) {
            // left or right
            this.angle *= -1;
            this.x = 2 * x - this.x;
          }
          if (wall === 0 || wall === 2) {
            // top or bottom
            this.angle = Math.PI - this.angle;
            this.y = 2 * y - this.y;
          }
        } else {
          // hit a wall: remove it!
          playSound("res/sound/grenade.wav");
          new Cloud(this.player.game, bullet.x, bullet.y, 3);
          bullet.delete();
          tile.addWall(wall, true);
        }
      }
    };
    bullet.trace = true;
    bullet.leaveTrace = function () {
      if (Math.random() > 0.96) {
        const smoke = new Smoke(this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.player.game.addObject(smoke);
      }
    };
    return bullet;
  }
}

/**
 * Creates walls.
 * @extends Weapon
 */
export class WallBuilder extends Weapon {
  /**
   * Creates a new WallBuilder weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.name = "WallBuilder";
    this.image = new Image();
    this.image.src = "res/img/wallBuilder.png";
    this.active = true;
  }

  shoot() {
    if (this.active) {
      const tile = this.tank.map.getTileByPos(this.tank.x, this.tank.y);
      let direction = this.tank.angle;
      while (direction < 0) direction += 2 * Math.PI;
      direction = Math.round(-direction / (Math.PI / 2) + 16) % 4;
      if (tile.neighbors[direction] === -1) return;
      if (tile.walls[direction]) tile.addWall(direction, true);
      else tile.addWall(direction, false);
      playSound("res/sound/gun.wav");
      this.active = false;
      const self = this;
      this.tank.player.game.timeouts.push(
        setTimeout(function () {
          if (self.tank.weapon === self) self.tank.defaultWeapon();
        }, 400),
      );
    }
  }
}

/**
 * Throws over walls.
 * @extends Weapon
 */
export class Slingshot extends Weapon {
  /**
   * Creates a new Slingshot weapon.
   * @param {Tank} tank - The tank.
   */
  constructor(tank) {
    super(tank);
    this.image = new Image();
    this.image.src = "res/img/slingshot.png";
    this.name = "Slingshot";
    this.active = true;
    this.fired = false;
    this.bot.shooting_range = 8;
    this.bot.fleeing_duration = 0;
  }

  newBullet() {
    const bullet = super.newBullet();
    bullet.radius = 6;
    bullet.color = "#333";
    bullet.speed = 2 * Settings.BulletSpeed;
    bullet.timeout = 2000;
    bullet.checkCollision = function (x, y) {};
    bullet.trace = true;
    bullet.leaveTrace = function () {
      if (Math.random() > 0.96) {
        bullet.speed *= 0.92;
        const smoke = new Smoke(this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.player.game.addObject(smoke);
      }
    };
    return bullet;
  }
}
