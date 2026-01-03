import { describe, it, expect, beforeEach, vi } from "vitest";
import { TEAMS } from "@/game/team";
import { store } from "@/game/store";
import GameMap from "@/game/gamemap";
import Player from "@/game/player";

describe("Player Class", () => {
  const mockMap: GameMap = {
    spawnPoint: () => ({ x: 100, y: 100 }),
  } as GameMap;

  beforeEach(() => {
    store.nplayers = 0;
    store.game = {
      map: mockMap,
      addObject: vi.fn(),
      nPlayersAlive: 0,
      timeouts: [],
      t: 0,
      canvas: { shake: vi.fn() },
      nkills: 0,
    } as any;
  });

  it("should initialize with provided values", () => {
    const p1 = new Player(0, "Player 1", TEAMS[1], []);
    const p2 = new Player(1, "Player 2", TEAMS[0], []);

    expect(p1.id).toBe(0);
    expect(p1.name).toBe("Player 1");
    expect(p2.id).toBe(1);
    expect(p2.name).toBe("Player 2");
  });

  it("should reset stats correctly", () => {
    const player = new Player(0, "P", TEAMS[0], []);
    player.stats = { deaths: 5, kills: 10, miles: 100, shots: 50 };

    player.resetStats();
    expect(player.stats.deaths).toBe(0);
    expect(player.stats.kills).toBe(0);
    expect(player.stats.miles).toBe(0);
    expect(player.stats.shots).toBe(0);
  });

  it("should change color and team correctly", () => {
    const player = new Player(0, "P", TEAMS[0], []);
    const initialColor = player.team.color;

    player.changeTeam([TEAMS[0], TEAMS[1]]);
    expect(player.team).toBe(TEAMS[1]);
    expect(player.team.color).not.toBe(initialColor);
  });
});
