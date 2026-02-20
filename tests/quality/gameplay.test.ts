import { describe, it, expect, beforeEach, vi } from "vitest";
import Game from "@/game/game";
import { Settings } from "@/stores/settings";
import Canvas from "@/game/canvas";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";
import Tank from "@/entities/tank";
import { SpeedBonus } from "@/entities/powerups/speedBonus";

vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
  generateCloud: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  SOUNDS: { gamestart: "start.wav", kill: "kill.wav", powerup: "powerup.wav" },
  IMAGES: { gun: "gun.png", speed: "speed.png" },
}));

describe("Gameplay Experience (Scenario 6 & 7)", () => {
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

    Settings.DT = 10;
    game = new Game(mockCanvas);
  });

  it("should provide a temporary advantage with SpeedBonus (Balance)", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);
    const tank = new Tank(player, game);
    game.addObject(tank);

    const originalSpeed = tank.speed;
    const bonus = new SpeedBonus(game);

    // 1. Action: Collect power-up
    bonus.apply(tank);

    // 2. Response: Speed should be increased
    expect(tank.speed).toBeGreaterThan(originalSpeed);

    // 3. Action: Advance time past the 8000ms duration
    // We step multiple times because game.step logic cleans up timeouts
    for (let i = 0; i < 850; i++) {
      game.step(10);
    }

    // 4. Response: Speed should return to baseline
    expect(tank.speed).toBeCloseTo(originalSpeed);
  });

  it("should trigger visual feedback on tank kill (Juiciness)", () => {
    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);
    const tank = new Tank(player, game);
    game.addObject(tank);

    // 1. Action: Kill the player
    player.kill();

    // 2. Response: Must trigger screen shake
    expect(mockCanvas.shake).toHaveBeenCalled();
  });
});
