import { describe, it, expect, beforeEach, vi } from "vitest";
import Tank from "@/entities/tank";
import { Settings } from "@/game/store";

describe("Tank Class", () => {
  let mockPlayer: any;

  beforeEach(() => {
    const mockTile = {
      getWalls: () => [false, false, false, false],
      corners: () => [
        { x: 0, y: 0, w: false },
        { x: 0, y: 100, w: false },
        { x: 100, y: 100, w: false },
        { x: 100, y: 0, w: false },
      ],
    };

    mockPlayer = {
      color: "#ff0000",
      name: "Test Player",
      game: {
        t: 0,
        map: {
          getTileByPos: vi.fn(() => mockTile),
        },
      },
      stats: { miles: 0, shots: 0 },
      step: vi.fn(),
      isBot: () => false,
    };
    Settings.TankSpeed = 200;
  });

  it("should initialize with correct default properties", () => {
    const tank = new Tank(mockPlayer);
    expect(tank instanceof Tank).toBe(true);
    expect(tank.speed).toBe(200);
    expect(tank.player).toBe(mockPlayer);
  });

  it("should update stats when moving", () => {
    const tank = new Tank(mockPlayer);
    tank.map = mockPlayer.game.map;

    const initialMiles = mockPlayer.stats.miles;

    tank.move(1);
    expect(mockPlayer.stats.miles).toBeGreaterThan(initialMiles);
  });

  it("should be invincible when spawnshield is active", () => {
    const tank = new Tank(mockPlayer);
    tank.timers.spawnshield = 1000;
    mockPlayer.game.t = 500;

    expect(tank.spawnshield()).toBe(true);
    expect(tank.invincible()).toBe(true);
  });

  it("should not be invincible after shield expires", () => {
    const tank = new Tank(mockPlayer);
    tank.timers.spawnshield = 1000;
    mockPlayer.game.t = 1500;

    expect(tank.spawnshield()).toBe(false);
    expect(tank.invincible()).toBe(false);
  });
});
