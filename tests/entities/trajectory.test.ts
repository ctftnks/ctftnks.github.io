import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Trajectory from "@/entities/trajectory";
import { Settings } from "@/stores/settings";
import Tank from "@/entities/tank";

describe("Trajectory Class", () => {
  let mockMap: any;
  let mockGame: any;
  let mockTile: any;
  let traj: Trajectory;

  beforeEach(() => {
    mockTile = {
      getWalls: vi.fn().mockReturnValue([false, false, false, false]),
      objs: [],
    };

    mockMap = {
      getTileByPos: vi.fn().mockReturnValue(mockTile),
    };

    mockGame = {
      map: mockMap,
    };

    traj = new Trajectory(mockGame, 0, 0, 0);

    Settings.DT = 10;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate straight path in empty space", () => {
    // Length 2000, delta 4. Should produce ~500 points
    traj.step(0);

    expect(traj.points.length).toBeGreaterThan(1);
    // Angle 0 -> sin(0)=0, cos(0)=1. y decreases.
    const lastPoint = traj.points[traj.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(0);
    expect(lastPoint.y).toBeLessThan(0);
  });

  it("should stop at max length", () => {
    traj.length = 100;
    traj.step(0);
    // 100 / 4 = 25 steps roughly
    expect(traj.points.length).toBeCloseTo(26, 1);
  });

  it("should detect targets", () => {
    const tankObj = Object.create(Tank.prototype);
    mockTile.objs = [tankObj];
    traj.step(10);
    expect(traj.possibleTargets).toContain(tankObj);
  });

  it("should delete itself after timeout", () => {
    traj.maxAge = 5;
    traj.age = 6;
    traj.step(0);
    expect(traj.isDeleted()).toBe(true);
  });

  it("should bounce off walls", () => {
    // 1. Bounce 180 degrees (corner)
    mockTile.getWalls.mockReturnValueOnce([true, true, false, false]);
    traj.angle = 0;
    traj.step(0);
    // It's a loop, so checking exact points is tricky, but we can check if angle changed in the points
    const points = traj.points;
    const bounced = points.some((p) => Math.abs(p.angle - Math.PI) < 0.1);
    expect(bounced).toBe(true);
  });

  it("should bounce off side walls", () => {
    mockTile.getWalls.mockReturnValue([false, true, false, false]); // Right wall
    traj.angle = Math.PI / 4;
    traj.step(0);
    // Angle should flip sign: PI/4 -> -PI/4
    const points = traj.points;
    const bounced = points.some((p) => Math.abs(p.angle + Math.PI / 4) < 0.1);
    expect(bounced).toBe(true);
  });

  it("should bounce off top/bottom walls", () => {
    mockTile.getWalls.mockReturnValue([true, false, false, false]); // Top wall
    traj.angle = Math.PI / 4;
    traj.step(0);
    // Angle should flip around X axis: PI/4 -> 3PI/4 (PI - angle)
    const points = traj.points;
    const bounced = points.some((p) => Math.abs(p.angle - (Math.PI - Math.PI / 4)) < 0.1);
    expect(bounced).toBe(true);
  });

  it("should stop if tile is missing", () => {
    mockMap.getTileByPos.mockReturnValue(null);
    traj.step(0);
    // Only start point
    expect(traj.points.length).toBe(1);
  });

  it("should not draw if hidden", () => {
    const mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
    } as any;
    traj.hidden = true;
    traj.draw(mockContext);
    expect(mockContext.save).not.toHaveBeenCalled();
  });

  it("should draw correctly", () => {
    const mockContext = {
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
    } as any;

    traj.points = [
      { x: 0, y: 0, angle: 0 },
      { x: 10, y: 10, angle: 0 },
    ];
    traj.draw(mockContext);

    expect(mockContext.fillRect).toHaveBeenCalled();
  });
});
