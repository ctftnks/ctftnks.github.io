import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Autopilot from "@/game/autopilot";
import { Laser, Guided, Slingshot, WreckingBall } from "@/entities/weapons";
import Tank from "@/entities/tank";
import { TEAMS } from "@/game/team";
import { Settings } from "@/stores/settings";
import { CaptureTheFlag, KingOfTheHill } from "@/game/gamemode";

vi.mock("@/game/assets", () => ({
  IMAGES: { laser: "", guided: "", slingshot: "", wreckingBall: "" },
  SOUNDS: {},
}));

vi.mock("@/entities/trajectory", () => ({
  default: class {
    length = 0;
    drawevery = 0;
    targets = [];
  },
}));

describe("Autopilot Class", () => {
  let autopilot: Autopilot;
  let mockGame: any;
  let mockMap: any;
  let mockTank: any;
  let mockPlayer: any;
  let mockTile: any;

  beforeEach(() => {
    // Mock Tile
    mockTile = {
      x: 0,
      y: 0,
      dx: 100,
      dy: 100,
      xypathToObj: vi.fn(),
      neighbors: [null, null, null, null],
      walls: [false, false, false, false],
    };

    // Mock Map
    mockMap = {
      getTileByPos: vi.fn(() => mockTile),
    };

    // Mock Game
    mockGame = {
      map: mockMap,
      t: 0,
      mode: {},
      players: [],
      addObject: vi.fn(),
      addTimeout: vi.fn((cb, time) => {
        setTimeout(cb, time); // Simulate for test
      }),
      timeouts: [],
    };

    // Mock Player
    mockPlayer = {
      team: TEAMS[0],
      isBot: () => true,
      base: undefined,
      game: mockGame,
    };

    // Mock Tank
    mockTank = {
      x: 100,
      y: 100,
      width: 40,
      angle: 0,
      speed: 10,
      player: mockPlayer,
      weapon: {
        isActive: true,
        name: "Gun",
        bot: {
          shootingRange: 5,
          fleeIfActive: false,
          fleeingDuration: 0,
        },
        shoot: vi.fn(),
      },
      map: mockMap,
      invincible: vi.fn().mockReturnValue(false),
      move: vi.fn(),
      turn: vi.fn(),
      shoot: vi.fn(),
      carriedFlag: null,
      timers: { spawnshield: 0, invincible: 0 },
      spawnshield: vi.fn().mockReturnValue(false),
    };

    autopilot = new Autopilot();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should perform movements towards target", () => {
    autopilot.goto = { x: 200, y: 100 }; // To the right

    (autopilot as any).performMovements(mockTank);
    expect(mockTank.turn).toHaveBeenCalled();
  });

  it("should set path correctly", () => {
    const path = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
    ];
    (autopilot as any).setPath(path);
    expect(autopilot.goto).toBe(path[1]);

    const shortPath = [{ x: 100, y: 100 }];
    (autopilot as any).setPath(shortPath);
    expect(autopilot.goto).toBe(shortPath[0]);
  });

  it("should not autopilot too frequently", () => {
    (autopilot as any).timeSinceLastUpdate = 0;
    Settings.GameFrequency = 10;
    mockTank.speed = 200;

    (autopilot as any).updateDecision(mockTank, mockGame);
    expect(mockMap.getTileByPos).not.toHaveBeenCalled();

    (autopilot as any).timeSinceLastUpdate = 1000;
    mockMap.getTileByPos.mockReturnValue(null);
    (autopilot as any).updateDecision(mockTank, mockGame);
    expect(mockMap.getTileByPos).toHaveBeenCalled();
  });

  describe("Decision Logic", () => {
    it("should attract to powerups", () => {
      const path = [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
      ];
      mockTile.xypathToObj.mockReturnValueOnce(path); // PowerUp path

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });

    it("should attract to enemies and follow them", () => {
      const enemyTank = {
        x: 300,
        y: 300,
        width: 40,
        player: { team: TEAMS[1], isBot: vi.fn().mockReturnValue(false) },
        invincible: () => false,
        carriedFlag: null,
      } as any;
      const path = [{ x: 100, y: 100 }, enemyTank];

      mockTile.xypathToObj.mockReturnValueOnce(null); // No powerup
      mockTile.xypathToObj.mockReturnValueOnce(path); // Enemy path

      // Mock calculateAim to return shouldShoot false so we just follow
      vi.spyOn(autopilot as any, "calculateAim").mockReturnValue({ shouldShoot: false, target: enemyTank, weight: 100 });

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      // Should follow
      expect(autopilot.goto).toEqual(enemyTank);
    });

    it("should back off if too close to enemy (Personal Space)", () => {
      const enemyTank = {
        x: 105, // Very close to 100
        y: 100,
        width: 40,
        player: { team: TEAMS[1], isBot: vi.fn().mockReturnValue(false) },
        invincible: () => false,
        carriedFlag: null,
      } as any;
      const path = [{ x: 100, y: 100 }, enemyTank];

      mockTile.xypathToObj.mockReturnValueOnce(null);
      mockTile.xypathToObj.mockReturnValueOnce(path);

      vi.spyOn(autopilot as any, "calculateAim").mockReturnValue({ shouldShoot: false, target: enemyTank, weight: 100 });

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      // Should NOT go to enemy, but retreat
      expect(autopilot.goto).not.toEqual(enemyTank);
      expect(autopilot.goto).not.toBeNull();
    });

    it("should handle random angle when perfectly overlapping", () => {
      const enemyTank = {
        x: 100,
        y: 100,
        width: 40,
        player: { team: TEAMS[1], isBot: vi.fn().mockReturnValue(false) },
        invincible: () => false,
        carriedFlag: null,
      } as any;
      const path = [{ x: 100, y: 100 }, enemyTank];

      mockTile.xypathToObj.mockReturnValueOnce(null);
      mockTile.xypathToObj.mockReturnValueOnce(path);
      vi.spyOn(autopilot as any, "calculateAim").mockReturnValue({ shouldShoot: false, target: enemyTank, weight: 100 });

      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5); // Fixed random

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      expect(autopilot.goto).not.toBeNull();
      expect(randomSpy).toHaveBeenCalled();
    });

    it("should shoot at enemy if aim is good", () => {
      const enemyTank = {
        x: 300,
        y: 300,
        player: { team: TEAMS[1], isBot: vi.fn().mockReturnValue(false) },
        invincible: () => false,
        carriedFlag: null,
      } as any;
      const path = [{ x: 100, y: 100 }, enemyTank];

      mockTile.xypathToObj.mockReturnValueOnce(null);
      mockTile.xypathToObj.mockReturnValueOnce(path);

      vi.spyOn(autopilot as any, "calculateAim").mockReturnValue({ shouldShoot: true, target: enemyTank, weight: 200 });
      const shootSpy = vi.spyOn(autopilot as any, "shootAt");

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      expect(shootSpy).toHaveBeenCalledWith(mockTank, enemyTank, mockGame);
    });

    it("should handle Capture The Flag logic", () => {
      mockGame.mode = { __proto__: CaptureTheFlag.prototype };
      const flag = { team: TEAMS[1] };
      const path = [{ x: 100, y: 100 }, flag];

      mockTile.xypathToObj.mockReturnValueOnce(null); // No powerup
      mockTile.xypathToObj.mockReturnValueOnce(null); // No enemy
      mockTile.xypathToObj.mockReturnValueOnce(path); // Flag path

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });

    it("should handle King Of The Hill logic", () => {
      mockGame.mode = { __proto__: KingOfTheHill.prototype };
      const hill = { team: TEAMS[1] };
      const path = [{ x: 100, y: 100 }, hill];

      mockTile.xypathToObj.mockReturnValueOnce(null);
      mockTile.xypathToObj.mockReturnValueOnce(null);
      mockTile.xypathToObj.mockReturnValueOnce(path);

      (autopilot as any).timeSinceLastUpdate = 100000;
      (autopilot as any).updateDecision(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });
  });

  describe("Aiming & Shooting Logic", () => {
    it("should handle Laser shooting", () => {
      const laser = new Laser(mockTank);
      mockTank.weapon = laser;
      const enemy = { player: { team: TEAMS[1] }, invincible: () => false };
      laser.trajectory.targets = [enemy as any];

      const result = (autopilot as any).calculateAim(mockTank, enemy as any, [{ x: 0, y: 0 }] as any, mockGame);
      expect(result.shouldShoot).toBe(true);
    });

    it("should handle Laser shooting (no hit)", () => {
      const laser = new Laser(mockTank);
      mockTank.weapon = laser;
      const enemy = { player: { team: TEAMS[1] }, invincible: () => false };
      laser.trajectory.targets = []; // No targets

      const result = (autopilot as any).calculateAim(mockTank, enemy as any, [{ x: 0, y: 0 }] as any, mockGame);
      expect(result.shouldShoot).toBe(false);
    });

    it("should handle Slingshot shooting", () => {
      const slingshot = new Slingshot(mockTank);
      mockTank.weapon = slingshot;
      const enemy = { x: 200, y: 200, invincible: () => false } as any;

      const result = (autopilot as any).calculateAim(mockTank, enemy, [{ x: 0, y: 0 }] as any, mockGame);
      expect(result.shouldShoot).toBe(true);
    });

    it("should handle Guided weapon shooting", () => {
      const guided = new Guided(mockTank);
      mockTank.weapon = guided;
      const enemy = { x: 200, y: 200, invincible: () => false } as any;

      mockTile.walls = [false, true, true, true]; // Open top (index 0)

      // Guided wants Open Space (walls[i] === false).
      // i=0 is false (open). Match!
      const result = (autopilot as any).calculateAim(mockTank, enemy, null, mockGame);

      expect(result.shouldShoot).toBe(true);
      expect(result.target).toBeDefined();
    });

    it("should handle WreckingBall shooting", () => {
      const wb = new WreckingBall(mockTank);
      mockTank.weapon = wb;
      const enemy = { x: 200, y: 200, invincible: () => false } as any;

      mockTile.walls = [true, false, false, false]; // Wall top (index 0)

      // WreckingBall wants Walls (walls[i] === true).
      // i=0 is true. Match!
      const result = (autopilot as any).calculateAim(mockTank, enemy, null, mockGame);

      expect(result.shouldShoot).toBe(true);
    });

    it("should execute shootAt with jitter and micro-movements", () => {
      const target = { x: 200, y: 200, width: 40 };
      vi.useFakeTimers();

      const moveSpy = mockTank.move;
      const shootSpy = mockTank.shoot;

      // Force micro-movement (random < 0.05)
      vi.spyOn(Math, "random").mockReturnValue(0.01);

      (autopilot as any).shootAt(mockTank, target, mockGame);

      expect(moveSpy).toHaveBeenCalled();
      expect(shootSpy).toHaveBeenCalled();
      expect(autopilot.goto).toBeNull();

      vi.useRealTimers();
    });

    it("should execute shootAt with delay for bot targets", () => {
      const botTarget = Object.create(Tank.prototype);
      Object.assign(botTarget, {
        x: 200,
        y: 200,
        width: 40,
        player: { isBot: () => true },
      });

      vi.useFakeTimers();

      (autopilot as any).shootAt(mockTank, botTarget, mockGame);

      expect(mockTank.shoot).not.toHaveBeenCalled(); // Delayed
      vi.advanceTimersByTime(200);
      expect(mockTank.shoot).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("Fleeing Logic", () => {
    it("should initiate fleeing", () => {
      mockTank.weapon.bot.fleeingDuration = 1000;
      mockTank.angle = 0;

      (autopilot as any).initiateFlee(mockTank, mockGame);
      expect((autopilot as any).fleeingState.from).toBeDefined();
    });

    it("should get flee path", () => {
      const tile1 = { ...mockTile, neighbors: [null, null, null, null], walls: [false, false, false, false] };
      const tile2 = { x: 100, y: 0, dx: 100, dy: 100 };
      tile1.neighbors[0] = tile2;

      (autopilot as any).fleeingState = {
        from: [],
        condition: () => true,
      };

      mockTank.weapon.bot.fleeIfActive = true;
      mockTank.weapon.isActive = true;
      mockMap.getTileByPos.mockReturnValue(tile1);

      const path = (autopilot as any).findFleePath(mockTank, mockGame);
      expect(path).toBeDefined();
      expect(path.length).toBe(2);
    });

    it("should stop fleeing when condition met (time)", () => {
      mockTank.weapon.bot.fleeingDuration = 1000;
      mockTank.weapon.isActive = false; // ensure we don't return false due to active weapon
      mockGame.t = 0;
      (autopilot as any).initiateFlee(mockTank, mockGame);

      const condition = (autopilot as any).fleeingState.condition;
      expect(condition()).toBe(true);

      mockGame.t = 1500;
      expect(condition()).toBe(false);
    });

    it("should not flee if weapon is active and fleeIfActive is false", () => {
      (autopilot as any).fleeingState = {
        from: [],
        condition: () => true,
      };
      mockTank.weapon.bot.fleeIfActive = false;
      mockTank.weapon.isActive = true;

      const path = (autopilot as any).findFleePath(mockTank, mockGame);
      expect(path).toBeNull();
    });
  });
});
