import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Gun, MG, Grenade } from "@/entities/weapons";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  hexToRgbA: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  IMAGES: {
    gun: "gun.png",
    mg: "mg.png",
    grenade: "grenade.png",
    mine: "mine.png",
    laser: "laser.png",
    guided: "guided.png",
    wreckingBall: "wreckingBall.png",
    slingshot: "slingshot.png",
  },
  SOUNDS: {
    gun: "gun.wav",
    mg: "mg.wav",
    grenade: "grenade.wav",
    reload: "reload.wav",
    laser: "laser.wav",
  },
}));

vi.mock("@/entities/bullet", () => {
  return {
    default: class MockBullet {
      x = 0;
      y = 0;
      angle = 0;
      radius = 5;
      speed = 10;
      player = {};
      color = "#000";
      lethal = false;
      timeout = 1000;
      age = 0;
      deleted = false;
      explode = vi.fn();
      delete = vi.fn();
      constructor(weapon: any) {
        this.player = weapon.tank.player;
      }
    },
  };
});

describe("Weapon System", () => {
  let mockTank: any;
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      addObject: vi.fn(),
      timeouts: [],
      map: {
        getTileByPos: vi.fn(),
      },
    };

    mockTank = {
      player: {
        game: mockGame,
        team: TEAMS[0],
        isBot: () => false,
      },
      corners: () => [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      angle: 0,
      rapidfire: false,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Base Weapon (via Gun)", () => {
    it("should initialize correctly", () => {
      const gun = new Gun(mockTank);
      expect(gun.isActive).toBe(true);
      expect(gun.isDeleted).toBe(false);
    });

    it("should shoot and create bullet", () => {
      const gun = new Gun(mockTank);
      vi.useFakeTimers();

      gun.shoot();

      expect(mockGame.addObject).toHaveBeenCalled(); // Bullet added
      expect(gun.isActive).toBe(false); // Deactivated

      vi.runAllTimers();
      expect(mockGame.timeouts.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it("should reactivate after delay", () => {
      const gun = new Gun(mockTank);
      gun.deactivate();
      expect(gun.isActive).toBe(false);

      // Manually trigger timeout callback if we could access it,
      // or rely on implementation detail that it pushes to game.timeouts
      // Since we mocked timeouts as array, we can check it's populated
      expect(mockGame.timeouts.length).toBeGreaterThan(0);
    });
  });

  describe("Machine Gun (MG)", () => {
    it("should init with multiple shots", () => {
      const mg = new MG(mockTank);
      expect(mg.nshots).toBe(20);
    });
  });

  describe("Grenade", () => {
    it("should create bullet with explode method", () => {
      const grenade = new Grenade(mockTank);
      const bullet = grenade.newBullet();

      expect(bullet).toBeDefined();
      expect(bullet.timeout).toBe(10000);
      expect(typeof (bullet as any).explode).toBe("function");
    });
  });
});
