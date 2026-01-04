import Bullet from "./bullet";
import Tank from "./tank";
import Trajectory from "./trajectory";
import { playSound, hexToRgbA } from "@/game/effects";
import { Smoke, generateCloud } from "./smoke";
import { Settings } from "@/stores/settings";
import { IMAGES, SOUNDS } from "@/game/assets";

/**
 * Base class for all weapons.
 */
export class Weapon {
  name: string = "Weapon";
  tank: Tank;
  image: HTMLImageElement;
  isActive: boolean = true;
  isDeleted: boolean = false;
  bot: { shootingRange: number; fleeingDuration: number; fleeIfActive: boolean };
  trajectory?: Trajectory;
  bullet: Bullet | null = null;
  nshots?: number;
  every?: number;
  fired?: boolean;

  /**
   * Creates a new Weapon.
   * @param tank - The tank owning this weapon.
   */
  constructor(tank: Tank) {
    this.tank = tank;
    this.image = new Image();
    this.image.src = "";
    this.bot = {
      shootingRange: 2, // distance at which bots fire the weapon
      fleeingDuration: 800, // how long should a bot flee after firing this weapon?
      fleeIfActive: false, // should the bot flee even if this weapon is active?
    };
  }

  /**
   * Fires the weapon.
   * Plays sound and creates a new bullet.
   */
  shoot(): void {
    if (!this.isActive) {
      return;
    }
    playSound(SOUNDS.gun);
    if (!this.isDeleted) {
      this.newBullet();
    }
    this.deactivate();
  }

  /**
   * Creates a new bullet with all the typical properties.
   * Handles tank corner positioning and initial lethality delay.
   * @returns The created bullet.
   */
  newBullet(): Bullet {
    const bullet = new Bullet(this);
    const corners = this.tank.corners();
    bullet.x = (corners[0].x + corners[1].x) / 2;
    bullet.y = (corners[0].y + corners[1].y) / 2;
    bullet.lethal = false;
    window.setTimeout(() => (bullet.lethal = true), 100);
    bullet.angle = this.tank.angle;
    bullet.player = this.tank.player;
    bullet.color = this.tank.player.team.color;
    this.tank.player.game!.addObject(bullet);
    return bullet;
  }

  /**
   * Deactivates the weapon (cannot shoot temporarily or until deleted).
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    const delay = this.tank.rapidfire ? 500 : 1800;
    this.tank.player.game!.timeouts.push(
      window.setTimeout(() => {
        if (this.tank.rapidfire) {
          this.activate();
        } else {
          this.delete();
        }
      }, delay),
    );
  }

  /**
   * Reactivate a deactivated weapon.
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Mark weapon as deleted.
   */
  delete(): void {
    this.isActive = false;
    this.isDeleted = true;
  }

  /**
   * Draw crosshair or trajectory preview.
   */
  crosshair(): void {}
}

/**
 * The normal, default gun.
 * @augments Weapon
 */
export class Gun extends Weapon {
  override name: string = "Gun";

  /**
   * Creates a new Gun.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.gun;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new bullet for the gun.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    // bullet explosion leads to weapon reactivation
    bullet.explode = () => {
      if (!this.tank.rapidfire) {
        this.activate();
      }
    };
    return bullet;
  }

  /**
   * Cannot be deleted.
   */
  override delete(): void {}
}

/**
 * A rapid-firing machine gun.
 * @augments Weapon
 */
export class MG extends Weapon {
  override name: string = "MG";
  override nshots: number = 20;
  override every: number = 0;

