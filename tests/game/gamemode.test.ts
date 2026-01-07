import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Deathmatch, TeamDeathmatch, KingOfTheHill, CaptureTheFlag } from "@/game/gamemode";
import Game from "@/game/game";

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

vi.mock("@/entities/base", () => ({
  default: vi.fn().mockImplementation(function (this: any, game, x, y, team) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.team = team;
    this.tile = { id: 1, randomWalk: vi.fn().mockReturnValue({ id: 2, x: 10, y: 10, dx: 1, dy: 1 }) };
  }),
  Hill: vi.fn().mockImplementation(function (this: any, game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.team = null;
  }),
}));

vi.mock("@/entities/flag", () => ({
  default: vi.fn().mockImplementation(function (this: any, game, base) {
    this.game = game;
    this.base = base;
    this.drop = vi.fn();
  }),
}));

describe("Gamemode Classes", () => {
  let mockGame: any;
  let player1: any;
  let player2: any;
  let player3: any;
  let redTeam: any;
  let blueTeam: any;

  beforeEach(() => {
    redTeam = { color: "red" };
    blueTeam = { color: "blue" };

    player1 = { id: 1, team: redTeam, score: 0, spree: 0, resetStats: vi.fn(), tank: {}, isBot: () => false };
    player2 = { id: 2, team: blueTeam, score: 0, spree: 0, resetStats: vi.fn(), tank: {}, isBot: () => false };
    player3 = { id: 3, team: redTeam, score: 0, spree: 0, resetStats: vi.fn(), tank: {}, isBot: () => false }; // Teammate of player1

    mockGame = {
      players: [player1, player2, player3],
      t: 0,
      map: {
        spawnPoint: vi.fn().mockReturnValue({ x: 0, y: 0 }),
        getFurthestSpawnPoint: vi.fn().mockReturnValue({ x: 100, y: 100 }),
        getTileByPos: vi.fn().mockReturnValue({
          id: 1,
          x: 0,
          y: 0,
          dx: 1,
          dy: 1,
          pathTo: vi.fn().mockReturnValue({ length: 1 }),
        }),
      },
      addObject: vi.fn(),
      mode: { BaseSpawnDistance: 2 },
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
      mode.newKill(player1, player3);
      expect(player1.score).toBe(-1);
    });

    it("should handle killing sprees", () => {
      player1.spree = 4;
      mode.giveScore(player1, 1);
      expect(player1.spree).toBe(5);
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

    it("should initialize bases", () => {
      mode.init();
      expect(mockGame.addObject).toHaveBeenCalled();
      expect(player1.base).toBeDefined();
      expect(player2.base).toBeDefined();
      expect(player3.base).toBe(player1.base);
    });
  });

  describe("CaptureTheFlag", () => {
    let mode: CaptureTheFlag;

    beforeEach(() => {
      mode = new CaptureTheFlag(mockGame as Game);
    });

    it("should give points to all team members", () => {
      mode.giveScore(player1, 1);
      expect(player1.score).toBe(1);
      expect(player3.score).toBe(1);
      expect(player2.score).toBe(0);
    });

    it("should handle new kill correctly", () => {
      mode.newKill(player1, player2);
      expect(player1.spree).toBe(1);
      expect(player1.score).toBe(0); // Kill doesn't give score in CTF
    });

    it("should initialize bases and flags", () => {
      mode.init();
      expect(mockGame.addObject).toHaveBeenCalled();
      expect(player1.base).toBeDefined();
      expect(player1.base.flag).toBeDefined();
    });
  });

  describe("KingOfTheHill", () => {
    let mode: KingOfTheHill;

    beforeEach(() => {
      mode = new KingOfTheHill(mockGame as Game);
    });

    it("should award points when hills are controlled by one team", () => {
      mode.bases = [{ team: redTeam } as any, { team: redTeam } as any];
      mockGame.t = 2000;
      mode.step();
      expect(player1.score).toBe(1);
      expect(player3.score).toBe(1);
      expect(player2.score).toBe(0);
    });

    it("should not award points if hills are mixed", () => {
      mode.bases = [{ team: redTeam } as any, { team: blueTeam } as any];
      mockGame.t = 2000;
      mode.step();
      expect(player1.score).toBe(0);
      expect(player2.score).toBe(0);
    });

    it("should initialize hills", () => {
      mode.init();
      expect(mockGame.addObject).toHaveBeenCalled();
      expect(mode.bases.length).toBe(mockGame.players.length - 1);
    });
  });
});
