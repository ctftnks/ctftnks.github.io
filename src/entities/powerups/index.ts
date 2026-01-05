import { reactive } from "vue";
import { playSound } from "@/game/effects";
import { SOUNDS, IMAGES } from "@/game/assets";

import { PowerUp } from "./powerup";
import { WeaponBonus } from "./weaponBonus";
import { MultiBonus } from "./multiBonus";
import { InvincibleBonus } from "./invincibleBonus";
import { TerminatorBonus } from "./terminatorBonus";
import { FogBonus } from "./fogBonus";
import { SpeedBonus } from "./speedBonus";

import { Laser, MG, Grenade, Mine, Guided, WreckingBall, Slingshot } from "../weapons";

export * from "./powerup";
export * from "./weaponBonus";
export * from "./multiBonus";
export * from "./invincibleBonus";
export * from "./terminatorBonus";
export * from "./fogBonus";
export * from "./speedBonus";

export const PowerUps = reactive([
  {
    create: () => new WeaponBonus(IMAGES.laser, Laser, true),
    name: "Laser",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.mg, MG, true),
    name: "MG",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.grenade, Grenade, false),
    name: "Grenade",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.mine, Mine, false),
    name: "Mine",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.guided, Guided, true),
    name: "Guided",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.wreckingBall, WreckingBall, false),
    name: "WreckingBall",
    weight: 0.5,
  },
  {
    create: () => new MultiBonus(),
    name: "Multiplier",
    weight: 1,
  },
  {
    create: () => new WeaponBonus(IMAGES.slingshot, Slingshot, true),
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
