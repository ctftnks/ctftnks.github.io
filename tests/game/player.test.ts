import { describe, it, expect, beforeEach, vi } from "vitest";
import { TEAMS } from "@/game/team";
import { store } from "@/game/store";
import { Key } from "@/game/key";
import { Settings } from "@/game/settings";
import Player from "@/game/player";

describe("Player Class", () => {
  const mockMap = {
    spawnPoint: vi.fn(() => ({ x: 100, y: 100 })),
    getTileByPos: vi.fn(() => null),
  };

  const mockGame = {
    map: mockMap,
    addObject: vi.fn(),
    nPlayersAlive: 0,
    timeouts: [] as number[],
    t: 0,
    canvas: { shake: vi.fn() },
    nkills: 0,
    mode: { BaseSpawnDistance: 2 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store.nplayers = 0;
    store.game = mockGame as any;
    mockGame.nPlayersAlive = 0;
    mockGame.timeouts = [];
    mockGame.nkills = 0;
  });

  it("should initialize with provided values", () => {
    const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
    const player = new Player(0, "Player 1", TEAMS[1], keys);

    expect(player.id).toBe(0);
    expect(player.name).toBe("Player 1");
    expect(player.team).toBe(TEAMS[1]);
    expect(player.keys).toEqual(keys);
    expect(player.tank).toBeDefined();
  });

  it("should return false for isBot", () => {
    const player = new Player(0, "P", TEAMS[0], []);
    expect(player.isBot()).toBe(false);
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

  describe("step()", () => {
    it("should move tank forward when first key is pressed", () => {
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
      const player = new Player(0, "P", TEAMS[0], keys);
      player.game = mockGame as any;
      const moveSpy = vi.spyOn(player.tank, "move");

      vi.spyOn(Key, "isDown").mockImplementation((code) => code === "KeyW");

      player.step();
      expect(moveSpy).toHaveBeenCalledWith(1);
    });

    it("should turn tank left when second key is pressed", () => {
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
      const player = new Player(0, "P", TEAMS[0], keys);
      player.game = mockGame as any;
      const turnSpy = vi.spyOn(player.tank, "turn");

      vi.spyOn(Key, "isDown").mockImplementation((code) => code === "KeyA");

      player.step();
      expect(turnSpy).toHaveBeenCalledWith(-1);
    });

    it("should move tank backward when third key is pressed", () => {
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
      const player = new Player(0, "P", TEAMS[0], keys);
      player.game = mockGame as any;
      const moveSpy = vi.spyOn(player.tank, "move");

      vi.spyOn(Key, "isDown").mockImplementation((code) => code === "KeyS");

      player.step();
      expect(moveSpy).toHaveBeenCalledWith(-0.7);
    });

    it("should turn tank right when fourth key is pressed", () => {
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
      const player = new Player(0, "P", TEAMS[0], keys);
      player.game = mockGame as any;
      const turnSpy = vi.spyOn(player.tank, "turn");

      vi.spyOn(Key, "isDown").mockImplementation((code) => code === "KeyD");

      player.step();
      expect(turnSpy).toHaveBeenCalledWith(1);
    });

    it("should shoot when fifth key is pressed", () => {
      const keys = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
      const player = new Player(0, "P", TEAMS[0], keys);
      player.game = mockGame as any;
      const shootSpy = vi.spyOn(player.tank, "shoot");

      vi.spyOn(Key, "isDown").mockImplementation((code) => code === "Space");

      player.step();
      expect(shootSpy).toHaveBeenCalled();
    });
  });

  describe("spawn()", () => {
    it("should spawn at map spawn point if no base is set", () => {
      const player = new Player(0, "P", TEAMS[0], []);
      player.game = mockGame as any;
      mockMap.spawnPoint.mockReturnValue({ x: 200, y: 300 });

      player.spawn();

      expect(player.tank.x).toBe(200);
      expect(player.tank.y).toBe(300);
      expect(mockGame.addObject).toHaveBeenCalledWith(player.tank);
      expect(mockGame.nPlayersAlive).toBe(1);
      expect(player.tank.timers.spawnshield).toBe(mockGame.t + Settings.SpawnShieldTime * 1000);
    });

    it("should spawn near base if base is set", () => {
      const player = new Player(0, "P", TEAMS[0], []);
      player.game = mockGame as any;
      const mockTile = {
        id: 1,
        x: 500,
        y: 600,
        dx: 100,
        dy: 100,
        randomWalk: vi.fn(() => ({ id: 2, x: 700, y: 800, dx: 100, dy: 100 })),
      };
      player.base = { tile: mockTile } as any;

      player.spawn();

      expect(mockTile.randomWalk).toHaveBeenCalled();
      expect(player.tank.x).toBe(750); // 700 + 100/2
      expect(player.tank.y).toBe(850); // 800 + 100/2
    });
  });

  describe("kill()", () => {
    it("should handle player death correctly", () => {
      vi.useFakeTimers();
      const player = new Player(0, "P", TEAMS[0], []);
      player.game = mockGame as any;
      mockGame.nPlayersAlive = 1;
      player.spree = 5;

      player.kill();

      expect(mockGame.nPlayersAlive).toBe(0);
      expect(player.tank.weapon.isActive).toBe(false);
      expect(mockGame.nkills).toBe(1);
      expect(mockGame.canvas.shake).toHaveBeenCalled();
      expect(player.spree).toBe(0);
      expect(player.stats.deaths).toBe(1);
      expect(mockGame.timeouts.length).toBe(1);

      vi.runAllTimers();
      // Should trigger spawn()
      expect(mockGame.nPlayersAlive).toBe(1);

      vi.useRealTimers();
    });
  });
});
