import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { playSound, playMusic, stopMusic, hexToRgbA, fogOfWar, clearEffects } from "@/game/effects";
import { Settings } from "@/stores/settings";
import { store } from "@/stores/gamestore";

describe("Effects Module", () => {
  let playSpy: any;
  let pauseSpy: any;

  beforeEach(() => {
    vi.useFakeTimers();
    playSpy = vi.spyOn(Audio.prototype, "play").mockImplementation(() => Promise.resolve());
    pauseSpy = vi.spyOn(Audio.prototype, "pause").mockImplementation(() => {});
    Settings.muted = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Sound and Music", () => {
    it("should play sound if not muted", () => {
      playSound("test.wav");
      expect(playSpy).toHaveBeenCalled();
    });

    it("should not play sound if muted", () => {
      Settings.muted = true;
      playSound("test.wav");
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("should play music and handle loop", () => {
      playMusic("music.mp3");
      expect(playSpy).toHaveBeenCalled();
    });

    it("should not restart music if same file is playing", () => {
      playMusic("music.mp3");
      playSpy.mockClear();
      playMusic("music.mp3");
      expect(playSpy).not.toHaveBeenCalled();
    });

    it("should stop music", () => {
      playMusic("music.mp3");
      stopMusic();
      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe("Utility functions", () => {
    it("should convert hex to rgba", () => {
      expect(hexToRgbA("#ffffff", 0.5)).toBe("rgba(255,255,255,0.5)");
      expect(hexToRgbA("#fff", 1)).toBe("rgba(255,255,255,1)");
      expect(hexToRgbA("#000000", 0)).toBe("rgba(0,0,0,0)");
    });

    it("should throw error for invalid hex", () => {
      expect(() => hexToRgbA("invalid", 1)).toThrow("bad hex");
    });
  });

  describe("Visual Effects", () => {
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
        updatables: [],
      };

      fogOfWar(mockGame as any);

      expect(mockGame.updatables.length).toBe(1);
      const effect = mockGame.updatables[0] as any;

      // Simulate a step
      effect.step();

      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockGame.getTanks).toHaveBeenCalled();
    });

    it("should replace existing fog of war effect", () => {
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

      const existingEffect = {
        delete: vi.fn(),
      };
      // Mock instanceof check by setting prototype or using a class structure if needed,
      // but since we can't easily import the private FogEffect class, we rely on the implementation logic.
      // The implementation uses `u instanceof FogEffect`.
      // We can check if we can simulate this by running fogOfWar twice.

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
        updatables: [],
      };

      // First call
      fogOfWar(mockGame as any);
      const firstEffect = mockGame.updatables[0];
      const deleteSpy = vi.spyOn(firstEffect, "delete");

      // Second call
      fogOfWar(mockGame as any);

      expect(deleteSpy).toHaveBeenCalled();
      expect(mockGame.updatables.length).toBe(1);
      expect(mockGame.updatables[0]).not.toBe(firstEffect);
    });

    it("should not initiate fog of war if canvas is missing", () => {
      const mockGame = {
        canvas: {
          effectsCanvas: null,
        },
      };
      fogOfWar(mockGame as any);
      // Should not crash
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
        updatables: [],
      };

      fogOfWar(mockGame as any);
      const effect = mockGame.updatables[0] as any;

      // 1. Test isDeleted
      effect.delete(); // Sets maxAge to -1
      effect.age = 0; // 0 > -1 is true
      effect.step();
      expect(mockCtx.fillRect).not.toHaveBeenCalled(); // Should return early

      // Reset for next steps
      effect.maxAge = 10000;
      effect.age = 0;

      // 2. Test ambient light < 300 age
      effect.age = 150;
      effect.duration = 10000;
      effect.step();
      // ambientLight = 1 - 150/300 = 0.5
      expect(effect.ambientLight).toBe(0.5);

      // 3. Test ambient light > 300 and < duration - 300
      effect.age = 5000;
      effect.step();
      expect(effect.ambientLight).toBe(0);

      // 4. Test ambient light > duration - 300
      effect.age = 9850; // duration 10000. diff is 150.
      effect.step();
      // ambientLight = 1 - 150/300 = 0.5
      expect(effect.ambientLight).toBe(0.5);
    });

    it("should clear effects", () => {
      const mockCtx = {
        clearRect: vi.fn(),
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
        },
      };

      store.game = mockGame as any;
      clearEffects();
      expect(mockCtx.clearRect).toHaveBeenCalled();
    });

    it("should safely handle clearEffects when game or canvas is missing", () => {
      store.game = null;
      clearEffects(); // Should not throw

      store.game = { canvas: null } as any;
      clearEffects(); // Should not throw

      store.game = {
        canvas: {
          effectsCanvas: {
            getContext: () => null,
            width: 0,
            height: 0,
          },
          canvas: { clientWidth: 0, clientHeight: 0 },
        },
      } as any;
      clearEffects(); // Should not throw
    });
  });
});
