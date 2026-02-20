import { describe, it, expect, beforeEach, vi } from "vitest";
import Game from "@/game/game";
import Player from "@/game/player";
import { Settings } from "@/stores/settings";
import Canvas from "@/game/canvas";
import { TEAMS } from "@/game/team";
import Tank from "@/entities/tank";
import Bullet from "@/entities/bullet";
import Weapon from "@/entities/weapons/weapon";

// Mock dependencies to avoid browser-specific issues
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
}));

vi.mock("@/ui/ui", () => ({
  updateScores: vi.fn(),
}));

vi.mock("@/ui/pages", () => ({
  openPage: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  SOUNDS: {
    gamestart: "gamestart.wav",
    bounce: "bounce.wav",
    origGun: "gun.mp3",
  },
  IMAGES: {
    gun: "gun.png",
  },
}));

describe("Performance Stress Test (Scenario 1)", () => {
  let mockCanvas: any;
  let game: Game;

  beforeEach(() => {
    mockCanvas = {
      width: 2000,
      height: 2000,
      rescale: vi.fn(),
      draw: vi.fn(),
      resize: vi.fn(),
      clearEffects: vi.fn(),
      shake: vi.fn(),
    } as unknown as Canvas;

    // Standard settings for performance
    Settings.MapNxMin = 20;
    Settings.MapNxMax = 20;
    Settings.DT = 16.6;
    Settings.BulletsCanCollide = true; // Enable heavy collision checks

    game = new Game(mockCanvas);
  });

  it("should complete a heavy logic step (8 tanks, 100 bullets) within the frame budget", () => {
    // 1. Setup Stimulus: 8 tanks
    for (let i = 0; i < 8; i++) {
      const player = new Player(i, `Bot ${i}`, TEAMS[i % TEAMS.length], []);
      game.addPlayer(player);
      const tank = new Tank(player, game);
      tank.x = 100 + i * 100;
      tank.y = 100 + i * 100;
      game.addObject(tank);
    }

    const tanks = game.getTanks();
    expect(tanks.length).toBe(8);

    // 2. Setup Stimulus: 100 bullets
    const weapon = new Weapon(tanks[0]);
    for (let i = 0; i < 100; i++) {
      const bullet = new Bullet(weapon);
      // Scatter bullets to trigger various spatial partitions
      bullet.x = Math.random() * 1500;
      bullet.y = Math.random() * 1500;
      bullet.angle = Math.random() * Math.PI * 2;
      game.addObject(bullet);
    }

    expect(game.objs.length).toBeGreaterThan(100);

    // 3. Measure: Run 100 steps and calculate average time
    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      game.step(Settings.DT);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTimePerStep = totalTime / iterations;

    console.log(`Stress Test: Average time per step with ${game.objs.length} objects: ${avgTimePerStep.toFixed(4)}ms`);

    // 4. Response & Measure: Must be well within 16.6ms frame budget.
    // Even on CI, we expect logic for 100 objects to be very fast (< 2ms).
    expect(avgTimePerStep).toBeLessThan(16.6);
  });
});
