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
    tank.move(1);
    expect(mockPlayer.stats.miles).toBeGreaterThan(initialMiles);
  });

  it("should handle wall collision when moving", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;

    // First call returns no collision, second call (inside move) returns collision
    mockTile.getWalls.mockReturnValueOnce([false]).mockReturnValueOnce([true]);

    const initialX = tank.x;
    tank.move(1);
    expect(tank.x).toBe(initialX);
  });

  it("should handle wall collision when turning", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;

    const initialAngle = tank.angle;
    mockTile.getWalls.mockReturnValueOnce([true]); // Immediate collision on turn

    tank.turn(1);
    expect(tank.angle).toBe(initialAngle);
  });

  it("should be invincible when spawnshield is active", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.timers.spawnshield = 1000;
    mockPlayer.game.t = 500;

    expect(tank.spawnshield()).toBe(true);
    expect(tank.invincible()).toBe(true);
  });

  it("should not shoot when spawnshield is active", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.timers.spawnshield = 1000;
    mockPlayer.game.t = 500;
    const shootSpy = vi.spyOn(tank.weapon, "shoot");

    tank.shoot();
    expect(shootSpy).not.toHaveBeenCalled();
  });

  it("should shoot and update stats when not invincible", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.timers.spawnshield = 0;
    mockGame.t = 500;
    const shootSpy = vi.spyOn(tank.weapon, "shoot").mockImplementation(() => {
      tank.weapon.isActive = true;
    });
    tank.weapon.isActive = true;

    tank.shoot();
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
    tank.timers.invincible = 1000;
    mockGame.t = 500;

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
    tank.step();
    expect(mockBullet.onDeleted).not.toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(false);

    // Friendly Fire ON
    Settings.FriendlyFire = true;
    tank.step();
    expect(mockBullet.delete).toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(true);
  });

  it("should not be killed by bullet if invincible", () => {
    const tank = new Tank(mockPlayer, mockGame);
    tank.x = 50;
    tank.y = 50;
    tank.timers.invincible = 1000;
    mockGame.t = 500;

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

    tank.step();

    expect(mockBullet.isDeleted).not.toHaveBeenCalled();
    expect(tank.isDeleted()).toBe(false);
  });
});