  /**
   * Creates a new MG.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.mg;
    this.bot.shootingRange = 2;
    this.bot.fleeingDuration = 1500;
    this.bot.fleeIfActive = true;
  }

  /**
   * Fires a burst of bullets.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    bullet.radius = 2;
    bullet.bounceSound = "";
    bullet.extrahitbox = -3;
    bullet.angle = this.tank.angle + 0.2 * (0.5 - Math.random());
    bullet.timeout = 4000 + 1000 * (0.5 - Math.random());
    bullet.color = "#000";
    return bullet;
  }

  /**
   * Fires the MG burst.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }

    if (this.nshots === 20) {
      this.tank.player.game!.timeouts.push(window.setTimeout(() => this.deactivate(), 3000));
    }

    if (this.tank.player.isBot() && this.nshots > 15) {
      window.setTimeout(() => this.shoot(), Settings.GameFrequency);
    }

    this.every -= Settings.GameFrequency;
    if (this.nshots > 0 && this.every < 0 && this.isActive) {
      this.every = 50;
      playSound(SOUNDS.mg);
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
 * @augments Weapon
 */
export class Laser extends Weapon {
  override name: string = "Laser";
  override fired: boolean = false;
  override trajectory: Trajectory;

  /**
   * Creates a new Laser.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.laser;
    this.trajectory = new Trajectory(this.tank.player.game!.map, this.tank.x, this.tank.y, this.tank.angle);
    this.trajectory.length = 620;
    this.trajectory.drawevery = 3;
    this.trajectory.color = hexToRgbA(this.tank.player.team.color, 0.4);
    this.tank.player.game!.addObject(this.trajectory);
    this.bot.fleeingDuration = 0;
  }

  /**
   * Fires the laser.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }
    playSound(SOUNDS.laser);
    this.trajectory.length = 1300;
    this.trajectory.delta = 2;
    this.trajectory.step();

    for (const p of this.trajectory.points.slice(15)) {
      const bullet = new Bullet(this);
      bullet.x = p.x;
      bullet.y = p.y;
      bullet.angle = p.angle;
      bullet.radius = 2;
      bullet.extrahitbox = -100;
      bullet.timeout = 150;
      bullet.speed = 0;
      bullet.color = this.tank.player.team.color;
      bullet.bounceSound = "";
      bullet.age = 0;
      bullet.checkCollision = () => {};
      this.tank.player.game!.addObject(bullet);
    }
    this.deactivate();
  }

  /**
   * Updates crosshair position.
   * @override
   */
  override crosshair(): void {
    this.trajectory.x = this.tank.x;
    this.trajectory.y = this.tank.y;
    this.trajectory.angle = this.tank.angle;
    this.trajectory.timeout = 100;
    this.trajectory.length = this.isActive ? 620 : 0;
  }

  /**
   * Deletes the weapon and its trajectory.
   * @override
   */
  override delete(): void {
    this.isDeleted = true;
    this.trajectory.delete();
  }
}

/**
 * A grenade that can be remotely detonated.
 * @augments Weapon
 */
export class Grenade extends Weapon {
  override name: string = "Grenade";
  override nshots: number = 30; // repurposed for nshrapnels if needed, but original used nshrapnels

  private nshrapnels: number = 30;

  /**
   * Creates a new Grenade weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.grenade;
    this.bot.fleeingDuration = 4000;
    this.bot.fleeIfActive = false;
  }

  /**
   * Creates a new grenade bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = IMAGES.grenade;
    e.radius = 6;
    e.color = "#000";
    e.timeout = 10000;
    e.exploded = false;

    /**
     * Explosion logic for grenade.
     */
    e.explode = () => {
      if (!e.exploded) {
        e.exploded = true;
        playSound(SOUNDS.grenade);
        for (let i = 0; i < this.nshrapnels; i++) {
          const shrapnel = new Bullet(this as Weapon);
          shrapnel.x = e.x;
          shrapnel.y = e.y;
          shrapnel.radius = 2;
          shrapnel.age = 0;
          shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
          shrapnel.angle = 2 * Math.PI * Math.random();
          shrapnel.timeout = (360 * 280) / Settings.BulletSpeed;
          shrapnel.extrahitbox = -3;
          shrapnel.checkCollision = () => {};
          this.tank.player.game!.addObject(shrapnel);
        }
        this.bullet = null;
        this.deactivate();
      }
    };

