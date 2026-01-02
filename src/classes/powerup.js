import GameObject from "./object.js";
import { Settings } from "../state.js";
import { playSound, playMusic, stopMusic, fogOfWar } from "../effects.js";
import { store } from "../state.js";
import { Laser, MG, Grenade, Mine, Guided, WreckingBall, Slingshot, WallBuilder } from "./weapons.js";
import { IMAGES, SOUNDS } from "../assets.js";

// a parent class for powerups

/**
 * Base class for all PowerUps.
 * @extends GameObject
 */
export class PowerUp extends GameObject {
  /**
   * Creates a new PowerUp.
   */
  constructor() {
    super();
    /** @type {boolean} Indicates this is a powerup. */
    this.isPowerUp = true;
    /** @type {HTMLImageElement} PowerUp icon. */
    this.image = new Image();
    /** @type {number} Width of the icon. */
    this.width = 30;
    /** @type {number} X coordinate. */
    this.x = undefined;
    /** @type {number} Y coordinate. */
    this.y = undefined;
    /** @type {number} Collision radius. */
    this.radius = 40;
    /** @type {boolean} Whether bots are attracted to it. */
    this.attractsBots = false;
  }

  /**
   * Applies the powerup effect to a tank.
   * @param {Tank} tank - The tank picking up the powerup.
   */
  apply(tank) {}

  /**
   * Update step.
   */
  step() {}

  /**
   * Draws the powerup.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }
}

/**
 * Laser weapon powerup.
 * @extends PowerUp
 */
export class LaserBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.laser;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new Laser(tank);
  }
}

/**
 * Machine Gun weapon powerup.
 * @extends PowerUp
 */
export class MGBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.mg;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new MG(tank);
  }
}

/**
 * Grenade weapon powerup.
 * @extends PowerUp
 */
export class GrenadeBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.grenade;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new Grenade(tank);
  }
}

/**
 * Mine weapon powerup.
 * @extends PowerUp
 */
export class MineBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.mine;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new Mine(tank);
  }
}

/**
 * Guided Missile weapon powerup.
 * @extends PowerUp
 */
export class GuidedBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.guided;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new Guided(tank);
  }
}

/**
 * Wrecking Ball weapon powerup.
 * @extends PowerUp
 */
export class WreckingBallBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.wreckingBall;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new WreckingBall(tank);
  }
}

/**
 * Slingshot weapon powerup.
 * @extends PowerUp
 */
export class SlingshotBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.slingshot;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new Slingshot(tank);
  }
}

/**
 * Wall Builder weapon powerup.
 * @extends PowerUp
 */
export class WallBuilderBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.wallBuilder;
  }
  apply(tank) {
    playSound(SOUNDS.reload);
    tank.weapon = new WallBuilder(tank);
  }
}

/**
 * Speed Boost powerup.
 * @extends PowerUp
 */
export class SpeedBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.speed;
  }
  apply(tank) {
    tank.speed *= 1.1;
    const self = tank;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.speed /= 1.1;
      }, 8000),
    );
  }
}

/**
 * Invincibility powerup.
 * @extends PowerUp
 */
export class InvincibleBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.invincible;
    this.applied = false;
  }
  apply(tank) {
    if (this.applied) return;
    this.applied = true;
    stopMusic();
    if (!Settings.muted) playMusic(SOUNDS.invincible);
    tank.speed *= 1.14;
    tank.timers.invincible = tank.player.game.t + 10000;
    const self = tank;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.speed /= 1.14;
        if (Settings.bgmusic) {
          // playMusic(SOUNDS.bgmusic); // Assuming we might want to add bgmusic later.
        } else if (!tank.invincible()) stopMusic();
      }, 10100),
    );
  }
}

/**
 * Terminator powerup (Rapid Fire).
 * @extends PowerUp
 */
export class TerminatorBonus extends PowerUp {
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.terminator;
    this.applied = false;
  }
  apply(tank) {
    if (this.applied) return;
    this.applied = true;
    tank.rapidfire = true;
    playSound(SOUNDS.terminator);
    const self = tank;
    // self.weapon.image = this.image;
    tank.player.game.timeouts.push(
      setTimeout(function () {
        self.rapidfire = false;
      }, 120000),
    );
  }
}

/**
 * Multiplier powerup (Spawn rate increase).
 * @extends PowerUp
 */
export class MultiBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.multi;
    this.used = false;
  }
  apply(tank) {
    if (!this.used) {
      this.used = true;
      Settings.PowerUpRate /= 2.5;
      Settings.PowerUpRate = Math.round(1000 * Settings.PowerUpRate) / 1000;
      Settings.MaxPowerUps *= 2.5;
      setTimeout(function () {
        Settings.PowerUpRate *= 2.5;
        Settings.MaxPowerUps /= 2.5;
      }, 8000);
    }
  }
}

/**
 * Fog of War powerup.
 * @extends PowerUp
 */
export class FogBonus extends PowerUp {
  constructor() {
    super();
    this.image.src = IMAGES.fog;
    this.used = false;
  }
  apply(tank) {
    if (!this.used) tank.player.game.intvls.push(fogOfWar(store.game));
  }
}

export const PowerUps = [
  {
    create: function () {
      return new LaserBonus();
    },
    name: "Laser",
    weight: 1,
  },
  {
    create: function () {
      return new MGBonus();
    },
    name: "MG",
    weight: 1,
  },
  {
    create: function () {
      return new GrenadeBonus();
    },
    name: "Grenade",
    weight: 1,
  },
  {
    create: function () {
      return new MineBonus();
    },
    name: "Mine",
    weight: 1,
  },
  {
    create: function () {
      return new GuidedBonus();
    },
    name: "Guided",
    weight: 1,
  },
  {
    create: function () {
      return new WreckingBallBonus();
    },
    name: "WreckingBall",
    weight: 0.5,
  },
  {
    create: function () {
      return new MultiBonus();
    },
    name: "Multiplier",
    weight: 1,
  },
  {
    create: function () {
      return new SlingshotBonus();
    },
    name: "Slingshot",
    weight: 1,
  },
  {
    create: function () {
      return new InvincibleBonus();
    },
    name: "Invincible",
    weight: 1,
  },
  {
    create: function () {
      return new TerminatorBonus();
    },
    name: "Terminator",
    weight: 1,
  },
  {
    create: function () {
      return new FogBonus();
    },
    name: "FogOfWar",
    weight: 0,
  },
  {
    create: function () {
      return new SpeedBonus();
    },
    name: "SpeedBoost",
    weight: 1,
  },
];

/**
 * Returns a random powerup based on weights.
 * @returns {PowerUp} A new PowerUp instance.
 */
export function getRandomPowerUp() {
  let totalWeights = 0;
  for (let i = 0; i < PowerUps.length; i++) totalWeights += PowerUps[i].weight;
  let randWeight = Math.random() * totalWeights;
  let h;
  for (h = 0; randWeight > 0; h++) randWeight -= PowerUps[h].weight;
  playSound(SOUNDS.origPowerup);
  return PowerUps[h - 1].create();
}
