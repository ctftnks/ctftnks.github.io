import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Trajectory from "@/entities/trajectory";
import { Settings } from "@/stores/settings";
import Tank from "@/entities/tank";

describe("Trajectory Class", () => {
  let mockMap: any;
  let mockTile: any;
  let traj: Trajectory;

  beforeEach(() => {
    mockTile = {
      getWalls: vi.fn().mockReturnValue([false, false, false, false]),
      objs: [],
    };

    mockMap = {
      getTileByPos: vi.fn().mockReturnValue(mockTile),
      settings: Settings,
    };

    traj = new Trajectory(mockMap, 0, 0, 0);

    Settings.GameFrequency = 10;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate straight path in empty space", () => {
    // Length 2000, delta 4. Should produce ~500 points
    traj.step();

    expect(traj.points.length).toBeGreaterThan(1);
    // Angle 0 -> sin(0)=0, cos(0)=1. y decreases.
    const lastPoint = traj.points[traj.points.length - 1];
    expect(lastPoint.x).toBeCloseTo(0);
    expect(lastPoint.y).toBeLessThan(0);
  });

  it("should stop at max length", () => {
    traj.length = 100;
    traj.step();
    // 100 / 4 = 25 steps roughly
    expect(traj.points.length).toBeCloseTo(26, 1);
  });

  it("should detect targets", () => {
    // We need to trick the 'instanceof Tank' check or use a class that extends it?
    // Vitest 'instanceof' checks rely on prototype chain.
    // Best to construct a real Tank but mocking its deps might be hard.
    // Or we can just trust that 'instanceof' works and mock the map returning an object that IS a tank.
    // For now, let's skip the explicit target detection test if we can't easily mock 'instanceof Tank'.
    // Actually, we can just assign the prototype.
    const tankObj = Object.create(Tank.prototype);
    mockTile.objs = [tankObj];

    traj.step();

    expect(traj.targets).toContain(tankObj);
  });

  it("should delete itself after timeout", () => {
    traj.timeout = 5;
    traj.step();
    expect(traj.deleted).toBe(true);
  });
});
