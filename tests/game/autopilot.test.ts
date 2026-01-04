import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Autopilot from "@/game/autopilot";
import { Settings } from "@/game/settings";
import { TEAMS } from "@/game/team";
import { CaptureTheFlag, KingOfTheHill } from "@/game/gamemode";
import { Laser, Guided, Slingshot } from "@/entities/weapons/weapons";
import Tank from "@/entities/tank";
import Player from "@/game/player";

vi.mock("@/game/assets", () => ({
  IMAGES: { laser: "", guided: "", slingshot: "" },
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
    };

    // Mock Player
    mockPlayer = {
      team: TEAMS[0],
      isBot: () => true,
      base: undefined,
    };

    // Mock Tank
    mockTank = {
      x: 100,
      y: 100,
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

  it("should follow a path", () => {
    const path = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
    ];
    (autopilot as any).follow(path);
    expect(autopilot.goto).toBe(path[1]);
  });

  it("should perform movements towards target", () => {
    autopilot.goto = { x: 200, y: 100 }; // To the right

    (autopilot as any).performMovements(mockTank);
    expect(mockTank.turn).toHaveBeenCalled();
  });

  it("should shoot at target", () => {
    const targetTank = { x: 150, y: 100, player: { isBot: () => false } } as any;
    vi.useFakeTimers();

    (autopilot as any).shoot(mockTank, targetTank, mockGame);

    expect(mockTank.shoot).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should not autopilot too frequently", () => {
    (autopilot as any).lastChecked = 0;
    Settings.GameFrequency = 10;
    mockTank.speed = 200;

    (autopilot as any).autopilot(mockTank, mockGame);
    expect(mockMap.getTileByPos).not.toHaveBeenCalled();

    (autopilot as any).lastChecked = 1000;
    mockMap.getTileByPos.mockReturnValue(null);

    (autopilot as any).autopilot(mockTank, mockGame);
    expect(mockMap.getTileByPos).toHaveBeenCalled();
  });

  describe("Decision Logic", () => {
    it("should attract to powerups", () => {
      const path = [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
      ];
      mockTile.xypathToObj.mockReturnValueOnce(path); // PowerUp path

      (autopilot as any).lastChecked = 100000;
      (autopilot as any).autopilot(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });

    it("should attract to enemies and shoot", () => {
      const enemyTank = {
        x: 300,
        y: 300,
        player: { team: TEAMS[1], isBot: vi.fn().mockReturnValue(false) },
        invincible: () => false,
        carriedFlag: null,
      } as any;
      const path = [{ x: 100, y: 100 }, enemyTank];

      mockTile.xypathToObj.mockReturnValueOnce(null); // No powerup
      mockTile.xypathToObj.mockReturnValueOnce(path); // Enemy path

      // Mock aimbot to return shouldShoot true
      vi.spyOn(autopilot as any, "aimbot").mockReturnValue({ shouldShoot: true, target: enemyTank, weight: 100 });

      (autopilot as any).lastChecked = 100000;
      (autopilot as any).autopilot(mockTank, mockGame);

      expect(mockTank.shoot).toHaveBeenCalled();
    });

    it("should handle Capture The Flag logic", () => {
      mockGame.mode = { __proto__: CaptureTheFlag.prototype }; // Mock instance check
      const flag = { team: TEAMS[1] };
      const path = [{ x: 100, y: 100 }, flag];

      mockTile.xypathToObj.mockReturnValueOnce(null); // No powerup
      mockTile.xypathToObj.mockReturnValueOnce(null); // No enemy
      mockTile.xypathToObj.mockReturnValueOnce(path); // Flag path

      (autopilot as any).lastChecked = 100000;
      (autopilot as any).autopilot(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });

    it("should handle King Of The Hill logic", () => {
      mockGame.mode = { __proto__: KingOfTheHill.prototype };
      const hill = { team: TEAMS[1] };
      const path = [{ x: 100, y: 100 }, hill];

      mockTile.xypathToObj.mockReturnValueOnce(null); // No powerup
      mockTile.xypathToObj.mockReturnValueOnce(null); // No enemy
      mockTile.xypathToObj.mockReturnValueOnce(path); // Hill path

      (autopilot as any).lastChecked = 100000;
      (autopilot as any).autopilot(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });

    it("should prioritize carried flag returning to base in CTF", () => {
      mockGame.mode = { __proto__: CaptureTheFlag.prototype };
      mockTank.carriedFlag = { team: TEAMS[1] };
      mockPlayer.base = { hasFlag: () => true }; // Flag is in base
      mockTank.invincible.mockReturnValue(true);

      const path = [
        { x: 100, y: 100 },
        { x: 50, y: 50 },
      ]; // Path to base
      mockTile.xypathToObj.mockReturnValueOnce(null); // Powerup
      mockTile.xypathToObj.mockReturnValueOnce(null); // Enemy
      mockTile.xypathToObj.mockReturnValueOnce(path); // CTF path

      (autopilot as any).lastChecked = 100000;
      (autopilot as any).autopilot(mockTank, mockGame);

      expect(autopilot.goto).toEqual(path[1]);
    });
  });

  describe("Special Weapons Aimbot", () => {
    it("should handle Laser shooting", () => {
      mockPlayer.game = mockGame;
      const laser = new Laser(mockTank);
      mockTank.weapon = laser;
      const enemy = { player: { team: TEAMS[1] }, invincible: () => false };
      laser.trajectory.targets = [enemy as any];

      const result = (autopilot as any).aimbot(mockTank, enemy as any, [{ x: 0, y: 0 }] as any, mockGame);
      expect(result.shouldShoot).toBe(true);
    });

    it("should handle Slingshot shooting", () => {
      const slingshot = new Slingshot(mockTank);
      mockTank.weapon = slingshot;
      const enemy = { x: 200, y: 200, invincible: () => false } as any;

      const result = (autopilot as any).aimbot(mockTank, enemy, [{ x: 0, y: 0 }] as any, mockGame);
      expect(result.shouldShoot).toBe(true);
    });

    it("should handle Guided weapon shooting", () => {
      const player = new Player(0, "P1", TEAMS[0], []);
      player.game = mockGame;
      const realTank = new Tank(player, mockGame);
      const guided = new Guided(realTank);
      realTank.weapon = guided;
      const enemy = { x: 200, y: 200, invincible: () => false } as any;

      mockTile.walls = [false, true, true, true];

      const aimbotSpy = vi.spyOn(autopilot as any, "aimbot");
      (autopilot as any).aimbot(realTank, enemy, null, mockGame);

      expect(aimbotSpy).toHaveBeenCalled();
    });
  });

  describe("Fleeing Logic", () => {
    it("should initiate fleeing", () => {
      mockTank.weapon.bot.fleeingDuration = 1000;
      mockTank.angle = 0;

      (autopilot as any).flee(mockTank, mockGame);
      expect((autopilot as any).fleeing.from).toBeDefined();
    });

    it("should get flee path", () => {
      const tile1 = { ...mockTile, neighbors: [null, null, null, null], walls: [false, false, false, false] };
      const tile2 = { x: 100, y: 0, dx: 100, dy: 100 };
      tile1.neighbors[0] = tile2;

      (autopilot as any).fleeing = {
        from: [],
        condition: () => true,
      };

      mockTank.weapon.bot.fleeIfActive = true;
      mockTank.weapon.isActive = true;
      mockMap.getTileByPos.mockReturnValue(tile1);

      const path = (autopilot as any).getFleePath(mockTank, mockGame);
      expect(path).toBeDefined();
      expect(path.length).toBe(2);
    });

    it("should not flee if weapon is active and fleeIfActive is false", () => {
      (autopilot as any).fleeing = {
        from: [],
        condition: () => true,
      };
      mockTank.weapon.bot.fleeIfActive = false;
      mockTank.weapon.isActive = true;

      const path = (autopilot as any).getFleePath(mockTank, mockGame);
      expect(path).toBeNull();
    });
  });
});
