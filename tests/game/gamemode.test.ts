import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Deathmatch, TeamDeathmatch, KingOfTheHill } from "@/game/gamemode";
import Game from "@/game/game";
import { Settings } from "@/stores/settings";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

vi.mock("@/ui/ui", () => ({
  updateScores: vi.fn(),
}));

vi.mock("@/game/bot", () => ({
  adaptBotSpeed: vi.fn(),
}));

describe("Gamemode Classes", () => {
  let mockGame: any;
  let player1: any;
  let player2: any;
  let player3: any;

  beforeEach(() => {
    player1 = { id: 1, team: 1, score: 0, spree: 0, resetStats: vi.fn(), tank: {} };
    player2 = { id: 2, team: 2, score: 0, spree: 0, resetStats: vi.fn(), tank: {} };
    player3 = { id: 3, team: 1, score: 0, spree: 0, resetStats: vi.fn(), tank: {} }; // Teammate of player1

    mockGame = {
      players: [player1, player2, player3],
      settings: Settings,
      t: 0,
      map: {},
      addObject: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Deathmatch", () => {
    let mode: Deathmatch;

    beforeEach(() => {
      mode = new Deathmatch(mockGame as Game);
    });

    it("should give points for enemy kill", () => {
      mode.newKill(player1, player2);
      expect(player1.score).toBe(1);
      expect(player1.spree).toBe(1);
    });

    it("should deduct points for friendly fire (same team)", () => {
      // In DM usually everyone is own team or different, but logic checks team equality
      mode.newKill(player1, player3);
      expect(player1.score).toBe(-1);
    });

    it("should handle killing sprees", () => {
      player1.spree = 4;
      mode.giveScore(player1, 1);
      expect(player1.spree).toBe(5);
      // Bonus for spree: score += floor(5/5) = 1. Total +2.
      expect(player1.score).toBe(2);
    });
  });

  describe("TeamDeathmatch", () => {
    let mode: TeamDeathmatch;

    beforeEach(() => {
      mode = new TeamDeathmatch(mockGame as Game);
    });

    it("should give points to all team members", () => {
      mode.giveScore(player1, 1);
      expect(player1.score).toBe(1);
      expect(player3.score).toBe(1); // Teammate
      expect(player2.score).toBe(0); // Enemy
    });

    it("should handle new kill correctly", () => {
      mode.newKill(player1, player2);
      expect(player1.score).toBe(1);
      expect(player3.score).toBe(1);
    });
  });

  describe("KingOfTheHill", () => {
    let mode: KingOfTheHill;

    beforeEach(() => {
      mode = new KingOfTheHill(mockGame as Game);
    });

    it("should award points when hills are controlled by one team", () => {
      // Mock bases
      mode.bases = [{ team: 1 } as any, { team: 1 } as any];

      mockGame.t = 2000; // Trigger score interval

      mode.step();

      expect(player1.score).toBe(1);
      expect(player3.score).toBe(1);
      expect(player2.score).toBe(0);
    });

    it("should not award points if hills are mixed", () => {
      mode.bases = [{ team: 1 } as any, { team: 2 } as any];

      mockGame.t = 2000;

      mode.step();

      expect(player1.score).toBe(0);
      expect(player2.score).toBe(0);
    });
  });
});