    return e;
  }

  /**
   * Fires or detonates the grenade.
   * @override
   */
  override shoot(): void {
    if (!this.isActive) {
      return;
    }
    if (!this.bullet) {
      if (!this.isDeleted) {
        this.bullet = this.newBullet();
      } else {
        this.bullet = null;
      }
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
 * @augments Weapon
 */
export class Mine extends Weapon {
  override name: string = "Mine";
  private nshrapnels: number = 24;

  /**
   * Creates a new Mine weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.mine;
  }

  /**
   * Creates a new mine bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.image = new Image();
    e.image.src = IMAGES.mine;
    e.radius = 6;
    e.exploded = false;
    e.color = "#000";
    e.timeout = 120000 + 20 * Math.random();

    /**
     * Explosion logic for mine.
     */
    e.explode = () => {
      if (!e.exploded) {
        e.exploded = true;
        playSound(SOUNDS.grenade);
        for (let i = 0; i < this.nshrapnels; i++) {
          const shrapnel = new Bullet(this as Weapon);
          shrapnel.x = e.x;
          shrapnel.y = e.y;
          shrapnel.radius = 2;
          shrapnel.age = 0;
          shrapnel.speed = 2 * Settings.BulletSpeed * (0.8 + 0.4 * Math.random());
          shrapnel.angle = 2 * Math.PI * Math.random();
          shrapnel.timeout = 600;
          shrapnel.extrahitbox = -3;
          this.tank.player.game!.addObject(shrapnel);
        }
        this.bullet = null;
      }
    };

    e.player.game!.timeouts.push(
      window.setTimeout(() => {
        e.speed = 0;
      }, 600),
    );

    return e;
  }
}

/**
 * A guided missile.
 * @augments Weapon
 */
export class Guided extends Weapon {
  override name: string = "Guided";

  /**
   * Creates a new Guided Missile weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.guided;
    this.bot.shootingRange = 16;
    this.bot.fleeingDuration = 3000;
  }

  /**
   * Creates a new guided missile bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const e = super.newBullet();
    e.radius = 6;
    e.image = new Image();
    e.image.src = IMAGES.guided;
    e.color = "#555";
    e.smokeColor = "#555";
    e.speed = 1.1 * Settings.TankSpeed;
    let gotoTarget: { x: number; y: number; dx: number; dy: number } | null = null;
    e.extrahitbox = 10;

    /**
     * Guided bullet logic.
     */
    e.step = function (): void {
      e.age += Settings.GameFrequency;
      if (e.age > e.timeout) {
        e.delete();
      }
      e.leaveTrace();

      const oldx = e.x;
      const oldy = e.y;
      // normal translation
      if (gotoTarget === null) {
        e.x -= (e.speed * Math.sin(-e.angle) * Settings.GameFrequency) / 1000;
        e.y -= (e.speed * Math.cos(-e.angle) * Settings.GameFrequency) / 1000;
      } else {
        // guided translation:
        // if egoto has point data stored go into it's direction
        const distx = gotoTarget.x + gotoTarget.dx / 2 - e.x;
        const disty = gotoTarget.y + gotoTarget.dy / 2 - e.y;
        const len = Math.sqrt(distx * distx + disty * disty);
        e.x += (e.speed * (distx / len) * Settings.GameFrequency) / 1000;
        e.y += (e.speed * (disty / len) * Settings.GameFrequency) / 1000;
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
        playSound(SOUNDS.guided);
        // get current tile and path
        const tile = e.map.getTileByPos(oldx, oldy)!;
        /**
         * Pathfinding logic for guided missile.
         * @param destination - The destination tile.
         * @returns Whether the tile contains an enemy tank.
         */
        const path = tile.pathTo((destination) => {
          for (let i = 0; i < destination.objs.length; i++) {
            const obj = destination.objs[i];
            if (obj instanceof Tank && obj.player.team !== e.player.team) {
              return true;
            }
          }
          return false;
        });
        // set next path tile as goto point
        if (path && path.length > 1) {
          gotoTarget = path[1];
        } // if there is no next tile, hit the tank in the tile
        else {
          for (let i = 0; i < tile.objs.length; i++) {
            if (tile.objs[i] instanceof Tank) {
              gotoTarget = { x: tile.objs[i].x, y: tile.objs[i].y, dx: 0, dy: 0 };
            }
          }
        }

        if (path && path.length > 0) {
          const target = path[path.length - 1].objs[0];
          if (target instanceof Tank) {
            e.smokeColor = target.color;
          }
        }
      }
      /**
       * Leaves a smoke trace.
       */
      e.leaveTrace = function (): void {
        if (Math.random() > 0.8) {
          const smoke = new Smoke(this.x, this.y, 400, this.radius / 1.4, 0.6);
          smoke.color = e.smokeColor!;
          e.player.game!.addObject(smoke);
        }
      };
    };
    return e;
  }
}

/**
 * Destroys walls.
 * @augments Weapon
 */
export class WreckingBall extends Weapon {
  override name: string = "WreckingBall";
  override fired: boolean = false;

