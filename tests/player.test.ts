import { describe, it, expect, beforeEach, vi } from "vitest";
import Player from "../src/classes/player";
import { store } from "../src/state";

describe("Player Class", () => {
  beforeEach(() => {
    store.nplayers = 0;
    store.game = {
      map: {
        spawnPoint: () => ({ x: 100, y: 100 }),
      },
      addObject: vi.fn(),
      nPlayersAlive: 0,
      timeouts: [],
      t: 0,
    };
  });

  it("should initialize with unique IDs and default names", () => {
    const p1 = new Player();
    const p2 = new Player();

    expect(p1.id).toBe(0);
    expect(p1.name).toBe("Player 1");
    expect(p2.id).toBe(1);
    expect(p2.name).toBe("Player 2");
  });

  it("should reset stats correctly", () => {
    const player = new Player();
    player.stats = { deaths: 5, kills: 10, miles: 100, shots: 50 };

    player.resetStats();
    expect(player.stats.deaths).toBe(0);
    expect(player.stats.kills).toBe(0);
    expect(player.stats.miles).toBe(0);
    expect(player.stats.shots).toBe(0);
  });

  it("should change color and team correctly", () => {
    const player = new Player();
    const initialColor = player.color;
    const initialTeam = player.team;

    player.changeColor();
    expect(player.team).toBe(initialTeam + 1);
    expect(player.color).not.toBe(initialColor);
  });
});
