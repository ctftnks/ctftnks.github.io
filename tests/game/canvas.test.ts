import { describe, it, expect, beforeEach, vi } from "vitest";
import Canvas from "@/game/canvas";

describe("Canvas Class", () => {
  let mockCanvas: HTMLCanvasElement;
  let mockEffectsCanvas: HTMLCanvasElement;
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      clearRect: vi.fn(),
      setTransform: vi.fn(),
      scale: vi.fn(),
    };

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      clientWidth: 800,
      clientHeight: 600,
      width: 0,
      height: 0,
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      offsetWidth: 800,
    } as any;

    mockEffectsCanvas = {
      width: 0,
      height: 0,
    } as any;
  });

  it("should initialize correctly", () => {
    const canvasMgr = new Canvas(mockCanvas, mockEffectsCanvas);
    expect(canvasMgr.width).toBe(800);
    expect(canvasMgr.height).toBe(600);
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
    expect(mockEffectsCanvas.width).toBe(800);
    expect(mockEffectsCanvas.height).toBe(600);
  });

  it("should draw game objects", () => {
    const canvasMgr = new Canvas(mockCanvas, mockEffectsCanvas);
    const mockGame = {
      map: { draw: vi.fn() },
      objs: [{ draw: vi.fn() }, { draw: vi.fn() }],
    };

    canvasMgr.draw(mockGame as any);

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockGame.map.draw).toHaveBeenCalledWith(mockContext);
    expect(mockGame.objs[0].draw).toHaveBeenCalledWith(mockContext);
    expect(mockGame.objs[1].draw).toHaveBeenCalledWith(mockContext);
  });

  it("should rescale correctly", () => {
    const canvasMgr = new Canvas(mockCanvas, mockEffectsCanvas);
    canvasMgr.rescale(2);
    expect(canvasMgr.scale).toBe(2);
    expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
  });

  it("should resize correctly", () => {
    const canvasMgr = new Canvas(mockCanvas, mockEffectsCanvas);

    mockCanvas.clientWidth = 1024;
    mockCanvas.clientHeight = 768;

    canvasMgr.resize();

    expect(canvasMgr.width).toBe(1024);
    expect(canvasMgr.height).toBe(768);
    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(768);
  });

  it("should shake the canvas", () => {
    const canvasMgr = new Canvas(mockCanvas, mockEffectsCanvas);
    canvasMgr.shake();
    expect(mockCanvas.classList.remove).toHaveBeenCalledWith("shake");
    expect(mockCanvas.classList.add).toHaveBeenCalledWith("shake");
  });
});
