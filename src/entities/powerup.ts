import { Settings } from "@/stores/settings";
import GameObject from "./gameobject";
import { playSound, playMusic, stopMusic, fogOfWar } from "@/game/effects";
import { Laser, MG, Grenade, Mine, Guided, WreckingBall, Slingshot } from "./weapons";
import { IMAGES, SOUNDS } from "@/game/assets";
import type Tank from "./tank";

/**
 * Base class for all PowerUps.
 * @augments GameObject
 */
export abstract class PowerUp extends GameObject {
  /** Collision radius. */
  radius: number = 40;
  /** Whether bots are attracted to it. */
  attractsBots: boolean = false;

  /**
   * Creates a new PowerUp.
   */
  constructor() {
    super();
    this.width = 30;
  }

  /**
   * Applies the powerup effect to a tank.
   * @param tank - The tank picking up the powerup.
   */
  abstract apply(tank: Tank): void;

  /**
   * Update step.
   */
  step(): void {}

  /**
   * Draws the powerup.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, -this.width / 2, -this.width / 2, this.width, this.width);
    context.restore();
  }
}

/**
 * Laser weapon powerup.
 * @augments PowerUp
 */
class LaserBonus extends PowerUp {
  /**
   * Creates a new LaserBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.laser;
  }
  /**
   * Applies the laser weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Laser(tank);
  }
}

/**
 * Machine Gun weapon powerup.
 * @augments PowerUp
 */
class MGBonus extends PowerUp {
  /**
   * Creates a new MGBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.mg;
  }
  /**
   * Applies the MG weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new MG(tank);
  }
}

/**
 * Grenade weapon powerup.
 * @augments PowerUp
 */
class GrenadeBonus extends PowerUp {
  /**
   * Creates a new GrenadeBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.grenade;
  }
  /**
   * Applies the grenade weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Grenade(tank);
  }
}

/**
 * Mine weapon powerup.
 * @augments PowerUp
 */
class MineBonus extends PowerUp {
  /**
   * Creates a new MineBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.mine;
  }
  /**
   * Applies the mine weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Mine(tank);
  }
}

/**
 * Guided Missile weapon powerup.
 * @augments PowerUp
 */
class GuidedBonus extends PowerUp {
  /**
   * Creates a new GuidedBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.guided;
  }
  /**
   * Applies the guided weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Guided(tank);
  }
}

/**
 * Wrecking Ball weapon powerup.
 * @augments PowerUp
 */
class WreckingBallBonus extends PowerUp {
  /**
   * Creates a new WreckingBallBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.wreckingBall;
  }
  /**
   * Applies the wrecking ball weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new WreckingBall(tank);
  }
}

/**
 * Slingshot weapon powerup.
 * @augments PowerUp
 */
class SlingshotBonus extends PowerUp {
  /**
   * Creates a new SlingshotBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.slingshot;
  }
  /**
   * Applies the slingshot weapon to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    playSound(SOUNDS.reload);
    tank.weapon = new Slingshot(tank);
  }
}

/**
 * Speed Boost powerup.
 * @augments PowerUp
 */
class SpeedBonus extends PowerUp {
  /**
   * Creates a new SpeedBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.speed;
  }

  /**
   * Applies the speed boost to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    tank.speed *= 1.25;
    tank.player.game!.timeouts.push(
      window.setTimeout(() => {
        tank.speed /= 1.25;
      }, 8000),
    );
  }
}

/**
 * Invincibility powerup.
 * @augments PowerUp
 */
class InvincibleBonus extends PowerUp {
  private applied: boolean = false;

