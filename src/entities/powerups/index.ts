import { reactive } from "vue";
import { playSound } from "@/game/effects";
import { SOUNDS } from "@/game/assets";

import { PowerUp } from "./powerup";
import { LaserBonus } from "./laserBonus";
import { MGBonus } from "./mgBonus";
import { GrenadeBonus } from "./grenadeBonus";
import { MineBonus } from "./mineBonus";
import { GuidedBonus } from "./guidedBonus";
import { WreckingBallBonus } from "./wreckingBallBonus";
import { MultiBonus } from "./multiBonus";
import { SlingshotBonus } from "./slingshotBonus";
import { InvincibleBonus } from "./invincibleBonus";
import { TerminatorBonus } from "./terminatorBonus";
import { FogBonus } from "./fogBonus";
import { SpeedBonus } from "./speedBonus";

export * from "./powerup";
export * from "./laserBonus";
export * from "./mgBonus";
export * from "./grenadeBonus";
export * from "./mineBonus";
export * from "./guidedBonus";
export * from "./wreckingBallBonus";
export * from "./multiBonus";
export * from "./slingshotBonus";
export * from "./invincibleBonus";
export * from "./terminatorBonus";
export * from "./fogBonus";
export * from "./speedBonus";

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
