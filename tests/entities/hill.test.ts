import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Hill from "@/entities/hill";
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
    hill.step();

    expect(hill.team).toBe(TEAMS[2]);
  });

  it("should do nothing in step if no tile", () => {
    const hill = new Hill(mockGame, 200, 200);
    hill.tile = null;
    hill.step(); // Should not throw
    expect(hill.team).toBeUndefined();
  });
});
