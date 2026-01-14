import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Tank from "@/entities/tank";
import { Settings } from "@/stores/settings";
import { TEAMS } from "@/game/team";
import Bullet from "@/entities/bullet";

// Mock dependencies
vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  generateCloud: vi.fn(),
}));

describe("Tank Class", () => {
  let mockPlayer: any;
  let mockGame: any;
  let mockTile: any;

  beforeEach(() => {
    mockTile = {
      x: 0,
      y: 0,
      dx: 100,
      dy: 100,
      walls: [false, false, false, false],
      neighbors: [null, null, null, null],
      getWalls: vi.fn(() => [false, false, false, false]),
      corners: vi.fn(() => [
        { x: 0, y: 0, w: false },
        { x: 0, y: 100, w: false },
        { x: 100, y: 100, w: false },
        { x: 100, y: 0, w: false },
      ]),
      objs: [],
    };

    mockGame = {
      t: 0,
      map: {
        getTileByPos: vi.fn(() => mockTile),
        getTileByIndex: vi.fn(() => mockTile),
      },
      mode: {
        newKill: vi.fn(),
      },
      addObject: vi.fn(),
      timeouts: [],
    };

    mockPlayer = {
      team: TEAMS[1],
      name: "Test Player",
      game: mockGame,
      stats: { miles: 0, shots: 0, kills: 0 },
      step: vi.fn(),
      steer: vi.fn(),
      isBot: () => false,
      kill: vi.fn(),
    };

    Settings.TankSpeed = 200;
    Settings.FriendlyFire = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with correct default properties", () => {
    const tank = new Tank(mockPlayer, mockGame);
    expect(tank instanceof Tank).toBe(true);
    expect(tank.speed).toBe(200);
    expect(tank.player).toBe(mockPlayer);
  });

  it("should update stats when moving", () => {
    const tank = new Tank(mockPlayer, mockGame);
    const initialMiles = mockPlayer.stats.miles;
    tank.move(1, 10);
    expect(mockPlayer.stats.miles).toBeGreaterThan(initialMiles);
  });

  it("should handle wall collision when moving by glancing", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;

    // Sequence of getWalls calls:
    // 1. move() -> checkWallCollision() -> Collision at Corner 0.
    //    Calls getWalls for corner 0 -> Returns true.
    //    Returns index 0.
    // 2. move() -> Resolution Loop -> checkWallCollision() -> No Collision.
    //    Calls getWalls for corners 0..3 -> All false.
    //    Returns -1. Success!

    mockTile.getWalls
      // Collision Check (1 call - Corner 0 Hit)
      .mockReturnValueOnce([true, false, false, false])
      // Resolution Check (4 calls - No Collision)
      .mockReturnValueOnce([false, false, false, false])
      .mockReturnValueOnce([false, false, false, false])
      .mockReturnValueOnce([false, false, false, false])
      .mockReturnValueOnce([false, false, false, false]);

    tank.tile = mockTile;

    const initialX = tank.x;
    const initialY = tank.y;
    const initialAngle = tank.angle;

    // Part 2 check (wall corners) should return empty/false
    mockTile.corners.mockReturnValue([]);

    tank.move(1, 10);

    // Should have moved and turned
    expect(tank.x).not.toBe(initialX);
    expect(tank.y).not.toBe(initialY);
    expect(tank.angle).not.toBe(initialAngle);
  });

  it("should handle wall corner collision when moving", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 90;
    tank.y = 90;
    tank.width = 30;
    tank.height = 30;
    tank.angle = Math.PI / 4; // 45 degrees

    // Part A: No direct wall crossing for all checks
    // checkWallCollision will call getWalls 4 times (for tank corners)
    mockTile.getWalls.mockReturnValue([false, false, false, false]);

    // Setup Part B: Corner (100, 100) is active.
    mockTile.x = 0;
    mockTile.y = 0;
    mockTile.dx = 100;
    mockTile.dy = 100;

    // We mock corners() to return the active corner.
    mockTile.corners.mockReturnValue([
      { x: 0, y: 0, w: false },
      { x: 0, y: 100, w: false },
      { x: 100, y: 100, w: true }, // Bottom-Right corner is active
      { x: 100, y: 0, w: false },
    ]);

    tank.tile = mockTile;
    const initialX = tank.x;

    // Angle PI/2 is facing right.
    tank.angle = Math.PI / 2;

    // Move forward.
    tank.move(1, 100);

    // Expectation: checkWallCollision returns 5. move() reverts position.
    expect(tank.x).toBe(initialX);
  });

  it("should handle wall collision when turning", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;

    const initialAngle = tank.angle;

    // Mock collision to always be true to force revert after failed resolution
    // turn() calls checkWallCollision -> returns index 0 (collision)
    // Then loop calls checkWallCollision -> returns index 0 (collision)
    mockTile.getWalls.mockReturnValue([true, false, false, false]);
    tank.tile = mockTile;

    tank.turn(1, 10);
    expect(tank.angle).toBe(initialAngle);
  });

  it("should be invincible when spawnshield is active", () => {
    const tank = new Tank(mockPlayer, mockGame);
    // age starts at 0, Settings.SpawnShieldTime is usually > 0
    expect(tank.spawnshield()).toBe(true);
    expect(tank.invincible()).toBe(true);
  });

  it("should not shoot when spawnshield is active", () => {
    const tank = new Tank(mockPlayer, mockGame);
    const shootSpy = vi.spyOn(tank.weapon, "shoot");

    tank.shoot(10);
    expect(shootSpy).not.toHaveBeenCalled();
  });

  it("should shoot and update stats when not invincible", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.age = 100000; // Force spawnshield expiration
    const shootSpy = vi.spyOn(tank.weapon, "shoot").mockImplementation(() => {
      tank.weapon.isActive = true;
    });
    tank.weapon.isActive = true;

    tank.shoot(10);
    expect(shootSpy).toHaveBeenCalled();
    expect(mockPlayer.stats.shots).toBe(1);
  });

  it("should drop flag and delete weapon when deleted", () => {
    const tank = new Tank(mockPlayer, mockGame);
    const mockFlag = { drop: vi.fn() };
    const weaponSpy = vi.spyOn(tank.weapon, "delete");
    tank.carriedFlag = mockFlag as any;

    tank.delete();

    expect(mockFlag.drop).toHaveBeenCalled();
    expect(weaponSpy).toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(true);
  });

  it("should draw correctly", () => {
    const tank = new Tank(mockPlayer, mockGame);
    const mockContext = {
      save: vi.fn(),
      beginPath: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
    } as any;

    Settings.ShowTankLabels = true;
    tank.invincibleDuration = 1000;

    tank.draw(mockContext);

    expect(mockContext.fill).toHaveBeenCalled();
    expect(mockContext.fillText).toHaveBeenCalledWith(mockPlayer.name, expect.any(Number), expect.any(Number));
  });

  it("should draw correctly when carrying a flag", () => {
    const tank = new Tank(mockPlayer, mockGame);
    const mockContext = {
      save: vi.fn(),
      beginPath: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
    } as any;

    tank.carriedFlag = { color: "#ff0000", size: 24 } as any;
    tank.draw(mockContext);

    expect(mockContext.fill).toHaveBeenCalled();
  });

  it("should respect friendly fire settings when colliding with bullet", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;
    tank.age = 100000; // Expire spawnshield

    const mockBullet = {
      x: 50,
      y: 50,
      age: 10,
      lethal: true,
      player: { team: TEAMS[1], id: 999, stats: { kills: 0 } }, // Same team, different player
      onDeleted: vi.fn(),
      delete: vi.fn(),
    };
    Object.setPrototypeOf(mockBullet, Bullet.prototype);

    mockTile.objs.push(mockBullet);

    // Friendly Fire OFF
    Settings.FriendlyFire = false;
    tank.step(10);
    expect(mockBullet.delete).not.toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(false);

    // Friendly Fire ON
    Settings.FriendlyFire = true;
    tank.step(10);
    expect(mockBullet.delete).toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(true);
  });

  it("should not be killed by bullet if invincible", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;
    tank.invincibleDuration = 1000;

    const mockBullet = {
      x: 50,
      y: 50,
      age: 10,
      lethal: true,
      player: { team: TEAMS[2], stats: { kills: 0 } }, // Enemy team
      isDeleted: vi.fn(),
      delete: vi.fn(),
    };
    Object.setPrototypeOf(mockBullet, Bullet.prototype);

    mockTile.objs.push(mockBullet);

    tank.step(10);

    expect(mockBullet.delete).not.toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(false);
  });
});
