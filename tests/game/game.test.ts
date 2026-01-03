import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Game from "@/game/game";
import GameMap from "@/game/gamemap";
import Player from "@/game/player";
import { store, Settings } from "@/game/store";
import Canvas from "@/game/canvas";

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

    // Mock Canvas
    mockCanvas = {
      width: 800,
      height: 600,
      rescale: vi.fn(),
      sync: vi.fn(),
      shake: vi.fn(),
    } as unknown as Canvas;

    // Use a fixed map size for predictability
    Settings.MapNxMin = 10;
    Settings.MapNxMax = 10;
    Settings.GameFrequency = 10;
    Settings.PowerUpRate = 1000; // High value to avoid random powerups in basic tests

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
    expect(store.GameID).toBeGreaterThan(0);
  });

  it("should add players", () => {
    const player = new Player();
    game.addPlayer(player);
    expect(game.players).toContain(player);
    expect(player.game).toBe(game);
  });

  it("should start the game loop", () => {
    const player = new Player();
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
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    vi.spyOn(window, "clearTimeout");

    game.stop();

    expect(game.paused).toBe(true);
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should execute step function", () => {
    game.start();
    const modeStepSpy = vi.spyOn(game.mode, "step");

    // Advance time
    vi.advanceTimersByTime(Settings.GameFrequency);

    expect(game.t).toBeGreaterThan(0);
    expect(modeStepSpy).toHaveBeenCalled();
  });

  it("should handle object management in step", () => {
    // Add a mock object
    const mockObj = {
      x: 0,
      y: 0,
      deleted: false,
      step: vi.fn(),
      delete: vi.fn(),
    } as any;

    game.addObject(mockObj);
    expect(game.objs).toContain(mockObj);

    // Step
    game.step();
    expect(mockObj.step).toHaveBeenCalled();

    // Mark as deleted
    mockObj.deleted = true;
    game.step();
    expect(game.objs).not.toContain(mockObj);
  });

  it("should end game when time is up", () => {
    game.start();
    const endSpy = vi.spyOn(game, "end");

    // Fast forward past round time
    game.t = Settings.RoundTime * 60000 + 100;
    game.step();

    expect(endSpy).toHaveBeenCalled();
  });
});
