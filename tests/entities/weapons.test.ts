import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Gun, MG, Grenade, Laser, Mine, Guided, WreckingBall, Slingshot } from "@/entities/weapons";
import { TEAMS } from "@/game/team";
import { Settings } from "@/stores/settings";
import Tank from "@/entities/tank";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  hexToRgbA: vi.fn().mockReturnValue("rgba(0,0,0,0.4)"),
}));

vi.mock("@/entities/smoke", () => ({
  Smoke: class {
    constructor() {}
  },
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
      maxAge = 1000;
      age = 0;
      deleted = false;
      explode = vi.fn();
      delete = vi.fn();
      checkCollision = vi.fn();
      checkBulletCollision = vi.fn();
      leaveTrace = vi.fn();
      setPosition = vi.fn((c: any) => {
        this.x = c.x;
        this.y = c.y;
      });
      constructor(weapon: any) {
        if (weapon && weapon.tank) {
          this.player = weapon.tank.player;
          this.map = weapon.tank.player.game.map;
        } else {
          // Fallback for tests where weapon might be incompletely mocked or constructed
          this.player = {};
          this.map = {};
        }
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
      setPosition = vi.fn((c: any) => {
        this.x = c.x;
        this.y = c.y;
      });
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
      addTimeout: vi.fn(() => ({ triggerTime: 0, callback: vi.fn() })),
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

      gun.deactivate();

      expect(mockGame.addTimeout).toHaveBeenCalled();
      // Capture the callback passed to addTimeout
      const callback = mockGame.addTimeout.mock.calls[0][0];
      callback();

      expect(gun.isActive).toBe(true);
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
      expect(bullet.maxAge).toBe(10000);

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
      expect(bullet.maxAge).toBeGreaterThan(100000);

      bullet.explode();
      expect(mockGame.addObject).toHaveBeenCalled();
    });
  });

  describe("Guided Missile", () => {
    it("should follow path to target in step", () => {
      const guided = new Guided(mockTank);
      const bullet = guided.newBullet();
      expect(bullet.speed).toBeGreaterThan(0);

      const targetTile = { x: 100, y: 100, dx: 0, dy: 0, objs: [] };
      const pathToMock = vi.fn().mockReturnValue([{ id: 1, objs: [] }, targetTile]);

      mockGame.map.getTileByPos.mockReturnValue({
        pathTo: pathToMock,
        objs: [],
      });

      // 1. Initial Step - triggering pathfinding
      bullet.age = 2000;
      (bullet as any).step();

      expect(mockGame.map.getTileByPos).toHaveBeenCalled();
      expect(pathToMock).toHaveBeenCalled();

      // Verify callback logic (manually call the callback passed to pathTo if possible,
      // or rely on the mock setup if we want to test the callback function itself)
      // To test the callback provided BY the bullet, we need to capture it.
      const callback = pathToMock.mock.calls[0][0];

      const enemyTank = Object.create(Tank.prototype);
      enemyTank.player = { team: TEAMS[1] };

      const friendlyTank = Object.create(Tank.prototype);
      friendlyTank.player = { team: TEAMS[0] };

      // Callback should return true for enemy tank
      expect(callback({ objs: [enemyTank] })).toBe(true);
      // Callback should return false for friendly tank
      expect(callback({ objs: [friendlyTank] })).toBe(false);
      // Callback should return false for empty tile
      expect(callback({ objs: [] })).toBe(false);

      // 2. Second Step - Guided Movement
      // Now gotoTarget should be set to targetTile
      // Initial position 0,0. Target 100,100.
      const oldX = bullet.x;
      const oldY = bullet.y;

      // Speed is ~200 (1.1 * 200). dt = 10. distance ~2.
      // Direction 1,1.
      (bullet as any).step();

      // Should have moved towards 100,100 (positive change)
      // Normal movement (angle 0) would be y decreasing.
      // Guided movement towards 100,100 should be x increasing, y increasing.
      expect(bullet.x).toBeGreaterThan(oldX);
      expect(bullet.y).toBeGreaterThan(oldY);
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

    it("should bounce off outer walls", () => {
      const ball = new WreckingBall(mockTank);
      const bullet = ball.newBullet();
      const mockTile = {
        getWalls: vi.fn().mockReturnValue([true, false, false, false]), // Top wall
        neighbors: [undefined, {}, {}, {}], // Top neighbor is missing (outer wall)
        addWall: vi.fn(),
      };
      mockGame.map.getTileByPos.mockReturnValue(mockTile);

      bullet.angle = 0; // Moving up
      bullet.y = 10;
      const oldY = 12;

      (bullet as any).checkCollision(10, oldY);

      expect(mockTile.addWall).not.toHaveBeenCalled();
      // Should bounce: angle = PI - angle
      expect(bullet.angle).toBeCloseTo(Math.PI);
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
