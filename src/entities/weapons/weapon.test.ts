import { describe, it, expect, vi, beforeEach } from "vitest";
import { Weapon } from "./weapon";
import Tank from "../tank";
import Bullet from "../bullet";

// Mocks
const mockGame = {
  addObject: vi.fn(),
  timeouts: [],
  addTimeout: vi.fn(),
} as any;

const mockPlayer = {
  game: mockGame,
  team: { color: "red" },
} as any;

const mockTank = {
  player: mockPlayer,
  angle: 0,
  corners: () => [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ],
  rapidfire: false,
} as unknown as Tank;

// Concrete implementation for testing abstract class
class TestWeapon extends Weapon {
  name = "TestWeapon";
  constructor(tank: Tank) {
    super(tank);
    this.image.src = "test.png";
  }

  newBullet(): Bullet {
    const bullet = new Bullet(this);
    this.tank.player.game!.addObject(bullet);
    return bullet;
  }
}

describe("Weapon", () => {
  let weapon: TestWeapon;

  beforeEach(() => {
    weapon = new TestWeapon(mockTank);
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    expect(weapon.isActive).toBe(true);
    expect(weapon.isDeleted).toBe(false);
    expect(weapon.bot.shootingRange).toBe(2);
  });

  it("should create a new bullet", () => {
    const bullet = weapon.newBullet();
    expect(bullet).toBeInstanceOf(Bullet);
    expect(bullet.weapon).toBe(weapon);
    expect(mockGame.addObject).toHaveBeenCalledWith(bullet);
  });

  it("should deactivate", () => {
    weapon.deactivate();
    expect(weapon.isActive).toBe(false);
    // Should set a timeout
    expect(mockGame.addTimeout).toHaveBeenCalled();
  });
});
