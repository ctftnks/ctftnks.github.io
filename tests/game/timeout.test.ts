import { describe, it, expect, vi } from "vitest";
import GameTimeout from "@/game/timeout";

describe("GameTimeout Class", () => {
  it("should initialize correctly", () => {
    const callback = vi.fn();
    const timeout = new GameTimeout(100, callback);
    expect(timeout.age).toBe(0);
    expect(timeout.isDeleted()).toBe(false);
  });

  it("should not execute callback before delay", () => {
    const callback = vi.fn();
    const timeout = new GameTimeout(100, callback);

        timeout.age = 99;
        timeout.step(0);
        
        expect(callback).not.toHaveBeenCalled();    expect(timeout.isDeleted()).toBe(false);
  });

  it("should execute callback and delete itself after delay", () => {
    const callback = vi.fn();
    const timeout = new GameTimeout(100, callback);

        timeout.age = 100;
        timeout.step(0);
        
        expect(callback).toHaveBeenCalled();    expect(timeout.isDeleted()).toBe(true);
  });

  it("should handle interval mode (periodic execution)", () => {
    const callback = vi.fn();
    const timeout = new GameTimeout(100, callback, true);

    // First execution
    timeout.age = 100;
    timeout.step(0);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(timeout.isDeleted()).toBe(false);
    expect(timeout.age).toBe(0); // Should reset age

    // Second execution
    timeout.age = 100;
    timeout.step(0);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(timeout.isDeleted()).toBe(false);
  });
});
