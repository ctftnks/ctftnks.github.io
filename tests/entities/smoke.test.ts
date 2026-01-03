import { describe, it, expect, beforeEach, vi } from "vitest";
import { Smoke, generateCloud } from "@/entities/smoke";
import { Settings } from "@/game/store";

describe("Smoke System", () => {
  let mockGame: any;

  beforeEach(() => {
    mockGame = {
      addObject: vi.fn(),
    };
    Settings.GameFrequency = 10;
  });

  it("should initialize Smoke particle", () => {
    const smoke = new Smoke(10, 10, 100, 5, 1);
    expect(smoke.x).toBe(10);
    expect(smoke.y).toBe(10);
    expect(smoke.radius).toBe(5);
    expect(smoke.timeout).toBe(100);
  });

  it("should update smoke particle in step", () => {
    const smoke = new Smoke(0, 0, 100, 10, 1);
    const initialRadius = smoke.radius;

    smoke.step();

    expect(smoke.timeout).toBe(90); // 100 - 10
    expect(smoke.radius).toBeLessThan(initialRadius);
  });

  it("should delete smoke when timeout expired", () => {
    const smoke = new Smoke(0, 0, 5, 10, 1);

    smoke.step(); // -10 ms

    expect(smoke.timeout).toBeLessThan(0);
    expect(smoke.deleted).toBe(true);
  });

  it("should generate cloud of smoke", () => {
    generateCloud(mockGame, 0, 0, 5, 10);

    expect(mockGame.addObject).toHaveBeenCalledTimes(5);
  });
});
