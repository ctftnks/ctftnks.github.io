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
        intvls: [],
      };

      fogOfWar(mockGame as any);

      // Fast forward to trigger interval
      vi.advanceTimersByTime(30);
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockGame.getTanks).toHaveBeenCalled();
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
  });
});
