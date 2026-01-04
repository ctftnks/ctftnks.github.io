import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Gun, MG, Grenade, Laser, Mine, Guided, WreckingBall, Slingshot } from "@/entities/weapons";
import { TEAMS } from "@/game/team";
import { Settings } from "@/stores/settings";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  hexToRgbA: vi.fn().mockReturnValue("rgba(0,0,0,0.4)"),
}));

vi.mock("@/entities/smoke", () => ({
  Smoke: vi.fn().mockImplementation(() => ({})),
  generateCloud: vi.fn(),
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
    guided: "guided.wav",
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
      map = {};
      color = "#000";
      lethal = false;
      timeout = 1000;
      age = 0;
      deleted = false;
      explode = vi.fn();
      delete = vi.fn();
      checkCollision = vi.fn();
      checkBulletCollision = vi.fn();
      leaveTrace = vi.fn();
      constructor(weapon: any) {
        this.player = weapon.tank.player;
        this.map = weapon.tank.player.game.map;
      }
    },
  };
});

vi.mock("@/entities/trajectory", () => {
  return {
    default: class MockTrajectory {
      points = [{ x: 0, y: 0, angle: 0 }];
      length = 0;
      drawevery = 0;
      color = "";
      x = 0;
      y = 0;
      angle = 0;
      timeout = 0;
      delta = 0;
      constructor() {
        // Mock some points for laser
        for (let i = 0; i < 20; i++) {
          this.points.push({ x: i, y: i, angle: 0 });
        }
      }
      step = vi.fn();
      delete = vi.fn();
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
        getTileByPos: vi.fn().mockReturnValue({
          getWalls: vi.fn().mockReturnValue([true, false, false, false]),
          neighbors: [null, {}, {}, {}],
          addWall: vi.fn(),
          objs: [],
          pathTo: vi.fn().mockReturnValue([{ id: 1 }, { id: 2, x: 0, y: 0, dx: 1, dy: 1 }]),
        }),
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
      x: 5,
      y: 5,
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
      expect(mockGame.addObject).toHaveBeenCalled();
      expect(gun.isActive).toBe(false);
      vi.useRealTimers();
    });

    it("should reactivate if rapidfire is on", () => {
      mockTank.rapidfire = true;
      const gun = new Gun(mockTank);
      vi.useFakeTimers();
      gun.deactivate();

      vi.advanceTimersByTime(500);

      expect(gun.isActive).toBe(true);
      vi.useRealTimers();
    });
  });

  describe("Machine Gun (MG)", () => {
    it("should fire burst of bullets when shooting", () => {
      const mg = new MG(mockTank);
      mg.shoot(); // First shoot starts timeout and fires first bullet
      expect(mg.nshots).toBe(19);
      expect(mockGame.addObject).toHaveBeenCalled();
    });
  });

  describe("Laser", () => {
    it("should fire multiple bullets along trajectory", () => {
      const laser = new Laser(mockTank);
      laser.shoot();
      expect(mockGame.addObject).toHaveBeenCalled();
      expect(laser.trajectory.step).toHaveBeenCalled();
    });

    it("should update crosshair", () => {
      const laser = new Laser(mockTank);
      laser.crosshair();
      expect(laser.trajectory.x).toBe(mockTank.x);
    });
  });

  describe("Grenade", () => {
    it("should create bullet that explodes into shrapnels", () => {
      const grenade = new Grenade(mockTank);
      const bullet = grenade.newBullet();
      expect(bullet.timeout).toBe(10000);

      (bullet as any).explode();
      expect(mockGame.addObject).toHaveBeenCalledTimes(31); // 1 for grenade + 30 shrapnels
    });

    it("should explode existing grenade when shooting again", () => {
      const grenade = new Grenade(mockTank);
      const bullet = grenade.newBullet();
      const explodeSpy = vi.fn();
      bullet.explode = explodeSpy;
      grenade.bullet = bullet as any;
      bullet.age = 400;

      grenade.shoot();
      expect(explodeSpy).toHaveBeenCalled();
    });
  });

  describe("Mine", () => {
    it("should create mine that stays in place", () => {
      const mine = new Mine(mockTank);
      const bullet = mine.newBullet();
      expect(bullet.timeout).toBeGreaterThan(100000);

      (bullet as any).explode();
      expect(mockGame.addObject).toHaveBeenCalled();
    });
  });

  describe("Guided Missile", () => {
    it("should follow path to target in step", () => {
      const guided = new Guided(mockTank);
      const bullet = guided.newBullet();
      expect(bullet.speed).toBeGreaterThan(0);

      // Trigger pathfinding logic in step
      bullet.age = 2000;
      mockGame.map.getTileByPos.mockReturnValue({
        pathTo: vi.fn().mockReturnValue([
          { id: 1, objs: [] },
          { id: 2, x: 0, y: 0, dx: 1, dy: 1, objs: [{}] },
        ]),
      });

      (bullet as any).step();
      expect(mockGame.map.getTileByPos).toHaveBeenCalled();
    });
  });

  describe("WreckingBall", () => {
    it("should damage walls on collision", () => {
      const ball = new WreckingBall(mockTank);
      const bullet = ball.newBullet();

      const mockTile = {
        getWalls: vi.fn().mockReturnValue([true, false, false, false]),
        neighbors: [{}, {}, {}, {}], // neighbors exist, so it's not an outer wall
        addWall: vi.fn(),
      };
      mockGame.map.getTileByPos.mockReturnValue(mockTile);

      (bullet as any).checkCollision(0, 0);

      expect(mockTile.addWall).toHaveBeenCalled();
    });
  });

  describe("Slingshot", () => {
    it("should fire high speed bullet", () => {
      const sling = new Slingshot(mockTank);
      const bullet = sling.newBullet();
      expect(bullet.speed).toBe(2 * Settings.BulletSpeed);
    });
  });
});
