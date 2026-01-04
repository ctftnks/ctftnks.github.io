import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Base, Flag, Hill } from "@/entities/ctf";
import Tank from "@/entities/tank";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

describe("CTF Entities", () => {
  let mockGame: any;
  let mockPlayer: any;
  let mockTile: any;

  beforeEach(() => {
    mockTile = {
      objs: [],
      x: 0,
      y: 0,
      dx: 100,
      dy: 100,
    };

    mockGame = {
      map: {
        getTileByPos: vi.fn().mockReturnValue(mockTile),
      },
      mode: {
        giveScore: vi.fn(),
      },
      t: 1000,
      objs: [],
    };

    mockPlayer = {
      team: TEAMS[1],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Base Class", () => {
    it("should initialize correctly", () => {
      const base = new Base(mockGame, mockPlayer, 50, 50);
      expect(base.team).toBe(mockPlayer.team);
      expect(base.color).toBe(mockPlayer.team.color);
      expect(base.x).toBe(50);
      expect(base.y).toBe(50);
    });

    it("should initialize as neutral when no player provided", () => {
      const base = new Base(mockGame, null, 50, 50);
      expect(base.team).toBeNull();
      expect(base.color).toBe("#555");
    });

    it("should detect if it has flag", () => {
      const base = new Base(mockGame, mockPlayer, 50, 50);
      expect(base.hasFlag()).toBe(false);

      const flag = new Flag(mockGame, base);
      base.flag = flag;
      expect(base.hasFlag()).toBe(true);

      flag.inBase = false;
      expect(base.hasFlag()).toBe(false);
    });

    it("should score when friendly tank returns flag", () => {
      const base = new Base(mockGame, mockPlayer, 50, 50);
      const flag = new Flag(mockGame, base);
      base.flag = flag;
      flag.inBase = true;

      const player = new Player(0, "P1", TEAMS[1], []);
      const friendlyTank = new Tank(player, mockGame);
      friendlyTank.x = 50;
      friendlyTank.y = 50;

      const enemyBase = new Base(mockGame, { team: TEAMS[2] } as any, 500, 500);
      const enemyFlag = new Flag(mockGame, enemyBase);
      friendlyTank.carriedFlag = enemyFlag;

      mockTile.objs.push(friendlyTank);
      base.step();

      expect(mockGame.mode.giveScore).toHaveBeenCalledWith(player, 1);
      expect(friendlyTank.carriedFlag).toBeNull();
    });

    it("should draw itself", () => {
      const base = new Base(mockGame, mockPlayer, 50, 50);
      const mockContext = {
        save: vi.fn(),
        beginPath: vi.fn(),
        translate: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        restore: vi.fn(),
      } as any;
      base.draw(mockContext);
      expect(mockContext.fill).toHaveBeenCalled();
    });
  });

  describe("Flag Class", () => {
    it("should initialize and link to base", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);

      expect(flag.base).toBe(base);
      expect(flag.team).toBe(base.team);
      expect(flag.inBase).toBe(true);
    });

    it("should be picked up", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      const tank = { carriedFlag: null } as any;

      flag.pickup(tank);

      expect(flag.picked).toBe(true);
      expect(flag.inBase).toBe(false);
      expect(tank.carriedFlag).toBe(flag);
      expect(flag.deleted).toBe(true);
    });

    it("should reset to base", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      flag.x = 500;
      flag.y = 500;
      flag.inBase = false;

      flag.reset();

      expect(flag.inBase).toBe(true);
      expect(flag.x).toBe(100);
      expect(flag.y).toBe(100);
    });

    it("should be picked up by enemy tank in step", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      flag.drop(100, 100);
      flag.inBase = false;

      const enemyPlayer = new Player(1, "E1", TEAMS[2], []);
      const enemyTank = new Tank(enemyPlayer, mockGame);
      enemyTank.x = 100;
      enemyTank.y = 100;
      mockTile.objs.push(enemyTank);

      flag.step();

      expect(flag.picked).toBe(true);
      expect(enemyTank.carriedFlag).toBe(flag);
    });

    it("should be reset by friendly tank in step if not in base", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      flag.drop(200, 200);
      flag.inBase = false;

      // Ensure base says it doesn't have the flag
      base.flag = flag;

      const friendlyPlayer = new Player(0, "P1", TEAMS[1], []);
      const friendlyTank = new Tank(friendlyPlayer, mockGame);
      friendlyTank.x = 200;
      friendlyTank.y = 200;
      mockTile.objs.push(friendlyTank);

      flag.step();

      expect(flag.inBase).toBe(true);
      expect(flag.x).toBe(base.x);
    });

    it("should reset automatically after timeout", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      flag.drop(200, 200);
      flag.inBase = false;
      flag.picked = false;

      // Set timer to the past
      flag.resetTimer = 500;
      mockGame.t = 1000;

      flag.step();

      expect(flag.inBase).toBe(true);
    });

    it("should draw itself", () => {
      const base = new Base(mockGame, mockPlayer, 100, 100);
      const flag = new Flag(mockGame, base);
      const mockContext = {
        save: vi.fn(),
        translate: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        restore: vi.fn(),
        fillStyle: "",
      } as any;
      flag.draw(mockContext);
      expect(mockContext.fill).toHaveBeenCalled();
    });
  });

  describe("Hill Class", () => {
    it("should change team on capture", () => {
      const hill = new Hill(mockGame, 200, 200);
      expect(hill.team).toBeNull();

      const enemyPlayer = new Player(1, "E1", TEAMS[2], []);
      const enemyTank = new Tank(enemyPlayer, mockGame);
      enemyTank.x = 200;
      enemyTank.y = 200;

      mockTile.objs.push(enemyTank);
      hill.step();

      expect(hill.team).toBe(TEAMS[2]);
    });

    it("should do nothing in step if no tile", () => {
      const hill = new Hill(mockGame, 200, 200);
      hill.tile = null;
      hill.step(); // Should not throw
      expect(hill.team).toBeNull();
    });
  });
});
