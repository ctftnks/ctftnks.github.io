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
import type Game from "@/game/game";

export * from "./powerup";
export * from "./weaponBonus";
export * from "./multiBonus";
export * from "./invincibleBonus";
export * from "./terminatorBonus";
export * from "./fogBonus";
export * from "./speedBonus";

export const PowerUps = reactive([
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.laser, Laser, true),
    name: "Laser",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.mg, MG, true),
    name: "MG",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.grenade, Grenade, false),
    name: "Grenade",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.mine, Mine, false),
    name: "Mine",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.guided, Guided, true),
    name: "Guided",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.wreckingBall, WreckingBall, false),
    name: "WreckingBall",
    weight: 0.5,
  },
  {
    create: (game: Game) => new MultiBonus(game),
    name: "Multiplier",
    weight: 1,
  },
  {
    create: (game: Game) => new WeaponBonus(game, IMAGES.slingshot, Slingshot, true),
    name: "Slingshot",
    weight: 1,
  },
  {
    create: (game: Game) => new InvincibleBonus(game),
    name: "Invincible",
    weight: 1,
  },
  {
    create: (game: Game) => new TerminatorBonus(game),
    name: "Terminator",
    weight: 1,
  },
  {
    create: (game: Game) => new FogBonus(game),
    name: "FogOfWar",
    weight: 0,
  },
  {
    create: (game: Game) => new SpeedBonus(game),
    name: "SpeedBoost",
    weight: 1,
  },
]);

/**
 * Returns a random powerup based on weights.
 * @param game - The game instance.
 * @returns A new PowerUp instance.
 */
export function getRandomPowerUp(game: Game): PowerUp {
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
  return PowerUps[h - 1].create(game);
}
