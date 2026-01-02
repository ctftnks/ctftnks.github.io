import GameObject from "./gameobject";
import { Settings, store } from "../state";
import { playSound, playMusic, stopMusic, fogOfWar } from "../effects";
import { Laser, MG, Grenade, Mine, Guided, WreckingBall, Slingshot, WallBuilder } from "./weapons";
import { IMAGES, SOUNDS } from "../assets";
import Tank from "./tank";

/**
 * Base class for all PowerUps.
 * @extends GameObject
 */
export class PowerUp extends GameObject {
  /** Collision radius. */
  radius: number = 40;
  /** Whether bots are attracted to it. */
  attractsBots: boolean = false;

  /**
   * Creates a new PowerUp.
   */
  constructor() {
    super();
    this.image = new Image();
    this.width = 30;
    this.x = 0; // Initialized later
    this.y = 0; // Initialized later
    this.radius = 40;
    this.attractsBots = false;
  }

  /**
   * Applies the powerup effect to a tank.
   * @param {Tank} tank - The tank picking up the powerup.
   */
  apply(tank: Tank) {}

  /**
   * Update step.
   */
  step() {}

  /**
   * Draws the powerup.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas: any, context: CanvasRenderingContext2D) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  apply(tank: Tank) {
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
  applied: boolean = false;

  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.invincible;
    this.applied = false;
  }

  apply(tank: Tank) {
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
  applied: boolean = false;

  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.terminator;
    this.applied = false;
  }
  apply(tank: Tank) {
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
  used: boolean = false;
  constructor() {
    super();
    this.image.src = IMAGES.multi;
    this.used = false;
  }
  apply(tank: Tank) {
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
  used: boolean = false;
  constructor() {
    super();
    this.image.src = IMAGES.fog;
    this.used = false;
  }
  apply(tank: Tank) {
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
export function getRandomPowerUp(): PowerUp {
  let totalWeights = 0;
  for (let i = 0; i < PowerUps.length; i++) totalWeights += PowerUps[i].weight;

  let randWeight = Math.random() * totalWeights;
  let h: number;
  for (h = 0; randWeight > 0; h++) randWeight -= PowerUps[h].weight;

  playSound(SOUNDS.origPowerup);
  return PowerUps[h - 1].create();
}
