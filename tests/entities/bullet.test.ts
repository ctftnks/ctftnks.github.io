import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Bullet from "@/entities/bullet";
import { Settings } from "@/game/settings";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
}));

vi.mock("@/entities/smoke", () => ({
  Smoke: vi.fn(),
  generateCloud: vi.fn(),
}));

describe("Bullet Class", () => {
  let mockGame: any;
  let mockMap: any;
  let mockPlayer: any;
  let mockTank: any;
  let mockWeapon: any;
  let bullet: Bullet;

  beforeEach(() => {
    // Mock Map
    mockMap = {
      getTileByPos: vi.fn().mockReturnValue(null),
    };

    // Mock Game
    mockGame = {
      map: mockMap,
      t: 0,
      addObject: vi.fn(),
      timeouts: [],
    };

    // Mock Player
    mockPlayer = {
      game: mockGame,
      team: 1,
      stats: { kills: 0 },
    };

    // Mock Tank
    mockTank = {
      player: mockPlayer,
    };

    // Mock Weapon
    mockWeapon = {
      tank: mockTank,
    };

    // Reset settings
    Settings.BulletSpeed = 100;
    Settings.BulletTimeout = 1;
    Settings.GameFrequency = 10;

    bullet = new Bullet(mockWeapon);
    bullet.x = 100;
    bullet.y = 100;
    bullet.angle = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize correctly", () => {
    expect(bullet.player).toBe(mockPlayer);
    expect(bullet.speed).toBe(Settings.BulletSpeed);
    expect(bullet.timeout).toBe(1000); // 1 * 1000
    expect(bullet.age).toBe(0);
  });

  it("should move correctly in step", () => {
    const startY = bullet.y;
    // Angle 0 -> cos(0) = 1 -> moves up (y decreases)
    // dy = speed * cos(angle) * dt / 1000 = 100 * 1 * 10 / 1000 = 1

    bullet.step();

    expect(bullet.y).toBeCloseTo(startY - 1);
    expect(bullet.age).toBe(10);
  });

  it("should delete itself after timeout", () => {
    bullet.age = 1001;
    bullet.step();
    expect(bullet.deleted).toBe(true);
  });

  it("should bounce off walls", () => {
    // Mock collision with wall
    mockMap.getTileByPos.mockReturnValue({
      getWalls: vi.fn().mockReturnValue([true, false, false, false]), // Top wall
    });

    bullet.angle = 0; // Moving up
    const oldY = 100;
    bullet.y = 90; // Moved past wall?

    // checkCollision is called inside step with old coordinates.
    // checking logic directly via public method for precision
    bullet.checkCollision(100, oldY);

    // Should bounce off top wall: angle = PI - angle = PI - 0 = PI
    expect(bullet.angle).toBeCloseTo(Math.PI);
  });
});
