import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Game, { createGame } from "@/game/game";
import GameMap from "@/game/gamemap";
import Player from "@/game/player";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import Canvas from "@/game/canvas";
import { TEAMS } from "@/game/team";
import Tank from "@/entities/tank";
import { PowerUp } from "@/entities/powerups";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
  clearEffects: vi.fn(),
}));

vi.mock("@/ui/ui", () => ({
  updateScores: vi.fn(),
}));

vi.mock("@/ui/pages", () => ({
  openPage: vi.fn(),
}));

// Mock Assets
vi.mock("@/game/assets", () => ({
  SOUNDS: {
    gamestart: "gamestart.wav",
    kill: "kill.wav",
  },
  IMAGES: {
    gun: "gun.png",
  },
}));

describe("Game Class", () => {
  let mockCanvas: any;
  let game: Game;

  beforeEach(() => {
    // Reset store
    store.GameID = 0;
    store.players = [];
    store.canvas = undefined;

    // Mock Canvas
    mockCanvas = {
      width: 800,
      height: 600,
      rescale: vi.fn(),
      draw: vi.fn(),
      shake: vi.fn(),
      resize: vi.fn(),
    } as unknown as Canvas;

    store.canvas = mockCanvas;

    // Use a fixed map size for predictability
    Settings.MapNxMin = 10;
    Settings.MapNxMax = 10;
    Settings.GameFrequency = 10;
    Settings.PowerUpRate = 1000; // High value to avoid random powerups in basic tests
    Settings.RoundTime = 5;

    // Mock window timers
    vi.useFakeTimers();

    // Create game instance
    game = new Game(mockCanvas);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize correctly", () => {
    expect(game).toBeDefined();
    expect(game.canvas).toBe(mockCanvas);
    expect(game.map).toBeInstanceOf(GameMap);
    expect(game.players).toEqual([]);
    expect(game.objs).toEqual([]);
    expect(game.paused).toBe(false);
  });

  it("should initialize with provided map", () => {
    const customMap = new GameMap(mockCanvas);
    const customGame = new Game(mockCanvas, customMap);
    expect(customGame.map).toBe(customMap);
  });

  it("should add players", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);
    expect(game.players).toContain(player);
    expect(player.game).toBe(game);
  });

  it("should start the game loop", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);

    // Spy on player spawn
    const spawnSpy = vi.spyOn(player, "spawn");

    game.start();

    expect(game.loop).toBeDefined();
    expect(spawnSpy).toHaveBeenCalled();
  });

  it("should pause and unpause", () => {
    expect(game.paused).toBe(false);
    game.pause();
    expect(game.paused).toBe(true);
    game.pause();
    expect(game.paused).toBe(false);
  });

  it("should stop the game", () => {
    game.start();
    const cancelAnimationFrameSpy = vi.spyOn(window, "cancelAnimationFrame");
    vi.spyOn(window, "clearTimeout");

    game.stop();

    expect(game.paused).toBe(true);
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it("should execute step function", () => {
    game.start();
    const modeStepSpy = vi.spyOn(game.mode, "step");

    // Advance time enough to trigger frames and accumulation
    vi.advanceTimersByTime(Settings.GameFrequency * 10);

    expect(game.t).toBeGreaterThan(0);
    expect(modeStepSpy).toHaveBeenCalled();
  });

  it("should handle object management in step", () => {
    // Add a mock object
    const mockObj = {
      x: 0,
      y: 0,
      step: vi.fn(),
      delete: vi.fn(),
      isDeleted: vi.fn(),
    } as any;

    game.addObject(mockObj);
    expect(game.objs).toContain(mockObj);

    // Step
    game.step(Settings.GameFrequency);
    expect(mockObj.step).toHaveBeenCalled();

    // Mark as deleted
    mockObj.isDeleted.mockReturnValue(true);
    game.step(Settings.GameFrequency);
    expect(game.objs).not.toContain(mockObj);
  });

  it("should handle updatables management in step", () => {
    const callback = vi.fn();
    const timeout = game.addTimeout(callback, 50);

    expect(game.updatables).toContain(timeout);

    // Step forward but not enough to trigger
    game.step(40);
    expect(callback).not.toHaveBeenCalled();
    expect(game.updatables).toContain(timeout);

    // Step forward to trigger
    game.step(20);
    expect(callback).toHaveBeenCalled();
    expect(timeout.isDeleted()).toBe(true);

    // Step forward to clean up
    game.step(10);
    expect(game.updatables).not.toContain(timeout);
  });

  it("should generate powerups in step", () => {
    Settings.PowerUpRate = 0.01; // Every 10ms
    game.t = 0;

    game.step(Settings.GameFrequency);

    const powerups = game.objs.filter((o) => o instanceof PowerUp);
    expect(powerups.length).toBeGreaterThan(0);
    expect(game.nkills).toBe(0);
  });

  it("should end game when time is up", () => {
    game.start();
    const endSpy = vi.spyOn(game, "end");

    // Fast forward past round time
    game.t = Settings.RoundTime * 60000 + 100;
    game.step(Settings.GameFrequency);

    expect(endSpy).toHaveBeenCalled();
  });

  it("should return tanks with getTanks", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    const tank = new Tank(player, game);
    game.addObject(tank);
    game.addObject({} as any); // Some other object

    const tanks = game.getTanks();
    expect(tanks).toContain(tank);
    expect(tanks.length).toBe(1);
  });

  it("should reset tank timers with resetTime", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    const tank = new Tank(player, game);
    game.addObject(tank);
    tank.timers.invincible = 1000;
    tank.timers.spawnshield = 1000;

    game.resetTime();

    expect(game.t).toBe(0);
    expect(tank.timers.invincible).toBe(0);
    expect(tank.timers.spawnshield).toBe(0);
  });

  it("should handle resize", () => {
    game.map.resize = vi.fn();
    game.resize();
    expect(mockCanvas.resize).toHaveBeenCalled();
    expect(game.map.resize).toHaveBeenCalled();
  });

  describe("createGame function", () => {
    it("should create and start a new game", () => {
      const player = new Player(0, "P1", TEAMS[0], []);
      Settings.GameMode = "DM";
      Settings.ResetStatsEachGame = true;

      const statsSpy = vi.spyOn(player, "resetStats");

      const g = createGame(mockCanvas, [player]);

      expect(g).toBeInstanceOf(Game);
      expect(g.players[0].id).toBe(player.id);
      expect(statsSpy).toHaveBeenCalled();
    });
  });
});