  /**
   * Creates a new WreckingBall weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.wreckingBall;
    this.bot.shootingRange = 99;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new wrecking ball bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    bullet.radius = 10;
    bullet.color = "#000";
    bullet.speed = Settings.TankSpeed * 1.1;
    bullet.timeout = 1000;
    /**
     * Custom collision logic for wrecking ball.
     * @param x - Old x position.
     * @param y - Old y position.
     */
    bullet.checkCollision = function (x: number, y: number): void {
      const tile = bullet.map.getTileByPos(x, y);
      if (tile === null) {
        return;
      }
      const walls = tile.getWalls(this.x, this.y);
      const wall = walls.indexOf(true);
      if (wall !== -1) {
        if (typeof tile.neighbors[wall] === "undefined" || tile.neighbors[wall] === null) {
          // is the wall an outer wall?
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
          playSound(SOUNDS.grenade);
          generateCloud(this.player.game!, bullet.x, bullet.y, 3);
          bullet.delete();
          tile.addWall(wall, true);
        }
      }
    };

    bullet.trace = true;
    /**
     * Leaves a smoke trace.
     */
    bullet.leaveTrace = function (): void {
      if (Math.random() > 0.96) {
        const smoke = new Smoke(this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.player.game!.addObject(smoke);
      }
    };

    return bullet;
  }
}

/**
 * Creates walls.
 * @augments Weapon
 */

/**
 * Throws over walls.
 * @augments Weapon
 */
export class Slingshot extends Weapon {
  override name: string = "Slingshot";
  override fired: boolean = false;

  /**
   * Creates a new Slingshot weapon.
   * @param tank - The tank.
   */
  constructor(tank: Tank) {
    super(tank);
    this.image.src = IMAGES.slingshot;
    this.bot.shootingRange = 8;
    this.bot.fleeingDuration = 0;
  }

  /**
   * Creates a new slingshot bullet.
   * @returns The created bullet.
   * @override
   */
  override newBullet(): Bullet {
    const bullet = super.newBullet();
    bullet.radius = 6;
    bullet.color = "#333";
    bullet.speed = 2 * Settings.BulletSpeed;
    bullet.timeout = 2000;
    /**
     * Custom collision check for slingshot bullet.
     */
    bullet.checkCollision = function (): void {};
    bullet.trace = true;
    /**
     * Leaves a smoke trace.
     */
    bullet.leaveTrace = function (): void {
      if (Math.random() > 0.96) {
        bullet.speed *= 0.92;
        const smoke = new Smoke(this.x, this.y, 800, bullet.radius, 0.6);
        smoke.color = "rgba(0,0,0,0.3)";
        bullet.player.game!.addObject(smoke);
      }
    };

    return bullet;
  }
}
