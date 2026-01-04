import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Base from "@/entities/base";
import Flag from "@/entities/flag";
import Tank from "@/entities/tank";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

describe("Base Class", () => {
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
