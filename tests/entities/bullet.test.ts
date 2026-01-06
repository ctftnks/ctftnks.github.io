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
    };

    // Mock Weapon
    mockWeapon = {
      tank: mockTank,
    };

    // Reset settings
    Settings.BulletSpeed = 100;
    Settings.BulletTimeout = 1;
    Settings.GameFrequency = 10;
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

    bullet.step();

    expect(bullet.y).toBeCloseTo(startY - 1);
    expect(bullet.age).toBe(10);
  });

  it("should delete itself after timeout", () => {
    bullet.age = 1001;
    bullet.step();
    expect(bullet.isDeleted()).toBe(true);
  });

  it("should bounce off walls", () => {
    // Mock collision with wall
    mockMap.getTileByPos.mockReturnValue({
      getWalls: vi.fn().mockReturnValue([true, false, false, false]), // Top wall
    });

    bullet.angle = 0; // Moving up

    // Call step to trigger movement and collision check
    bullet.step();

    // Should bounce off top wall: angle = PI - angle = PI - 0 = PI
    expect(bullet.angle).toBeCloseTo(Math.PI);
  });

  it("should bounce off side walls", () => {
    mockMap.getTileByPos.mockReturnValue({
      getWalls: vi.fn().mockReturnValue([false, true, false, false]), // Left wall
    });

    bullet.angle = Math.PI / 4; // Moving up-left
    // Reset position to center for clean calculation, though step moves it slightly
    bullet.x = 100;
    bullet.y = 100;

    bullet.step();

    // Should bounce off side wall: angle = -angle = -PI/4
    expect(bullet.angle).toBeCloseTo(-Math.PI / 4);
  });

  it("should bounce 180 degrees when hitting a corner (2 walls)", () => {
    mockMap.getTileByPos.mockReturnValue({
      getWalls: vi.fn().mockReturnValue([true, true, false, false]), // Top-left corner
    });

    bullet.angle = 0;
    bullet.x = 100;
    bullet.y = 100;

    bullet.step();

    expect(bullet.angle).toBeCloseTo(Math.PI);
    // x/y are harder to predict exactly because step moves them before collision reset,
    // but they should be reset close to original by the bounce logic
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
    bullet.image = { src: "" } as any;
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
    bullet.step();
    expect(mockGame.addObject).toHaveBeenCalled();
  });

  it("should handle bullet-bullet collisions", () => {
    const otherBullet = new Bullet(mockWeapon);
    otherBullet.x = 100; // Same pos
    otherBullet.y = 100;
    otherBullet.age = 10;
    otherBullet.lethal = true;

    mockMap.getTileByPos.mockReturnValue({
      objs: [bullet, otherBullet],
      getWalls: vi.fn().mockReturnValue([false, false, false, false]),
    });

    Settings.BulletsCanCollide = true;
    bullet.age = 10;

    bullet.step();

    expect(bullet.isDeleted()).toBe(true);
    expect(otherBullet.isDeleted()).toBe(true);
  });

  it("should not collide with itself", () => {
    mockMap.getTileByPos.mockReturnValue({
      objs: [bullet],
      getWalls: vi.fn().mockReturnValue([false, false, false, false]),
    });

    Settings.BulletsCanCollide = true;
    bullet.age = 10;

    bullet.step();

    expect(bullet.isDeleted()).toBe(false);
  });

  it("should have a default explode method that does nothing", () => {
    expect(() => bullet.onDeleted()).not.toThrow();
  });
});
