import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Bot from "@/game/bot";
import { store } from "@/stores/game";
import { TEAMS } from "@/game/team";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

vi.mock("@/entities/tank");
vi.mock("@/entities/weapons/weapons");
vi.mock("@/game/autopilot");

describe("Bot Class", () => {
  let bot: Bot;
  let mockGame: any;
  let mockTank: any;

  beforeEach(() => {
    // Reset store
    store.GameID = 0;
    store.nplayers = 0;
    store.keymaps = [[]];

    mockGame = {
      t: 0,
      mode: {},
      players: [],
      map: {},
    };

    mockTank = {
      player: null,
    };

    // Inject mock game into store if needed, or attach to bot
    store.game = mockGame;

    // Create Bot
    bot = new Bot(0, "Bot 1", TEAMS[0]);
    bot.game = mockGame;
    mockTank.player = bot;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize as a bot", () => {
    expect(bot.isBot()).toBe(true);
    expect(bot.name).toContain("Bot");
    expect(bot.keys).toEqual([]);
  });

  it("should delegate steer to autopilot", () => {
    const stepSpy = vi.spyOn((bot as any).autopilot, "step");

    bot.steer(mockTank as any);

    expect(stepSpy).toHaveBeenCalledWith(mockTank, mockGame);
  });
});
