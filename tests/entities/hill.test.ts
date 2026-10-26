import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Hill } from "@/entities/base";
import Tank from "@/entities/tank";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

describe("Hill Class", () => {
  let mockGame: any;
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should change team on capture", () => {
    const hill = new Hill(mockGame, 200, 200);
    expect(hill.team).toBeUndefined();

    const enemyPlayer = new Player(1, "E1", TEAMS[2], []);
    const enemyTank = new Tank(enemyPlayer, mockGame);
    enemyTank.x = 200;
    enemyTank.y = 200;

    mockTile.objs.push(enemyTank);
    hill.tile = mockTile;
    hill.step(0);

    expect(hill.team).toBe(TEAMS[2]);
  });

  it("should not be captured by a tank that was destroyed in this frame", () => {
    const hill = new Hill(mockGame, 200, 200);
    const tank = new Tank(new Player(1, "E1", TEAMS[2], []), mockGame);
    tank.x = 200;
    tank.y = 200;
    tank.delete();
    mockTile.objs.push(tank);
    hill.tile = mockTile;

    hill.step(0);

    expect(hill.team).toBeUndefined();
  });

  it("should do nothing in step if no tile", () => {
    const hill = new Hill(mockGame, 200, 200);
    hill.tile = undefined;
    hill.step(0); // Should not throw
    expect(hill.team).toBeUndefined();
  });
});
