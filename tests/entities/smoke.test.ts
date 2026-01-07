import { describe, it, expect, beforeEach, vi } from "vitest";
import { Smoke, generateCloud } from "@/entities/smoke";
import { Settings } from "@/stores/settings";

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
    expect(smoke.maxAge).toBe(100);
    expect(smoke.age).toBe(0);
  });

  it("should delete smoke when timeout expired", () => {
    const smoke = new Smoke(0, 0, 5, 10, 1);

    smoke.age = 6;
    expect(smoke.isDeleted()).toBe(true);
  });

  it("should generate cloud of smoke", () => {
    generateCloud(mockGame, 0, 0, 5, 10);

    expect(mockGame.addObject).toHaveBeenCalledTimes(5);
  });
});
