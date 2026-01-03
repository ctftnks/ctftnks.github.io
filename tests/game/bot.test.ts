import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Bot from "@/game/bot";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

vi.mock("@/entities/tank");
vi.mock("@/entities/weapons/weapons");

describe("Bot Class", () => {
  let bot: Bot;
  let mockGame: any;
  let mockMap: any;
  let mockTank: any;

  beforeEach(() => {
    // Reset store
    store.GameID = 0;
    store.nplayers = 0;
    store.keymaps = [[]];

    // Mock Game and Map
    mockMap = {
      getTileByPos: vi.fn(),
    };

    mockGame = {
      map: mockMap,
      t: 0,
      mode: {},
      players: [],
    };

    // Mock Tank
    mockTank = {
      x: 100,
      y: 100,
      angle: 0,
      speed: 10,
      weapon: {
        isActive: false,
        bot: {
          shootingRange: 5,
          fleeIfActive: false,
          fleeingDuration: 0,
        },
        shoot: vi.fn(),
      },
      map: mockMap,
      invincible: vi.fn().mockReturnValue(false),
      move: vi.fn(),
      turn: vi.fn(),
      shoot: vi.fn(),
    };

    // Inject mock game into store if needed, or attach to bot
    store.game = mockGame;

    // Create Bot
    bot = new Bot(0, "Bot 1", TEAMS[0]);
    bot.game = mockGame;
    bot.tank = mockTank; // Replace real tank with mock
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize as a bot", () => {
    expect(bot.isBot()).toBe(true);
    expect(bot.name).toContain("Bot");
    expect(bot.keys).toEqual([]);
  });

  it("should follow a path", () => {
    const path = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
    ];
    bot.follow(path);
    expect(bot.goto).toBe(path[1]);
  });

  it("should perform movements towards target", () => {
    bot.goto = { x: 200, y: 100 }; // To the right

    // Current state: x=100, y=100, angle=0.
    // Target is (200, 100).
    // distx = 100, disty = 0.
    // atan2(-100, 0) = -PI/2.
    // target angle = -PI/2 + PI = PI/2.

    bot.performMovements();

    // Expect turn or move called
    // Since angle 0 != PI/2, it should turn
    expect(mockTank.turn).toHaveBeenCalled();
  });

  it("should shoot at target", () => {
    const targetTank = { x: 150, y: 100, player: { isBot: () => false } } as any;
    vi.useFakeTimers();

    bot.shoot(targetTank);

    expect(mockTank.shoot).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should not autopilot too frequently", () => {
    bot.lastChecked = 0;
    Settings.GameFrequency = 10;
    bot.tank.speed = 200;

    // Threshold is 72000 / 200 = 360

    bot.autopilot();
    // First call, lastChecked becomes 10. 10 < 360, returns early.

    expect(mockMap.getTileByPos).not.toHaveBeenCalled();

    bot.lastChecked = 1000; // Force ready

    // Mock getTileByPos to return null to avoid further logic
    mockMap.getTileByPos.mockReturnValue(null);

    bot.autopilot();
    expect(mockMap.getTileByPos).toHaveBeenCalled();
  });
});
