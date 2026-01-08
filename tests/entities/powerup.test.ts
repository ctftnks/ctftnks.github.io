import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getRandomPowerUp, PowerUps } from "@/entities/powerups";
import { store } from "@/stores/gamestore";
import { fogOfWar } from "@/game/effects";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  playMusic: vi.fn(),
  stopMusic: vi.fn(),
  hexToRgbA: vi.fn().mockReturnValue("rgba(0,0,0,0.4)"),
  fogOfWar: vi.fn(),
}));

vi.mock("@/entities/trajectory", () => {
  return {
    default: class MockTrajectory {
      length = 0;
      drawevery = 0;
      color = "";
      x = 0;
      y = 0;
      angle = 0;
      timeout = 0;
      delta = 0;
      step = vi.fn();
      delete = vi.fn();
    },
  };
});

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
      addObject: vi.fn(),
      addTimeout: vi.fn((cb, time) => {
        mockGame.updatables.push({ callback: cb, triggerTime: mockGame.t + time });
        setTimeout(cb, time);
      }),
      modifyPowerUpSpawnRate: vi.fn(),
      updatables: [],
      t: 1000,
      intvls: [],
      map: {},
    };
    store.game = mockGame;

    mockTank = {
      x: 0,
      y: 0,
      angle: 0,
      speed: 100,
      player: {
        game: mockGame,
        team: { color: "#ff0000" },
      },
      timers: { invincible: 0 },
      weapon: {},
      rapidfire: false,
      invincible: () => false,
      corners: () => [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get a random powerup", () => {
    const p = getRandomPowerUp();
    expect(p).toBeDefined();
    expect(p.image.src).toBeDefined();
  });

  it("should apply LaserBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Laser")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("Laser");
  });

  it("should apply MGBonus", () => {
    const creator = PowerUps.find((p) => p.name === "MG")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("MG");
  });

  it("should apply GrenadeBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Grenade")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("Grenade");
  });

  it("should apply MineBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Mine")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("Mine");
  });

  it("should apply GuidedBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Guided")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("Guided");
  });

  it("should apply WreckingBallBonus", () => {
    const creator = PowerUps.find((p) => p.name === "WreckingBall")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("WreckingBall");
  });

  it("should apply SlingshotBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Slingshot")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.weapon.name).toBe("Slingshot");
  });

  it("should apply SpeedBonus", () => {
    const creator = PowerUps.find((p) => p.name === "SpeedBoost")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.speed).toBeCloseTo(130);
    expect(mockGame.updatables.length).toBe(1);
  });

  it("should apply InvincibleBonus", () => {
    vi.useFakeTimers();
    const creator = PowerUps.find((p) => p.name === "Invincible")!;
    const bonus = creator.create();

    // 1. First Apply
    bonus.apply(mockTank);
    expect(mockTank.invincibleDuration).toBe(10000);
    expect(mockGame.updatables.length).toBe(1);
    // expect(playMusic).toHaveBeenCalledWith(SOUNDS.invincible); // Need to export playMusic from mock or check calls

    // 2. Second Apply (Guard clause)
    bonus.apply(mockTank);
    expect(mockGame.updatables.length).toBe(1); // No new timeout added (or length stays 1 if implementation doesn't duplicate)

    // 3. Timeout execution
    // Speed was multiplied by 1.14.
    // Wait for timeout (10100ms)
    vi.advanceTimersByTime(10100);

    // Speed should be reset (divided by 1.14)
    // 100 * 1.14 / 1.14 ~= 100.
    expect(mockTank.speed).toBeCloseTo(100);

    vi.useRealTimers();
  });

  it("should apply TerminatorBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Terminator")!;
    const bonus = creator.create();
    bonus.apply(mockTank);
    expect(mockTank.rapidfire).toBe(true);
    expect(mockGame.updatables.length).toBe(1);
  });

  it("should apply MultiBonus", () => {
    const creator = PowerUps.find((p) => p.name === "Multiplier")!;
    const bonus = creator.create();

    (bonus as any).apply();

    expect(mockGame.modifyPowerUpSpawnRate).toHaveBeenCalledWith(8000);
  });

  it("should apply FogBonus", () => {
    // Find FogBonus creator
    const creator = PowerUps.find((p) => p.name === "FogOfWar")!;
    const bonus = creator.create();

    // Apply bonus
    bonus.apply(mockTank);

    // Verify fogOfWar was called
    // (fogOfWar is mocked at the top of this file)
    expect(fogOfWar).toHaveBeenCalledWith(mockGame);

    // Apply again - should not trigger fogOfWar
    (fogOfWar as any).mockClear();
    bonus.apply(mockTank);
    expect(fogOfWar).not.toHaveBeenCalled();
  });
});
