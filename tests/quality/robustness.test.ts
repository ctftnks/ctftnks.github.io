import { describe, it, expect, beforeEach, vi } from "vitest";
import Game from "@/game/game";
import { Settings } from "@/stores/settings";
import Canvas from "@/game/canvas";
import Bullet from "@/entities/bullet";
import Weapon from "@/entities/weapons/weapon";
import Player from "@/game/player";
import { TEAMS } from "@/game/team";
import Tank from "@/entities/tank";

vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
}));

vi.mock("@/game/assets", () => ({
  SOUNDS: { bounce: "bounce.wav", origGun: "gun.mp3", gamestart: "start.wav" },
  IMAGES: { gun: "gun.png" },
}));

describe("Collision Robustness (Scenario 4)", () => {
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

    Settings.MapNxMin = 5;
    Settings.MapNxMax = 5;
    Settings.DT = 10; // 10ms steps
    game = new Game(mockCanvas);
  });

  it("should not tunnel through walls at high speed", () => {
    // 1. Setup Stimulus: High speed bullet
    const bulletSpeed = 2000; // Very fast
    Settings.BulletSpeed = bulletSpeed;

    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);
    const tank = new Tank(player, game);
    const weapon = new Weapon(tank);
    const bullet = new Bullet(weapon);

    // Position bullet near a wall (tile 0,0 has border walls)
    // Tile size is dx=130. Wall 3 is right wall of tile (0,0)
    game.map.tiles[0].walls = [true, true, false, true]; // top, left, bottom, right

    bullet.x = 120; // Near right wall (x=130)
    bullet.y = 65; // Middle of tile
    bullet.angle = -Math.PI / 2; // Moving right
    bullet.speed = bulletSpeed;
    game.addObject(bullet);

    // 2. Action: Step forward. In 10ms at 2000px/s, it moves 20px.
    // It should hit the wall at x=130 and reflect.
    game.step(10);

    // 3. Response: Should still be in or near the tile, not past x=130
    expect(bullet.x).toBeLessThanOrEqual(130);
    // Angle should be reflected (PI/2 or similar depending on implementation)
    expect(Math.abs(bullet.angle)).toBeCloseTo(Math.PI / 2);
  });

  it("should correctly reflect at wall T-junctions (corner case)", () => {
    // Set up two adjacent tiles with a shared corner
    const tileA = game.map.getTileByIndex(0, 0)!;
    const tileB = game.map.getTileByIndex(1, 0)!;

    // Create a T-junction or corner
    tileA.walls = [true, true, false, true]; // Wall at right
    tileB.walls = [true, false, false, false]; // Wall at top

    const player = new Player(0, "P1", TEAMS[0], []);
    const tank = new Tank(player, game);
    const weapon = new Weapon(tank);
    const bullet = new Bullet(weapon);

    bullet.x = 125;
    bullet.y = 5; // Near top corner
    bullet.angle = -Math.PI / 4; // Moving up-right towards corner
    game.addObject(bullet);

    // Step multiple times
    for (let i = 0; i < 5; i++) game.step(10);

    // Bullet should still be active and within map bounds
    expect(bullet.isDeleted()).toBe(false);
    expect(bullet.x).toBeGreaterThan(0);
    expect(bullet.y).toBeGreaterThan(0);
  });
});