  /**
   * Creates a new InvincibleBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.invincible;
  }

  /**
   * Applies the invincibility to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (this.applied) {
      return;
    }
    this.applied = true;
    stopMusic();
    if (!Settings.muted) {
      playMusic(SOUNDS.invincible);
    }
    tank.speed *= 1.14;
    tank.timers.invincible = tank.player.game!.t + 10000;
    tank.player.game!.timeouts.push(
      window.setTimeout(() => {
        tank.speed /= 1.14;
        if (Settings.bgmusic) {
          // playMusic(SOUNDS.bgmusic); // Assuming we might want to add bgmusic later.
        } else if (!tank.invincible()) {
          stopMusic();
        }
      }, 10100),
    );
  }
}

/**
 * Terminator powerup (Rapid Fire).
 * @augments PowerUp
 */
class TerminatorBonus extends PowerUp {
  private applied: boolean = false;

  /**
   * Creates a new TerminatorBonus.
   */
  constructor() {
    super();
    this.attractsBots = true;
    this.image.src = IMAGES.terminator;
  }
  /**
   * Applies the terminator effect to the tank.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (this.applied) {
      return;
    }
    this.applied = true;
    tank.rapidfire = true;
    playSound(SOUNDS.terminator);
    tank.player.game!.timeouts.push(
      window.setTimeout(() => {
        tank.rapidfire = false;
      }, 120000),
    );
  }
}

/**
 * Multiplier powerup (Spawn rate increase).
 * @augments PowerUp
 */
class MultiBonus extends PowerUp {
  private used: boolean = false;

  /**
   * Creates a new MultiBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.multi;
  }

  /**
   * Applies the multiplier effect.
   */
  apply(): void {
    if (!this.used) {
      this.used = true;
      Settings.PowerUpRate /= 2.5;
      Settings.PowerUpRate = Math.round(1000 * Settings.PowerUpRate) / 1000;
      Settings.MaxPowerUps *= 2.5;
      window.setTimeout(() => {
        Settings.PowerUpRate *= 2.5;
        Settings.MaxPowerUps /= 2.5;
      }, 8000);
    }
  }
}

/**
 * Fog of War powerup.
 * @augments PowerUp
 */
export class FogBonus extends PowerUp {
  private used: boolean = false;
  /**
   * Creates a new FogBonus.
   */
  constructor() {
    super();
    this.image.src = IMAGES.fog;
  }
  /**
   * Applies the fog of war effect.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (!this.used) {
      const game = tank.player.game!;
      game.intvls.push(fogOfWar(game));
    }
  }
}

import { reactive } from "vue";

export const PowerUps = reactive([
  {
    create: () => new LaserBonus(),
    name: "Laser",
    weight: 1,
  },
  {
    create: () => new MGBonus(),
    name: "MG",
    weight: 1,
  },
  {
    create: () => new GrenadeBonus(),
    name: "Grenade",
    weight: 1,
  },
  {
    create: () => new MineBonus(),
    name: "Mine",
    weight: 1,
  },
  {
    create: () => new GuidedBonus(),
    name: "Guided",
    weight: 1,
  },
  {
    create: () => new WreckingBallBonus(),
    name: "WreckingBall",
    weight: 0.5,
  },
  {
    create: () => new MultiBonus(),
    name: "Multiplier",
    weight: 1,
  },
  {
    create: () => new SlingshotBonus(),
    name: "Slingshot",
    weight: 1,
  },
  {
    create: () => new InvincibleBonus(),
    name: "Invincible",
    weight: 1,
  },
  {
    create: () => new TerminatorBonus(),
    name: "Terminator",
    weight: 1,
  },
  {
    create: () => new FogBonus(),
    name: "FogOfWar",
    weight: 0,
  },
  {
    create: () => new SpeedBonus(),
    name: "SpeedBoost",
    weight: 1,
  },
]);

/**
 * Returns a random powerup based on weights.
 * @returns A new PowerUp instance.
 */
export function getRandomPowerUp(): PowerUp {
  let totalWeights = 0;
  for (let i = 0; i < PowerUps.length; i++) {
    totalWeights += PowerUps[i].weight;
  }

  let randWeight = Math.random() * totalWeights;
  let h: number;
  for (h = 0; randWeight > 0; h++) {
    randWeight -= PowerUps[h].weight;
  }

  playSound(SOUNDS.origPowerup);
  return PowerUps[h - 1].create();
}
