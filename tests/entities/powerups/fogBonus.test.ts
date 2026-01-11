import { describe, it, expect, vi } from "vitest";
import { FogEffect } from "@/entities/powerups/fogBonus";

describe("FogEffect", () => {
  it("should initiate fog of war", () => {
    const mockCtx = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      restore: vi.fn(),
    };

    const mockGame = {
      canvas: {
        effectsCanvas: {
          getContext: vi.fn().mockReturnValue(mockCtx),
          width: 0,
          height: 0,
        },
        canvas: {
          clientWidth: 800,
          clientHeight: 600,
        },
        scale: 1,
      },
      map: { Nx: 10, Ny: 10, dx: 32, dy: 32 },
      getTanks: vi.fn().mockReturnValue([{ x: 100, y: 100 }]),
      updatables: [] as any[],
    };

    const effect = new FogEffect(mockGame as any);
    mockGame.updatables.push(effect);

    expect(mockGame.updatables.length).toBe(1);

    // Simulate a step
    effect.step(0);

    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockGame.getTanks).toHaveBeenCalled();
  });

  it("should test FogEffect step logic", () => {
    const mockCtx = {
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      globalCompositeOperation: "",
    };

    const mockGame = {
      canvas: {
        effectsCanvas: {
          getContext: vi.fn().mockReturnValue(mockCtx),
          width: 0,
          height: 0,
        },
        canvas: { clientWidth: 800, clientHeight: 600 },
        scale: 1,
      },
      map: { Nx: 10, Ny: 10, dx: 32, dy: 32 },
      getTanks: vi.fn().mockReturnValue([]),
      updatables: [] as any[],
    };

    const effect = new FogEffect(mockGame as any);

    // 1. Test isDeleted
    effect.delete(); // Sets maxAge to -1
    effect.age = 0; // 0 > -1 is true
    effect.step(0);
    expect(mockCtx.fillRect).not.toHaveBeenCalled(); // Should return early

    // Reset for next steps
    effect.maxAge = 10000;
    effect.age = 0;

    // 2. Test ambient light < 300 age
    effect.age = 150;
    effect.duration = 10000;
    effect.step(0);
    // ambientLight = 1 - 150/300 = 0.5
    expect(effect.ambientLight).toBe(0.5);

    // 3. Test ambient light > 300 and < duration - 300
    effect.age = 5000;
    effect.step(0);
    expect(effect.ambientLight).toBe(0);

    // 4. Test ambient light > duration - 300
    effect.age = 9850; // duration 10000. diff is 150.
    effect.step(0);
    // ambientLight = 1 - 150/300 = 0.5
    expect(effect.ambientLight).toBe(0.5);
  });
});
