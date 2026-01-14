import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Bullet from "@/entities/bullet";
import { Settings } from "@/stores/settings";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  generateCloud: vi.fn(),
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
      game: mockGame,
    };

    // Mock Weapon
    mockWeapon = {
      tank: mockTank,
    };

    // Reset settings
    Settings.BulletSpeed = 100;
    Settings.BulletTimeout = 1;
    Settings.DT = 10;
    Settings.BulletsCanCollide = false;

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
    expect(bullet.maxAge).toBe(1000); // 1 * 1000
    expect(bullet.age).toBe(0);
  });

  it("should move correctly in step", () => {
    const startY = bullet.y;
    // Angle 0 -> cos(0) = 1 -> moves up (y decreases)
    // dy = speed * cos(angle) * dt / 1000 = 100 * 1 * 10 / 1000 = 1

    bullet.step(10);

    expect(bullet.y).toBeCloseTo(startY - 1);
  });

  it("should delete itself after timeout", () => {
    bullet.age = 1001;
    bullet.step(0);
    expect(bullet.isDeleted()).toBe(true);
  });

  it("should bounce off walls", () => {
    // Setup tile at 100, 100
    const tile = {
      x: 100, y: 100, dx: 100, dy: 100,
      walls: [true, false, false, false], // Top wall
      neighbors: [null, null, null, null],
      getWalls: vi.fn(), 
    };
    mockMap.getTileByPos.mockReturnValue(tile);
    bullet.tile = tile as any;

    bullet.angle = 0; // Moving up
    bullet.x = 150; // Center X
    bullet.y = 100; // Top edge

    // Call step to trigger movement and collision check
    // Moves to y = 99 (approx), crossing top wall
    bullet.step(10);

    // Should bounce off top wall: angle = PI - angle = PI - 0 = PI
    expect(bullet.angle).toBeCloseTo(Math.PI);
  });

  it("should bounce off side walls", () => {
    const tile = {
      x: 100, y: 100, dx: 100, dy: 100,
      walls: [false, false, false, true], // Right wall
      neighbors: [null, null, null, null],
      getWalls: vi.fn(),
    };
    mockMap.getTileByPos.mockReturnValue(tile);
    bullet.tile = tile as any;

    bullet.angle = Math.PI / 4; // Moving up-right
    bullet.x = 200; // Right edge
    bullet.y = 150; // Center Y

    bullet.step(10);

    // Should bounce off side wall: angle = -angle = -PI/4
    expect(bullet.angle).toBeCloseTo(-Math.PI / 4);
  });

  it("should bounce 180 degrees when hitting a corner (2 walls)", () => {
    const tile = {
      x: 100, y: 100, dx: 100, dy: 100,
      walls: [true, false, false, true], // Top and Right (Top-Right corner)
      neighbors: [null, null, null, null],
      getWalls: vi.fn(),
    };
    mockMap.getTileByPos.mockReturnValue(tile);
    bullet.tile = tile as any;

    bullet.angle = Math.PI / 4; // Moving NE
    bullet.x = 200; // Right edge
    bullet.y = 100; // Top edge

    bullet.step(10);

    // Bounce 180: PI/4 + PI = 5PI/4 = -3PI/4
    const expected = Math.PI / 4 + Math.PI;
    expect(bullet.angle).toBeCloseTo(expected);
  });

  it("should draw correctly without image", () => {
    const mockContext = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    } as any;

    // Force src to be empty string
    bullet.image = undefined;
    bullet.draw(mockContext);

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it("should draw correctly with image", () => {
    const mockContext = {
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
    } as any;

    bullet.image = new Image();
    bullet.image.src = "test.png";
    bullet.draw(mockContext);

    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.drawImage).toHaveBeenCalled();
  });

  it("should leave trace when enabled", () => {
    bullet.trace = true;
    bullet.step(0);
    expect(mockGame.addObject).toHaveBeenCalled();
  });

  it("should handle bullet-bullet collisions", () => {
    const otherBullet = new Bullet(mockWeapon);
    otherBullet.x = 100; // Same pos
    otherBullet.y = 100;
    otherBullet.radius = 4;
    otherBullet.age = 10;
    otherBullet.lethal = true;

    // Need to setup mockTile so getWallsForTile doesn't crash if called
    const tile = {
      x: 100, y: 100, dx: 100, dy: 100,
      walls: [false, false, false, false],
      neighbors: [null, null, null, null],
      objs: [bullet, otherBullet],
      getWalls: vi.fn(),
    };
    mockMap.getTileByPos.mockReturnValue(tile);
    bullet.tile = tile as any;

    Settings.BulletsCanCollide = true;
    bullet.age = 10;

    bullet.step(0);

    expect(bullet.isDeleted()).toBe(true);
    expect(otherBullet.isDeleted()).toBe(true);
  });

  it("should not collide with itself", () => {
    const tile = {
      x: 100, y: 100, dx: 100, dy: 100,
      walls: [false, false, false, false],
      neighbors: [null, null, null, null],
      objs: [bullet],
      getWalls: vi.fn(),
    };
    mockMap.getTileByPos.mockReturnValue(tile);
    bullet.tile = tile as any;

    Settings.BulletsCanCollide = true;
    bullet.age = 10;

    bullet.step(0);

    expect(bullet.isDeleted()).toBe(false);
  });

  it("should have a default explode method that does nothing", () => {
    expect(() => bullet.explode()).not.toThrow();
  });
});
