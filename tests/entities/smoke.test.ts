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
    const smoke = new Smoke(mockGame, 10, 10, 100, 5, 1);
    expect(smoke.x).toBe(10);
    expect(smoke.y).toBe(10);
    expect(smoke.radius).toBe(5);
    expect(smoke.maxAge).toBe(100);
    expect(smoke.age).toBe(0);
  });

  it("should delete smoke when timeout expired", () => {
    const smoke = new Smoke(mockGame, 0, 0, 5, 10, 1);

    smoke.age = 6;
    expect(smoke.isDeleted()).toBe(true);
  });

  it("should generate cloud of smoke", () => {
    generateCloud(mockGame, 0, 0, 5, 10);

    expect(mockGame.addObject).toHaveBeenCalledTimes(5);
  });

  it("should generate cloud of smoke with custom color", () => {
    generateCloud(mockGame, 0, 0, 1, 10, 1, "red");
    expect(mockGame.addObject).toHaveBeenCalledTimes(1);
    const smokeArg = mockGame.addObject.mock.calls[0][0] as Smoke;
    expect(smokeArg.color).toBe("red");
  });

  it("should draw smoke particle", () => {
    const smoke = new Smoke(mockGame, 10, 10, 100, 5, 1);
    const mockCtx = {
      beginPath: vi.fn(),
      fillStyle: "",
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Test early stage (perc >= 0.3)
    // maxAge = 100. If age = 0, perc = 1.
    smoke.draw(mockCtx);
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalledWith(10, 10, 5, 0, Math.PI * 2, true);
    expect(mockCtx.fill).toHaveBeenCalled();

    // Test late stage (perc < 0.3)
    // perc = 1 - age/maxAge. We want perc < 0.3 => 1 - age/100 < 0.3 => 0.7 < age/100 => age > 70.
    smoke.age = 80; // perc = 0.2
    smoke.draw(mockCtx);
    // When perc < 0.3, perc becomes 0.
    expect(mockCtx.arc).toHaveBeenCalledWith(10, 10, 0, 0, Math.PI * 2, true);
  });
});
