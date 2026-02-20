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
      width: 1000, height: 1000, rescale: vi.fn(), draw: vi.fn(), 
      resize: vi.fn(), clearEffects: vi.fn(), shake: vi.fn()
    } as unknown as Canvas;
    
    // Fix map dimensions for predictability
    Settings.MapNxMin = 5;
    Settings.MapNxMax = 5;
    Settings.DT = 10;
    Settings.BotSpeed = 1;
    game = new Game(mockCanvas);

    // Clear all random walls first
    for (const tile of game.map.tiles) {
        tile.walls = [false, false, false, false];
    }
  });

  it("should navigate around a U-shaped obstacle to reach an enemy", () => {
    /**
     * Maze Layout (3x3 area):
     * B = Bot (0,0)
     * E = Enemy (2,0)
     * W = Wall
     * . = Path
     * 
     * [B] [W] [E]  <- Direct path blocked by wall at (0,0)-right and (1,0)-left
     * [.] [W] [.]
     * [.] [.] [.]  <- Only path is via (0,1) -> (0,2) -> (1,2) -> (2,2) -> (2,1) -> (2,0)
     */
    
    const tile00 = game.map.getTileByIndex(0, 0)!;
    const tile10 = game.map.getTileByIndex(1, 0)!;
    const tile11 = game.map.getTileByIndex(1, 1)!;
    const tile20 = game.map.getTileByIndex(2, 0)!;

    // Block horizontal path between (0,0) and (1,0)
    tile00.addWall(3); // Right wall
    // Block horizontal path between (1,0) and (2,0)
    tile10.addWall(3); // Right wall
    // Block vertical path into (1,0) from (1,1)
    tile10.addWall(2); // Bottom wall
    // Block vertical path into (1,1) from (1,2)
    tile11.addWall(2); // Bottom wall

    const botPlayer = new Bot(0, "Bot", TEAMS[0]);
    game.addPlayer(botPlayer);
    const botTank = new Tank(botPlayer, game);
    botTank.x = tile00.x + 65; 
    botTank.y = tile00.y + 65;
    game.addObject(botTank);
    
    const enemyPlayer = new Player(1, "Enemy", TEAMS[1], []);
    game.addPlayer(enemyPlayer);
    const enemyTank = new Tank(enemyPlayer, game);
    enemyTank.x = tile20.x + 65; 
    enemyTank.y = tile20.y + 65;
    game.addObject(enemyTank);

    // Force decision update
    const autopilot = (botPlayer as any).autopilot;
    autopilot.timeSinceLastUpdate = 1000000; 
    
    game.step(10); 

    // Response: The bot should have a 'goto' target
    expect(autopilot.goto).not.toBeNull();
    
    // The bot must NOT go right (x=195) because it's blocked.
    // It must go DOWN to tile (0,1).
    // Tile (0,1) center: x=65, y=130+65=195
    expect(autopilot.goto.x).toBeCloseTo(tile00.x + 65);
    expect(autopilot.goto.y).toBeCloseTo(tile00.y + 130 + 65);
  });
});
