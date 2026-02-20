import { describe, it, expect, beforeEach, vi } from "vitest";
import Game from "@/game/game";
import { Settings } from "@/stores/settings";
import Canvas from "@/game/canvas";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";
import Tank from "@/entities/tank";
import Bot from "@/game/bot";

vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  SOUNDS: { gamestart: "start.wav", kill: "kill.wav" },
  IMAGES: { gun: "gun.png" },
}));

describe("AI Stability (Scenario 5)", () => {
  let game: Game;
  let mockCanvas: any;

  beforeEach(() => {
    mockCanvas = {
      width: 1000,
      height: 1000,
      rescale: vi.fn(),
      draw: vi.fn(),
      resize: vi.fn(),
      clearEffects: vi.fn(),
      shake: vi.fn(),
    } as unknown as Canvas;

    // Fix map dimensions for predictability
    Settings.MapNxMin = 5;
    Settings.MapNxMax = 5;
    Settings.DT = 10;
    Settings.BotSpeed = 1;
    game = new Game(mockCanvas);
  });

  it("should find a path to an enemy in a complex maze", () => {
    // 1. Setup Stimulus: Bot and Enemy
    const botPlayer = new Bot(0, "Bot", TEAMS[0]);
    game.addPlayer(botPlayer);
    const botTank = new Tank(botPlayer, game);

    // Place bot in some tile
    const startTile = game.map.tiles[0];
    botTank.x = startTile.x + 65;
    botTank.y = startTile.y + 65;
    game.addObject(botTank);

    // Place enemy in a distant tile (e.g. 2 tiles away)
    const targetTile = game.map.tiles[2];
    const enemyPlayer = new Player(1, "Enemy", TEAMS[1], []);
    game.addPlayer(enemyPlayer);
    const enemyTank = new Tank(enemyPlayer, game);
    enemyTank.x = targetTile.x + 65;
    enemyTank.y = targetTile.y + 65;
    game.addObject(enemyTank);

    // Verify initial state
    expect(botTank.tile).toBe(startTile);
    expect(enemyTank.tile).toBe(targetTile);

    // 2. Action: Force decision update
    const autopilot = (botPlayer as any).autopilot;
    autopilot.timeSinceLastUpdate = 1000000;

    game.step(10);

    // 3. Response: The bot should have a 'goto' target
    expect(autopilot.goto).not.toBeNull();

    // Distance check: the goto target should be closer to the enemy than the bot currently is
    const distBefore = Math.hypot(botTank.x - enemyTank.x, botTank.y - enemyTank.y);
    const distGoto = Math.hypot(autopilot.goto.x - enemyTank.x, autopilot.goto.y - enemyTank.y);

    expect(distGoto).toBeLessThan(distBefore);
  });
});
