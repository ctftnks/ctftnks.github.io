import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getRandomPowerUp, PowerUps } from "@/entities/powerup";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  playMusic: vi.fn(),
  stopMusic: vi.fn(),
  fogOfWar: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  IMAGES: {
    laser: "laser.png",
    speed: "speed.png",
    invincible: "invincible.png",
    terminator: "terminator.png",
    multi: "multi.png",
    fog: "fog.png",
    slingshot: "slingshot.png",
    wreckingBall: "wreckingBall.png",
    guided: "guided.png",
    mine: "mine.png",
    grenade: "grenade.png",
    mg: "mg.png",
  },
  SOUNDS: {
    reload: "reload.wav",
    origPowerup: "powerup.wav",
    invincible: "invincible.mp3",
    terminator: "terminator.mp3",
  },
}));

describe("PowerUp System", () => {
  let mockTank: any;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      timeouts: [],
      t: 0,
      intvls: [],
    };

    mockTank = {
      speed: 100,
      player: { game: mockGame },
      timers: { invincible: 0 },
      weapon: {},
      rapidfire: false,
      invincible: () => false,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get a random powerup", () => {
    const p = getRandomPowerUp();
    expect(p).toBeDefined();
    // Verify it is one of the known types
    // We can't easily check class name without constructor.name, but we can check properties
    expect(p.image.src).toBeDefined();
  });

  it("should apply SpeedBonus", () => {
    // Find SpeedBonus creator
    const creator = PowerUps.find((p) => p.name === "SpeedBoost")!;
    const bonus = creator.create();

    bonus.apply(mockTank);

    expect(mockTank.speed).toBeCloseTo(110); // 100 * 1.1
    expect(mockGame.timeouts.length).toBe(1); // Reset timeout
  });

  it("should apply InvincibleBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Invincible")!;
    const bonus = creator.create();

    bonus.apply(mockTank);

    expect(mockTank.timers.invincible).toBeGreaterThan(0);
    expect(mockGame.timeouts.length).toBe(1);
  });
});
